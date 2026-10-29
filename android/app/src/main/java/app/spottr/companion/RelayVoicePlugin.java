package app.spottr.companion;

import android.content.Intent;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * Relay's spoken voice. Talks to Google's speech engine directly and picks voices by their real name
 * (for example en-gb-x-gbd-local), so Relay never falls back to the old low-quality voice by accident.
 * Reports whether each voice is actually downloaded, needs a connection, and its quality.
 */
@CapacitorPlugin(name = "RelayVoice")
public class RelayVoicePlugin extends Plugin {
    private static final String GOOGLE = "com.google.android.tts";
    private TextToSpeech tts;
    private boolean ready = false, inited = false;
    private String engine = "";
    private final List<PluginCall> waiting = new ArrayList<>();
    private final Map<String, PluginCall> speaking = new HashMap<>();
    private int seq = 0;

    @Override
    public void load() {
        TextToSpeech.OnInitListener onInit = status -> {
            synchronized (this) {
                inited = true;
                ready = status == TextToSpeech.SUCCESS;
                if (ready) listen();
                for (PluginCall c : waiting) run(c);
                waiting.clear();
            }
        };
        // prefer Google's engine even if another engine is the phone's default
        boolean hasGoogle = false;
        try {
            Intent q = new Intent(TextToSpeech.Engine.INTENT_ACTION_TTS_SERVICE).setPackage(GOOGLE);
            hasGoogle = !getContext().getPackageManager().queryIntentServices(q, 0).isEmpty();
        } catch (Exception ignored) {}
        tts = hasGoogle ? new TextToSpeech(getContext(), onInit, GOOGLE) : new TextToSpeech(getContext(), onInit);
        engine = hasGoogle ? GOOGLE : "default";
    }

    private void listen() {
        tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
            @Override public void onStart(String id) {}
            @Override public void onDone(String id) { finish(id, true, false); }
            @Override public void onError(String id) { finish(id, false, false); }
            @Override public void onError(String id, int code) { finish(id, false, false); }
            @Override public void onStop(String id, boolean interrupted) { finish(id, true, true); }
        });
    }

    private void finish(String id, boolean ok, boolean stopped) {
        PluginCall c;
        synchronized (this) { c = speaking.remove(id); }
        if (c == null) return;
        if (ok) { JSObject r = new JSObject(); r.put("stopped", stopped); c.resolve(r); } else c.reject("speech failed");
    }

    /** queue calls that arrive before the engine has started */
    private synchronized boolean whenReady(PluginCall call) {
        if (ready) return true;
        if (inited) { call.reject("speech engine unavailable"); return false; }
        waiting.add(call); return false;
    }

    private void run(PluginCall call) {
        if (!ready) { call.reject("speech engine unavailable"); return; }  // init failed: callers fall back quietly
        switch (call.getMethodName()) {
            case "voices": doVoices(call); break;
            case "speak": doSpeak(call); break;
            default: call.resolve();
        }
    }

    @PluginMethod
    public void voices(PluginCall call) { if (whenReady(call)) doVoices(call); }

    private void doVoices(PluginCall call) {
        JSArray list = new JSArray();
        Set<Voice> all = tts.getVoices();
        if (all != null) for (Voice v : all) {
            Locale l = v.getLocale();
            if (l == null || !"en".equals(l.getLanguage())) continue;
            Set<String> f = v.getFeatures();
            JSObject o = new JSObject();
            o.put("name", v.getName());
            o.put("lang", l.toLanguageTag());
            o.put("quality", v.getQuality());
            o.put("latency", v.getLatency());
            o.put("network", v.isNetworkConnectionRequired());
            o.put("installed", f == null || !f.contains(TextToSpeech.Engine.KEY_FEATURE_NOT_INSTALLED));
            list.put(o);
        }
        JSObject r = new JSObject();
        r.put("engine", engine);
        r.put("voices", list);
        call.resolve(r);
    }

    @PluginMethod
    public void speak(PluginCall call) { if (whenReady(call)) doSpeak(call); }

    private void doSpeak(PluginCall call) {
        String text = call.getString("text", "");
        String name = call.getString("voice", "");
        float rate = call.getFloat("rate", 1.0f);
        float pitch = call.getFloat("pitch", 1.0f);
        Voice chosen = null;
        Set<Voice> all = tts.getVoices();
        if (all != null && name != null && !name.isEmpty()) for (Voice v : all) if (name.equals(v.getName())) { chosen = v; break; }
        if (chosen != null) tts.setVoice(chosen); else tts.setLanguage(Locale.UK);
        tts.setSpeechRate(rate);
        tts.setPitch(pitch);
        String id = "relay-" + (++seq);
        synchronized (this) { speaking.put(id, call); }
        Bundle p = new Bundle();
        p.putString(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, id);
        if (tts.speak(text, TextToSpeech.QUEUE_FLUSH, p, id) != TextToSpeech.SUCCESS) finish(id, false, false);
    }

    @PluginMethod
    public void stop(PluginCall call) {
        if (tts != null && ready) tts.stop();
        call.resolve();
    }

    /** opens Google's voice download screen, for phones without a natural English voice installed */
    @PluginMethod
    public void install(PluginCall call) {
        try {
            Intent i = new Intent(TextToSpeech.Engine.ACTION_INSTALL_TTS_DATA);
            if (GOOGLE.equals(engine)) i.setPackage(GOOGLE);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(i);
            call.resolve();
        } catch (Exception e) { call.reject("cannot open voice settings"); }
    }

    @Override
    protected void handleOnDestroy() {
        if (tts != null) { tts.stop(); tts.shutdown(); }
    }
}
