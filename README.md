# ANIM AI Android

ANIM AI dibungkus menjadi aplikasi Android berbasis WebView lokal. Tidak perlu deploy ke GitHub Pages.

## Build APK melalui GitHub Actions
1. Upload seluruh isi folder ini ke repository GitHub.
2. Buka tab **Actions**.
3. Pilih workflow **Build ANIM AI APK**.
4. Jalankan **Run workflow** atau tunggu build otomatis setelah push.
5. Buka hasil workflow yang sukses, lalu unduh artifact `ANIM-AI-debug-apk`.
6. Ekstrak ZIP artifact dan instal `app-debug.apk` di Android.

## Spesifikasi
- Package: `com.rafi.animai`
- Minimum Android: 10 (API 29)
- Target SDK: 35
- Java 17, Gradle 8.9, Android Gradle Plugin 8.7.3
- WebView memuat aset aplikasi secara lokal.
- MP4 disimpan ke folder `Download/ANIM AI`.

## Catatan
Gemini API dan FFmpeg WebAssembly tetap memerlukan internet. API key dimasukkan sendiri di aplikasi dan digunakan langsung dari perangkat; jangan membagikan APK yang berisi key pribadi. Ekspor 720p berdurasi 60 detik dapat berat pada perangkat seluler.
