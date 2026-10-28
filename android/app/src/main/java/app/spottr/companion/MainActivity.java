package app.spottr.companion;

import android.graphics.Color;
import android.os.Bundle;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(SystemBarsPlugin.class);
        super.onCreate(savedInstanceState);
        // Keep the screen on while Spottr is open beside the game.
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        // No grey bar: system bars start navy, then follow the screen.
        SystemBarsPlugin.apply(getWindow(), Color.parseColor("#1C1E22"), false);
    }
}
