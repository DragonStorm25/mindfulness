package com.mobile_app; // replace com.your-app-name with your app’s name
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.Callback;

import android.content.Context;

import java.util.Map;
import java.util.HashMap;


public class UrlModule extends ReactContextBaseJavaModule {
    Context context;
    UrlModule(ReactApplicationContext context) {
        super(context);
        this.context = context.getApplicationContext();
    }

    public String getName() {
        return "UrlModule";
    }

    @ReactMethod
    public void setUrls(Callback setUrlsCallback) {
        MainApplication app = (MainApplication) this.context;
        setUrlsCallback.invoke(app.getUrlDetectionsJSON());
    }
}