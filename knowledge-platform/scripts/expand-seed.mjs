/**
 * Generates supplemental seed JSON (articles, fun facts, trivia).
 * Run: node scripts/expand-seed.mjs
 */
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "data", "seed");

const articleTemplate = (id, title, summary, category, tags, sections, related, readTime = 5) => ({
  id,
  title,
  summary,
  category,
  tags,
  content: sections,
  related,
  source: "internal",
  author: "Tim Redaksi Knowledge Hub",
  publishedAt: "2026-04-01",
  updatedAt: "2026-04-01",
  readTime,
  level: "pemula",
  verified: true,
});

const p = (text) => ({ type: "p", text });
const h2 = (text) => ({ type: "h2", text });
const h3 = (text) => ({ type: "h3", text });
const ul = (items) => ({ type: "ul", items });
const ref = (text) => [h3("Referensi"), p(text)];

const extraArticles = [
  articleTemplate(
    "art-moores-law",
    "Hukum Moore dan Batas Skala Semikonduktor",
    "Gordon Moore memperkirakan jumlah transistor ganda setiap ~2 tahun; prediksi ini menginspirasi industri chip meski batas fisika makin dekat.",
    "technology",
    ["chip", "sejarah", "semikonduktor"],
    [
      h2("Asal prediksi"),
      p(
        "Pada 1965, Gordon Moore (Intel) menulis bahwa jumlah komponen per chip terintegrasi cenderung berlipat ganda kira-kira setiap tahun. Tahun 1975 prediksi disesuaikan menjadi kira-kira dua tahun. Observasi ini kemudian populer sebagai \"Hukum Moore\" — bukan hukum fisika, melainkan tren industri yang didorong R&D dan ekonomi skala."
      ),
      h2("Dampak praktis"),
      p(
        "Selama puluhan tahun, peningkatan kepadatan transistor membuat prosesor lebih cepat dan hemat daya per operasi, sehingga laptop, ponsel, dan cloud computing bisa berkembang pesat. Para perancang chip mengandalkan node proses yang lebih kecil (nm) dan arsitektur baru."
      ),
      h2("Mengapa melambat"),
      ul([
        "Efek kuantum dan kebocoran arus makin signifikan pada skala sangat kecil.",
        "Biaya fabrikasi fab ultra-canggih melonjak drastis.",
        "Peningkatan performa tunggal core CPU tidak lagi se-linear; optimasi paralel dan akselerator (GPU, TPU) makin penting.",
      ]),
      ...ref(
        "Ringkasan sejarah dan interpretasi Hukum Moore: artikel dan dokumentasi Intel; literatur teknik semikonduktor (IEEE)."
      ),
    ],
    ["art-cpu-basics", "art-ram-basics"]
  ),
  articleTemplate(
    "art-dns-basics",
    "DNS: Buku Telepon Internet",
    "DNS menerjemahkan nama domain seperti example.com menjadi alamat IP agar browser menemukan server yang benar.",
    "technology",
    ["networking", "dns", "internet"],
    [
      h2("Masalah yang diselesaikan DNS"),
      p(
        "Manusia lebih mudah mengingat nama domain daripada angka IP (IPv4/IPv6). DNS (Domain Name System) adalah sistem terdistribusi yang menyimpan catatan: nama → alamat IP, mail server, dan data lain."
      ),
      h2("Alur singkat saat Anda membuka situs"),
      ul([
        "Browser bertanya ke resolver (biasanya dari ISP atau DNS publik).",
        "Resolver menanyakan hierarki: root → TLD (.com) → authoritative nameserver domain.",
        "Jawaban di-cache sesuai TTL untuk mengurangi latensi.",
      ]),
      h2("Keamanan"),
      p(
        "DNSSEC menambahkan tanda tangan kriptografi agar respons DNS lebih sulit dipalsukan. DNS over HTTPS (DoH) mengenkripsi query agar tidak mudah dibaca di jaringan lokal."
      ),
      ...ref("Spesifikasi dan penjelasan DNS: RFC 1034/1035; dokumentasi ICANN dan registrars."),
    ],
    ["art-https-basics", "art-cpu-basics"]
  ),
  articleTemplate(
    "art-git-basics",
    "Git dan Kontrol Versi untuk Pemula",
    "Git melacak perubahan kode, memungkinkan kolaborasi tim, cabang fitur, dan rollback yang aman.",
    "technology",
    ["git", "devops", "kolaborasi"],
    [
      h2("Mengapa kontrol versi"),
      p(
        "Tanpa kontrol versi, tim mudah saling menimpa file. Git menyimpan snapshot (commit) beserta metadata: siapa, kapan, dan pesan perubahan. Setiap commit merujuk commit sebelumnya sehingga terbentuk riwayat."
      ),
      h2("Konsep inti"),
      ul([
        "Repository — folder proyek + database riwayat Git.",
        "Branch — garis pengembangan paralel (mis. fitur login).",
        "Merge — menggabungkan branch kembali ke main.",
        "Remote — salinan di server (GitHub, GitLab, dll.).",
      ]),
      h2("Alur kerja umum"),
      p(
        "Clone → buat branch → edit → git add → git commit → push → buka pull request → review → merge. Conflict terjadi jika dua branch mengubah baris sama; diselesaikan manual lalu commit."
      ),
      ...ref("Dokumentasi resmi Git (git-scm.com) dan Pro Git (Scott Chacon)."),
    ],
    ["art-https-basics", "art-dns-basics"]
  ),
  articleTemplate(
    "art-api-rest",
    "API REST: Cara Aplikasi Saling Berbicara",
    "REST memanfaatkan HTTP (GET, POST, PUT, DELETE) dan URL sumber daya untuk pertukaran data antar layanan.",
    "technology",
    ["api", "web", "backend"],
    [
      h2("Apa itu API"),
      p(
        "Application Programming Interface adalah kontrak antar program. REST (Representational State Transfer) adalah gaya arsitektur populer di web: setiap URL mengidentifikasi sumber daya, dan verb HTTP menunjukkan operasi."
      ),
      h2("Prinsip praktis"),
      ul([
        "GET — baca data tanpa mengubah server (idempotent).",
        "POST — buat sumber daya baru.",
        "PUT/PATCH — perbarui sebagian atau seluruh.",
        "DELETE — hapus.",
        "Gunakan kode status HTTP (200, 201, 404, 422) dengan konsisten.",
      ]),
      h2("JSON dan dokumentasi"),
      p(
        "Payload umumnya JSON. OpenAPI/Swagger membantu mendokumentasikan endpoint agar frontend dan partner integrasi selaras."
      ),
      ...ref("Fielding dissertation (2000) tentang REST; spesifikasi HTTP (IETF RFC 9110)."),
    ],
    ["art-git-basics", "art-https-basics"]
  ),
  articleTemplate(
    "art-storage-basics",
    "Penyimpanan Data: HDD, SSD, dan Cloud",
    "Perbedaan media penyimpanan lokal dan cloud mempengaruhi kecepatan, biaya, dan keandalan aplikasi.",
    "technology",
    ["storage", "ssd", "cloud"],
    [
      h2("HDD vs SSD"),
      p(
        "Hard Disk Drive (HDD) memakai piringan magnetik mekanik — kapasitas besar dengan biaya per GB rendah. Solid State Drive (SSD) memakai flash NAND tanpa bagian bergerak: jauh lebih cepat untuk boot OS dan load aplikasi, tetapi harga per GB lebih tinggi."
      ),
      h2("Cloud object storage"),
      p(
        "Layanan seperti S3-compatible storage menyimpan file sebagai objek dengan metadata. Cocok untuk backup, media statis, dan data lake; latensi jaringan perlu diperhitungkan."
      ),
      h2("Tips praktis"),
      ul([
        "OS dan aplikasi utama di SSD; arsip besar di HDD atau cloud.",
        "Selalu punya backup terpisah (3-2-1 rule: 3 salinan, 2 media, 1 offsite).",
      ]),
      ...ref("Panduan produsen storage dan dokumentasi cloud provider (AWS, GCP, Azure)."),
    ],
    ["art-ram-basics", "art-cpu-basics"]
  ),
  articleTemplate(
    "art-tls-handshake",
    "TLS Handshake: Pertukuan Kunci Aman",
    "Sebelum data HTTPS terenkripsi, klien dan server sepakat versi TLS, cipher suite, dan kunci sesi.",
    "technology",
    ["keamanan", "tls", "https"],
    [
      h2("Tujuan handshake"),
      p(
        "TLS memastikan kerahasiaan (enkripsi), integritas (deteksi manipulasi), dan autentikasi server (sertifikat). Handshake awal bisa 1-RTT (TLS 1.3) atau lebih pada versi lama."
      ),
      h2("Peran sertifikat"),
      p(
        "Server present sertifikat X.509 yang ditandatangani Certificate Authority (CA). Browser memverifikasi rantai ke trust store. Sertifikat self-signed hanya cocok untuk development lokal."
      ),
      h2("TLS 1.3"),
      p(
        "Versi modern menghapus cipher lemah dan memperpendek handshake, mengurangi latensi sekaligus meningkatkan keamanan default."
      ),
      ...ref("RFC 8446 (TLS 1.3); dokumentasi Mozilla SSL Configuration Generator."),
    ],
    ["art-https-basics", "art-dns-basics"]
  ),
  articleTemplate(
    "art-photosynthesis",
    "Fotosintesis: Mengubah Cahaya Menjadi Energi Kimia",
    "Tumbuhan, alga, dan sebagian bakteri mengubah CO₂ dan air menjadi glukosa dengan bantuan klorofil dan cahaya.",
    "science",
    ["biologi", "tumbuhan", "energi"],
    [
      h2("Reaksi keseluruhan (disederhanakan)"),
      p(
        "6 CO₂ + 6 H₂O + cahaya → C₆H₁₂O₆ + 6 O₂. Oksigen yang kita hirup adalah produk samping penting fotosintesis."
      ),
      h2("Dua tahap utama"),
      ul([
        "Reaksi terang — di tilakoid kloroplast; energi foton memecah air, menghasilkan ATP, NADPH, dan O₂.",
        "Siklus Calvin — di stroma; CO₂ difiksasi menjadi gula dengan ATP dan NADPH.",
      ]),
      h2("Mengapa penting bagi ekosistem"),
      p(
        "Fotosintesis menjadi basis rantai makanan dan menyerap karbon dioksida atmosfer. Perubahan iklim mempengaruhi laju fotosintesis global melalui suhu, CO₂, dan kekeringan."
      ),
      ...ref("Buku teks biologi sel (Alberts dkk.); NASA Earth Observatory tentang siklus karbon."),
    ],
    ["art-gravity-basics", "art-dna-intro"]
  ),
  articleTemplate(
    "art-gravity-basics",
    "Gravitasi: Gaya Tarik Massa",
    "Newton menjelaskan gravitasi sebagai gaya proporsional massa dan berbanding terbalik kuadrat jarak; Einstein memperluas dengan kelengkungan ruang-waktu.",
    "science",
    ["fisika", "gravitasi", "newton"],
    [
      h2("Hukum Newton"),
      p("F = G·m₁·m₂ / r². Semua massa saling tarik; gaya lemah untuk benda kecil, dominan untuk planet dan bintang."),
      h2("Efek sehari-hari"),
      ul([
        "Berat badan ≈ massa × percepatan gravitasi lokal (≈9,8 m/s² di permukaan Bumi).",
        "Orbit satelit dan bulan adalah keseimbangan gravitasi dan kecepatan tangensial.",
      ]),
      h2("Relativitas umum (garis besar)"),
      p(
        "Einstein memodelkan gravitasi bukan sebagai gaya jarak jauh, melainkan kelengkungan ruang-waktu oleh massa-energi. Prediksi seperti presepsi orbit Merkurius dan lensa gravitasi telah teruji observasi."
      ),
      ...ref("NASA Science — Gravity; teks fisika universitas tentang mekanika klasik dan relativitas."),
    ],
    ["art-photosynthesis", "art-periodic-table"]
  ),
  articleTemplate(
    "art-dna-intro",
    "DNA: Molekul Instruksi Hidup",
    "DNA menyimpan informasi genetik dalam urutan basa A, T, C, G yang disalin saat sel membelah.",
    "science",
    ["biologi", "genetika", "dna"],
    [
      h2("Struktur double helix"),
      p(
        "Watson, Crick, Franklin, dan Wilkins mengungkap heliks ganda (1953): dua untai komplementer dengan pasangan basa A–T dan C–G, stabil oleh ikatan hidrogen."
      ),
      h2("Dari gen ke protein"),
      p(
        "Transkripsi menghasilkan RNA messenger; ribosom menerjemahkan kodon menjadi rangkaian asam amino (protein). Mutasi perubahan urutan dapat netral, menguntungkan, atau merugikan."
      ),
      h2("Aplikasi modern"),
      ul([
        "Diagnostik medis dan skrining genetik.",
        "Forensik dan identifikasi.",
        "Biologi sintetis — desain sekuens dengan prinsip etika ketat.",
      ]),
      ...ref("NIH Genetics Home Reference; Nature Education Scitable — DNA structure."),
    ],
    ["art-photosynthesis", "art-climate-basics"]
  ),
  articleTemplate(
    "art-periodic-table",
    "Tabel Periodik: Peta Elemen",
    "Susunan periodik Mendeleev mengelompokkan elemen menurut nomor atom dan sifat berulang (periodisitas).",
    "science",
    ["kimia", "elemen", "mendeleev"],
    [
      h2("Nomor atom dan massa"),
      p(
        "Nomor atom (Z) = jumlah proton; menentukan identitas elemen. Isotop memiliki neutron berbeda; massa atom rata-rata tercermin pada massa periodik."
      ),
      h2("Golongan dan periode"),
      ul([
        "Golongan (kolom) — valensi elektron serupa (mis. gas mulia, halogen).",
        "Periode (baris) — lapis elektron bertambah.",
        "Logam, metalloid, dan nonlogam terletak di area berbeda.",
      ]),
      h2("Elemen sintetis"),
      p(
        "Elemen transuranium (atom >92) umumnya tidak stabil radioaktif; diciptakan di reaktor atau akselerator partikel."
      ),
      ...ref("IUPAC Periodic Table of Elements; Royal Society of Chemistry education resources."),
    ],
    ["art-gravity-basics", "art-climate-basics"]
  ),
  articleTemplate(
    "art-climate-basics",
    "Perubahan Iklim: Evidensi dan Mekanisme",
    "Peningkatan gas rumah kaca dari aktivitas manusia memanaskan atmosfer; konsensus ilmiah didukung data multi-decade.",
    "science",
    ["iklim", "lingkungan", "co2"],
    [
      h2("Bukti observasi"),
      p(
        "Rekor suhu permukaan, pencairan es kutub, kenaikan permukaan laut, dan perubahan pola cuaca ekstrem konsisten dengan model fisika atmosfer. Badan seperti IPCC mensintesis ribuan studi."
      ),
      h2("Mekanisme utama"),
      p(
        "CO₂, CH₄, dan N₂O menahan radiasi inframerah. Membakar bahan bakar fosil, deforestasi, dan industri semen/pertanian meningkatkan konsentrasi atmosfer."
      ),
      h2("Mitigasi dan adaptasi"),
      ul([
        "Transisi energi terbarukan dan efisiensi.",
        "Carbon capture (dengan trade-off biaya).",
        "Adaptasi infrastruktur pesisir dan pertanian.",
      ]),
      ...ref("Laporan IPCC Assessment Reports; NOAA Global Climate Dashboard."),
    ],
    ["art-photosynthesis", "art-dna-intro"]
  ),
  articleTemplate(
    "art-vaccines-immune",
    "Vaksin dan Sistem Imun",
    "Vaksin melatih imunitas adaptif mengenali patogen tanpa penyakit penuh, melalui antigen mati/lemah atau platform mRNA.",
    "science",
    ["kesehatan", "imunologi", "vaksin"],
    [
      h2("Imunitas innate vs adaptif"),
      p(
        "Imunitas bawaan merespons cepat secara umum. Imunitas adaptif (sel B dan T) membentuk memori spesifik antigen — dasar efek vaksin."
      ),
      h2("Jenis vaksin"),
      ul([
        "Inactivated/attenuated — virus dibunuh atau dilemahkan.",
        "Subunit/rekombinan — protein spesifik saja.",
        "mRNA — sel host memproduksi protein antigen sementara.",
      ]),
      h2("Keamanan dan efektivitas"),
      p(
        "Vaksin melewati uji klinis fase I–III sebelum disetujui regulator (FDA, EMA, BPOM). Efek samping umum ringan (demam, nyeri injeksi); monitoring berkelanjutan via pharmacovigilance."
      ),
      ...ref("WHO Vaccines explainer; CDC Immunization guidelines."),
    ],
    ["art-dna-intro", "art-climate-basics"]
  ),
  articleTemplate(
    "art-chess-opening",
    "Pembukaan Catur: Prinsip Dasar",
    "Kontrol pusat, kembangkan pieza ringan, amankan raja — prinsip yang mendasari pembukaan klasik.",
    "chess",
    ["catur", "pembukaan", "strategi"],
    [
      h2("Tujuan pembukaan"),
      p(
        "Pembukaan bukan hafalan langkah, melainkan rencana: tempati kotak sentral (e4, d4, e5, d5), kembangkan kuda dan gajah, rokade cepat, hindari gerak pieza yang sama berulang tanpa alasan."
      ),
      h2("Contoh populer"),
      ul([
        "Italian Game — 1.e4 e5 2.Nf3 Nc6 3.Bc4 fokus pusat dan serangan cepat.",
        "Queen's Gambit — 1.d4 d5 2.c4 menawarkan pion untuk kontrol pusat.",
        "Sicilian Defense — 1.e4 c5 asymetris hitam.",
      ]),
      h2("Kesalahan pemula"),
      p(
        "Menggerakkan ratu terlalu awal, mengabaikan rokade, atau membuka diagonal terhadap raja sendiri sering dihukum taktik lawan."
      ),
      ...ref("Buku pembukaan resmi FIDE; Lichess opening explorer (database partai)."),
    ],
    ["art-chess-fork", "art-chess-endgame"]
  ),
  articleTemplate(
    "art-chess-endgame",
    "Endgame Catur: Raja Aktif dan Promosi",
    "Saat pieza berkurang, raja menjadi kuat; promosi pion sering menentukan hasil.",
    "chess",
    ["catur", "endgame", "pion"],
    [
      h2("Prinsip endgame"),
      ul([
        "Aktifkan raja — maju ke pusat, jangan tinggal di pojok.",
        "Pion lewat (passed pawn) harus didorong dengan dukungan raja.",
        "Opposisi dan zugzwang dapat memaksa lawan gerak merugikan.",
      ]),
      h2("Raja dan pion vs raja"),
      p(
        "Pion di baris ke-7 dengan raja mendukung biasanya menang jika kotak promosi dapat dijaga. Pelajari \"kotak promosi\" dan trik stalemate agar tidak remis kehilangan menang."
      ),
      h2("Latihan"),
      p("Gunakan puzzle endgame di Lichess atau platform lokal; pahami Lucena dan Philidor pada rook endgame klasik."),
      ...ref("Silman — Complete Endgame Course; tablebase online untuk posisi ≤7 piece."),
    ],
    ["art-chess-opening", "art-chess-fork"]
  ),
  articleTemplate(
    "art-chess-skewer",
    "Taktik Catur: Skewer (Tusuk)",
    "Skewer menyerang pieza berharga di depan sehingga pieza di belakangnya dapat ditangkap setelah yang depan minggat.",
    "chess",
    ["catur", "taktik", "skewer"],
    [
      h2("Skewer vs pin"),
      p(
        "Pin menahan pieza depan karena pieza berharga di belakang. Skewer kebalikannya: pieza depan (sering raja atau ratu) terpaksa minggat, memperlihatkan pieza di belakang."
      ),
      h2("Contoh bidak"),
      p(
        "Bidak putih di diagonal mengecek raja hitam; raja minggat, bidak menangkap ratu di belakangnya. Skewer absolut dengan raja sangat kuat karena raja harus gerak."
      ),
      h2("Tips"),
      p("Periksa garis bidak dan rook setiap langkah; perhatikan urutan cek yang membuka skewer."),
      ...ref("Chess.com / Lichess tactics trainer — tema skewer."),
    ],
    ["art-chess-pin", "art-chess-fork"]
  ),
  articleTemplate(
    "art-chess-notation",
    "Notasi Catur Algebraik",
    "Notasi SAN/algebraik standar (e4, Nf3, O-O) memudahkan rekam partai dan baca buku catur.",
    "chess",
    ["catur", "notasi", "pembelajaran"],
    [
      h2("Kolom dan baris"),
      p("Kolom a–h dari kiri (sisi putih) ke kanan; baris 1–8 dari dekat putih ke hitam. e4 berarti pion ke e4."),
      h2("Simbol pieza"),
      ul(["K raja", "Q ratu", "R benteng", "B gajah", "N kuda", "Pion tanpa huruf"]),
      h2("Rokade dan simbol lain"),
      p("O-O rokade sayap menteri; O-O-O sayap ratu. + cek, # mat, x tangkap, !? langkah menarik."),
      ...ref("FIDE Laws of Chess — appendix notation."),
    ],
    ["art-chess-opening", "art-chess-fork"]
  ),
  articleTemplate(
    "art-chess-blitz",
    "Blitz dan Rapid: Catur Bertempo",
    "Kontrol waktu mengubah gaya: blitz (≤3 menit) menuntut intuisi taktik; rapid memberi ruang perhitungan.",
    "chess",
    ["catur", "waktu", "blitz"],
    [
      h2("Klasifikasi FIDE"),
      ul([
        "Classical — lebih dari 60 menit per pemain.",
        "Rapid — lebih dari 10, kurang dari 60 menit.",
        "Blitz — 10 menit atau kurang (termasuk increment kecil).",
      ]),
      h2("Increment (Fischer)"),
      p(
        "Setiap langkah menambah detik (mis. +2 detik) sehingga partai tidak selalu habis di time scramble murni."
      ),
      h2("Online vs OTB"),
      p("Lichess/Chess.com menggunakan server clock; over-the-board memakai jam fisik dengan tombol lever."),
      ...ref("FIDE handbook — time controls; Lichess FAQ waktu."),
    ],
    ["art-chess-notation", "art-chess-endgame"]
  ),
  articleTemplate(
    "art-anime-studio-ghibli",
    "Studio Ghibli: Animasi dengan Jiwa Ekologi",
    "Ghibli dipimpin Miyazaki dan Takahata, dikenal karya seperti Totoro, Mononoke, dan Spirited Away.",
    "anime",
    ["anime", "ghibli", "miyazaki"],
    [
      h2("Sejarah singkat"),
      p(
        "Didirikan 1985 setelah sukses Nausicaä. Nama dari Libyan Arabic \"ghibli\" (angin panas Sahara). Film-film Ghibli sering menonjolkan alam, pacifisme, dan heroine muda."
      ),
      h2("Karya landmark"),
      ul([
        "My Neighbor Totoro (1988) — ikon budaya pop Jepang.",
        "Princess Mononoke (1997) — tema industri vs hutan.",
        "Spirited Away (2001) — Oscar Best Animated Feature.",
      ]),
      h2("Gaya produksi"),
      p(
        "Banyak adegan animasi tradisional; latar detail hand-painted. Musik sering oleh Joe Hisaishi. (Informasi canon dari rilis resmi dan wawancara sutradara.)"
      ),
      ...ref("Situs resmi Studio Ghibli; data film di MyAnimeList/ANN untuk tanggal rilis."),
    ],
    ["art-anime-otaku", "art-anime-manga-diff"]
  ),
  articleTemplate(
    "art-anime-manga-diff",
    "Perbedaan Anime dan Manga",
    "Manga adalah komik Jepang cetak/digital; anime adalah adaptasi animasi (atau karya orisinal animasi).",
    "anime",
    ["anime", "manga", "budaya"],
    [
      h2("Manga"),
      p(
        "Dibaca kanan-ke-kiri dalam edisi Jepang; genre sangat luas (shonen, seinen, josei, slice of life). Banyak anime adalah adaptasi manga, light novel, atau game."
      ),
      h2("Anime"),
      p(
        "Produksi kolaboratif studio, sutradara, seiyuu, dan komposer. Episode TV ~24 menit; film layar lebar durasi lebih panjang. Adaptasi bisa faithful atau divergen (Canon vs filler — cek daftar episode resmi)."
      ),
      h2("Di mana memulai"),
      p("Pilih satu judul populer sesuai selera; verifikasi rating usia dan content warning di database resmi distributor."),
      ...ref("ANN encyclopedia; Shonen Jump / publisher sites untuk manga serial."),
    ],
    ["art-anime-studio-ghibli", "art-anime-otaku"]
  ),
  articleTemplate(
    "art-anime-seiyuu",
    "Seiyuu: Pengisi Suara di Industri Anime",
    "Seiyuu (voice actor) Jepang sering juga bernyanyi tema OP/ED dan tampil di event fan.",
    "anime",
    ["anime", "seiyuu", "industri"],
    [
      h2("Peran seiyuu"),
      p(
        "Mengisi dialog karakter, narasi, dan kadang dubbing game. Casting dipengaruhi timbre suara, chemistry antar pemeran, dan popularitas idola seiyuu."
      ),
      h2("Latihan dan industri"),
      p(
        "Banyak lulus sekolah seiyuu; kompetisi ketat. Kontrak bisa per judul atau agency. (Spesifik gaji bervariasi; angka pasti jarang publik.)"
      ),
      h2("Fan culture"),
      p("Event AnimeJapan, Comiket, dan live concert tema anime mempererat hubungan seiyuu-fans; hormati batas privasi artis."),
      ...ref("Agency profiles resmi; interview di Animage/Newtype (sumber sekunder industri)."),
    ],
    ["art-anime-manga-diff", "art-anime-otaku"]
  ),
  articleTemplate(
    "art-anime-shonen",
    "Genre Shonen: Aksi, Persahabatan, Pertumbuhan",
    "Shonen ditujukan remaja laki-laki (bukan exclusif); tema umum: latihan, rival, melindungi teman.",
    "anime",
    ["anime", "shonen", "genre"],
    [
      h2("Ciri umum"),
      ul([
        "Protagonis underdog yang berkembang kuat.",
        "Grup teman (nakama) dan mentor.",
        "Arc turnamen atau pertarungan bergelombang.",
      ]),
      h2("Contoh populer (canon publikasi)"),
      p(
        "One Piece (Oda), Naruto (Kishimoto), Dragon Ball (Toriyama), My Hero Academia (Horikoshi) — masing-masing punya manga serial resmi di Weekly Shonen Jump atau majalah sejenis."
      ),
      h2("Kritik sehat"),
      p(
        "Beberapa shonen panjang punya pacing lambat atau filler anime; cek panduan episode filler komunitas resmi atau database episode."
      ),
      ...ref("Viz Media / MANGA Plus untuk rilis legal manga; Shonen Jump catalog."),
    ],
    ["art-anime-manga-diff", "art-anime-isekai"]
  ),
  articleTemplate(
    "art-anime-isekai",
    "Isekai: Ketika Protagonis Pindah Dunia",
    "Subgenre isekai menempatkan karakter dari dunia modern ke fantasi; populer di 2010-an via light novel dan anime adaptasi.",
    "anime",
    ["anime", "isekai", "light-novel"],
    [
      h2("Tropes umum"),
      ul([
        "Truck-kun (celaka lalu reinkarnasi) — meme fan, bukan aturan canon.",
        "Sistem level/status seperti RPG.",
        "Kekuatan unik (cheat skill) dari reinkarnasi.",
      ]),
      h2("Contoh terkenal"),
      p(
        "Re:Zero, Konosuba, Mushoku Tensei — masing-masing tone berbeda (gelap vs komedi vs coming-of-age). Spesifik plot mengacu pada light novel/anime resmi."
      ),
      h2("Teori vs canon"),
      p(
        "Interpretasi fan tentang multiverse atau power scaling adalah spekulasi unless disebut eksplisit di sumber resmi."
      ),
      ...ref("MyAnimeList tags; publisher Kadokawa/Square Enix untuk LN orisinal."),
    ],
    ["art-anime-shonen", "art-anime-manga-diff"]
  ),
  articleTemplate(
    "art-anime-production",
    "Pipeline Produksi Anime TV",
    "Dari treatment hingga sakuga: produksi anime melibatkan studio, outsourcing, dan jadwal ketat per episode.",
    "anime",
    ["anime", "produksi", "industri"],
    [
      h2("Tahap pra-produksi"),
      p(
        "Committee (sponsor) → scenario → character design → storyboard. Director (kantoku) mengarahkan visi; series composer mengatur alur episodik."
      ),
      h2("Produksi"),
      ul([
        "Layout → key animation → in-between → coloring (digital cel).",
        "Banyak studio outsource ke studio kecil (animasi jarak jauh).",
        "Crunch sebelum on-air — isu tenaga kerja sering dilaporkan media industri.",
      ]),
      h2("Distribusi"),
      p("Siaran TV Jepang, streaming global (Crunchyroll, Netflix, dll.), home video, dan merchandise."),
      ...ref("Sakuga Blog; ANN industry news; laporan Association of Japanese Animations."),
    ],
    ["art-anime-seiyuu", "art-anime-studio-ghibli"]
  ),
];

