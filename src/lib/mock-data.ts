import { Challenge, LeaderboardEntry, StudentLiveState } from "@/types";

export const SAMPLE_CHALLENGES: Challenge[] = [
  {
    id: "challenge-pricing-01",
    title: "Lab #04: SaaS Fiyatlandırma Kartı (Canlı Ders)",
    description:
      "Size verilen karmaşık bir Bootstrap şablonundan sadece ortadaki 'Pro Plan' fiyatlandırma kartını ve butonunu ayıklayın. Gereksiz Bootstrap class'larını temizleyin ve bağımsız modern CSS ile yeniden oluşturun.",
    category: "pricing",
    difficulty: "Orta",
    roomType: "live_lab",
    deadline: "Ders Sonu (Canlı)",
    activeStudentsCount: 15,
    xpReward: 150,
    targetImageUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    targetWidth: 720,
    targetHeight: 420,
    starterHtml: `<div class="pricing-card">
  <div class="badge">POPÜLER</div>
  <h3 class="plan-title">Pro Plan</h3>
  <div class="price-container">
    <span class="currency">₺</span>
    <span class="amount">299</span>
    <span class="period">/aylık</span>
  </div>
  <ul class="features">
    <li>✓ Sınırsız CSS İnceleme</li>
    <li>✓ Canlı Piksel Karşılaştırma</li>
    <li>✓ Otomatik Kod Hijyen Denetimi</li>
  </ul>
  <button class="cta-button">Hemen Başla</button>
</div>`,
    starterCss: `/* Bu kartı hedef tasarıma milimetrik eşitleyin */
.pricing-card {
  background: #18181f;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 32px;
  max-width: 340px;
  color: #ffffff;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  font-family: inherit;
}

.badge {
  display: inline-block;
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 9999px;
  margin-bottom: 12px;
  letter-spacing: 0.05em;
}

.plan-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 16px;
}

.price-container {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 24px;
}

.currency {
  font-size: 20px;
  color: #a1a1aa;
}

.amount {
  font-size: 40px;
  font-weight: 800;
  color: #ffffff;
}

.period {
  font-size: 13px;
  color: #71717a;
}

.features {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 13px;
  color: #d4d4d8;
  margin-bottom: 28px;
}

.cta-button {
  width: 100%;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.cta-button:hover {
  opacity: 0.9;
}`,
    hints: [
      "Kartın dış gölgesinde box-shadow değerine dikkat edin.",
      "Butonun üzerine gelindiğinde (hover) yumuşak geçiş için transition kullanın.",
      "Tüm dış Bootstrap class'larını silip sadece semantik isimler bırakın.",
    ],
    maxLinesGoal: 65,
    createdAt: "2026-10-01",
  },
  {
    id: "challenge-homework-01",
    title: "Ödev #02: Glassmorphism Banka Kartı",
    description:
      "Haftalık laboratuvar ev ödevi: Arka planı buzlu cam efektine (backdrop-filter: blur) sahip, altın çipli ve parıltılı modern banka kartını CSS ile dilimleyin.",
    category: "card",
    difficulty: "İleri",
    roomType: "homework",
    deadline: "3 Gün 14 Saat",
    activeStudentsCount: 11,
    xpReward: 250,
    targetImageUrl:
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
    targetWidth: 500,
    targetHeight: 320,
    starterHtml: `<div class="glass-card">
  <div class="card-chip"></div>
  <div class="card-number">4532 •••• •••• 8821</div>
  <div class="card-footer">
    <div class="card-holder">
      <span class="label">KART SAHİBİ</span>
      <span class="name">AHMET YILMAZ</span>
    </div>
    <div class="card-expiry">
      <span class="label">SKT</span>
      <span class="date">09/29</span>
    </div>
  </div>
</div>`,
    starterCss: `/* Buzlu cam efekti ve şık gölgeler uygulayın */
.glass-card {
  width: 360px;
  height: 220px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
  color: #fff;
  font-family: inherit;
}

.card-chip {
  width: 44px;
  height: 32px;
  background: linear-gradient(135deg, #ffd700, #ffae00);
  border-radius: 6px;
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.4);
}

.card-number {
  font-size: 20px;
  letter-spacing: 2px;
  font-family: monospace;
  font-weight: 600;
}

.card-footer {
  display: flex;
  justify-content: space-between;
}

.label {
  display: block;
  font-size: 9px;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 1px;
}

.name, .date {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
}`,
    hints: [
      "Cam efekti için backdrop-filter: blur(16px) ve yarı saydam border kullanın.",
      "Kart numarası için monospace font ailesi hizalamayı kolaylaştırır.",
    ],
    maxLinesGoal: 50,
    createdAt: "2026-10-04",
  },
  {
    id: "challenge-practice-toggle",
    title: "iOS Yumuşak Geçişli Toggle Switch",
    description:
      "CSSBattle Pratik: Saf HTML checkbox ve CSS ile iOS tarzı akıcı, basıldığında hafif uzayan ve yeşile dönen toggle anahtarı kodlayın.",
    category: "form",
    difficulty: "Kolay",
    roomType: "practice",
    xpReward: 60,
    targetImageUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
    targetWidth: 400,
    targetHeight: 250,
    starterHtml: `<label class="switch-container">
  <input type="checkbox" class="switch-input" checked>
  <span class="switch-track">
    <span class="switch-thumb"></span>
  </span>
</label>`,
    starterCss: `/* iOS tarzı akıcı geçişli toggle */
.switch-container {
  display: inline-block;
  cursor: pointer;
}

.switch-input {
  display: none;
}

.switch-track {
  display: block;
  width: 58px;
  height: 34px;
  background-color: #34c759;
  border-radius: 9999px;
  position: relative;
  transition: background-color 0.25s ease;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.15);
}

.switch-thumb {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 30px;
  height: 30px;
  background-color: #ffffff;
  border-radius: 50%;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}`,
    hints: [
      "Input:checked seçicisi ile track arka planını ve thumb konumunu dinamik yönetin.",
      "Cubic-bezier yay efekti Apple doğallığı sağlar.",
    ],
    maxLinesGoal: 35,
    createdAt: "2026-10-05",
  },
  {
    id: "challenge-practice-badge",
    title: "Minimalist SaaS Tag & Statü Rozeti",
    description:
      "CSSBattle Pratik: Parlayan canlı durum noktası (pulse ring) ve şık renk gradyanı içeren modern ürün etiketi dilimleme.",
    category: "hero",
    difficulty: "Kolay",
    roomType: "practice",
    xpReward: 50,
    targetImageUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
    targetWidth: 400,
    targetHeight: 250,
    starterHtml: `<div class="status-badge">
  <span class="pulse-dot"></span>
  <span class="badge-text">v2.4 Güncellemesi Yayında</span>
  <span class="arrow-icon">→</span>
</div>`,
    starterCss: `/* Parlayan canlı bildirim rozeti */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 9999px;
  background: rgba(0, 122, 255, 0.1);
  border: 1px solid rgba(0, 122, 255, 0.25);
  color: #007aff;
  font-size: 13px;
  font-weight: 500;
}

.pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: #007aff;
  box-shadow: 0 0 10px #007aff;
}

.arrow-icon {
  font-size: 12px;
  transition: transform 0.2s ease;
}

.status-badge:hover .arrow-icon {
  transform: translateX(3px);
}`,
    hints: ["Pulse animasyonu için keyframes veya box-shadow kullanabilirsiniz."],
    maxLinesGoal: 30,
    createdAt: "2026-10-05",
  },
  {
    id: "challenge-practice-metrics",
    title: "İstatistik & Trend Widget'ı",
    description:
      "CSSBattle Pratik: Dashboard panellerinde sıkça kullanılan; artış yüzdesi, gelir toplamı ve mini grafik göstergesi içeren kart.",
    category: "card",
    difficulty: "Orta",
    roomType: "practice",
    xpReward: 120,
    targetImageUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
    targetWidth: 420,
    targetHeight: 260,
    starterHtml: `<div class="metric-card">
  <div class="metric-header">
    <span class="metric-title">Toplam Gelir</span>
    <span class="metric-badge">+%24.8 ↑</span>
  </div>
  <div class="metric-value">₺184,420</div>
  <div class="metric-subtitle">Geçen aya göre ₺32.000 artış</div>
</div>`,
    starterCss: `/* Modern analitik metrik kartı */
.metric-card {
  width: 280px;
  padding: 20px;
  border-radius: 16px;
  background: #141419;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #fff;
  font-family: inherit;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.metric-title {
  font-size: 13px;
  color: #a1a1aa;
}

.metric-badge {
  font-size: 11px;
  font-weight: 600;
  color: #30d158;
  background: rgba(48, 209, 88, 0.15);
  padding: 3px 8px;
  border-radius: 999px;
}

.metric-value {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
  margin-bottom: 6px;
}

.metric-subtitle {
  font-size: 11.5px;
  color: #71717a;
}`,
    hints: ["Tipografi hiyerarşisi ve renk kontrastı skorlamada önemlidir."],
    maxLinesGoal: 45,
    createdAt: "2026-10-05",
  },
  {
    id: "challenge-practice-order",
    title: "Sipariş Özeti & Ödeme Kutusu",
    description:
      "CSSBattle Pratik: E-ticaret sepet özet kartı; ara toplam, kargo bedeli, indirim kuponu butonu ve toplam fiyat dökümü.",
    category: "table",
    difficulty: "İleri",
    roomType: "practice",
    xpReward: 200,
    targetImageUrl:
      "https://images.unsplash.com/photo-1556742049-0a67e557224f?auto=format&fit=crop&w=700&q=80",
    targetWidth: 480,
    targetHeight: 340,
    starterHtml: `<div class="order-box">
  <h3 class="order-title">Sipariş Özeti</h3>
  <div class="row">
    <span>Ürün Tutarı</span>
    <span>₺1.250,00</span>
  </div>
  <div class="row">
    <span>Kargo</span>
    <span class="free">ÜCRETSİZ</span>
  </div>
  <div class="divider"></div>
  <div class="row total">
    <span>Toplam Tutar</span>
    <span class="total-price">₺1.250,00</span>
  </div>
  <button class="checkout-btn">Siparişi Onayla</button>
</div>`,
    starterCss: `/* Sipariş özeti kartı */
.order-box {
  width: 320px;
  background: #1c1c24;
  border-radius: 18px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.order-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 18px;
}

.row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 10px;
  color: #a1a1aa;
}

.row.total {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  margin-top: 14px;
}

.free {
  color: #30d158;
  font-weight: 600;
}

.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 14px 0;
}

.checkout-btn {
  width: 100%;
  margin-top: 18px;
  padding: 12px;
  border-radius: 10px;
  background: #007aff;
  color: #fff;
  border: none;
  font-weight: 600;
  cursor: pointer;
}`,
    hints: ["Border ve divider ayrımında opaklık değerlerini koruyun."],
    maxLinesGoal: 50,
    createdAt: "2026-10-06",
  },
];

