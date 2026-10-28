package app.spottr.companion;

import android.graphics.Color;
import android.os.Build;
import android.view.Window;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Colours the status and navigation bars to match the screen: navy normally, amber while listening. */
@CapacitorPlugin(name = "SystemBars")
public class SystemBarsPlugin extends Plugin {
    @PluginMethod
    public void set(PluginCall call) {
        final String color = call.getString("color", "#0F1218");
        final boolean light = Boolean.TRUE.equals(call.getBoolean("light", false));
        getActivity().runOnUiThread(() -> {
            try { apply(getActivity().getWindow(), Color.parseColor(color), light); } catch (Exception ignored) {}
            call.resolve();
        });
    }

    static void apply(Window w, int color, boolean lightBackground) {
        w.setStatusBarColor(color);
        w.setNavigationBarColor(color);
        if (Build.VERSION.SDK_INT >= 28) w.setNavigationBarDividerColor(color);
        if (Build.VERSION.SDK_INT >= 29) { w.setNavigationBarContrastEnforced(false); w.setStatusBarContrastEnforced(false); }
        WindowInsetsControllerCompat ic = WindowCompat.getInsetsController(w, w.getDecorView());
        ic.setAppearanceLightStatusBars(lightBackground);
        ic.setAppearanceLightNavigationBars(lightBackground);
    }
}
