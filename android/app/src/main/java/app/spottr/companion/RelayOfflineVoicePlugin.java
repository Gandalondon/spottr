package app.spottr.companion;

import android.media.AudioAttributes;
import android.media.AudioFormat;
import android.media.AudioTrack;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.k2fsa.sherpa.onnx.GenerationConfig;
import com.k2fsa.sherpa.onnx.OfflineTts;
import com.k2fsa.sherpa.onnx.OfflineTtsConfig;
import com.k2fsa.sherpa.onnx.OfflineTtsModelConfig;
import com.k2fsa.sherpa.onnx.OfflineTtsSupertonicModelConfig;
import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.apache.commons.compress.archivers.tar.TarArchiveEntry;
import org.apache.commons.compress.archivers.tar.TarArchiveInputStream;
import org.apache.commons.compress.compressors.bzip2.BZip2CompressorInputStream;

/**
 * Relay's offline voice: Supertonic 3 (Supertone, OpenRAIL-M model, free) running on the phone through sherpa-onnx.
 * No internet and no keys once the voice is downloaded (about 130 MB, once, into the app's own storage).
 * Speech plays as it is made, sentence by sentence, so the first words come out as soon as possible.
 */
@CapacitorPlugin(name = "RelayOfflineVoice")
public class RelayOfflineVoicePlugin extends Plugin {
    private static final String NAME = "sherpa-onnx-supertonic-3-tts-int8-2026-05-11";
    private static final String URL_MODEL = "https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/" + NAME + ".tar.bz2";
    private static final long APPROX_BYTES = 128774318L;

    private final ExecutorService work = Executors.newSingleThreadExecutor();   // loading and speaking
    private final ExecutorService fetch = Executors.newSingleThreadExecutor();  // downloading
    private volatile OfflineTts tts;
    private volatile String state = "";        // "", downloading, unpacking, failed: ...
    private volatile long got = 0;
    private volatile int speakSeq = 0;
    private volatile AudioTrack track;
    private volatile long loadMs = -1;

    // crash guard: a marker file is written before each native step and removed after. If Relay is killed mid-step,
    // the next start finds the marker and Relay switches back to Google's voice.
    private File marker() { return new File(getContext().getFilesDir(), "ov-busy"); }
    private void mark(String step) { try (FileOutputStream o = new FileOutputStream(marker())) { o.write(step.getBytes()); } catch (Throwable ignored) {} }
    private void unmark() { marker().delete(); }
    private volatile String startCrash = "";
    @Override
    public void load() {
        File m = marker();  // read once at start: a marker left over means the last run died mid-step
        if (m.exists()) {
            try { startCrash = new String(java.nio.file.Files.readAllBytes(m.toPath())); } catch (Throwable e) { startCrash = "unknown"; }
            m.delete();
        }
    }
    private String crashed() { String c = startCrash; startCrash = ""; return c; }

    /** why Android last closed Relay (crash, native crash, low memory...), for the voices screen */
    private String lastExit() {
        if (android.os.Build.VERSION.SDK_INT < 30) return "";
        try {
            android.app.ActivityManager am = (android.app.ActivityManager) getContext().getSystemService(android.content.Context.ACTIVITY_SERVICE);
            java.util.List<android.app.ApplicationExitInfo> l = am.getHistoricalProcessExitReasons(getContext().getPackageName(), 0, 1);
            if (l.isEmpty()) return "";
            android.app.ApplicationExitInfo x = l.get(0);
            int r = x.getReason();
            String why = r == android.app.ApplicationExitInfo.REASON_CRASH ? "crash" : r == android.app.ApplicationExitInfo.REASON_CRASH_NATIVE ? "native crash" : r == android.app.ApplicationExitInfo.REASON_ANR ? "not responding" : r == android.app.ApplicationExitInfo.REASON_LOW_MEMORY ? "low memory" : r == android.app.ApplicationExitInfo.REASON_USER_REQUESTED ? "closed by you" : r == android.app.ApplicationExitInfo.REASON_USER_STOPPED ? "stopped by you" : r == android.app.ApplicationExitInfo.REASON_EXIT_SELF ? "normal exit" : "reason " + r;
            long ago = (System.currentTimeMillis() - x.getTimestamp()) / 60000;
            return why + ", " + ago + " min ago" + (x.getDescription() != null ? ": " + x.getDescription() : "");
        } catch (Throwable e) { return "unknown"; }
    }

