# ANIM AI Android — Updated

Studio animasi 2D Android berbasis WebView lokal. Proyek ini menyusun konsep dengan Gemini, mengambil referensi prinsip desain dari Tavily (opsional), membuat frame SVG, memutar preview per frame, dan mengekspor MP4.

## Build APK lewat GitHub Actions
1. Upload isi folder ini ke repository GitHub.
2. Buka tab **Actions** dan pilih **Build ANIM AI APK**.
3. Jalankan **Run workflow** atau push ke branch `main`.
4. Setelah workflow sukses, unduh artifact `ANIM-AI-debug-apk` dan ekstrak `app-debug.apk`.

Workflow juga menjalankan pemeriksaan sintaks JavaScript sebelum build Android.

## Spesifikasi
- Package: `com.rafi.animai`
- Minimum Android: 10 (API 29)
- Target SDK: 35
- Java 17, Gradle 8.9, Android Gradle Plugin 8.7.3
- MP4 disimpan melalui MediaStore ke `Download/ANIM AI`.

## Fitur update
- Timer AI aktif selama permintaan Gemini berlangsung.
- Produksi menyimpan 12 frame SVG per adegan.
- Preview memutar frame pada timeline kontinu dan mendukung seek.
- Ekspor mengambil frame hasil produksi yang sama, merekam WebM, lalu mengonversinya ke MP4 H.264 menggunakan FFmpeg WebAssembly.
- Pesan error diperjelas untuk WebView tanpa dukungan MediaRecorder.

## Setup Gemini
Masukkan Gemini API key sendiri di aplikasi. Jangan unggah key ke repository atau membagikan APK yang menyimpan key pribadi. Gunakan key yang dikelola dengan aman.

## Riset Tavily (opsional)
1. Deploy repository ini ke Vercel.
2. Atur `TAVILY_API_KEY` di Vercel → Settings → Environment Variables.
3. Deploy ulang dan isi URL `https://nama-project.vercel.app/api/research` di aplikasi.

Tavily digunakan hanya dari backend sehingga key tidak dimasukkan ke APK. Backend contoh ini belum memiliki autentikasi atau rate limit per pengguna; jangan buka endpoint publik tanpa pembatasan bila dipakai banyak orang.

## Tentang Pexafy
Pexafy tidak diaktifkan di build ini. Ketentuan layanan Pexafy menetapkan usia minimum 16 tahun. Jangan membuat akun atau menggunakan API jika belum memenuhi syarat tersebut. Referensi visual dapat ditambahkan sendiri dari aset yang memang boleh digunakan.

## Catatan ekspor dan pengujian
FFmpeg WebAssembly mengunduh komponen sekitar 30 MB. Ekspor 720p selama 60 detik dapat memerlukan waktu dan memori cukup besar di HP. Mulai uji dengan durasi 30 detik. Kode dan sintaks JS sudah diperiksa di lingkungan build ini, tetapi APK belum diuji pada perangkat Android fisik; hasil GitHub Actions dan pengujian HP tetap perlu dilakukan.