const factSeeds = [
  ["ff-light-speed", "Cahaya di vakum bergerak sekitar 299.792 km/detik — batas kecepatan informasi menurut relativitas khusus.", "Konstanta c muncul di E=mc² dan GPS harus koreksi relativitas agar akurat.", "science", ["fisika", "cahaya"], "NIST / CODATA"],
  ["ff-water-expansion", "Air mencapai kepadatan maksimum sekitar 4°C; saat membeku air memuai ~9%.", "Memuainya es menjelaskan mengapa pipa pecah dan esbergs mengapung.", "science", ["kimia", "air"], "USGS Water Science"],
  ["ff-human-bones", "Tubuh manusia dewasa memiliki 206 tulang; bayi lahir dengan lebih banyak tulang rawan yang menyatu seiring tumbuh.", "Perbedaan jumlah tulang bayi vs dewasa sering di kutip dalam anatomi dasar.", "science", ["biologi", "anatomi"], "Teks anatomi standar"],
  ["ff-brain-energy", "Otak manusia memakai sekitar 20% energi tubuh meski hanya ~2% massa badan.", "Menunjukkan betapa mahalnya proses saraf secara metabolik.", "science", ["biologi", "otak"], "Harvard Medical School — brain energy"],
  ["ff-plate-tectonics", "Lempeng tektonik bergerak beberapa sentimeter per tahun — sekitar secepat pertumbuhan kuku.", "Gerakan ini menjelaskan gempa, gunung api, dan distribusi fosil.", "science", ["geologi", "bumi"], "USGS Plate Tectonics"],
  ["ff-vaccine-history", "Vaksinasi modern dimulai dengan cacar variola; WHO menyatakan eradikasi cacar pada 1980.", "Satu-satunya penyakit manusia yang dinyatakan eradicated global.", "science", ["kesehatan", "sejarah"], "WHO Smallpox fact sheet"],
  ["ff-binary", "Sistem biner (basis-2) dipakai komputer karena sinyal listrik mudah dibedakan dua keadaan: on/off.", "Setiap bit 0 atau 1; 8 bit = 1 byte.", "technology", ["binary", "digital"], "Computer science textbooks"],
  ["ff-first-computer-bug", "Istilah \"bug\" komputer populer setelah Grace Hopper menemukan ngengat di relay Mark II (1947).", "Catatan log ngengat masih disimpan di Smithsonian.", "technology", ["sejarah", "bug"], "Smithsonian / Navy history"],
  ["ff-open-source", "Linux kernel dirilis 1991 oleh Linus Torvalds sebagai proyek open source.", "Memicu ekosistem server, Android, dan cloud modern.", "technology", ["linux", "open-source"], "kernel.org history"],
  ["ff-unicode", "Unicode mencakup lebih dari 150.000 karakter untuk hampir semua sistem tulisan dunia.", "Emoji juga distandarkan Unicode Consortium.", "technology", ["unicode", "teks"], "unicode.org FAQ"],
  ["ff-wifi-name", "Wi-Fi bukan singkatan resmi; merek dipopulerkan Wi-Fi Alliance (dulu Wireless Ethernet Compatibility Alliance).", "802.11 adalah standar IEEE teknis di balik Wi-Fi.", "technology", ["wifi", "jaringan"], "Wi-Fi Alliance / IEEE 802.11"],
  ["ff-qubit", "Qubit dapat berada superposisi 0 dan 1; komputer kuantum mengeksploitasi interferensi untuk algoritma tertentu.", "Belum menggantikan PC klasik untuk semua tugas sehari-hari.", "technology", ["kuantum", "komputasi"], "IBM Quantum / NIST post-quantum crypto"],
  ["ff-en-passant", "Aturan en passant di catur memungkinkan tangkap pion lawan yang baru maju dua kotak melewati pion Anda.", "Satu-satunya tangkapan di mana pieza tidak berakhir di kotak pieza yang ditangkap.", "chess", ["catur", "aturan"], "FIDE Laws of Chess"],
  ["ff-chess-960", "Chess960 (Fischer Random) menempatkan piece back-rank acak dengan aturan castling disesuaikan.", "Mengurangi ketergantungan hafalan pembukaan.", "chess", ["catur", "960"], "Lichess Chess960 rules"],
  ["ff-youngest-gm", "Abhimanyu Mishra menjadi Grandmaster termuda (2021) pada usia 12 tahun 4 bulan 25 hari.", "Rekor Guinness; usia GM terus turun seiring kompetisi online.", "chess", ["catur", "rekor"], "Guinness World Records / FIDE"],
  ["ff-stalemate", "Stalemate (pat) adalah remis: pemain yang giliran gerak tidak in check tetapi tidak punya legal move.", "Sering jadi penyelamat underdog di endgame.", "chess", ["catur", "remis"], "FIDE Laws"],
  ["ff-checkmate-persian", "Kata \"checkmate\" dari frase Persia \"shah mat\" (raja mati/terjebak).", "Menunjukkan sejarah catur dari India-Persia ke Eropa.", "chess", ["catur", "etimologi"], "Oxford English Dictionary etymology"],
  ["ff-mangaka-deadline", "Mangaka serial mingguan sering deadline ketat; hiatus kesehatan kadang diumumkan resmi majalah.", "Jangan asumsikan semua hiatus tanpa pengumuman publisher.", "anime", ["manga", "industri"], "Publisher announcements (Jump+)"] ,
  ["ff-one-piece-length", "Manga One Piece (Eiichiro Oda) memecahkan rekor panjang serial populer; jumlah chapter terus bertambah.", "Cek jumlah chapter terkini di publisher resmi, bukan angka fan.", "anime", ["one-piece", "manga"], "Shueisha / MANGA Plus"],
  ["ff-anime-film-box", "Spirited Away pernah menjadi film animasi highest-grossing di Jepang sebelum Demon Slayer Mugen Train (2020).", "Angka box office dari Motion Picture Producers Association of Japan.", "anime", ["box-office", "ghibli"], "MPAJ statistics"],
  ["ff-sakuga", "Istilah \"sakuga\" merujuk momen animasi berkualitas tinggi, sering diisolasi fan di clip.", "Bukan rating resmi; apresiasi estetika animasi.", "anime", ["sakuga", "animasi"], "Sakuga Blog glossary"],
  ["ff-crunchyroll", "Crunchyroll (Sony) adalah salah satu distributor streaming anime legal global terbesar.", "Mendukung simulcast dengan subtitle resmi.", "anime", ["streaming", "legal"], "Crunchyroll corporate site"],
  ["ff-ocean-salinity", "Lautan mengandung rata-rata ~35 g garam per liter air laut.", "Salinitas mempengaruhi densitas dan sirkulasi termohalin.", "science", ["laut", "salinitas"], "NOAA Ocean Service"],
  ["ff-iss-speed", "Stasiun Luar Angkasa Internasional orbit ~7,66 km/detik (~90 menit per orbit).", "Astronaut mengalami microgravity karena free-fall orbit, bukan \"zero gravity\" absolut.", "science", ["luar angkasa", "iss"], "NASA ISS facts"],
  ["ff-python-name", "Bahasa Python dinamai dari Monty Python, bukan ular.", "Guido van Rossum merilis Python 1991.", "technology", ["python", "sejarah"], "python.org history"],
  ["ff-https-padlock", "Ikon gembok browser menandakan koneksi terenkripsi TLS; bukan jaminan situs jujur secara bisnis.", "Phishing juga bisa memakai HTTPS.", "technology", ["https", "phishing"], "EFF HTTPS Everywhere FAQ"],
  ["ff-chess-computers", "Deep Blue mengalahkan Kasparov 1997 dalam match regulasi; kontroversi strategi tim IBM.", "Tonggak sejarah AI/game tree search.", "chess", ["catur", "ai"], "IBM Deep Blue archives"],
  ["ff-anime-cels", "Produksi anime tradisional memakai cel acetat; digital paint menggantikan sebagian besar cel fisik 2000-an.", "Museum anime kadang memamerkan cel asli.", "anime", ["produksi", "cel"], "Tokyo Anime Center / studio tours"],
  ["ff-moon-distance", "Jarak rata-rata Bumi-Bulan ~384.400 km — sekitar 30 diameter Bumi.", "Orbit elips sehingga jarak bervariasi (perige vs apoge).", "science", ["astronomi", "bulan"], "NASA Moon fact sheet"],
  ["ff-rust-lang", "Rust dirancang Mozilla dengan fokus memory safety tanpa garbage collector.", "Digunakan di sistem, WebAssembly, dan infrastruktur modern.", "technology", ["rust", "bahasa"], "rust-lang.org"],
  ["ff-lichess-oss", "Lichess.org adalah platform catur gratis open source tanpa iklan.", "Didanai donasi; API puzzle publik dengan rate limit.", "chess", ["lichess", "online"], "lichess.org about"],
  ["ff-anime-cour", "Satu \"cour\" anime TV biasanya 12–13 episode (satu kuartal siaran).", "Split cour membagi season dengan jeda beberapa bulan.", "anime", ["season", "cour"], "ANN encyclopedia — cour"],
  ["ff-jpeg", "JPEG kompresi foto lossy dengan DCT; tidak cocok untuk teks tajam atau transparansi.", "PNG lossless lebih baik untuk diagram UI.", "technology", ["gambar", "jpeg"], "W3C / JPEG committee"],
  ["ff-earth-age", "Bumi diperkirakan ~4,54 miliar tahun berdasarkan dating meteorit dan model geologi.", "Estimasi dengan margin ketidakpastian kecil.", "science", ["geologi", "bumi"], "USGS / Nature geochronology reviews"],
  ["ff-chess-draw", "Tigafold repetition dan fifty-move rule adalah cara remis otomatis di catur turnamen.", "Pemain harus klaim atau arbitter konfirmasi sesuai FIDE.", "chess", ["catur", "remis"], "FIDE Laws"],
  ["ff-anime-ova", "OVA/OAV adalah episode anime rilis langsung video tanpa siaran TV dulu.", "Sering budget lebih tinggi per menit.", "anime", ["ova", "rilis"], "ANN release types"],
  ["ff-tor-browser", "Tor Browser mengarahkan lalu lintas melalui relay terenkripsi untuk anonimitas jaringan.", "Bukan alat ilegal; dipakai jurnalis dan aktivis di regim represif.", "technology", ["privasi", "tor"], "torproject.org"],
  ["ff-magnus-carlsen", "Magnus Carlsen memegang rating Elo klasik tertinggi sejarah (~2882) pada periode puncaknya.", "Angka Elo berubah dinamis; cek FIDE rating terkini.", "chess", ["catur", "carlsen"], "FIDE ratings"],
  ["ff-anime-10ep", "Serial anime pendek 10–13 episode makin umum untuk adaptasi ringan light novel.", "Format cocok streaming binge-watch.", "anime", ["format", "streaming"], "Industry reports ANN"],
  ["ff-ssd-wear", "SSD NAND punya terbatas program/erase cycles; wear leveling memperpanjang umur.", "Estimasi TBW tercantum di spesifikasi produsen.", "technology", ["ssd", "hardware"], "Vendor datasheets"],
  ["ff-black-hole", "Lubang hitam tidak \"hisap\" lebih kuat dari bintang sebelum collapse jika massa sama.", "Gravitasi surface tergantung massa dan jarak Schwarzschild.", "science", ["astrofisika", "lubang-hitam"], "NASA Black Holes"],
  ["ff-chess-pawn-promo", "Pion yang mencapai baris terakhir harus dipromosikan menjadi Q, R, B, atau N — tidak bisa tetap pion.", "Promosi ke ratu paling umum.", "chess", ["catur", "promosi"], "FIDE Laws"],
  ["ff-anime-dub", "Simuldub memproduksi dub bahasa Inggris hampir bersamaan rilis Jepang.", "Kualitas dub bervariasi per studio (Bang Zoom, Funimation/Crunchyroll).", "anime", ["dub", "lokalization"], "Crunchyroll news"],
  ["ff-http-status", "HTTP 404 artinya sumber daya tidak ditemukan di server; 503 sering maintenance/overload.", "Membantu debug API dan web.", "technology", ["http", "web"], "RFC 9110 status codes"],
  ["ff-blood-types", "Sistem golongan darah ABO dan Rh menentukan kompatibilitas transfusi.", "Transfusi salah bisa fatal — crossmatch wajib.", "science", ["medis", "darah"], "Red Cross blood types"],
  ["ff-chess-clock", "Bobby Fischer menyarankan increment waktu untuk mengurangi flagging murni.", "Fischer random chess dan increment dipakai online modern.", "chess", ["catur", "waktu"], "FIDE / chess history texts"],
  ["ff-anime-key-visual", "Key visual adalah poster promosi resmi season anime, sering jadi wallpaper resmi.", "Bedakan fan art vs key visual resmi dari situs anime.", "anime", ["promosi", "art"], "Official anime sites"],
  ["ff-kelvin-scale", "Skala Kelvin nol mutlak = 0 K; tidak negatif.", "Digunakan sains karena proporsional energi kinetik rata-rata.", "science", ["fisika", "suhu"], "NIST SI units"],
  ["ff-docker-container", "Container Linux memakai namespace dan cgroups; Docker mempopulerkan workflow image registry.", "Bedakan container vs VM full OS.", "technology", ["docker", "devops"], "docker.com docs"],
  ["ff-anime-12-ep", "Format 12 episode sering disebut \"single cour\" untuk musim semi musim gugur.", "Jadwal produksi ketat 4–5 minggu per episode.", "anime", ["produksi", "jadwal"], "ANN production articles"],
  ["ff-chess-zugzwang", "Zugzwang: giliran gerak memperburuk posisi sendiri; klasik di endgame king-pawn.", "Contoh terkenal di studi endgame.", "chess", ["catur", "endgame"], "Chess endgame manuals"],
  ["ff-tree-co2", "Pohon dewasa dapat menyerap puluhan pound CO₂ per tahun tergantung spesies dan iklim.", "Angka bervariasi; reboisasi bukan satu-satunya solusi iklim.", "science", ["iklim", "hutan"], "US Forest Service carbon sequestration"],
  ["ff-git-hash", "Git commit ID adalah SHA-1 (beralih ke SHA-256 di versi baru) dari snapshot + metadata.", "Hash menjamin integritas riwayat.", "technology", ["git", "hash"], "Git documentation"],
  ["ff-anime-filler", "Episode filler anime tidak ada di manga sumber — cek daftar resmi/fandom terkurasi.", "Studio isi gap agar manga tidak terlampaui.", "anime", ["filler", "adaptasi"], "Episode guides ANN"],
];

