package com.zai.thelastgarage;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.media.AudioManager;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;

public class MainActivity extends Activity {
    private WebView web;
    private Vibrator vib;

    @SuppressLint("SetJavaScriptEnabled")
    @SuppressWarnings("deprecation")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        setVolumeControlStream(AudioManager.STREAM_MUSIC);
        vib = (Vibrator) getSystemService(VIBRATOR_SERVICE);

        web = new WebView(this);
        web.setBackgroundColor(0xFF0B0D10);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        // local assets only: allow fonts/audio/XHR under file:// on older WebViews
        s.setAllowFileAccessFromFileURLs(true);
        s.setAllowUniversalAccessFromFileURLs(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setSupportZoom(false);
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);
        web.setWebViewClient(new WebViewClient() {
            @Override
            public void onReceivedError(android.webkit.WebView v, int code, String desc, String url) {
                android.util.Log.e("TLG", "load error " + code + " " + desc + " " + url);
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(android.webkit.ConsoleMessage m) {
                android.util.Log.d("TLG", m.messageLevel() + " " + m.message() + " @" + m.sourceId() + ":" + m.lineNumber());
                return true;
            }
        });
        web.addJavascriptInterface(new Bridge(), "AndroidBridge");
        setContentView(web);

        hideSystemUI();
        web.loadUrl("file:///android_asset/game/index.html");
    }

    private void hideSystemUI() {
        View d = getWindow().getDecorView();
        d.setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemUI();
    }

    @Override
    public void onBackPressed() {
        web.evaluateJavascript(
                "(function(){if(window.Main&&Main.backPressed){Main.backPressed();return 'ok'}return 'no'})()",
                null);
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (web != null) web.evaluateJavascript("(function(){if(window.AudioSys)AudioSys.stopAmbient();if(window.SaveSys)SaveSys.commit();})()", null);
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) web.evaluateJavascript("(function(){if(window.AudioSys){AudioSys.ensure();AudioSys.resume();AudioSys.startAmbient();}})()", null);
        hideSystemUI();
    }

    private class Bridge {
        @android.webkit.JavascriptInterface
        public void vibrate(final int ms) {
            runOnUiThread(new Runnable() {
                public void run() {
                    if (vib == null) return;
                    if (Build.VERSION.SDK_INT >= 26) {
                        vib.vibrate(VibrationEffect.createOneShot(Math.max(1, ms), VibrationEffect.DEFAULT_AMPLITUDE));
                    } else {
                        vib.vibrate(ms);
                    }
                }
            });
        }

        @android.webkit.JavascriptInterface
        public void exit() {
            runOnUiThread(new Runnable() {
                public void run() { finish(); }
            });
        }

        @android.webkit.JavascriptInterface
        public boolean isAndroid() { return true; }
    }
}
