"use client";

import * as React from "react";
import Link from "next/link";
import {
  Download,
  ArrowRight,
  Monitor,
} from "lucide-react";
import { StatsBand, type Stat } from "@/components/arc/blocks/stats-band/stats-band";
import { ChangelogFeed, type ChangelogEntry, type ChangelogMonth } from "@/components/arc/blocks/changelog-feed/changelog-feed";
import { FaqSection, type FaqItem } from "@/components/arc/blocks/faq-section/faq-section";
import { SiteFooter } from "@/components/arc/blocks/site-footer/site-footer";
import { MacbookScroll } from "@/components/ui/macbook-scroll";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

const PIXELCUT_STATS: Stat[] = [
  {
    value: 99.8,
    decimals: 1,
    suffix: "%",
    label: "Piksel Eşleşme Doğruluğu",
    detail: "Figma ve kod örtüştürme",
    context: "0.2px ortalama tolerans",
  },
  {
    value: 2.5,
    decimals: 1,
    suffix: "s",
    label: "Mikro Enstantane Aralığı",
    detail: "Zaman Yolculuğu Replay",
    context: "120 adımlık hafıza tamponu",
  },
  {
    value: 40,
    suffix: "+",
    label: "Otomatik CSS Hijyen Kuralı",
    detail: "Spagetti kod denetimi",
    context: "Derinlik, !important ve kayma tespiti",
  },
  {
    value: 15,
    prefix: "<",
    suffix: "ms",
    label: "Sınıf İçi Realtime Gecikmesi",
    detail: "Supabase WebSocket",
    context: "Tüm sınıf canlı ekranda",
  },
];

const PIXELCUT_CHANGELOG_MONTHS: ChangelogMonth[] = [
  { key: "2026-10", label: "Ekim 2026", short: "Eki" },
  { key: "2026-09", label: "Eylül 2026", short: "Eyl" },
];

const PIXELCUT_CHANGELOG: ChangelogEntry[] = [
  {
    id: "v0.1.0",
    month: "2026-10",
    date: "7 Eki",
    iso: "2026-10-07",
    version: "0.1.0",
    kind: "new",
    title: "İlk Kararlı Sürüm & Sınıf Radarı",
    summary: "PixelCut Stüdyosu, Supabase Realtime sınıf takibi ve Hoca Zaman Yolculuğu ile yayında.",
    details: [
      "Canlı Diff Slider ile tasarım referansı ve kod çıktısını milimetrik örtüştürme.",
      "2.5 saniyelik mikro enstantanelerle çalışan Zaman Yolculuğu oynatıcısı.",
      "Tek tıkla otomatik CSS hijyen analizi ve aşırı selector derinliği uyarısı.",
      "Windows x64 için imzalı bağımsız .exe masaüstü kurulum paketi.",
    ],
  },
  {
    id: "v0.0.9",
    month: "2026-10",
    date: "4 Eki",
    iso: "2026-10-04",
    version: "0.0.9",
    kind: "improved",
    title: "Monaco Editör & Web Audio Efektleri",
    summary: "Yazma gecikmesi sıfırlandı, Apple dokunsal arayüz sesleri eklendi.",
    details: [
      "VS Code çekirdekli Monaco Editor ile tam CSS & HTML intellisense desteği.",
      "Web Audio API üzerinden sentezlenen dokunsal tıklama ve geçiş sesleri.",
      "GitHub & Supabase kimlik doğrulama modülü güncellendi.",
    ],
  },
  {
    id: "v0.0.8",
    month: "2026-09",
    date: "28 Eyl",
    iso: "2026-09-28",
    version: "0.0.8",
    kind: "improved",
    title: "macOS & Windows Çift Platform Desteği",
    summary: "Yerel dosya sistemi (File System Access) ve yerel disk klasör desteği.",
    details: [
      "Kullanıcının bilgisayarındaki yerel proje klasörlerini doğrudan açıp kaydetme.",
      "Sonoma & visionOS esintili yarı saydam cam pencere kromu.",
    ],
  },
];

