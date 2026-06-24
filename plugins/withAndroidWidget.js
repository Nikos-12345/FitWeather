const { withAndroidManifest, withDangerousMod, withMainActivity } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withAndroidWidget(config) {
  config = withAndroidManifest(config, async (config) => {
    const mainApplication = config.modResults.manifest.application[0];
    if (!mainApplication.receiver) mainApplication.receiver = [];
    
    const hasWidget = mainApplication.receiver.some(r => r.$['android:name'] === '.FitWeatherWidget');
    if (!hasWidget) {
      mainApplication.receiver.push({
        $: {
          'android:name': '.FitWeatherWidget',
          'android:exported': 'false',
          'android:label': 'FitWeather Widget'
        },
        'intent-filter': [{
          action: [{ $: { 'android:name': 'android.appwidget.action.APPWIDGET_UPDATE' } }]
        }],
        'meta-data': [{
          $: {
            'android:name': 'android.appwidget.provider',
            'android:resource': '@xml/widget_info'
          }
        }]
      });
    }
    return config;
  });

  config = withMainActivity(config, (config) => {
    if (config.modResults.language === 'kotlin') {
      let content = config.modResults.contents;
      if (!content.includes('onPause()')) {
        const injectCode = `
    override fun onPause() {
        super.onPause()
        try {
            val intent = android.content.Intent(this, FitWeatherWidget::class.java).apply {
                action = android.appwidget.AppWidgetManager.ACTION_APPWIDGET_UPDATE
                val ids = android.appwidget.AppWidgetManager.getInstance(application).getAppWidgetIds(android.content.ComponentName(application, FitWeatherWidget::class.java))
                putExtra(android.appwidget.AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
            }
            sendBroadcast(intent)
        } catch (e: Exception) { e.printStackTrace() }
    }
  `;
        content = content.replace(/}\s*$/, `${injectCode}\n}`);
        config.modResults.contents = content;
      }
    }
    return config;
  });

  config = withDangerousMod(config, ['android', async (config) => {
    const root = config.modRequest.projectRoot;
    const resPath = path.join(root, 'android/app/src/main/res');
    const javaPath = path.join(root, 'android/app/src/main/java/com/nikoskon/FitWeather');

    fs.mkdirSync(path.join(resPath, 'layout'), { recursive: true });
    fs.mkdirSync(path.join(resPath, 'xml'), { recursive: true });
    fs.mkdirSync(javaPath, { recursive: true });

    const layoutXml = `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#1E1E24"
    android:padding="16dp"
    android:orientation="horizontal"
    android:gravity="center_vertical">
    
    <LinearLayout 
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_weight="1"
        android:orientation="vertical">
        <TextView
            android:id="@+id/widget_city"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="📍 ---"
            android:textColor="#FFFFFF"
            android:textSize="16sp"
            android:textStyle="bold" />
        <TextView
            android:id="@+id/widget_desc"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Ανοίξτε την εφαρμογή"
            android:textColor="#A0A0A0"
            android:textSize="12sp"
            android:layout_marginTop="2dp" />
    </LinearLayout>

    <LinearLayout
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:gravity="center_vertical">
        <TextView
            android:id="@+id/widget_emoji"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="🌤️"
            android:textSize="32sp"
            android:layout_marginEnd="10dp"/>
        <TextView
            android:id="@+id/widget_temp"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="--°C"
            android:textColor="#FFFFFF"
            android:textSize="26sp"
            android:textStyle="bold" />
    </LinearLayout>
</LinearLayout>`;

    const infoXml = `<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="180dp"
    android:minHeight="70dp"
    android:updatePeriodMillis="1800000"
    android:initialLayout="@layout/widget_layout"
    android:resizeMode="horizontal|vertical"
    android:widgetCategory="home_screen">
</appwidget-provider>`;

    const kotlinCode = `package com.nikoskon.FitWeather

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews

class FitWeatherWidget : AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val prefs = context.getSharedPreferences("FitWeatherPrefs", Context.MODE_PRIVATE)
            val city = prefs.getString("widget_city", "FitWeather")
            val temp = prefs.getString("widget_temp", "--°C")
            val desc = prefs.getString("widget_desc", "Ανοίξτε την εφαρμογή")
            val emoji = prefs.getString("widget_emoji", "🌤️")

            val views = RemoteViews(context.packageName, R.layout.widget_layout)
            views.setTextViewText(R.id.widget_city, "📍 " + city)
            views.setTextViewText(R.id.widget_temp, temp)
            views.setTextViewText(R.id.widget_desc, desc)
            views.setTextViewText(R.id.widget_emoji, emoji)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}`;

    fs.writeFileSync(path.join(resPath, 'layout/widget_layout.xml'), layoutXml);
    fs.writeFileSync(path.join(resPath, 'xml/widget_info.xml'), infoXml);
    fs.writeFileSync(path.join(javaPath, 'FitWeatherWidget.kt'), kotlinCode);

    return config;
  }]);

  return config;
};