    private File dir() { return new File(getContext().getFilesDir(), NAME); }
    private boolean installed() { return new File(dir(), "ok").exists(); }

    @PluginMethod
    public void status(PluginCall call) {
        JSObject r = new JSObject();
        r.put("installed", installed());
        r.put("loaded", tts != null);
        r.put("loadMs", loadMs);
        r.put("state", state);
        r.put("crashed", crashed());
        r.put("lastExit", lastExit());
        r.put("progress", APPROX_BYTES > 0 ? Math.min(100, (int) (got * 100 / APPROX_BYTES)) : 0);
        call.resolve(r);
    }

    /** downloads and unpacks the voice once; returns at once, poll status() for progress */
    @PluginMethod
    public void download(PluginCall call) {
        if (installed() || state.equals("downloading") || state.equals("unpacking")) { call.resolve(); return; }
        state = "downloading"; got = 0;
        fetch.execute(() -> {
            File tmp = new File(getContext().getFilesDir(), NAME + ".part");
            try {
                HttpURLConnection c = (HttpURLConnection) new URL(URL_MODEL).openConnection();
                c.setInstanceFollowRedirects(true);
                c.setConnectTimeout(15000); c.setReadTimeout(30000);
                try (InputStream in = new BufferedInputStream(c.getInputStream()); OutputStream out = new FileOutputStream(tmp)) {
                    byte[] b = new byte[1 << 16]; int n;
                    while ((n = in.read(b)) > 0) { out.write(b, 0, n); got += n; }
                }
                state = "unpacking";
                File base = getContext().getFilesDir();
                try (TarArchiveInputStream tar = new TarArchiveInputStream(new BZip2CompressorInputStream(new BufferedInputStream(new java.io.FileInputStream(tmp))))) {
                    TarArchiveEntry e;
                    byte[] b = new byte[1 << 16];
                    while ((e = tar.getNextTarEntry()) != null) {
                        File f = new File(base, e.getName());
                        if (!f.getCanonicalPath().startsWith(base.getCanonicalPath() + File.separator)) continue;  // stay inside our folder
                        if (e.isDirectory()) { f.mkdirs(); continue; }
                        f.getParentFile().mkdirs();
                        try (OutputStream out = new FileOutputStream(f)) { int n; while ((n = tar.read(b)) > 0) out.write(b, 0, n); }
                    }
                }
                new File(dir(), "ok").createNewFile();
                state = "";
            } catch (Throwable e) {
                state = "failed: " + e.getMessage();
            } finally {
                tmp.delete();
            }
        });
        call.resolve();
    }

    private OfflineTts engine() {
        if (tts != null) return tts;
        String d = dir().getAbsolutePath() + "/";
        OfflineTtsSupertonicModelConfig s = new OfflineTtsSupertonicModelConfig();
        s.setDurationPredictor(d + "duration_predictor.int8.onnx");
        s.setTextEncoder(d + "text_encoder.int8.onnx");
        s.setVectorEstimator(d + "vector_estimator.int8.onnx");
        s.setVocoder(d + "vocoder.int8.onnx");
        s.setTtsJson(d + "tts.json");
        s.setUnicodeIndexer(d + "unicode_indexer.bin");
        s.setVoiceStyle(d + "voice.bin");
        OfflineTtsModelConfig m = new OfflineTtsModelConfig();
        m.setSupertonic(s);
        m.setNumThreads(Math.max(2, Math.min(4, Runtime.getRuntime().availableProcessors() / 2)));
        OfflineTtsConfig cfg = new OfflineTtsConfig();
        cfg.setModel(m);
        long t0 = System.currentTimeMillis();
        mark("loading the voice");
        tts = new OfflineTts(null, cfg);
        unmark();
        loadMs = System.currentTimeMillis() - t0;
        return tts;
    }