export const INITIAL_STUDENTS: StudentLiveState[] = [
  {
    studentId: "st-1",
    studentName: "Mert Yılmaz",
    studentNo: "220401048",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80",
    html: `<div class="pricing-card">...</div>`,
    css: `.pricing-card { background: #18181f; padding: 32px; border-radius: 20px; }`,
    visualMatch: 95.8,
    cleanScore: 98,
    linesCount: 46,
    unusedCssPercent: 2,
    lastActive: Date.now() - 1000 * 30,
    status: "submitted",
    grade: 100,
    teacherFeedback: "Kusursuz ayıklama ve harika piksel doğruluğu!",
  },
  {
    studentId: "st-2",
    studentName: "Zeynep Kaya",
    studentNo: "220401012",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&q=80",
    html: `<div class="pricing-card">...</div>`,
    css: `.pricing-card { background: #1a1a24; border-radius: 18px; }`,
    visualMatch: 93.4,
    cleanScore: 94,
    linesCount: 52,
    unusedCssPercent: 4,
    lastActive: Date.now() - 1000 * 15,
    status: "coding",
  },
  {
    studentId: "st-3",
    studentName: "Barış Özcan",
    studentNo: "220401089",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80",
    html: `<div class="pricing-card">
  <div class="badge">POPÜLER</div>
  <h3 class="plan-title">Pro Plan</h3>
  <div class="price-container">
    <span class="currency">₺</span>
    <span class="amount">299</span>
  </div>
  <button class="cta-button">Hemen Başla</button>
</div>`,
    css: `.pricing-card {
  background: #18181f;
  border-radius: 20px;
  padding: 32px;
  display: block; /* Flexbox ile dikey ortalayamadı */
  color: #fff;
}
.badge { color: #10b981; }
.cta-button { background: #3b82f6; color: white; padding: 10px; }`,
    visualMatch: 72.4,
    cleanScore: 68,
    linesCount: 64,
    unusedCssPercent: 24,
    lastActive: Date.now() - 1000 * 20,
    status: "needs_help",
    helpTopic: "Kart içindeki elemanları dikeyde ortalayamıyorum ve buton aşağı yapışmıyor",
    helpRequestedAt: Date.now() - 1000 * 45,
  },
  {
    studentId: "st-4",
    studentName: "Elif Demir",
    studentNo: "220401023",
    avatarUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=128&q=80",
    html: `<div class="pricing-box">...</div>`,
    css: `.pricing-box { display: flex; flex-direction: column; }`,
    visualMatch: 91.5,
    cleanScore: 92,
    linesCount: 58,
    unusedCssPercent: 6,
    lastActive: Date.now() - 1000 * 5,
    status: "coding",
  },
  {
    studentId: "st-5",
    studentName: "Caner Aydın",
    studentNo: "220401055",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80",
    html: `<div class="card">...</div>`,
    css: `.card { background: #111; }`,
    visualMatch: 86.0,
    cleanScore: 78,
    linesCount: 74,
    unusedCssPercent: 18,
    lastActive: Date.now() - 1000 * 120,
    status: "submitted",
  },
  {
    studentId: "st-6",
    studentName: "Selin Şahin",
    studentNo: "220401034",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=128&q=80",
    html: `<div class="pricing">...</div>`,
    css: `.pricing { border: 1px solid #333; }`,
    visualMatch: 94.0,
    cleanScore: 96,
    linesCount: 49,
    unusedCssPercent: 3,
    lastActive: Date.now() - 1000 * 8,
    status: "coding",
  },
  {
    studentId: "st-7",
    studentName: "Emre Koç",
    studentNo: "220401067",
    avatarUrl:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=128&q=80",
    html: `<div class="container"><div class="row">...</div></div>`,
    css: `/* Tüm şablonu kopyalamış */\n.nav { ... }\n.footer { ... }\n.hero { ... }`,
    visualMatch: 89.0,
    cleanScore: 30,
    linesCount: 420,
    unusedCssPercent: 74,
    lastActive: Date.now() - 1000 * 10,
    status: "coding",
  },
  {
    studentId: "st-8",
    studentName: "Büşra Çelik",
    studentNo: "220401015",
    avatarUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=128&q=80",
    html: `<section class="pricing-plan">...</div>`,
    css: `.pricing-plan { backdrop-filter: blur(10px); }`,
    visualMatch: 96.2,
    cleanScore: 99,
    linesCount: 42,
    unusedCssPercent: 1,
    lastActive: Date.now() - 1000 * 180,
    status: "approved",
    grade: 100,
  },
  {
    studentId: "st-9",
    studentName: "Ahmet Erdem",
    studentNo: "220401072",
    avatarUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=128&q=80",
    html: `<div class="card">...</div>`,
    css: `.card { padding: 20px; }`,
    visualMatch: 82.5,
    cleanScore: 84,
    linesCount: 65,
    unusedCssPercent: 12,
    lastActive: Date.now() - 1000 * 20,
    status: "coding",
  },
  {
    studentId: "st-10",
    studentName: "Derya Doğan",
    studentNo: "220401041",
    avatarUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=128&q=80",
    html: `<div class="plan">...</div>`,
    css: `.plan { border-radius: 16px; }`,
    visualMatch: 92.1,
    cleanScore: 90,
    linesCount: 55,
    unusedCssPercent: 7,
    lastActive: Date.now() - 1000 * 60,
    status: "submitted",
  },
  {
    studentId: "st-11",
    studentName: "Kaan Arslan",
    studentNo: "220401093",
    avatarUrl:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=128&q=80",
    html: `<div class="pricing-col">...</div>`,
    css: `.pricing-col { margin: 0 auto; }`,
    visualMatch: 85.3,
    cleanScore: 80,
    linesCount: 68,
    unusedCssPercent: 15,
    lastActive: Date.now() - 1000 * 40,
    status: "coding",
  },
  {
    studentId: "st-12",
    studentName: "Gizem Kurt",
    studentNo: "220401008",
    avatarUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=128&q=80",
    html: `<div class="card-pro">...</div>`,
    css: `.card-pro { background: #16161a; }`,
    visualMatch: 90.7,
    cleanScore: 91,
    linesCount: 51,
    unusedCssPercent: 5,
    lastActive: Date.now() - 1000 * 25,
    status: "coding",
  },
  {
    studentId: "st-13",
    studentName: "Oğuzhan Tekin",
    studentNo: "220401084",
    avatarUrl:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=128&q=80",
    html: `<div class="box">...</div>`,
    css: `.box { padding: 30px; }`,
    visualMatch: 87.4,
    cleanScore: 86,
    linesCount: 60,
    unusedCssPercent: 10,
    lastActive: Date.now() - 1000 * 15,
    status: "coding",
  },
  {
    studentId: "st-14",
    studentName: "Nazlı Yurt",
    studentNo: "220401029",
    avatarUrl:
      "https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?auto=format&fit=crop&w=128&q=80",
    html: `<div class="tier-card">...</div>`,
    css: `.tier-card { border: 1px solid rgba(255,255,255,0.12); }`,
    visualMatch: 93.8,
    cleanScore: 95,
    linesCount: 47,
    unusedCssPercent: 3,
    lastActive: Date.now() - 1000 * 5,
    status: "coding",
  },
  {
    studentId: "st-15",
    studentName: "Tolga Sezer",
    studentNo: "220401062",
    avatarUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=128&q=80",
    html: `<div class="card">...</div>`,
    css: `.card { max-width: 320px; }`,
    visualMatch: 84.6,
    cleanScore: 72,
    linesCount: 88,
    unusedCssPercent: 24,
    lastActive: Date.now() - 1000 * 50,
    status: "coding",
  },
];

