package com.mobile_app;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.AccessibilityServiceInfo;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.AsyncTask;
import android.provider.Browser;
import android.provider.Settings;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import android.widget.Toast;

import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

import androidx.annotation.NonNull;

import java.text.Format;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

public class UrlInterceptorService extends AccessibilityService {
    private String android_id;

    private String resultOfCall;

    public static final String
            ACTION_LOCATION_BROADCAST = UrlInterceptorService.class.getName() + "URLs Visited",
            URL = "visited_urls";

    // This method specifies things about the AccessibilityService
    @Override
    protected void onServiceConnected() {
        AccessibilityServiceInfo info = getServiceInfo();
        info.eventTypes = AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED;
        info.packageNames = packageNames();
        info.feedbackType = AccessibilityServiceInfo.FEEDBACK_VISUAL;
        // throttling of accessibility event notification
        info.notificationTimeout = 300;
        // support ids interception
        info.flags = AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS |
                AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS;

        this.setServiceInfo(info);

        // gets the unique id for the phone
        android_id = Settings.Secure.getString(this.getContentResolver(),
                Settings.Secure.ANDROID_ID);
    }

    private String captureUrl(AccessibilityNodeInfo info, SupportedBrowserConfig config) {
        List<AccessibilityNodeInfo> nodes = info.findAccessibilityNodeInfosByViewId(config.addressBarId);
        if (nodes == null || nodes.size() <= 0) {
            return null;
        }

        AccessibilityNodeInfo addressBarNodeInfo = nodes.get(0);
        String url = null;
        if (addressBarNodeInfo.getText() != null) {
            url = addressBarNodeInfo.getText().toString();
        }
        addressBarNodeInfo.recycle();
        return url;
    }

    @Override
    public void onAccessibilityEvent(@NonNull AccessibilityEvent event) {
        MainApplication app = (MainApplication) getApplication();
        AccessibilityNodeInfo parentNodeInfo = event.getSource();
        if (parentNodeInfo == null) {
            return;
        }

        String packageName = event.getPackageName().toString();
        SupportedBrowserConfig browserConfig = null;
        for (SupportedBrowserConfig supportedConfig: getSupportedBrowsers()) {
            if (supportedConfig.packageName.equals(packageName)) {
                browserConfig = supportedConfig;
            }
        }
        //this is not supported browser, so exit
        if (browserConfig == null) {
            return;
        }

        String capturedUrl = captureUrl(parentNodeInfo, browserConfig);
        parentNodeInfo.recycle();

        //we can't find a url. Browser either was updated or opened page without url text field
        if (capturedUrl == null || filtersForSearches(capturedUrl)) {
            return;
        }

        long eventTime = System.currentTimeMillis();
        String detectionId = packageName + ":" + capturedUrl;
        //noinspection ConstantConditions
        long lastRecordedTime = app.hasPreviousUrlDetection(detectionId) ? app.getPreviousUrlDetection(detectionId) : 0;
        //some kind of redirect throttling
        if (eventTime - lastRecordedTime > 2000) {
            app.setPreviousUrlDetection(detectionId, eventTime);
            WritableMap payload = Arguments.createMap();
            payload.putString("packageName", packageName);
            payload.putString("url", capturedUrl);
            payload.putDouble("eventTime", eventTime);
            app.emitUrlDetectionEvent(payload);
        }
    }

    // filters out any unnecessary or unwanted websites from the saved urls
    private boolean filtersForSearches(String capturedUrl) {
        if (capturedUrl.startsWith("https://www.google.com/search") ||
            capturedUrl.startsWith("https://www.bing.com/search") ||
            capturedUrl.startsWith("https://duckduckgo.com/?q") ||
                !(
                        capturedUrl.contains("www.") ||
                        capturedUrl.contains(".com") ||
                        capturedUrl.contains(".org") ||
                        capturedUrl.contains(".net") ||
                        capturedUrl.contains(".edu") ||
                        capturedUrl.contains(".gov") ||
                        capturedUrl.contains(".biz") ||
                        capturedUrl.contains(".info")||
                        capturedUrl.contains(".io"))) {
            return true;
        }
        return false;
    }

    // formats the url that will be sent to the server appropriately
    private String formatUrl(String url) {
        // adds the http starter if it's not included in the given url
        if (!url.startsWith("http://") &&
                !url.startsWith("https://")) {
            return "http://" + url;
        }

        return url;
    }

    // MyAccessibilityServices needs to implement this -- don't delete it
    @Override
    public void onInterrupt() {}

    @NonNull
    private static String[] packageNames() {
        List<String> packageNames = new ArrayList<>();
        for (SupportedBrowserConfig config: getSupportedBrowsers()) {
            packageNames.add(config.packageName);
        }
        return packageNames.toArray(new String[0]);
    }

    private static class SupportedBrowserConfig {
        private String packageName, addressBarId;

        private SupportedBrowserConfig(String packageName, String addressBarId) {
            this.packageName = packageName;
            this.addressBarId = addressBarId;
        }
    }

    /** @return a list of supported browser configs
     * This list could be instead obtained from remote server to support future browser updates without updating an app */
    // Note: can be deleted entirely and all browsers will be supported
    @NonNull
    private static List<SupportedBrowserConfig> getSupportedBrowsers() {
        List<SupportedBrowserConfig> browsers = new ArrayList<>();
        browsers.add( new SupportedBrowserConfig("com.android.chrome", "com.android.chrome:id/url_bar"));
        //browsers.add( new SupportedBrowserConfig("org.mozilla.firefox", "org.mozilla.firefox:id/url_bar_title"));
        return browsers;
    }

}
