package app.spottr.companion;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.common.util.concurrent.ListenableFuture;
import com.google.mlkit.genai.common.DownloadCallback;
import com.google.mlkit.genai.common.FeatureStatus;
import com.google.mlkit.genai.common.GenAiException;
import com.google.mlkit.genai.prompt.GenerateContentRequest;
import com.google.mlkit.genai.prompt.GenerateContentResponse;
import com.google.mlkit.genai.prompt.Generation;
import com.google.mlkit.genai.prompt.TextPart;
import com.google.mlkit.genai.prompt.java.GenerativeModelFutures;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

/**
 * Gemini Nano on the phone (free, offline, through Android's AICore), used only to work out what a player meant
 * when Relay's own phrase rules didn't recognise it. It returns one short command line; Relay still answers
 * from its own quest and map data, so the model can't make up routes.
 */
@CapacitorPlugin(name = "RelayAI")
public class RelayAIPlugin extends Plugin {
    private GenerativeModelFutures model;
    private final ExecutorService bg = Executors.newSingleThreadExecutor();
    private String downloadState = "";

    private GenerativeModelFutures model() {
        if (model == null) model = GenerativeModelFutures.from(Generation.INSTANCE.getClient());
        return model;
    }

    /** available | downloadable | downloading | unavailable | error */
    @PluginMethod
    public void status(PluginCall call) {
        bg.execute(() -> {
            JSObject r = new JSObject();
            try {
                int s = model().checkStatus().get(15, TimeUnit.SECONDS);
                r.put("status", s == FeatureStatus.AVAILABLE ? "available" : s == FeatureStatus.DOWNLOADABLE ? "downloadable" : s == FeatureStatus.DOWNLOADING ? "downloading" : "unavailable");
            } catch (Throwable e) {
                r.put("status", "error");
                r.put("detail", String.valueOf(e.getMessage()));
            }
            r.put("download", downloadState);
            call.resolve(r);
        });
    }

    /** starts the one-off model download if Android hasn't got it yet; returns at once */
    @PluginMethod
    public void download(PluginCall call) {
        bg.execute(() -> {
            try {
                downloadState = "starting";
                model().download(new DownloadCallback() {
                    @Override public void onDownloadStarted(long bytes) { downloadState = "started"; }
                    @Override public void onDownloadProgress(long bytes) { downloadState = "downloading " + bytes; }
                    @Override public void onDownloadCompleted() { downloadState = "done"; }
                    @Override public void onDownloadFailed(GenAiException e) { downloadState = "failed: " + e.getMessage(); }
                });
            } catch (Throwable e) { downloadState = "failed: " + e.getMessage(); }
        });
        call.resolve();
    }

    /** one prompt in, the model's text out */
    @PluginMethod
    public void ask(PluginCall call) {
        final String prompt = call.getString("prompt", "");
        bg.execute(() -> {
            JSObject r = new JSObject();
            long t0 = System.currentTimeMillis();
            try {
                GenerateContentRequest.Builder b = new GenerateContentRequest.Builder(new TextPart(prompt));
                b.setTemperature(0f);
                b.setTopK(1);
                ListenableFuture<GenerateContentResponse> f = model().generateContent(b.build());
                GenerateContentResponse res = f.get(8, TimeUnit.SECONDS);
                String text = res.getCandidates().isEmpty() ? "" : res.getCandidates().get(0).getText();
                r.put("text", text == null ? "" : text);
            } catch (Throwable e) {
                r.put("text", "");
                r.put("error", String.valueOf(e.getMessage()));
            }
            r.put("ms", System.currentTimeMillis() - t0);
            call.resolve(r);
        });
    }
}