    /** loads the voice into memory ahead of the first answer */
    @PluginMethod
    public void warm(PluginCall call) {
        if (!installed()) { call.resolve(); return; }
        work.execute(() -> {
            JSObject r = new JSObject();
            try { engine(); r.put("loadMs", loadMs); } catch (Throwable e) { unmark(); r.put("error", e.getClass().getSimpleName() + ": " + e.getMessage()); }
            call.resolve(r);
        });
    }

    /** speaks text with voice sid (0 to 9); resolves when finished with timings */
    @PluginMethod
    public void speak(PluginCall call) {
        final String text = call.getString("text", "");
        // read numbers loosely: JavaScript sends 1 (whole) or 1.15 (decimal), and either must work
        final int sid = (int) call.getData().optDouble("sid", 5);
        final float speed = (float) call.getData().optDouble("speed", 1.0);
        final int steps = (int) call.getData().optDouble("steps", 5);
        if (!installed()) { call.reject("not installed"); return; }
        final int my = ++speakSeq;
        stopTrack();
        work.execute(() -> {
            JSObject r = new JSObject();
            final long t0 = System.currentTimeMillis();
            final long[] first = { -1 };
            AudioTrack at = null;
            try {
                OfflineTts e = engine();
                int rate = e.sampleRate();
                int min = AudioTrack.getMinBufferSize(rate, AudioFormat.CHANNEL_OUT_MONO, AudioFormat.ENCODING_PCM_FLOAT);
                at = new AudioTrack.Builder()
                    .setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ASSISTANT).setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build())
                    .setAudioFormat(new AudioFormat.Builder().setSampleRate(rate).setEncoding(AudioFormat.ENCODING_PCM_FLOAT).setChannelMask(AudioFormat.CHANNEL_OUT_MONO).build())
                    .setBufferSizeInBytes(Math.max(min, rate * 4))
                    .setTransferMode(AudioTrack.MODE_STREAM).build();
                track = at;
                mark("speaking");
                at.play();
                final AudioTrack out = at;
                GenerationConfig g = new GenerationConfig();
                g.setSid(sid); g.setSpeed(speed); g.setNumSteps(steps);
                Map<String, String> extra = new HashMap<>(); extra.put("lang", "en"); g.setExtra(extra);
                final long[] written = { 0 };
                // a real class, not a lambda: the engine looks up invoke(float[]) returning Integer by name, which a lambda doesn't have
                e.generateWithConfigAndCallback(text, g, new kotlin.jvm.functions.Function1<float[], Integer>() { @Override public Integer invoke(float[] samples) {
                    if (my != speakSeq) return 0;  // stopped or replaced
                    if (first[0] < 0) first[0] = System.currentTimeMillis() - t0;
                    int off = 0;
                    while (off < samples.length) {  // small non-blocking writes, so a stop is never stuck behind a full buffer
                        if (my != speakSeq) return 0;
                        int n = out.write(samples, off, samples.length - off, AudioTrack.WRITE_NON_BLOCKING);
                        if (n < 0) return 0;
                        if (n == 0) { try { Thread.sleep(10); } catch (InterruptedException ie) { return 0; } }
                        off += n;
                    }
                    written[0] += samples.length;
                    return 1;
                } });
                // wait for the last samples to play out
                long end = System.currentTimeMillis() + 15000;
                while (my == speakSeq && out.getPlaybackHeadPosition() < written[0] && System.currentTimeMillis() < end) Thread.sleep(30);
                r.put("stopped", my != speakSeq);
            } catch (Throwable ex) {
                r.put("error", ex.getClass().getSimpleName() + ": " + ex.getMessage());
            } finally {
                unmark();
                if (at != null) { try { at.stop(); } catch (Throwable ignored) {} at.release(); }
                if (track == at) track = null;
            }
            r.put("firstMs", first[0]);
            r.put("totalMs", System.currentTimeMillis() - t0);
            r.put("loadMs", loadMs);
            call.resolve(r);
        });
    }

    private void stopTrack() {
        AudioTrack t = track;
        if (t != null) { try { t.pause(); t.flush(); } catch (Throwable ignored) {} }
    }

    @PluginMethod
    public void stop(PluginCall call) {
        speakSeq++;
        stopTrack();
        call.resolve();
    }
}
