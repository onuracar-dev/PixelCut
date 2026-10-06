"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Code2,
  Database,
  Eye,
  EyeOff,
  GraduationCap,
  Layers,
  Lock,
  Mail,
  Maximize2,
  Palette,
  Shield,
  SkipForward,
  Sparkles,
  User,
  Zap,
  Dices,
} from "lucide-react";
import { PasswordField } from "@/components/arc/password-field/password-field";

const GitHubIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className || "size-5"}
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className || "size-5"}
    aria-hidden="true"
  >
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const AppleIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className || "size-5"}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
  </svg>
);
import { UserRole } from "@/types";
import { Appearance, APPEARANCES } from "@/types/theme";
import { useAppearance } from "@/lib/appearance";
import { cn } from "@/lib/utils";
import { MorphingText } from "@/components/ui/morphing-text";
import { TextAnimate } from "@/components/ui/text-animate";
import CoverflowDrag, { CoverflowItem, DEFAULT_AVATARS } from "@/components/coverflow-drag";
import RollingCardStack, { CardItem } from "@/components/rolling-card-stack";
import { AppleHelloLoader } from "@/components/loaders/apple-hello-loader";
import { ActionButton } from "@/components/arc/action-button/action-button";

export interface OnboardingData {
  role: UserRole;
  fullName: string;
  studentNo: string;
  classCode: string;
  avatarUrl: string;
  theme: Appearance;
  githubConnected?: boolean;
  supabaseConnected?: boolean;
}

interface OnboardingWizardProps {
  isOpen: boolean;
  onComplete: (data: OnboardingData) => void;
  onClose?: () => void;
  initialRole?: UserRole;
}

// 5 Curated Theme Cards for RollingCardStack
const THEME_CARDS: CardItem[] = [
  {
    id: "dark",
    caption: "Space Gray",
    title: "macOS Dark Klasik",
    description: "Kusursuz dengelenmiş grafit grisi, göz yormayan derin kontrast ve stüdyo netliği.",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=85",
    accentColor: "text-blue-500",
  },
  {
    id: "light",
    caption: "Cupertino Light",
    title: "Saf Apple Gündüzü",
    description: "Açık, havadar ve berrak beyaz çalışma alanı. Aydınlık laboratuvar ortamları için ideal.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
    accentColor: "text-sky-500",
  },
  {
    id: "oled",
    caption: "Midnight OLED",
    title: "Derin Siyah & Sonsuz Kontrast",
    description: "Saf #000000 zemin. OLED ve Mini-LED panellerde pikselleri tamamen kapatır, sıfır ışık sızması.",
    image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1600&q=85",
    accentColor: "text-neutral-200",
  },
  {
    id: "cream",
    caption: "Warm Studio",
    title: "Fildişi Krem & Terracotta",
    description: "Gözü dinlendiren sıcak fildişi kağıt dokusu. Uzun saatler süren CSS lab çalışmalarına özel.",
    image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1600&q=85",
    accentColor: "text-amber-500",
  },
  {
    id: "nordic",
    caption: "Arctic Slate",
    title: "Kutup Mavisi & Buz Grisi",
    description: "Raycast ve Linear esintili soğuk kuzey renk paleti. Modern ve keskin mühendis estetiği.",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=85",
    accentColor: "text-cyan-400",
  },
];

const THEME_NAMES: Record<string, string> = {
  dark: "Space Gray",
  light: "Cupertino Light",
  oled: "Midnight OLED",
  cream: "Warm Studio",
  nordic: "Arctic Slate",
};

const DICEBEAR_STYLES = [
  { id: "adventurer", label: "Maceracı" },
  { id: "bottts", label: "Robot" },
  { id: "lorelei", label: "Portre" },
  { id: "pixel-art", label: "8-Bit" },
  { id: "notionists", label: "Notion" },
  { id: "micah", label: "Vektör" },
];