const PIXELCUT_FAQ: FaqItem[] = [
  {
    question: "PixelCut tam olarak nedir?",
    answer:
      "PixelCut, frontend geliştiriciler, öğrenciler ve eğitmenler için tasarlanmış piksel hassasiyetinde bir CSS geliştirme, karşılaştırma ve sınıf laboratuvarı stüdyosudur.",
    category: "Genel",
  },
  {
    question: "PixelCut masaüstü uygulaması (.exe) nasıl kurulur?",
    answer:
      "GitHub Releases sayfasından Windows için hazırlanmış .exe dosyasını indirip doğrudan çalıştırabilirsiniz. Bilgisayarınızdaki yerel klasörleri doğrudan açabilir ve çevrimdışı çalışabilirsiniz.",
    category: "Kurulum",
  },
  {
    question: "Zaman Yolculuğu (Time-Travel) özelliği nasıl çalışır?",
    answer:
      "Kod yazarken her 2.5 saniyede bir mikro enstantane kaydedilir. Eğitmen veya öğrenci, kodun geçmişini kare kare geri sararak hatanın başladığı anı sesli ve görsel olarak inceleyebilir.",
    category: "Teknik",
  },
  {
    question: "Sınıf Radarı ve Hoca Müdahalesi nasıl işler?",
    answer:
      "Supabase Realtime altyapısı sayesinde eğitmen, sınıftaki tüm öğrencilerin canlı kodunu ve tasarım eşleşme yüzdesini tek ekranda izler. Takılan öğrenciye tek tıkla bağlanıp canlı kod müdahalesi yapabilir.",
    category: "Teknik",
  },
  {
    question: "PixelCut açık kaynak mı?",
    answer:
      "Evet, PixelCut MIT lisansı ile tamamen açık kaynaklıdır. GitHub deposu üzerinden kaynak kodlarına erişebilir ve ücretsiz kullanabilirsiniz.",
    category: "Lisans",
  },
];