const extraFacts = factSeeds.map(([id, statement, explanation, category, tags, source]) => ({
  id,
  statement,
  explanation,
  category,
  tags,
  source,
  verified: true,
  publishedAt: "2026-04-01",
}));

const triviaTemplates = [
  ["tri-sci-01", "Planet manakah yang terdekat dengan Matahari?", ["Venus", "Merkurius", "Mars", "Bumi"], 1, "Merkurius orbit paling dalam; Venus kadang terlihat lebih terang di langit.", "science", "mudah"],
  ["tri-sci-02", "Gas apa yang paling dominan di atmosfer Bumi?", ["Oksigen", "Nitrogen", "Karbon dioksida", "Argon"], 1, "Nitrogen ~78%, oksigen ~21%.", "science", "mudah"],
  ["tri-sci-03", "Organel sel yang memproduksi ATP disebut?", ["Ribosom", "Mitokondria", "Nukleus", "Lisosom"], 1, "Mitokondria \"powerhouse\" sel.", "science", "sedang"],
  ["tri-sci-04", "Berapa jumlah planet dalam Tata Surya (model IAU)?", ["7", "8", "9", "10"], 1, "Pluto reklasifikasi dwarf planet 2006.", "science", "mudah"],
  ["tri-sci-05", "Unsur dengan simbol Au?", ["Perak", "Emas", "Aluminium", "Arsen"], 1, "Au dari Latin aurum.", "science", "mudah"],
  ["tri-sci-06", "Apa nama proses tumbuhan membuat makanan dari cahaya?", ["Respirasi", "Fotosintesis", "Fermentasi", "Destilasi"], 1, "Fotosintesis di kloroplast.", "science", "mudah"],
  ["tri-sci-07", "Satelit alami Bumi?", ["Titan", "Bulan", "Europa", "Phobos"], 1, "Bulan/Luna satu satelit alami utama.", "science", "mudah"],
  ["tri-sci-08", "Suhu air mendidih pada tekanan atmosfer standar (°C)?", ["90", "100", "110", "120"], 1, "100°C pada 1 atm; berubah dengan ketinggian.", "science", "sedang"],
  ["tri-sci-09", "Partikel subatom dengan muatan negatif?", ["Proton", "Neutron", "Elektron", "Pion"], 2, "Elektron mengorbit nukleus.", "science", "mudah"],
  ["tri-sci-10", "Lapisan ozon terutama melindungi dari?", ["Radiasi gamma", "UV matahari", "Meteor", "Gravitasi"], 1, "UV-B/C berbahaya untuk DNA.", "science", "sedang"],
  ["tri-tech-03", "Bita terdiri dari berapa bit?", ["4", "8", "16", "32"], 1, "Standar de facto byte = 8 bit.", "technology", "mudah"],
  ["tri-tech-04", "Port default HTTPS?", ["80", "443", "22", "8080"], 1, "HTTP 80, HTTPS 443.", "technology", "mudah"],
  ["tri-tech-05", "Bahasa markup untuk struktur halaman web?", ["Python", "HTML", "SQL", "Bash"], 1, "HTML bukan bahasa pemrograman Turing-complete penuh.", "technology", "mudah"],
  ["tri-tech-06", "Linux kernel dibuat oleh?", ["Bill Gates", "Linus Torvalds", "Steve Jobs", "Tim Berners-Lee"], 1, "Torvalds 1991.", "technology", "mudah"],
  ["tri-tech-07", "SQL digunakan untuk?", ["Query database", "Render 3D", "Kompres video", "Mining Bitcoin"], 0, "Structured Query Language.", "technology", "mudah"],
  ["tri-tech-08", "IPv4 address length (bit)?", ["32", "64", "128", "256"], 0, "IPv6 128 bit.", "technology", "sedang"],
  ["tri-tech-09", "Manakah storage non-volatile?", ["RAM", "Cache CPU", "SSD", "Register"], 2, "RAM volatile.", "technology", "sedang"],
  ["tri-tech-10", "Git command untuk unduh repo remote?", ["git push", "git clone", "git init", "git fetch-only"], 1, "Clone membuat salinan lokal.", "technology", "mudah"],
  ["tri-chess-03", "Berapa langkah kuda maksimal tanpa menyerang?", ["1", "2", "3", "4"], 1, "Kuda L-shape: 2+1.", "chess", "mudah"],
  ["tri-chess-04", "Skor remis stalemate?", ["0-1", "1-0", "1/2-1/2", "2-0"], 2, "Setengah poin masing-masing.", "chess", "mudah"],
  ["tri-chess-05", "Pieza dengan gerak diagonal?", ["Rook", "Bishop", "Knight", "Pawn"], 1, "Bishop diagonal; rook lurus.", "chess", "mudah"],
  ["tri-chess-06", "En passant hanya berlaku untuk?", ["Raja", "Pion", "Ratu", "Kuda"], 1, "Aturan khusus pion.", "chess", "sedang"],
  ["tri-chess-07", "Rating sistem Elo dipakai untuk?", ["Kekuatan pemain", "Warna papan", "Ukuran kotak", "Durasi jam"], 0, "Elo perkiraan skill relatif.", "chess", "mudah"],
  ["tri-chess-08", "Checkmate berarti?", ["Raja terancam dan tidak bisa escape", "Ratu hilang", "Waktu habis", "Resign"], 0, "Mat = game over.", "chess", "mudah"],
  ["tri-chess-09", "Castling melibatkan?", ["Raja dan rook", "Dua kuda", "Dua ratu", "Semua pion"], 0, "O-O atau O-O-O.", "chess", "mudah"],
  ["tri-chess-10", "Promosi pion biasanya menjadi?", ["Ratu", "Raja", "Pion kedua", "Kosong"], 0, "Queen strongest.", "chess", "mudah"],
  ["tri-anime-03", "Sutradara Spirited Away?", ["Makoto Shinkai", "Hayao Miyazaki", "Satoshi Kon", "Hideaki Anno"], 1, "Studio Ghibli.", "anime", "mudah"],
  ["tri-anime-04", "Manga dibaca Jepang asli arah?", ["Atas ke bawah kiri", "Kanan ke kiri", "Kiri ke kanan", "Acak"], 1, "Edisi Barat sering mirror.", "anime", "mudah"],
  ["tri-anime-05", "Seiyuu adalah?", ["Pengisi suara", "Animator key frame", "Komposer OP", "Producer",], 0, "Voice actor Jepang.", "anime", "mudah"],
  ["tri-anime-06", "Genre mecha fokus pada?", ["Robot raksasa", "Masak-masak", "Idol", "Horror psikologis"], 0, "Gundam, Evangelion, dll.", "anime", "mudah"],
  ["tri-anime-07", "Studio behind Attack on Titan TV (season awal)?", ["Kyoto Animation", "Wit Studio", "P.A. Works", "Trigger"], 1, "Wit S1; MAPPA later seasons.", "anime", "sedang"],
  ["tri-anime-08", "OP singkatan dari?", ["Opening theme", "Original print", "Offline play", "Option pack"], 0, "ED ending theme.", "anime", "mudah"],
  ["tri-anime-09", "Light novel biasanya?", ["Prosa ilustrasi sporadis", "Komik hitam putih", "Game engine", "Live action"], 0, "Sumber banyak isekai.", "anime", "sedang"],
  ["tri-anime-10", "Anime seasonal biasa per cour?", ["~3 episode", "~12 episode", "~50 episode", "~100 episode"], 1, "12-13 episode cour.", "anime", "mudah"],
  ["tri-sci-11", "Rumus kimia air?", ["CO2", "H2O", "NaCl", "O2"], 1, "Dua hidrogen satu oksigen.", "science", "mudah"],
  ["tri-tech-11", "CSS digunakan untuk?", ["Gaya visual halaman", "Query database", "Kompilasi kernel", "Enkripsi TLS"], 0, "Cascading Style Sheets.", "technology", "mudah"],
  ["tri-chess-11", "Warna kotak a1?", ["Putih", "Hitam", "Abu", "Merah"], 1, "Sudut kiri bawah (white view) gelap.", "chess", "sedang"],
  ["tri-anime-11", "Manga One Piece author?", ["Eiichiro Oda", "Akira Toriyama", "Naoko Takeuchi", "Tite Kubo"], 0, "Weekly Shonen Jump.", "anime", "mudah"],
];

const extraTrivia = triviaTemplates.map(([id, question, options, answer, explanation, category, difficulty]) => ({
  id,
  question,
  options,
  answer,
  explanation,
  category,
  tags: [],
  difficulty,
  source: "internal",
}));

writeFileSync(join(root, "articles-extra.json"), JSON.stringify(extraArticles, null, 2), "utf8");
writeFileSync(join(root, "fun-facts-extra.json"), JSON.stringify(extraFacts, null, 2), "utf8");
writeFileSync(join(root, "trivia-extra.json"), JSON.stringify(extraTrivia, null, 2), "utf8");

console.log("Wrote", extraArticles.length, "articles,", extraFacts.length, "facts,", extraTrivia.length, "trivia");