function buildDicebearUrl(seed: string, style = "adventurer") {
  const safeSeed = encodeURIComponent((seed || "PixelCut").trim());
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${safeSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

export function OnboardingWizard({
  isOpen,
  onComplete,
  onClose,
  initialRole = "student",
}: OnboardingWizardProps) {
  const { appearance, setAppearance } = useAppearance();

  const [step, setStep] = React.useState<number>(1);
  const totalSteps = 6;

  // Form State
  const [role, setRole] = React.useState<UserRole>(initialRole);
  const [teacherPassword, setTeacherPassword] = React.useState<string>("");
  const [teacherPasswordError, setTeacherPasswordError] = React.useState<string>("");

  const [fullName, setFullName] = React.useState<string>("Ahmet Yılmaz");
  const [studentNo, setStudentNo] = React.useState<string>("220401048");
  const [classCode, setClassCode] = React.useState<string>("CSS-302-LAB");

  // Avatar State
  const [avatarStyle, setAvatarStyle] = React.useState<string>("adventurer");
  const [avatarSeed, setAvatarSeed] = React.useState<string>("Ahmet Yılmaz");
  const [isCustomAvatar, setIsCustomAvatar] = React.useState<boolean>(false);
  const [selectedAvatar, setSelectedAvatar] = React.useState<string>(DEFAULT_AVATARS[0].src);
  const [selectedAvatarName, setSelectedAvatarName] = React.useState<string>(DEFAULT_AVATARS[0].name);

  // Auth State
  const [authEmail, setAuthEmail] = React.useState<string>("ahmet.yilmaz@lab.edu.tr");
  const [authPassword, setAuthPassword] = React.useState<string>("CssSlicer!2026");
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [connectedProvider, setConnectedProvider] = React.useState<"github" | "google" | "apple" | null>(null);
  const [githubConnected, setGithubConnected] = React.useState<boolean>(false);
  const [supabaseConnected, setSupabaseConnected] = React.useState<boolean>(false);
  const [isAuthConnecting, setIsAuthConnecting] = React.useState<string | null>(null);

  // Dynamic Password Strength
  const passwordStrength = React.useMemo(() => {
    if (!authPassword) return 0;
    let score = 0;
    if (authPassword.length >= 8) score++;
    if (authPassword.length >= 12) score++;
    if (/[a-z]/.test(authPassword) && /[A-Z]/.test(authPassword)) score++;
    if (/\d|[^\w\s]/.test(authPassword)) score++;
    return score;
  }, [authPassword]);

  const strengthLabels = ["", "Zayıf", "Orta", "İyi", "Çok Güçlü"];
  const strengthColors = [
    "bg-hairline-strong",
    "bg-rose-500",
    "bg-amber-500",
    "bg-sky-500",
    "bg-emerald-500",
  ];

  const handleSSO = (provider: "github" | "google" | "apple") => {
    if (connectedProvider === provider) {
      setConnectedProvider(null);
      if (provider === "github") setGithubConnected(false);
    } else {
      setConnectedProvider(provider);
      if (provider === "github") {
        setGithubConnected(true);
        if (!fullName || fullName === "Ahmet Yılmaz") setFullName("Ahmet Yılmaz");
        setAuthEmail("ahmet.yilmaz@github.com");
      } else if (provider === "google") {
        if (!fullName || fullName === "Ahmet Yılmaz") setFullName("Ahmet Yılmaz");
        setAuthEmail("ahmet.yilmaz@gmail.com");
      } else if (provider === "apple") {
        if (!fullName || fullName === "Ahmet Yılmaz") setFullName("Ahmet Yılmaz");
        setAuthEmail("ahmet.yilmaz@icloud.com");
      }
    }
  };

  // Maximize desktop window on first launch
  React.useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      try {
        (window as any).electronAPI?.windowMaximize?.();
      } catch (e) {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    } else {
      onComplete({
        role,
        fullName: fullName.trim() || (role === "teacher" ? "Dr. Öğr. Üyesi" : "Öğrenci"),
        studentNo: studentNo.trim() || "220401048",
        classCode: classCode.trim() || "CSS-302-LAB",
        avatarUrl: selectedAvatar,
        theme: appearance,
        githubConnected,
        supabaseConnected,
      });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  // Mock GitHub Connect Action
  const handleConnectGithub = () => {
    setIsAuthConnecting("github");
    setTimeout(() => {
      setGithubConnected(true);
      setIsAuthConnecting(null);
    }, 900);
  };

  // Mock Supabase Connect Action
  const handleConnectSupabase = () => {
    setIsAuthConnecting("supabase");
    setTimeout(() => {
      setSupabaseConnected(true);
      setIsAuthConnecting(null);
    }, 900);
  };

  // Skip Auth step directly to finish
  const handleSkipAuth = () => {
    setGithubConnected(false);
    setSupabaseConnected(false);
    setStep(6);
  };

  return (
    <div className="fixed inset-0 z-[100] h-screen w-screen overflow-hidden flex flex-col justify-between bg-canvas text-label select-none transition-colors duration-500">
      {/* Cinematic Ambient Backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.25), rgba(255, 255, 255, 0))",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-well/30 backdrop-blur-3xl" />

      {/* Floating transparent Apple top bar on all steps: only traffic lights & subtle close */}
      <div className="relative z-20 flex h-12 w-full items-center justify-between px-6 pt-2">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-[#ff5f57] border border-black/10 inline-block shadow-sm" />
          <span className="size-3 rounded-full bg-[#febc2e] border border-black/10 inline-block shadow-sm" />
          <span className="size-3 rounded-full bg-[#28c840] border border-black/10 inline-block shadow-sm" />
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-[12px] text-label-3 hover:text-label transition-colors px-2 py-1 rounded-md cursor-pointer"
          >
            Kapat
          </button>
        )}
      </div>

      {/* Main Fullscreen Stage Container */}
      <main className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-10 flex flex-col items-center justify-center">
        <div className="w-full max-w-5xl mx-auto my-auto">
          <AnimatePresence mode="wait">
            {/* STEP 1: ICONIC APPLE HELLO LOADER & CLEAN PREMIUM STAGE */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col items-center justify-center text-center max-w-xl mx-auto py-12 space-y-7"
              >
                {/* Iconic Apple Hello Loader */}
                <div className="py-2 w-full flex items-center justify-center">
                  <AppleHelloLoader
                    greetings={[
                      "merhaba",
                      "hello",
                      "bonjour",
                      "hola",
                      "ciao",
                      "olá",
                      "namaste",
                      "hallo",
                    ]}
                    intervalMs={2200}
                    fadeMs={350}
                    className="min-h-[100px] px-2 py-0 bg-transparent"
                    textClassName="text-5xl sm:text-6xl md:text-7xl font-light tracking-tight text-label"
                  />
                </div>

                {/* Refined clean description */}
                <p className="text-[15px] sm:text-[16px] text-label-2 leading-relaxed max-w-md mx-auto font-normal -mt-2">
                  Piksel hassasiyetinde CSS ayıklama, Monaco editör ve canlı sınıf laboratuvarına hoş geldiniz.
                </p>

                {/* Premium Action Button */}
                <div className="flex items-center justify-center pt-4 w-full">
                  <ActionButton
                    label="Kuruluma Başla"
                    pendingLabel="Başlatılıyor..."
                    successLabel="Başlatıldı"
                    onAction={async () => {
                      await new Promise((r) => setTimeout(r, 450));
                      handleNext();
                    }}
                    className="h-11 px-8 rounded-full text-[13.5px] font-semibold tracking-tight shadow-mac-md cursor-pointer"
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 2: ROLE SELECTION (PURE APPLE MINIMAL DESIGN) */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-10 max-w-md mx-auto text-center py-6"
              >
                {/* Clean Apple Title with MorphingText */}
                <div className="h-12 sm:h-14 md:h-16 flex items-center justify-center">
                  <MorphingText
                    texts={["Rolünüzü", "Belirleyin"]}
                    className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-label"
                  />
                </div>

                {/* Apple Pure Role Cards - Strictly No Description */}
                <div className="grid grid-cols-2 gap-5 pt-1">
                  <button
                    type="button"
                    onClick={() => setRole("student")}
                    className={cn(
                      "group relative flex flex-col items-center justify-center p-7 sm:p-8 rounded-[28px] border transition-all duration-300 text-center backdrop-blur-2xl cursor-pointer select-none",
                      role === "student"
                        ? "bg-surface border-label shadow-mac-lg ring-2 ring-hairline-strong scale-[1.02]"
                        : "bg-surface/50 border-hairline hover:bg-surface/80 hover:border-hairline-strong hover:scale-[1.01]"
                    )}
                  >
                    {/* Apple Squircle Icon */}
                    <div
                      className={cn(
                        "grid size-18 place-items-center rounded-2xl border transition-all duration-300 mb-4 shadow-mac-xs",
                        role === "student"
                          ? "bg-label text-surface border-label"
                          : "bg-well text-label border-hairline group-hover:bg-well/80"
                      )}
                    >
                      <GraduationCap className="size-8 stroke-[1.5]" />
                    </div>

                    {/* Title Only */}
                    <span className="text-[16px] sm:text-[17px] font-semibold tracking-tight text-label">
                      Öğrenci Modu
                    </span>

                    {/* Apple Radio Indicator */}
                    <div className="mt-4 flex items-center justify-center">
                      <div
                        className={cn(
                          "size-4 rounded-full border flex items-center justify-center transition-all duration-200",
                          role === "student"
                            ? "border-label bg-label"
                            : "border-hairline-strong bg-transparent group-hover:border-label-3"
                        )}
                      >
                        {role === "student" && (
                          <div className="size-1.5 rounded-full bg-surface" />
                        )}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("teacher")}
                    className={cn(
                      "group relative flex flex-col items-center justify-center p-7 sm:p-8 rounded-[28px] border transition-all duration-300 text-center backdrop-blur-2xl cursor-pointer select-none",
                      role === "teacher"
                        ? "bg-surface border-label shadow-mac-lg ring-2 ring-hairline-strong scale-[1.02]"
                        : "bg-surface/50 border-hairline hover:bg-surface/80 hover:border-hairline-strong hover:scale-[1.01]"
                    )}
                  >
                    {/* Apple Squircle Icon */}
                    <div
                      className={cn(
                        "grid size-18 place-items-center rounded-2xl border transition-all duration-300 mb-4 shadow-mac-xs",
                        role === "teacher"
                          ? "bg-label text-surface border-label"
                          : "bg-well text-label border-hairline group-hover:bg-well/80"
                      )}
                    >
                      <Shield className="size-8 stroke-[1.5]" />
                    </div>

                    {/* Title Only */}
                    <span className="text-[16px] sm:text-[17px] font-semibold tracking-tight text-label">
                      Öğretmen Modu
                    </span>

                    {/* Apple Radio Indicator */}
                    <div className="mt-4 flex items-center justify-center">
                      <div
                        className={cn(
                          "size-4 rounded-full border flex items-center justify-center transition-all duration-200",
                          role === "teacher"
                            ? "border-label bg-label"
                            : "border-hairline-strong bg-transparent group-hover:border-label-3"
                        )}
                      >
                        {role === "teacher" && (
                          <div className="size-1.5 rounded-full bg-surface" />
                        )}
                      </div>
                    </div>
                  </button>
                </div>

                {/* Teacher Password Gate via @uiarc/password-field */}
                <AnimatePresence>
                  {role === "teacher" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      transition={{ duration: 0.28, ease: "easeOut" }}
                      className="overflow-hidden text-left"
                    >
                      <div className="rounded-[22px] border border-hairline/80 bg-surface/80 p-5 backdrop-blur-2xl shadow-mac-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[12.5px] font-semibold text-label flex items-center gap-1.5">
                            <Lock className="size-3.5 text-label-2" />
                            Eğitmen PIN Kodu
                          </label>
                          <span className="text-[11px] text-label-3 font-mono bg-well/60 px-2 py-0.5 rounded-md border border-hairline/50">
                            6 Haneli PIN
                          </span>
                        </div>

                        <div className="[&_label]:hidden">
                          <PasswordField
                            label="Eğitmen PIN Kodu"
                            placeholder="6 haneli PIN kodunu girin..."
                            value={teacherPassword}
                            maxLength={6}
                            onChange={(e) => {
                              setTeacherPassword(e.target.value);
                              if (teacherPasswordError) setTeacherPasswordError("");
                            }}
                            description={
                              teacherPasswordError ||
                              "Eğitmen kontrolü ve kullanıcı gözetimini aktifleştirmek için gereklidir."
                            }
                            className="bg-well/50 text-[14px] h-11 tracking-widest font-mono"
                          />
                        </div>

                        {teacherPassword && !teacherPasswordError && (
                          <div className="flex items-center gap-1.5 text-[11.5px] text-emerald-500 font-medium pt-0.5">
                            <CheckCircle2 className="size-3.5" />
                            <span>Eğitmen PIN kodu doğrulandı.</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* In-Flow Action Buttons */}
                <div className="flex items-center justify-center gap-3 pt-3 w-full">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="h-11 px-6 rounded-full text-[13.5px] font-medium text-label-2 hover:text-label hover:bg-well/60 transition-colors cursor-pointer"
                  >
                    Geri
                  </button>

                  <ActionButton
                    label="Devam Et"
                    pendingLabel="Doğrulanıyor..."
                    successLabel="Onaylandı"
                    onAction={async () => {
                      if (role === "teacher") {
                        const trimmed = teacherPassword.trim();
                        if (!trimmed) {
                          setTeacherPasswordError("Eğitmen paneli için 6 haneli PIN zorunludur.");
                          return;
                        }
                        const validPins = ["749201", "749-201"];
                        if (!validPins.includes(trimmed)) {
                          setTeacherPasswordError("Geçersiz eğitmen PIN kodu. Lütfen doğru PIN'i girin.");
                          return;
                        }
                      }
                      await new Promise((r) => setTimeout(r, 350));
                      handleNext();
                    }}
                    className="h-11 px-8 rounded-full text-[13.5px] font-semibold tracking-tight shadow-mac-md cursor-pointer"
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 3: AVATAR PICKER VIA COVERFLOW-DRAG & DICEBEAR GENERATOR */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 max-w-4xl mx-auto text-center py-2"
              >
                {/* Clean Apple Title */}
                <div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-label">
                    Avatarınızı Seçin
                  </h2>
                </div>

                {/* DiceBear Studio Control Bar */}
                <div className="mx-auto max-w-2xl rounded-2xl border border-hairline/80 bg-surface/80 p-3 backdrop-blur-2xl shadow-mac-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="relative size-12 rounded-xl overflow-hidden bg-well border border-hairline flex items-center justify-center p-1 shadow-mac-xs shrink-0">
                      <img
                        src={selectedAvatar}
                        alt="Avatar Önizleme"
                        className="size-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-semibold text-label">
                          {isCustomAvatar ? "Kişiselleştirilmiş Avatar" : selectedAvatarName}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-mono font-medium">
                          DiceBear SVG
                        </span>
                      </div>
                      <p className="text-[11.5px] text-label-3">
                        İsminize göre dinamik üretildi veya stil seçebilirsiniz.
                      </p>
                    </div>
                  </div>

                  {/* DiceBear Styles & Randomize */}
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {DICEBEAR_STYLES.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          setAvatarStyle(st.id);
                          setIsCustomAvatar(true);
                          setSelectedAvatar(buildDicebearUrl(avatarSeed || fullName, st.id));
                        }}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer",
                          avatarStyle === st.id
                            ? "bg-label text-surface font-semibold shadow-mac-xs"
                            : "bg-well/60 text-label-2 hover:bg-well hover:text-label"
                        )}
                      >
                        {st.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const randomSeed = "Pixel_" + Math.random().toString(36).substring(2, 7);
                        setAvatarSeed(randomSeed);
                        setIsCustomAvatar(true);
                        setSelectedAvatar(buildDicebearUrl(randomSeed, avatarStyle));
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-well/80 hover:bg-well text-label flex items-center gap-1 transition-all cursor-pointer shadow-mac-xs"
                      title="Rastgele Karakter Üret"
                    >
                      <Dices className="size-3 text-amber-500" />
                      Zar At
                    </button>
                  </div>
                </div>

                {/* Frameless 3D CoverflowDrag Component */}
                <div className="w-full py-0">
                  <CoverflowDrag
                    items={DEFAULT_AVATARS}
                    selectedId={selectedAvatar}
                    onSelect={(item: CoverflowItem) => {
                      setSelectedAvatar(item.src);
                      setSelectedAvatarName(item.name);
                      setIsCustomAvatar(false);
                    }}
                    className="h-[330px]"
                  />
                </div>

                {/* In-Flow Action Buttons */}
                <div className="flex items-center justify-center gap-3 pt-2 w-full">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="h-11 px-6 rounded-full text-[13.5px] font-medium text-label-2 hover:text-label hover:bg-well/60 transition-colors cursor-pointer"
                  >
                    Geri
                  </button>

                  <ActionButton
                    label="Devam Et"
                    pendingLabel="Kaydediliyor..."
                    successLabel="Kaydedildi"
                    onAction={async () => {
                      await new Promise((r) => setTimeout(r, 350));
                      handleNext();
                    }}
                    className="h-11 px-8 rounded-full text-[13.5px] font-semibold tracking-tight shadow-mac-md cursor-pointer"
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 4: THEME SELECTION VIA ROLLING-CARD-STACK (BORDERLESS APPLE DESIGN) */}
            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 max-w-4xl mx-auto text-center py-4"
              >
                {/* Clean Apple Title */}
                <div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-label">
                    Temanızı Seçin
                  </h2>
                </div>

                {/* Frameless RollingCardStack Component */}
                <div className="w-full">
                  <RollingCardStack
                    cards={THEME_CARDS}
                    showDeviceToggle={false}
                    showPagination={true}
                    onCardChange={(_, card) => {
                      if (card.id) {
                        setAppearance(card.id as Appearance);
                      }
                    }}
                    className="p-0"
                  />
                </div>

                {/* In-Flow Action Buttons */}
                <div className="flex items-center justify-center gap-3 pt-2 w-full">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="h-11 px-6 rounded-full text-[13.5px] font-medium text-label-2 hover:text-label hover:bg-well/60 transition-colors"
                  >
                    Geri
                  </button>

                  <ActionButton
                    label="Devam Et"
                    pendingLabel="Kaydediliyor..."
                    successLabel="Kaydedildi"
                    onAction={async () => {
                      await new Promise((r) => setTimeout(r, 350));
                      handleNext();
                    }}
                    className="h-11 px-8 rounded-full text-[13.5px] font-semibold tracking-tight shadow-mac-md cursor-pointer"
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 5: APPLE-GRADE AUTH CANVAS (BORDERLESS CUERTINO DESIGN) */}
            {step === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-[420px] mx-auto text-center space-y-6 py-2"
              >
                {/* Clean Apple Title */}
                <div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-label">
                    Hesabınızı Oluşturun
                  </h2>
                </div>

                {/* Glassmorphic Apple Studio Card */}
                <div className="rounded-[28px] border border-hairline/80 bg-surface/70 p-6 sm:p-7 backdrop-blur-2xl shadow-mac-lg text-left space-y-5">
                  {/* SSO Quick Connect Row */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* GitHub */}
                    <button
                      type="button"
                      onClick={() => handleSSO("github")}
                      className={cn(
                        "group relative flex items-center justify-center gap-2.5 h-12 px-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none",
                        connectedProvider === "github"
                          ? "bg-label text-surface border-label shadow-mac-xs ring-1 ring-hairline-strong"
                          : "bg-well/60 border-hairline hover:bg-well hover:border-hairline-strong text-label"
                      )}
                    >
                      <GitHubIcon
                        className={cn(
                          "size-5 transition-transform group-hover:scale-110",
                          connectedProvider === "github" ? "text-surface" : "text-label"
                        )}
                      />
                      <span className="text-[13px] font-medium tracking-tight">GitHub</span>
                      {connectedProvider === "github" && (
                        <span className="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shadow-sm font-bold">
                          ✓
                        </span>
                      )}
                    </button>

                    {/* Google */}
                    <button
                      type="button"
                      onClick={() => handleSSO("google")}
                      className={cn(
                        "group relative flex items-center justify-center gap-2.5 h-12 px-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none",
                        connectedProvider === "google"
                          ? "bg-label text-surface border-label shadow-mac-xs ring-1 ring-hairline-strong"
                          : "bg-well/60 border-hairline hover:bg-well hover:border-hairline-strong text-label"
                      )}
                    >
                      <GoogleIcon className="size-5 transition-transform group-hover:scale-110" />
                      <span
                        className={cn(
                          "text-[13px] font-medium tracking-tight",
                          connectedProvider === "google" ? "text-surface" : "text-label"
                        )}
                      >
                        Google
                      </span>
                      {connectedProvider === "google" && (
                        <span className="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shadow-sm font-bold">
                          ✓
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Clean Divider */}
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-hairline" />
                    </div>
                    <span className="relative bg-surface/90 px-3 text-[11px] font-medium uppercase tracking-wider text-label-3 rounded-full">
                      veya e-posta
                    </span>
                  </div>

                  {/* Inputs */}
                  <div className="space-y-3.5">
                    {/* Full Name with Live DiceBear Avatar Badge */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between ml-1">
                        <label className="text-[11.5px] font-medium text-label-2">
                          Ad Soyad
                        </label>
                        <span className="text-[10.5px] text-label-3 flex items-center gap-1">
                          <Sparkles className="size-3 text-amber-500" />
                          Avatar isme göre canlı üretilir
                        </span>
                      </div>
                      <div className="relative flex items-center">
                        <div className="absolute left-2.5 size-7 rounded-lg overflow-hidden border border-hairline/60 bg-surface flex items-center justify-center p-0.5 shadow-mac-xs">
                          <img
                            src={selectedAvatar}
                            alt="Avatar"
                            className="size-full object-contain"
                          />
                        </div>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => {
                            const newName = e.target.value;
                            setFullName(newName);
                            if (!isCustomAvatar) {
                              const newAvatar = buildDicebearUrl(newName, avatarStyle);
                              setSelectedAvatar(newAvatar);
                              setSelectedAvatarName(newName || "Öğrenci");
                            }
                          }}
                          placeholder="Adınız Soyadınız"
                          className="w-full h-11 pl-12 pr-4 rounded-xl bg-well/50 border border-hairline text-label placeholder:text-label-3 text-[13.5px] focus:outline-none focus:border-label focus:bg-surface focus:ring-1 focus:ring-label/30 transition-all duration-200"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="text-[11.5px] font-medium text-label-2 ml-1">
                        E-posta Adresi
                      </label>
                      <div className="relative flex items-center">
                        <Mail className="absolute left-3.5 size-4 text-label-3 pointer-events-none" />
                        <input
                          type="email"
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          placeholder="ad.soyad@ogr.uni.edu.tr"
                          className="w-full h-11 pl-10 pr-4 rounded-xl bg-well/50 border border-hairline text-label placeholder:text-label-3 text-[13.5px] focus:outline-none focus:border-label focus:bg-surface focus:ring-1 focus:ring-label/30 transition-all duration-200"
                        />
                      </div>
                    </div>

                    {/* Password with Strength Meter */}
                    <div className="space-y-1">
                      <label className="text-[11.5px] font-medium text-label-2 ml-1">
                        Şifre
                      </label>
                      <div className="relative flex items-center">
                        <Lock className="absolute left-3.5 size-4 text-label-3 pointer-events-none" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full h-11 pl-10 pr-10 rounded-xl bg-well/50 border border-hairline text-label placeholder:text-label-3 text-[13.5px] focus:outline-none focus:border-label focus:bg-surface focus:ring-1 focus:ring-label/30 transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 p-1 text-label-3 hover:text-label transition-colors cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>

                      {/* 4-Segment Strength Indicator Bar */}
                      {authPassword ? (
                        <div className="flex items-center justify-between pt-1 px-1">
                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4].map((bar) => (
                              <div
                                key={bar}
                                className={cn(
                                  "h-1.5 w-6 rounded-full transition-all duration-300",
                                  bar <= passwordStrength
                                    ? strengthColors[passwordStrength]
                                    : "bg-hairline-strong"
                                )}
                              />
                            ))}
                          </div>
                          <span
                            className={cn(
                              "text-[11px] font-medium transition-colors duration-200",
                              passwordStrength === 1 && "text-rose-500",
                              passwordStrength === 2 && "text-amber-500",
                              passwordStrength === 3 && "text-sky-500",
                              passwordStrength >= 4 && "text-emerald-500"
                            )}
                          >
                            {strengthLabels[passwordStrength]}
                          </span>
                        </div>
                      ) : (
                        <p className="text-[11px] text-label-3 px-1 pt-0.5">
                          En az 8 karakter ve karmaşık şifre önerilir.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* In-Flow Action Buttons */}
                <div className="flex items-center justify-center gap-3 pt-1 w-full">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="h-11 px-6 rounded-full text-[13.5px] font-medium text-label-2 hover:text-label hover:bg-well/60 transition-colors cursor-pointer"
                  >
                    Geri
                  </button>

                  <button
                    type="button"
                    onClick={handleSkipAuth}
                    className="h-11 px-5 rounded-full text-[13.5px] font-medium text-label-3 hover:text-label-2 hover:bg-well/40 transition-colors cursor-pointer"
                  >
                    Şimdilik Atla
                  </button>

                  <ActionButton
                    label="Hesap Oluştur"
                    pendingLabel="Oluşturuluyor..."
                    successLabel="Hesap Hazır"
                    onAction={async () => {
                      await new Promise((r) => setTimeout(r, 450));
                      handleNext();
                    }}
                    className="h-11 px-8 rounded-full text-[13.5px] font-semibold tracking-tight shadow-mac-md cursor-pointer"
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 6: READY & SUMMARY (BORDERLESS APPLE DESIGN) */}
            {step === 6 && (
              <motion.div
                key="step-6"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md mx-auto text-center space-y-8 py-8"
              >
                {/* Clean Apple Title */}
                <div>
                  <h2 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-label">
                    Her Şey Hazır
                  </h2>
                </div>

                {/* In-Flow Action Buttons */}
                <div className="flex items-center justify-center gap-3 pt-2 w-full">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="h-11 px-6 rounded-full text-[13.5px] font-medium text-label-2 hover:text-label hover:bg-well/60 transition-colors cursor-pointer"
                  >
                    Geri
                  </button>

                  <ActionButton
                    label="PixelCut'ı Başlat"
                    pendingLabel="Başlatılıyor..."
                    successLabel="Hoş Geldiniz!"
                    onAction={async () => {
                      await new Promise((r) => setTimeout(r, 350));
                      handleNext();
                    }}
                    className="h-11 px-8 rounded-full text-[13.5px] font-semibold tracking-tight shadow-mac-md cursor-pointer"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>


    </div>
  );
}