export interface PracticeChallenge {
  id: string;
  title: string;
  subtitle: string;
  category: "visionOS" | "Neumorphism" | "Apple UI" | "Micro-UI";
  difficulty: "Başlangıç" | "Orta" | "İleri";
  xpReward: number;
  maxLinesGoal: number;
  completedCount: number;
  targetImageUrl: string;
  starterHtml: string;
  starterCss: string;
  tags: string[];
}

export const DAILY_PRACTICE_CHALLENGES: PracticeChallenge[] = [
  {
    id: "practice-glassmorphism",
    title: "visionOS Glassmorphic Kart",
    subtitle: "Buzlu cam, dinamik iç ışık ve katman derinliği",
    category: "visionOS",
    difficulty: "Orta",
    xpReward: 250,
    maxLinesGoal: 35,
    completedCount: 24,
    targetImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    tags: ["backdrop-filter", "inner-shadow", "blur", "linear-gradient"],
    starterHtml: `<div class="glass-card">
  <div class="glass-chip">PRO</div>
  <h3>Spatial Interface</h3>
  <p>Ultra-thin translucent glass surface with light refraction.</p>
  <button class="glass-btn">Keşfet</button>
</div>`,
    starterCss: `.glass-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 24px;
  padding: 28px;
  color: #fff;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
}`,
  },
  {
    id: "practice-activity-ring",
    title: "Apple Watch Aktivite Halkası",
    subtitle: "Conic gradient ve maskeleme ile saf CSS halka",
    category: "Apple UI",
    difficulty: "İleri",
    xpReward: 400,
    maxLinesGoal: 50,
    completedCount: 16,
    targetImageUrl: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80",
    tags: ["conic-gradient", "mask-image", "aspect-ratio", "transform"],
    starterHtml: `<div class="ring-container">
  <div class="ring-circle">
    <div class="ring-inner">
      <span class="ring-val">680</span>
      <span class="ring-unit">KCAL</span>
    </div>
  </div>
</div>`,
    starterCss: `.ring-container {
  display: grid;
  place-items: center;
  padding: 30px;
}
.ring-circle {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: conic-gradient(#ff2442 0% 75%, rgba(255, 36, 66, 0.2) 75% 100%);
  display: grid;
  place-items: center;
}
.ring-inner {
  width: 104px;
  height: 104px;
  border-radius: 50%;
  background: #111;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
}`,
  },
  {
    id: "practice-neumorphic-switch",
    title: "iOS Neumorphic Soft Toggle",
    subtitle: "İç bükey ve dış bükey çift gölge tasarımı",
    category: "Neumorphism",
    difficulty: "Başlangıç",
    xpReward: 180,
    maxLinesGoal: 25,
    completedCount: 38,
    targetImageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
    tags: ["box-shadow", "inset", "transitions", "accent-color"],
    starterHtml: `<div class="neu-track active">
  <div class="neu-thumb"></div>
</div>`,
    starterCss: `.neu-track {
  width: 80px;
  height: 44px;
  border-radius: 22px;
  background: #e0e5ec;
  box-shadow: inset 4px 4px 8px #babecc, inset -4px -4px 8px #ffffff;
  padding: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.neu-thumb {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e0e5ec;
  box-shadow: 4px 4px 8px #babecc, -4px -4px 8px #ffffff;
  transform: translateX(36px);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}`,
  },
  {
    id: "practice-glow-btn",
    title: "Minimal Cyberpunk Glow Button",
    subtitle: "Hover durumunda gradient parlama ve neon aura",
    category: "Micro-UI",
    difficulty: "Başlangıç",
    xpReward: 150,
    maxLinesGoal: 20,
    completedCount: 52,
    targetImageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    tags: ["filter-drop-shadow", "pseudo-elements", "animation"],
    starterHtml: `<button class="glow-btn">
  <span>Launch Console</span>
</button>`,
    starterCss: `.glow-btn {
  position: relative;
  padding: 12px 28px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: #000;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s;
}
.glow-btn:hover {
  box-shadow: 0 0 25px rgba(255, 255, 255, 0.35);
  border-color: #ffffff;
}`,
  },
];

