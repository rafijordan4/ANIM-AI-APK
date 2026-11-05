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


## Riset desain online (Tavily + Pexafy)

ANIM AI dapat mengambil ringkasan referensi desain/animasi dari Tavily dan foto inspirasi dari Pexafy sebelum Gemini menyusun karakter serta storyboard. API key riset **tidak** dimasukkan ke APK.

### Deploy backend melalui Vercel

1. Push folder proyek ini ke GitHub.
2. Import repository ke Vercel sebagai project.
3. Di Vercel → Settings → Environment Variables, tambahkan:
   - `TAVILY_API_KEY` = API key Tavily
   - `PEXAFY_API_KEY` = API key Pexafy
4. Deploy project. Endpoint backend akan menjadi `https://nama-project.vercel.app/api/research`.
5. Di ANIM AI, tempel URL tersebut ke kolom **RESEARCH BACKEND URL**. URL ini bukan rahasia dan boleh disimpan pada perangkat.

Backend menjalankan dua pencarian secara bersamaan. Tavily mengembalikan ringkasan dan sumber web; Pexafy mengembalikan foto referensi beserta URL, sumber, dan informasi atribusi yang tersedia. Referensi digunakan sebagai inspirasi prinsip desain, bukan untuk menyalin karakter atau karya lain.

### Keamanan

- Jangan menaruh `TAVILY_API_KEY` atau `PEXAFY_API_KEY` di `app.js`, `index.html`, APK, atau repository.
- Jika API key pernah ditempel ke chat publik atau repository, cabut key tersebut dan buat yang baru.
- Endpoint demo ini belum memiliki autentikasi pengguna atau pembatasan kuota per pengguna. Untuk distribusi publik, tambahkan autentikasi dan rate limiting sebelum membagikan endpoint.
- Periksa ketentuan lisensi dan atribusi masing-masing sumber foto sebelum memakai hasilnya di karya yang dipublikasikan.

### Produksi dan timer

Produksi membuat 12 variasi fase SVG per adegan dan menampilkan waktu proses aktual. Ekspor MP4 tetap memakai FFmpeg WebAssembly dan proses ini cukup berat untuk video panjang/resolusi tinggi di HP; uji durasi pendek terlebih dahulu.


## Ikon aplikasi
Ikon launcher adaptive ANIM AI tersedia di `app/src/main/res/mipmap-anydpi-v26` dengan foreground vector dan varian monochrome untuk Android yang mendukung ikon bertema.


## APK build notes

This repository is an Android APK project. Build with GitHub Actions workflow `Build ANIM AI APK`. The workflow installs Android platform 35 and build-tools 35.0.0 and does not request the deprecated Android SDK `tools` package. Existing Tavily/Pexafy integration files and app behavior are preserved in this ZIP; API keys must remain in their existing secure runtime configuration and must not be committed to Git.