export default function LandingPage() {
  return (
    <SmoothScrollProvider>
      <div className="relative min-h-screen bg-[#070407] text-[#f5f2f5] selection:bg-rose-500/25 selection:text-white overflow-x-hidden font-sans">
        {/* ───────────────────────── 1. SUPASTE-STYLE FLOATING PILL NAVBAR ───────────────────────── */}
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-auto px-4 max-w-[94vw]">
          <header className="flex items-center gap-6 rounded-full border border-white/12 bg-[#0f0810]/75 px-5 py-2 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
            {/* Brand */}
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-black font-mono font-bold text-xs shadow-sm">
                PX
              </div>
              <span className="text-[13px] font-semibold tracking-tight text-white">PixelCut</span>
            </Link>

            {/* Links */}
            <nav className="hidden md:flex items-center gap-5 text-[12.5px] font-medium text-neutral-300">
              <a href="#stats" className="hover:text-white transition-colors">
                Rakamlar
              </a>
              <a href="#showcase" className="hover:text-white transition-colors">
                Stüdyo
              </a>
              <a href="#changelog" className="hover:text-white transition-colors">
                Changelog
              </a>
              <a href="#faq" className="hover:text-white transition-colors">
                SSS
              </a>
              <a
                href="https://github.com/onuracar-dev/PixelCut"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <GitHubIcon className="h-3.5 w-3.5 text-neutral-400" />
                <span>GitHub</span>
              </a>
            </nav>

            {/* Action CTAs: Direct Installer Download */}
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/onuracar-dev/PixelCut/releases/latest/download/PixelCut-Setup-0.1.0.exe"
                download="PixelCut-Setup-0.1.0.exe"
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-[12px] font-semibold text-black hover:bg-neutral-200 transition-all shadow-sm active:scale-95"
              >
                <Download className="h-3 w-3" />
                <span>İndir (.exe)</span>
              </a>
            </div>
          </header>
        </div>

        {/* ───────────────────────── 2. HERO SECTION (100vh) ───────────────────────── */}
        <section className="relative min-h-screen flex flex-col justify-between pt-36 pb-0 overflow-hidden">
          {/* Background 4K Pagoda Art with Japanese Misty Atmosphere */}
          <div
            className="absolute inset-0 z-0 bg-cover bg-center sm:bg-bottom opacity-85"
            style={{
              backgroundImage: "url('/images/landing-hero.jpg')",
            }}
          />

          {/* Atmospheric Overlays */}
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#090308]/75 via-[#0e040c]/40 to-[#070407]" />
          <div className="absolute inset-x-0 bottom-0 h-40 z-0 bg-gradient-to-t from-[#070407] to-transparent" />

          {/* Hero Top Content: Pure Apple Font, Max 3-4 Words Headline */}
          <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
            {/* Apple Typography Headline (Exactly 3 Words, No Neon Text Above) */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-white leading-[1.06]">
              Piksel Hassasiyetinde CSS.
            </h1>

            {/* Minimal 1-Sentence Apple Subtitle */}
            <p className="mt-4 text-base sm:text-lg text-neutral-300 max-w-xl mx-auto font-normal leading-relaxed">
              Tasarım ile kod çıktısı arasındaki farkı milimetrik sıfırlayan modern stüdyo.
            </p>

            {/* Single Download CTA (Direct Installer Download) */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
              <a
                href="https://github.com/onuracar-dev/PixelCut/releases/latest/download/PixelCut-Setup-0.1.0.exe"
                download="PixelCut-Setup-0.1.0.exe"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-xs sm:text-sm font-semibold text-black transition-all hover:bg-neutral-100 active:scale-95 shadow-lg hover:shadow-[0_0_25px_rgba(255,255,255,0.25)]"
              >
                <Download className="h-4 w-4" />
                <span>Windows için İndir (.exe)</span>
              </a>
            </div>

            <p className="mt-3 text-[11.5px] text-neutral-400">
              Windows 10/11 x64 • Açık Kaynak • Bağımsız Masaüstü Kurulumu
            </p>
          </div>

        {/* ───────────────────────── PEEK-THROUGH HALF WINDOW ───────────────────────── */}
        <div className="relative z-20 mx-auto w-full max-w-5xl px-4 sm:px-6 pt-10 mt-auto">
          <div
            className="relative overflow-hidden rounded-t-2xl border-t border-x border-white/15 bg-[#0e080e]/95 shadow-[0_-20px_80px_rgba(0,0,0,0.85)] backdrop-blur-2xl transition-all duration-300 hover:border-white/25"
            style={{
              height: "360px",
            }}
          >
            {/* macOS Chrome Titlebar */}
            <div className="flex items-center justify-between border-b border-white/10 bg-[#160f16]/90 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
                <span className="text-neutral-500 font-sans">PixelCut Studio —</span>
                <span>styles.css</span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400">
                <span>Desktop v0.1.0</span>
              </div>
            </div>

            {/* Split Screen Interior Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 h-full font-mono text-xs">
              {/* Left Column: Monaco Code Snippet */}
              <div className="border-r border-white/10 p-5 bg-[#0a060a]/80 select-none overflow-hidden">
                <div className="text-neutral-500 text-[11px] mb-3 font-sans flex items-center justify-between">
                  <span>// CSS Kuralları & Hijyen Denetimi</span>
                  <span className="text-neutral-400">styles.css</span>
                </div>
                <div className="space-y-1 text-neutral-300 leading-relaxed">
                  <p className="text-neutral-500">1  <span className="text-rose-300">.pricing-card</span> &#123;</p>
                  <p className="pl-4 text-neutral-300">2    <span className="text-cyan-300">display</span>: flex;</p>
                  <p className="pl-4 text-neutral-300">3    <span className="text-cyan-300">padding</span>: 24px;</p>
                  <p className="pl-4 text-neutral-300">4    <span className="text-cyan-300">border-radius</span>: 16px;</p>
                  <p className="pl-4 text-neutral-300">5    <span className="text-cyan-300">background</span>: #18181b;</p>
                  <p className="pl-4 text-neutral-300">6    <span className="text-cyan-300">box-shadow</span>: 0 10px 30px rgba(0,0,0,0.5);</p>
                  <p className="text-neutral-500">7  &#125;</p>
                </div>
              </div>

              {/* Right Column: Live Render Canvas */}
              <div className="relative flex items-center justify-center p-6 bg-gradient-to-br from-[#120a12] to-[#070407] overflow-hidden">
                <div className="w-full max-w-xs rounded-xl border border-white/15 bg-white/[0.04] p-5 backdrop-blur-xl shadow-2xl relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-neutral-200">
                      ÖNİZLEME
                    </span>
                  </div>
                  <div className="text-sm font-sans font-bold text-white mb-1">
                    Pro Plan • ₺299/ay
                  </div>
                  <p className="text-[11px] font-sans text-neutral-400 mb-4">
                    Piksel hassasiyetinde bileşen çıktısı.
                  </p>
                  <div className="w-full rounded-lg bg-white/10 text-center py-2 text-xs font-sans font-semibold text-neutral-200">
                    Bileşen Aktif
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── 3. UIARC STATS BAND ───────────────────────── */}
      <section id="stats" className="relative z-10 py-20 border-t border-white/[0.06] bg-gradient-to-b from-[#070407] via-[#0b050b] to-[#070407]">
        <div className="mx-auto max-w-6xl px-6">
          <StatsBand
            stats={PIXELCUT_STATS}
            layout="divided"
            title="Ölçülebilir Standartlar"
            description="Her CSS satırı cerrahi denetimden ve gerçek zamanlı eşleşme kontrolünden geçer."
          />
        </div>
      </section>

      {/* ───────────────────────── 4. MACBOOK SCROLL SHOWCASE ───────────────────────── */}
      <section id="showcase" className="relative z-10 border-t border-white/[0.06] bg-[#070407] overflow-x-clip">
        <MacbookScroll
          title={
            <div className="max-w-xl mx-auto text-center">
              <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white leading-tight">
                Piksel Hassasiyetinde Stüdyo.
              </h2>
              <p className="mt-3 text-sm sm:text-base text-neutral-400 font-normal leading-relaxed">
                VS Code çekirdekli Monaco editör, canlı kanvas ve otomatik kod denetimi tek bir masaüstü penceresinde.
              </p>
            </div>
          }
        >
          {/* Genuine In-App Window Frame Inside the Screen */}
          <div className="flex flex-col h-full w-full bg-[#120a12] select-none">
            {/* macOS Chrome Header */}
            <div className="flex h-9 items-center justify-between border-b border-white/10 bg-[#140a14] px-3.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-neutral-300">
                <Monitor className="h-3.5 w-3.5 text-neutral-400" />
                <span>PixelCut Studio — Çalışma Alanı</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400">
                <span>Windows x64</span>
              </div>
            </div>

            {/* Embedded In-App Screenshot */}
            <div className="relative flex-1 w-full overflow-hidden bg-black">
              <img
                src="/images/studio-screenshot.png"
                alt="PixelCut Studio Çalışma Alanı"
                className="h-full w-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </MacbookScroll>
      </section>

      {/* ───────────────────────── 5. UIARC CHANGELOG FEED ───────────────────────── */}
      <section id="changelog" className="relative z-20 py-24 border-t border-white/[0.06] bg-[#070407] shadow-[0_-30px_60px_rgba(0,0,0,0.9)]">
        <div className="mx-auto max-w-5xl px-6">
          <ChangelogFeed
            title="Sürüm Notları"
            subtitle="PixelCut v0.1.0 kararlı sürümü ve en son geliştirmeler"
            endNote="PixelCut masaüstü uygulaması düzenli olarak güncellenmektedir."
            entries={PIXELCUT_CHANGELOG}
            months={PIXELCUT_CHANGELOG_MONTHS}
          />
        </div>
      </section>

      {/* ───────────────────────── 6. UIARC FAQ SECTION ───────────────────────── */}
      <section id="faq" className="relative z-20 py-20 border-t border-white/[0.06] bg-[#070407]">
        <div className="mx-auto max-w-4xl px-6">
          <FaqSection
            items={PIXELCUT_FAQ}
            variant="accordion"
            title="Sıkça Sorulan Sorular"
            description="PixelCut'ın kurulumu, yetenekleri ve sınıf kullanımı hakkında merak edilenler."
            contact={{
              label: "Geliştiriciye Ulaşın",
              description: "Öneri veya hata bildirimleri için doğrudan iletişime geçin.",
              href: "mailto:onuracar.work@gmail.com",
            }}
          />
        </div>
      </section>

      {/* ───────────────────────── 7. UIARC SITE FOOTER ───────────────────────── */}
      <div className="relative z-20 border-t border-white/[0.06] bg-[#050305]">
        <SiteFooter
          variant="minimal"
          brand={{
            name: "PixelCut",
            href: "/",
            mark: (
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-black font-mono font-bold text-[10px]">
                PX
              </div>
            ),
          }}
          tagline="Piksel hassasiyetinde CSS laboratuvarı ve görsel dilimleme stüdyosu."
          status={null}
          newsletter={null}
          links={[
            { label: "GitHub Deposu", href: "https://github.com/onuracar-dev/PixelCut", external: true },
            { label: "Sürümler (.exe)", href: "https://github.com/onuracar-dev/PixelCut/releases", external: true },
            { label: "Geliştirici İletişim", href: "mailto:onuracar.work@gmail.com" },
          ]}
          legal={[
            { label: "MIT Lisansı", href: "https://github.com/onuracar-dev/PixelCut/blob/main/LICENSE" },
            { label: "v0.1.0" },
          ]}
          year={2026}
        />
      </div>
    </div>
    </SmoothScrollProvider>
  );
}