export const SAMPLE_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    studentId: "st-8",
    studentName: "Büşra Çelik",
    studentNo: "220401015",
    avatarUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=128&q=80",
    totalScore: 986,
    visualScore: 96.2,
    cleanScore: 99,
    speedMinutes: 14,
    linesCount: 42,
    streakDays: 8,
    trend: "same",
    trendDelta: 0,
    recentChallenge: "SaaS Fiyatlandırma Kartı",
    badges: [
      { id: "b1", label: "Pixel Perfect", icon: "🎯", description: "%95+ Görsel Eşleşme" },
      { id: "b2", label: "Zero Bloat", icon: "🛡️", description: "%0 Kullanılmayan CSS" },
      { id: "b3", label: "Clean Slicer", icon: "🧹", description: "En Düşük Satır Sayısı" },
    ],
  },
  {
    rank: 2,
    studentId: "st-1",
    studentName: "Ahmet Yılmaz",
    studentNo: "220401048",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80",
    totalScore: 974,
    visualScore: 95.8,
    cleanScore: 98,
    speedMinutes: 18,
    linesCount: 45,
    streakDays: 5,
    trend: "up",
    trendDelta: 1,
    recentChallenge: "SaaS Fiyatlandırma Kartı",
    badges: [
      { id: "b1", label: "Pixel Perfect", icon: "🎯", description: "%95+ Görsel Eşleşme" },
      { id: "b3", label: "Clean Slicer", icon: "🧹", description: "En Düşük Satır Sayısı" },
      { id: "b4", label: "Git Master", icon: "⑂", description: "Düzenli Commit & Push" },
    ],
  },
  {
    rank: 3,
    studentId: "st-6",
    studentName: "Selin Şahin",
    studentNo: "220401034",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=128&q=80",
    totalScore: 952,
    visualScore: 94.0,
    cleanScore: 96,
    speedMinutes: 22,
    linesCount: 49,
    streakDays: 4,
    trend: "down",
    trendDelta: 1,
    recentChallenge: "SaaS Fiyatlandırma Kartı",
    badges: [
      { id: "b2", label: "Zero Bloat", icon: "🛡️", description: "%0 Kullanılmayan CSS" },
    ],
  },
  {
    rank: 4,
    studentId: "st-14",
    studentName: "Nazlı Yurt",
    studentNo: "220401029",
    avatarUrl:
      "https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?auto=format&fit=crop&w=128&q=80",
    totalScore: 938,
    visualScore: 93.8,
    cleanScore: 95,
    speedMinutes: 26,
    linesCount: 47,
    streakDays: 6,
    trend: "up",
    trendDelta: 2,
    recentChallenge: "Tier Pricing Matrix",
    badges: [
      { id: "b1", label: "Pixel Perfect", icon: "🎯", description: "%95+ Görsel Eşleşme" },
    ],
  },
  {
    rank: 5,
    studentId: "st-2",
    studentName: "Zeynep Kaya",
    studentNo: "220401012",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&q=80",
    totalScore: 928,
    visualScore: 93.4,
    cleanScore: 94,
    speedMinutes: 29,
    linesCount: 52,
    streakDays: 3,
    trend: "same",
    trendDelta: 0,
    recentChallenge: "SaaS Fiyatlandırma Kartı",
    badges: [],
  },
  {
    rank: 6,
    studentId: "st-4",
    studentName: "Elif Demir",
    studentNo: "220401023",
    avatarUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=128&q=80",
    totalScore: 914,
    visualScore: 91.5,
    cleanScore: 92,
    speedMinutes: 34,
    linesCount: 58,
    streakDays: 2,
    trend: "down",
    trendDelta: 2,
    recentChallenge: "Pricing Box Flex",
    badges: [],
  },
  {
    rank: 7,
    studentId: "st-10",
    studentName: "Derya Doğan",
    studentNo: "220401041",
    avatarUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=128&q=80",
    totalScore: 890,
    visualScore: 92.1,
    cleanScore: 90,
    speedMinutes: 40,
    linesCount: 55,
    streakDays: 4,
    trend: "up",
    trendDelta: 1,
    recentChallenge: "Plan Card",
    badges: [],
  },
  {
    rank: 8,
    studentId: "st-12",
    studentName: "Gizem Kurt",
    studentNo: "220401008",
    avatarUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=128&q=80",
    totalScore: 875,
    visualScore: 90.7,
    cleanScore: 91,
    speedMinutes: 38,
    linesCount: 51,
    streakDays: 2,
    trend: "same",
    trendDelta: 0,
    recentChallenge: "Dark Mode Slicer",
    badges: [],
  },
  {
    rank: 9,
    studentId: "st-5",
    studentName: "Caner Aydın",
    studentNo: "220401055",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80",
    totalScore: 852,
    visualScore: 86.0,
    cleanScore: 78,
    speedMinutes: 42,
    linesCount: 74,
    streakDays: 1,
    trend: "down",
    trendDelta: 1,
    recentChallenge: "Card Pricing",
    badges: [],
  },
  {
    rank: 10,
    studentId: "st-13",
    studentName: "Oğuzhan Tekin",
    studentNo: "220401084",
    avatarUrl:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=128&q=80",
    totalScore: 840,
    visualScore: 87.4,
    cleanScore: 86,
    speedMinutes: 45,
    linesCount: 60,
    streakDays: 3,
    trend: "up",
    trendDelta: 2,
    recentChallenge: "Box Slicing",
    badges: [],
  },
];
