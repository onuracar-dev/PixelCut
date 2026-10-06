"use client";

import * as React from "react";
import Editor from "@monaco-editor/react";
import confetti from "canvas-confetti";
import { UserRole, StudentLiveState, LiveAssistanceSession, Challenge } from "@/types";
import { AskHelpDialog } from "@/components/classroom/ask-help-dialog";
import { TeacherRemoteWorkspace } from "@/components/classroom/teacher-remote-workspace";
import {
  SAMPLE_CHALLENGES,
  INITIAL_STUDENTS,
  SAMPLE_LEADERBOARD,
} from "@/lib/mock-data";
import { analyzeCssHygiene, CssAnalysisResult } from "@/lib/css-analyzer";
import { MacWindow } from "@/components/mac-ide/mac-window";
import { FileTreeSidebar, SidebarFileId, TreeItemNode } from "@/components/mac-ide/file-tree-sidebar";
import {
  openFolderFromPC,
  readWorkspaceFile,
  saveWorkspaceFile,
  createWorkspaceFile,
  createWorkspaceFolder,
  deleteWorkspacePath,
} from "@/lib/file-system";
import { LiveCssInspector } from "@/components/mac-ide/live-css-inspector";
import { MobilePreviewFrame } from "@/components/mac-ide/mobile-preview-frame";
import { TerminalDock } from "@/components/mac-ide/terminal-dock";
import { DiffSlider } from "@/components/workspace/diff-slider";
import { TeacherSubmitButton } from "@/components/mac-ide/teacher-submit-button";
import { ClassroomGrid } from "@/components/classroom/classroom-grid";
import { RoomsArenaView } from "@/components/classroom/rooms-arena-view";
import { Leaderboard } from "@/components/leaderboard/leaderboard";
import { SettingsView, FONT_FAMILY_MAP } from "@/components/settings/settings-view";
import { AppDock } from "@/components/mac-ide/app-dock";
import { CurveDrawer as GuidelineDrawer } from "@/components/ui/curve-drawer";
import { motion, AnimatePresence } from "motion/react";
import { MorphingUserMenu, UserStatus } from "@/components/mac-ide/morphing-user-menu";
import { SegmentedControl } from "@/components/apple/segmented-control";
import { Popover, MenuLabel, MenuSeparator } from "@/components/apple/popover";
import { Spotlight, SpotlightItem } from "@/components/apple/spotlight";
import { GitSourceControl } from "@/components/git/git-source-control";
import { GitSidebarPanel } from "@/components/git/git-sidebar-panel";
import { GitHubAuthModal } from "@/components/git/github-auth-modal";
import { OnboardingWizard, OnboardingData } from "@/components/onboarding/onboarding-wizard";
import { SupportModal } from "@/components/support/support-modal";
import { DeveloperSupportDesk } from "@/components/developer/developer-support-desk";
import { AuthState, loadSavedAuthState, initSupabaseAuthListener } from "@/lib/supabase-auth";
import {
  classroomRealtime,
  submitToSupabase,
  saveDraftLocally,
  loadDraftLocally,
  fetchChallengesFromSupabase,
} from "@/lib/classroom-realtime";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { pushFilesToGitHub } from "@/lib/github-api";
import { GitCommit, GitFileChange } from "@/types/git";
import {
  INITIAL_GIT_COMMITS,
  INITIAL_GIT_BRANCHES,
  generateGitHash,
  calculateLineDiff,
} from "@/lib/git-manager";
import { useAppearance } from "@/lib/appearance";
import { ACCENTS, AccentId, APPEARANCES, MONACO_PALETTE, Appearance } from "@/types/theme";
import { defineMonacoCustomThemes, getMonacoThemeName } from "@/lib/monaco-theme";
import { AppUpdaterBar } from "@/components/updater/app-updater-bar";
import {
  Bell,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronUp,
  Code2,
  FileCode,
  FilePlus,
  FolderOpen,
  GitBranch,
  Image as ImageIcon,
  Layers,
  LifeBuoy,
  Monitor,
  Moon,
  Palette,
  PanelLeft,
  Radio,
  Search,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
  SplitSquareVertical,
  Sun,
  Swords,
  Terminal as TerminalIcon,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const getMonacoLanguage = (fileName: string): string => {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".html") || lower.endsWith(".htm")) return "html";
  if (lower.endsWith(".css") || lower.endsWith(".scss") || lower.endsWith(".sass") || lower.endsWith(".less")) return "css";
  if (lower.endsWith(".js") || lower.endsWith(".jsx") || lower.endsWith(".mjs") || lower.endsWith(".cjs")) return "javascript";
  if (lower.endsWith(".ts") || lower.endsWith(".tsx")) return "typescript";
  if (lower.endsWith(".json")) return "json";
  if (lower.endsWith(".md") || lower.endsWith(".markdown")) return "markdown";
  if (lower.endsWith(".py")) return "python";
  if (lower.endsWith(".sql")) return "sql";
  if (lower.endsWith(".xml") || lower.endsWith(".svg")) return "xml";
  if (lower.endsWith(".yaml") || lower.endsWith(".yml")) return "yaml";
  return "plaintext";
};

export default function Home() {
  const { appearance, setAppearance, accent, setAccent, resolved } = useAppearance();

  const [activeFile, setActiveFile] = React.useState<SidebarFileId | null>(null);
  const [customFiles, setCustomFiles] = React.useState<Record<string, string>>({});
  const [previewMode, setPreviewMode] = React.useState<"desktop" | "mobile" | "diff">("desktop");
  const [userRole, setUserRole] = React.useState<UserRole>("student");

  // Local folder / workspace state
  const [workspaceTitle, setWorkspaceTitle] = React.useState<string>("Proje Gezgini");
  const [isExternalFolder, setIsExternalFolder] = React.useState<boolean>(false);
  const [externalNodes, setExternalNodes] = React.useState<TreeItemNode[] | null>(null);

  // Challenges State (Supports dynamic creation & switching)
  const [challenges, setChallenges] = React.useState<Challenge[]>(SAMPLE_CHALLENGES);
  const [activeChallengeId, setActiveChallengeId] = React.useState<string>(SAMPLE_CHALLENGES[0].id);
  const currentChallenge = challenges.find((c) => c.id === activeChallengeId) || challenges[0];

  const [htmlCode, setHtmlCode] = React.useState<string>(() => SAMPLE_CHALLENGES[0].starterHtml);
  const [cssCode, setCssCode] = React.useState<string>(() => SAMPLE_CHALLENGES[0].starterCss);
  const [analysis, setAnalysis] = React.useState<CssAnalysisResult>(() =>
    analyzeCssHygiene(htmlCode, cssCode)
  );

  const handleOpenFolder = async () => {
    try {
      const workspace = await openFolderFromPC();
      if (!workspace) return;

      setIsExternalFolder(true);
      setWorkspaceTitle(workspace.name);
      setExternalNodes(workspace.tree as TreeItemNode[]);

      if (workspace.files) {
        setCustomFiles((prev) => ({ ...prev, ...workspace.files }));
      }

      const findFirstFile = (nodes: TreeItemNode[]): string | null => {
        for (const node of nodes) {
          if (node.type === "file") return node.id;
          if (node.children) {
            const found = findFirstFile(node.children);
            if (found) return found;
          }
        }
        return null;
      };

      const firstFile = findFirstFile(workspace.tree as TreeItemNode[]);
      if (firstFile) {
        setActiveFile(firstFile);
        if (!customFiles[firstFile] && !workspace.files?.[firstFile]) {
          const content = await readWorkspaceFile(firstFile);
          if (content !== null) {
            setCustomFiles((prev) => ({ ...prev, [firstFile]: content }));
          }
        }
      }
    } catch (err) {
      console.error("Klasör açma hatası:", err);
    }
  };

  const handleResetWorkspace = () => {
    setIsExternalFolder(false);
    setWorkspaceTitle("Proje Gezgini");
    setExternalNodes(null);
    setActiveFile(null);
    setCustomFiles({});
  };

  const handleSelectFile = async (fileId: string) => {
    if (!fileId) {
      setActiveFile(null);
      return;
    }
    setActiveFile(fileId);
    if (isExternalFolder && !(fileId in customFiles)) {
      const content = await readWorkspaceFile(fileId);
      if (content !== null) {
        setCustomFiles((prev) => ({ ...prev, [fileId]: content }));
      }
    }
  };

  const handleFileCreate = async (
    fileName: string,
    type: "file" | "folder",
    parentId: string,
    fullPath: string
  ) => {
    if (type === "file") {
      const initialContent = fileName.endsWith(".html")
        ? `<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="utf-8">\n  <title>${fileName}</title>\n</head>\n<body>\n  <h1>${fileName}</h1>\n</body>\n</html>\n`
        : fileName.endsWith(".css")
        ? `/* ${fileName} */\n`
        : fileName.endsWith(".json")
        ? `{\n  \n}\n`
        : fileName.endsWith(".md")
        ? `# ${fileName}\n`
        : `// ${fileName}\n`;

      setCustomFiles((prev) => ({
        ...prev,
        [fullPath]: initialContent,
      }));

      if (isExternalFolder) {
        await createWorkspaceFile(fullPath, initialContent);
      }
    } else if (type === "folder") {
      if (isExternalFolder) {
        await createWorkspaceFolder(fullPath);
      }
    }
  };

  const handleFileDelete = async (fileId: string) => {
    setCustomFiles((prev) => {
      const updated = { ...prev };
      delete updated[fileId];
      return updated;
    });
    if (isExternalFolder) {
      await deleteWorkspacePath(fileId);
    }
    if (activeFile === fileId) {
      setActiveFile(null);
    }
  };

  const [students, setStudents] = React.useState<StudentLiveState[]>(INITIAL_STUDENTS);
  const [activeRemoteSession, setActiveRemoteSession] = React.useState<LiveAssistanceSession | null>(null);
  const [myHelpRequested, setMyHelpRequested] = React.useState<boolean>(false);
  const [myHelpTopic, setMyHelpTopic] = React.useState<string>("");
  const [connectedTeacherName, setConnectedTeacherName] = React.useState<string | null>(null);

  const helpRequestsCount = React.useMemo(() => {
    return students.filter((s) => s.status === "needs_help").length;
  }, [students]);

  const handleAskHelp = (topic: string, note?: string) => {
    setMyHelpRequested(true);
    setMyHelpTopic(topic);
    setStudents((prev) =>
      prev.map((s) =>
        s.studentId === "st-1"
          ? {
              ...s,
              status: "needs_help",
              helpTopic: note ? `${topic}: ${note}` : topic,
              helpRequestedAt: Date.now(),
            }
          : s
      )
    );

    // Supabase Realtime üzerinden sınıfa/hocaya canlı yardım sinyali ilet
    classroomRealtime.broadcastAskHelp({
      studentId: String(authState.user?.id || "st-1"),
      studentName: authState.user?.name || onboardingProfile?.fullName || "Ahmet Yılmaz",
      helpTopic: topic,
      note,
      timestamp: Date.now(),
    });
  };

  const handleCancelHelp = () => {
    setMyHelpRequested(false);
    setMyHelpTopic("");
    setStudents((prev) =>
      prev.map((s) =>
        s.studentId === "st-1"
          ? {
              ...s,
              status: "coding",
              helpTopic: undefined,
              helpRequestedAt: undefined,
            }
          : s
      )
    );

    // Supabase Realtime üzerinden yardım çağrısını iptal et
    classroomRealtime.broadcastCancelHelp(String(authState.user?.id || "st-1"));
  };

  const handleStartRemoteSession = (session: LiveAssistanceSession) => {
    setActiveRemoteSession(session);
    setActiveFile("classroom.radar");
    if (session.studentId === "st-1") {
      setConnectedTeacherName("Dr. Öğr. Üyesi (Hoca)");
    }
  };

  const [assistanceFinishedAlert, setAssistanceFinishedAlert] = React.useState<{
    isOpen: boolean;
    studentName: string;
  } | null>(null);

  const handleCloseRemoteSession = () => {
    if (activeRemoteSession?.studentId === "st-1") {
      setConnectedTeacherName(null);
    }
    setActiveRemoteSession(null);
  };

  const handleCompleteAssistance = (studentId: string) => {
    // 1. Clear the student's needs_help state
    setStudents((prev) =>
      prev.map((s) =>
        s.studentId === studentId
          ? {
              ...s,
              status: "coding",
              helpTopic: undefined,
              helpRequestedAt: undefined,
            }
          : s
      )
    );

    // 2. If it's the current user (st-1), reset local help request
    if (studentId === "st-1") {
      setMyHelpRequested(false);
      setMyHelpTopic("");
      setConnectedTeacherName(null);
    }

    // 3. Trigger alert for the student
    const student = students.find((s) => s.studentId === studentId);
    setAssistanceFinishedAlert({
      isOpen: true,
      studentName: student?.studentName || "Öğrenci",
    });

    // Supabase Realtime üzerinden öğrenciye hocanın yardımı bitirdiğini bildir
    classroomRealtime.broadcastCompleteAssistance(studentId);

    handleCloseRemoteSession();
  };

  const handleUpdateRemoteStudentCode = (studentId: string, html: string, css: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.studentId === studentId
          ? { ...s, html, css, linesCount: css.split("\n").filter((l) => l.trim()).length }
          : s
      )
    );
    if (studentId === "st-1") {
      setHtmlCode(html);
      setCssCode(css);
    }

    // Supabase Realtime üzerinden hocanın düzeltmesini anında öğrencinin ekranına gönder
    classroomRealtime.broadcastAssistance({
      studentId,
      html,
      css,
      teacherName: authState.user?.name || "Dr. Öğr. Üyesi (Hoca)",
      timestamp: Date.now(),
    });
  };

  // Öğrencinin yazdığı kodların anlık taslak kaydı ve canlı ders broadcast'i
  const broadcastTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const handleCodeChangeWithBroadcast = (type: "html" | "css", val: string) => {
    const nextHtml = type === "html" ? val : htmlCode;
    const nextCss = type === "css" ? val : cssCode;

    // 1. Öğrencinin kodunu cihazında anında localStorage taslağına kaydet (veri kaybı sıfır)
    saveDraftLocally(activeChallengeId, nextHtml, nextCss);

    // 2. Canlı ders sırasında 600ms debounce ile Supabase Realtime WebSocket'e aktar
    // (Veritabanı diskine SQL yazılmaz, tamamen bellek içi broadcasttir)
    if (broadcastTimeoutRef.current) {
      clearTimeout(broadcastTimeoutRef.current);
    }
    broadcastTimeoutRef.current = setTimeout(() => {
      classroomRealtime.broadcastCode({
        studentId: String(authState.user?.id || "st-1"),
        studentName: authState.user?.name || onboardingProfile?.fullName || "Ahmet Yılmaz",
        studentNo: onboardingProfile?.studentNo || "220101045",
        avatarUrl: authState.user?.avatar_url || onboardingProfile?.avatarUrl || "",
        html: nextHtml,
        css: nextCss,
        visualMatch: 94.2,
        cleanScore: analysis.cleanScore,
        linesCount: nextCss.split("\n").filter((l) => l.trim()).length,
        unusedCssPercent: analysis.unusedPercent,
        timestamp: Date.now(),
      });
    }, 600);
  };

  // Git / GitHub Source Control state
  const [gitBranch, setGitBranch] = React.useState<string>("main");
  const [gitBranches, setGitBranches] = React.useState<string[]>(INITIAL_GIT_BRANCHES);
  const [gitCommits, setGitCommits] = React.useState<GitCommit[]>(INITIAL_GIT_COMMITS);

  // Compute uncommitted changes dynamically by comparing current code against most recent commit snapshot
  const gitChanges: GitFileChange[] = React.useMemo(() => {
    const lastCommit = gitCommits[0];
    const list: GitFileChange[] = [];

    if (lastCommit) {
      if (cssCode !== lastCommit.cssSnapshot) {
        const diff = calculateLineDiff(lastCommit.cssSnapshot, cssCode);
        list.push({
          filename: "styles.css",
          status: "modified",
          additions: diff.additions,
          deletions: diff.deletions,
          previousContent: lastCommit.cssSnapshot,
          currentContent: cssCode,
        });
      }

      if (htmlCode !== lastCommit.htmlSnapshot) {
        const diff = calculateLineDiff(lastCommit.htmlSnapshot, htmlCode);
        list.push({
          filename: "index.html",
          status: "modified",
          additions: diff.additions,
          deletions: diff.deletions,
          previousContent: lastCommit.htmlSnapshot,
          currentContent: htmlCode,
        });
      }
    }
    return list;
  }, [gitCommits, cssCode, htmlCode]);

  const handleGitCommit = (message: string) => {
    const hash = generateGitHash();
    const newCommit: GitCommit = {
      hash,
      shortHash: hash.slice(0, 7),
      message,
      author: authState.user?.name || authState.user?.login || "Ahmet Yılmaz",
      authorEmail: authState.user?.email || "ahmet@csspg.dev",
      timestamp: Date.now(),
      branch: gitBranch,
      filesChanged: gitChanges.map((c) => ({
        filename: c.filename,
        additions: c.additions,
        deletions: c.deletions,
      })),
      htmlSnapshot: htmlCode,
      cssSnapshot: cssCode,
    };

    setGitCommits((prev) => [newCommit, ...prev]);

    confetti({
      particleCount: 35,
      spread: 45,
      origin: { y: 0.8 },
      colors: ["#ffffff", "#a1a1aa", "#52525b"],
    });
  };

  const handleGitCreateBranch = (branchName: string) => {
    if (!gitBranches.includes(branchName)) {
      setGitBranches((prev) => [...prev, branchName]);
    }
    setGitBranch(branchName);
  };

  const handleGitSwitchBranch = (branchName: string) => {
    setGitBranch(branchName);
  };

  // GitHub & Supabase Auth State
  const [authState, setAuthState] = React.useState<AuthState>(() => loadSavedAuthState());
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [gitToast, setGitToast] = React.useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Listen for Supabase OAuth redirect & sync GitHub token/profile
  React.useEffect(() => {
    const cleanup = initSupabaseAuthListener((newState) => {
      setAuthState(newState);
      if (newState.isAuthenticated && newState.user) {
        setGitToast({
          type: "success",
          message: `GitHub ile bağlandı: @${newState.user.login}`,
        });
        setTimeout(() => setGitToast(null), 3500);
      }
    });
    return cleanup;
  }, []);

  const handleGitPush = async () => {
    if (!authState.gitHubToken) {
      setIsAuthModalOpen(true);
      return;
    }

    const parts = authState.targetRepo.split("/");
    const owner = parts[0] || (authState.user?.login ?? "owner");
    const repo = parts[1] || "csspg-lab-04";

    if (authState.gitHubToken.startsWith("demo_")) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#ffffff", "#a1a1aa", "#52525b"],
      });
      setGitToast({
        type: "success",
        message: `origin/${gitBranch} hedefine başarıyla push edildi (Demo Modu).`,
      });
      setTimeout(() => setGitToast(null), 3500);
      return;
    }

    const filesToPush = [
      { path: "styles.css", content: cssCode },
      { path: "index.html", content: htmlCode },
    ];

    setGitToast({
      type: "info",
      message: `GitHub'a pushlanıyor (${owner}/${repo}@${gitBranch})...`,
    });

    const result = await pushFilesToGitHub(
      authState.gitHubToken,
      owner,
      repo,
      gitBranch,
      filesToPush,
      `feat: lab solution commit on branch ${gitBranch}`
    );

    if (!result.success) {
      setGitToast({
        type: "error",
        message: `Push hatası: ${result.error}`,
      });
      setTimeout(() => setGitToast(null), 5000);
    } else {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#ffffff", "#a1a1aa", "#52525b"],
      });
      setGitToast({
        type: "success",
        message: `Başarıyla GitHub'a push edildi! (${owner}/${repo}@${gitBranch})`,
      });
      setTimeout(() => setGitToast(null), 3500);
    }
  };

  const handleGitDiscardChange = (filename: "styles.css" | "index.html") => {
    const lastCommit = gitCommits[0];
    if (!lastCommit) return;
    if (filename === "styles.css") {
      setCssCode(lastCommit.cssSnapshot);
    } else if (filename === "index.html") {
      setHtmlCode(lastCommit.htmlSnapshot);
    }
  };

  const [isGuidelineOpen, setIsGuidelineOpen] = React.useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = React.useState(false);
  const [showCssInspector, setShowCssInspector] = React.useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [sidebarTab, setSidebarTab] = React.useState<"files" | "git">("files");
  const [isTerminalOpen, setIsTerminalOpen] = React.useState(true);
  const [userStatus, setUserStatus] = React.useState<UserStatus>("available");

  // Monaco Editor preferences: Font family & font size (persisted in localStorage)
  const [editorFontFamily, setEditorFontFamily] = React.useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("csspg_editor_font_family") || "Geist Mono";
    }
    return "Geist Mono";
  });

  const [editorFontSize, setEditorFontSize] = React.useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("csspg_editor_font_size");
      if (saved) {
        const n = Number(saved);
        if (!isNaN(n) && n >= 11 && n <= 24) return n;
      }
    }
    return 13;
  });

  const monacoRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => {
        if (monacoRef.current?.editor?.remeasureFonts) {
          monacoRef.current.editor.remeasureFonts();
        }
      });
    }
  }, [editorFontFamily]);

  const handleSaveEditorSettings = ({
    fontFamily,
    fontSize,
  }: {
    fontFamily: string;
    fontSize: number;
  }) => {
    setEditorFontFamily(fontFamily);
    setEditorFontSize(fontSize);
    if (typeof window !== "undefined") {
      localStorage.setItem("csspg_editor_font_family", fontFamily);
      localStorage.setItem("csspg_editor_font_size", String(fontSize));
    }
  };

  // Onboarding Wizard & App Initialization state
  const [isAppInitialized, setIsAppInitialized] = React.useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = React.useState<boolean>(false);
  const [onboardingProfile, setOnboardingProfile] = React.useState<OnboardingData | null>(null);
  const [isSupportModalOpen, setIsSupportModalOpen] = React.useState<boolean>(false);
  const [isDevDeskOpen, setIsDevDeskOpen] = React.useState<boolean>(false);

  React.useEffect(() => {
    let isMounted = true;

    const initializeApp = async () => {
      let savedProfile: OnboardingData | null = null;
      let isCompleted = false;

      if (typeof window !== "undefined") {
        isCompleted = localStorage.getItem("csspg_onboarding_completed_v3") === "true";

        // 1. In Electron, check persistent userData profile file first
        if (window.electronAPI?.getUserProfile) {
          try {
            const electronData = await window.electronAPI.getUserProfile();
            if (electronData) {
              savedProfile = electronData;
              isCompleted = true;
            }
          } catch (e) {}
        }

        // 2. Fallback to localStorage profile
        if (!savedProfile) {
          const localSaved = localStorage.getItem("csspg_user_profile");
          if (localSaved) {
            try {
              savedProfile = JSON.parse(localSaved);
            } catch (e) {}
          }
        }

        if (savedProfile) {
          setOnboardingProfile(savedProfile);
          if (savedProfile.role) setUserRole(savedProfile.role);
        }

        // 3. If first launch, automatically open the onboarding wizard
        if (!isCompleted) {
          setIsOnboardingOpen(true);
          setActiveFile(null);
          setExternalNodes(null);
          setIsExternalFolder(false);
          setCustomFiles({});
        }

        if (isMounted) {
          setIsAppInitialized(true);
        }

        // Load persistent custom challenges created by teacher or Supabase cloud
        let allChallenges = SAMPLE_CHALLENGES;
        try {
          const remoteChallenges = await fetchChallengesFromSupabase();
          if (remoteChallenges && remoteChallenges.length > 0) {
            allChallenges = [
              ...remoteChallenges,
              ...SAMPLE_CHALLENGES.filter((sc) => !remoteChallenges.some((rc) => rc.id === sc.id)),
            ];
          }
        } catch (e) {}

        const savedChallenges = localStorage.getItem("csspg_custom_challenges");
        if (savedChallenges) {
          try {
            const parsed = JSON.parse(savedChallenges);
            if (Array.isArray(parsed) && parsed.length > 0) {
              allChallenges = [
                ...parsed,
                ...allChallenges.filter((ac) => !parsed.some((p: any) => p.id === ac.id)),
              ];
            }
          } catch (e) {}
        }
        setChallenges(allChallenges);

        // Check teacher's currently active lab challenge (or default to first)
        const classActiveId = localStorage.getItem("csspg_class_active_challenge_id");
        const activeObj = allChallenges.find((c) => c.id === classActiveId) || allChallenges[0];
        if (activeObj) {
          setActiveChallengeId(activeObj.id);
          const savedDraft = loadDraftLocally(activeObj.id);
          if (savedDraft) {
            setHtmlCode(savedDraft.html);
            setCssCode(savedDraft.css);
          } else {
            setHtmlCode(activeObj.starterHtml);
            setCssCode(activeObj.starterCss);
          }
        }
      }
    };

    initializeApp();

    // Supabase Realtime WebSocket Başlatma (Hoca Radarı & Canlı Müdahale)
    classroomRealtime.init({
      onStudentCodeStream: (payload) => {
        setStudents((prev) =>
          prev.map((s) =>
            s.studentId === payload.studentId
              ? {
                  ...s,
                  studentName: payload.studentName || s.studentName,
                  studentNo: payload.studentNo || s.studentNo,
                  html: payload.html,
                  css: payload.css,
                  visualMatch: payload.visualMatch,
                  cleanScore: payload.cleanScore,
                  linesCount: payload.linesCount,
                  unusedCssPercent: payload.unusedCssPercent,
                  lastActive: payload.timestamp || Date.now(),
                }
              : s
          )
        );
      },
      onStudentAskHelp: (payload) => {
        setStudents((prev) =>
          prev.map((s) =>
            s.studentId === payload.studentId
              ? {
                  ...s,
                  status: "needs_help",
                  helpTopic: payload.note ? `${payload.helpTopic}: ${payload.note}` : payload.helpTopic,
                  helpRequestedAt: payload.timestamp || Date.now(),
                }
              : s
          )
        );
        setGitToast({
          type: "info",
          message: `🚨 ${payload.studentName} hocadan yardım istedi: ${payload.helpTopic}`,
        });
        setTimeout(() => setGitToast(null), 4000);
      },
      onStudentCancelHelp: (studentId) => {
        setStudents((prev) =>
          prev.map((s) =>
            s.studentId === studentId
              ? { ...s, status: "coding", helpTopic: undefined, helpRequestedAt: undefined }
              : s
          )
        );
      },
      onTeacherAssistance: (payload) => {
        const myStudentId = authState.user?.id || "st-1";
        if (payload.studentId === myStudentId) {
          setHtmlCode(payload.html);
          setCssCode(payload.css);
          setConnectedTeacherName(payload.teacherName || "Hoca");
          setGitToast({
            type: "info",
            message: `👨‍🏫 ${payload.teacherName || "Hocanız"} kodunuza canlı müdahale etti!`,
          });
          setTimeout(() => setGitToast(null), 4000);
        }
      },
      onTeacherCompleteAssistance: (studentId) => {
        const myStudentId = authState.user?.id || "st-1";
        if (studentId === myStudentId) {
          setMyHelpRequested(false);
          setMyHelpTopic("");
          setConnectedTeacherName(null);
          setAssistanceFinishedAlert({
            isOpen: true,
            studentName: onboardingProfile?.fullName || "Öğrenci",
          });
        }
      },
    });

    // Realtime listener for active challenge change broadcast
    const handleCustomSync = (e: any) => {
      if (e.detail) {
        const newId = e.detail;
        setActiveChallengeId(newId);
        setChallenges((prev) => {
          const found = prev.find((c) => c.id === newId);
          if (found) {
            const savedDraft = loadDraftLocally(found.id);
            if (savedDraft) {
              setHtmlCode(savedDraft.html);
              setCssCode(savedDraft.css);
            } else {
              setHtmlCode(found.starterHtml);
              setCssCode(found.starterCss);
            }
            setGitToast({
              type: "info",
              message: `📢 Hoca sınıfın aktif görevini güncelledi: ${found.title}`,
            });
            setTimeout(() => setGitToast(null), 4000);
          }
          return prev;
        });
      }
    };

    const handleStorageSync = (e: StorageEvent) => {
      if (e.key === "csspg_class_active_challenge_id" && e.newValue) {
        handleCustomSync({ detail: e.newValue });
      }
    };

    window.addEventListener("csspg_class_active_challenge_sync", handleCustomSync);
    window.addEventListener("storage", handleStorageSync);

    return () => {
      isMounted = false;
      classroomRealtime.disconnect();
      window.removeEventListener("csspg_class_active_challenge_sync", handleCustomSync);
      window.removeEventListener("storage", handleStorageSync);
    };
  }, []);

  const handleCompleteOnboarding = (data: OnboardingData) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("csspg_onboarding_completed_v3", "true");
      localStorage.setItem("csspg_user_profile", JSON.stringify(data));
      if (window.electronAPI?.setUserProfile) {
        window.electronAPI.setUserProfile(data).catch(() => {});
      }
    }
    setOnboardingProfile(data);
    setUserRole(data.role);
    setIsOnboardingOpen(false);

    // Clear any workspace data to ensure pristine empty state for new user
    setIsExternalFolder(false);
    setWorkspaceTitle("Proje Gezgini");
    setExternalNodes(null);
    setActiveFile(null);
    setCustomFiles({});

    // Sync student radar st-1 avatar & name
    setStudents((prev) =>
      prev.map((s) =>
        s.studentId === "st-1"
          ? {
              ...s,
              name: data.fullName,
              avatar: data.avatarUrl,
            }
          : s
      )
    );

    if (data.githubConnected) {
      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: true,
        user: {
          id: 1,
          login: "acaro",
          name: data.fullName,
          avatar_url: data.avatarUrl,
          email: "acaro@github.com",
        },
        targetRepo: "acaro/pixelcut-lab",
      }));
    }

    setGitToast({
      type: "success",
      message: `PixelCut stüdyosuna hoş geldiniz, ${data.fullName}!`,
    });
    setTimeout(() => setGitToast(null), 3500);
  };

  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("csspg_user_profile");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          parsed.role = newRole;
          localStorage.setItem("csspg_user_profile", JSON.stringify(parsed));
        } catch (e) {}
      }
    }

    if (newRole === "teacher") {
      setActiveFile("classroom.radar");
      setGitToast({
        type: "info",
        message: "👨‍🏫 Öğretmen Modu: Kullanıcılar ve Görev Yönetimi Aktif",
      });
    } else if (newRole === "student") {
      setActiveFile("styles.css");
      setGitToast({
        type: "info",
        message: "🎓 Öğrenci Modu: Kodlama Çalışma Alanına Dönüldü",
      });
    } else {
      setGitToast({
        type: "info",
        message: "🛠️ Geliştirici Modu: Tüm Sistem ve Görünüm Yetkileri Açık",
      });
    }
    setTimeout(() => setGitToast(null), 3500);
  };

  const handlePublishChallenge = (newChallenge: Challenge) => {
    setChallenges((prev) => [newChallenge, ...prev.filter((c) => c.id !== newChallenge.id)]);
    setActiveChallengeId(newChallenge.id);
    setHtmlCode(newChallenge.starterHtml);
    setCssCode(newChallenge.starterCss);

    if (typeof window !== "undefined") {
      try {
        const existing = localStorage.getItem("csspg_custom_challenges");
        const list = existing ? JSON.parse(existing) : [];
        const filtered = list.filter((c: Challenge) => c.id !== newChallenge.id);
        localStorage.setItem("csspg_custom_challenges", JSON.stringify([newChallenge, ...filtered]));
        localStorage.setItem("csspg_class_active_challenge_id", newChallenge.id);
        window.dispatchEvent(
          new CustomEvent("csspg_class_active_challenge_sync", { detail: newChallenge.id })
        );
      } catch (e) {}
    }

    // Supabase bulut veritabanına yeni görevi kaydet
    if (isSupabaseConfigured) {
      supabase
        .from("challenges")
        .upsert({
          id: newChallenge.id,
          title: newChallenge.title,
          description: newChallenge.description,
          category: newChallenge.category,
          difficulty: newChallenge.difficulty,
          room_type: newChallenge.roomType || "practice",
          target_image_url: newChallenge.targetImageUrl,
          target_width: newChallenge.targetWidth,
          target_height: newChallenge.targetHeight,
          starter_html: newChallenge.starterHtml,
          starter_css: newChallenge.starterCss,
          hints: newChallenge.hints,
          max_lines_goal: newChallenge.maxLinesGoal,
          xp_reward: newChallenge.xpReward || 100,
          deadline: newChallenge.deadline,
        })
        .then(({ error }) => {
          if (error) console.error("[Supabase] Challenge publish error", error);
        });
    }

    setGitToast({
      type: "success",
      message: `Yeni Görev Sınıfa Canlı Yayınlandı: ${newChallenge.title}`,
    });
    setTimeout(() => setGitToast(null), 4000);
  };

  const handleSelectChallenge = (challengeId: string) => {
    // 1. Önceki görevin taslağını kaydet
    saveDraftLocally(activeChallengeId, htmlCode, cssCode);

    setActiveChallengeId(challengeId);
    const target = challenges.find((c) => c.id === challengeId);
    if (target) {
      // 2. Seçilen görevin kayıtlı taslağı varsa getir, yoksa başlangıç kodunu yükle
      const savedDraft = loadDraftLocally(challengeId);
      if (savedDraft) {
        setHtmlCode(savedDraft.html);
        setCssCode(savedDraft.css);
      } else {
        setHtmlCode(target.starterHtml);
        setCssCode(target.starterCss);
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("csspg_class_active_challenge_id", challengeId);
        window.dispatchEvent(
          new CustomEvent("csspg_class_active_challenge_sync", { detail: challengeId })
        );
      }
      setGitToast({
        type: "info",
        message: `Sınıf Aktif Görevi Belirlendi: ${target.title}`,
      });
      setTimeout(() => setGitToast(null), 3000);
    }
  };

  const currentUser = {
    name:
      authState.user?.name ||
      authState.user?.login ||
      onboardingProfile?.fullName ||
      (userRole === "teacher" ? "Dr. Öğr. Üyesi" : "Ahmet Yılmaz"),
    email: authState.user?.email || "ahmet@csspg.dev",
    studentNo: onboardingProfile?.studentNo || "220101045",
    plan: authState.isAuthenticated
      ? `@${authState.user?.login || "github"}`
      : userRole === "teacher"
      ? "Eğitmen / Hoca"
      : onboardingProfile?.studentNo
      ? `No: ${onboardingProfile.studentNo}`
      : "Öğrenci",
    avatarSrc:
      authState.user?.avatar_url ||
      onboardingProfile?.avatarUrl ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  };

  const userMenuItems = [
    {
      label: "Ders İçi",
      icon: <BookOpen className="size-4" />,
      onSelect: () => setActiveFile("challenges.inclass"),
    },
    {
      label: "Ders Dışı",
      icon: <Swords className="size-4" />,
      onSelect: () => setActiveFile("challenges.practice"),
    },
    {
      label: "Sistem Ayarları",
      icon: <Settings className="size-4" />,
      onSelect: () => setActiveFile("settings.config"),
    },
    {
      label: "GitHub Kaynak Denetimi",
      icon: <GitBranch className="size-4" />,
      onSelect: () => {
        setIsSidebarOpen(true);
        setSidebarTab("git");
      },
    },
    {
      label: "Destek & Hata Bildirimi",
      icon: <LifeBuoy className="size-4 text-tint" />,
      onSelect: () => setIsSupportModalOpen(true),
    },
    {
      label: "Geliştirici Masası (Onur Acar)",
      icon: <ShieldCheck className="size-4 text-blue-400" />,
      onSelect: () => setIsDevDeskOpen(true),
    },
  ];

  // Keyboard shortcuts: ⌘B (sidebar), ⌘` (terminal), ⌘⇧G (git)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === "`" || e.key === "ё")) {
        e.preventDefault();
        setIsTerminalOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "g") {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev || sidebarTab !== "git");
        setSidebarTab("git");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarTab]);

  // Update hygiene analysis whenever code changes
  React.useEffect(() => {
    const res = analyzeCssHygiene(htmlCode, cssCode);
    setAnalysis(res);

    // Update current student (st-1) live broadcast
    setStudents((prev) =>
      prev.map((s) =>
        s.studentId === "st-1"
          ? {
              ...s,
              html: htmlCode,
              css: cssCode,
              linesCount: res.totalLines,
              unusedCssPercent: res.unusedPercent,
              cleanScore: res.cleanScore,
              lastActive: Date.now(),
              status: "coding",
            }
          : s
      )
    );
  }, [htmlCode, cssCode]);

  // Sandboxed HTML document source for desktop and mobile preview
  const liveSrcDoc = React.useMemo(() => {
    let effectiveHtml = htmlCode;
    let effectiveCss = cssCode;

    if (isExternalFolder) {
      effectiveHtml =
        customFiles["index.html"] ||
        customFiles["src/index.html"] ||
        htmlCode;

      if (activeFile && activeFile.endsWith(".css") && customFiles[activeFile] !== undefined) {
        effectiveCss = customFiles[activeFile];
      } else {
        effectiveCss =
          customFiles["styles.css"] ||
          customFiles["src/styles.css"] ||
          customFiles["index.css"] ||
          customFiles["src/index.css"] ||
          customFiles["style.css"] ||
          cssCode;
      }
    }

    const defaultBg = resolved === "dark" ? "#18181b" : "#ffffff";
    const defaultColor = resolved === "dark" ? "#f5f5f7" : "#1d1d1f";

    return `
      <!DOCTYPE html>
      <html data-theme="${resolved}" style="color-scheme: ${resolved};">
        <head>
          <meta charset="utf-8">
          ${(currentChallenge?.externalLibraries || [])
            .map((url) =>
              url.endsWith(".js")
                ? `<script src="${url}"></script>`
                : `<link rel="stylesheet" href="${url}">`
            )
            .join("\n")}
          <style>
            @font-face {
              font-family: 'Geist';
              src: url('/fonts/geist/Geist-Variable.woff2') format('woff2');
              font-weight: 100 900;
              font-style: normal;
            }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            html, body, *, *::before, *::after { cursor: none !important; }
            html {
              height: 100%;
              width: 100%;
              background-color: transparent;
            }
            body { 
              font-family: 'Geist', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100%;
              width: 100%;
              background-color: ${defaultBg};
              color: ${defaultColor};
              padding: 24px;
            }
            ${effectiveCss}
          </style>
          <script>
            (function() {
              window.addEventListener('mousemove', function(e) {
                try {
                  window.parent.postMessage({
                    type: '__CUSTOM_POINTER_MOVE__',
                    clientX: e.clientX,
                    clientY: e.clientY
                  }, '*');
                } catch(err) {}
              });
              window.addEventListener('mousedown', function() {
                try { window.parent.postMessage({ type: '__CUSTOM_POINTER_DOWN__' }, '*'); } catch(err) {}
              });
              window.addEventListener('mouseup', function() {
                try { window.parent.postMessage({ type: '__CUSTOM_POINTER_UP__' }, '*'); } catch(err) {}
              });

              if (${showCssInspector}) {
                var prevEl = null;
                document.addEventListener('mouseover', function(e) {
                  if (!e.target || e.target === document.body || e.target === document.documentElement) return;
                  if (prevEl) prevEl.style.outline = '';
                  prevEl = e.target;
                  prevEl.style.outline = '2px solid #007aff';
                  prevEl.style.outlineOffset = '1px';

                  var cs = window.getComputedStyle(e.target);
                  var rect = e.target.getBoundingClientRect();
                  window.parent.postMessage({
                    type: '__CSS_INSPECT_NODE__',
                    node: {
                      tagName: e.target.tagName.toLowerCase(),
                      className: typeof e.target.className === 'string' ? e.target.className : '',
                      width: Math.round(rect.width),
                      height: Math.round(rect.height),
                      display: cs.display,
                      color: cs.color,
                      backgroundColor: cs.backgroundColor,
                      fontSize: cs.fontSize,
                      fontWeight: cs.fontWeight,
                      padding: cs.padding,
                      margin: cs.margin,
                      borderRadius: cs.borderRadius,
                      boxShadow: cs.boxShadow !== 'none' ? 'Aktif' : 'Yok'
                    }
                  }, '*');
                });

                document.addEventListener('mouseout', function(e) {
                  if (prevEl) {
                    prevEl.style.outline = '';
                    prevEl = null;
                  }
                });
              }
            })();
          </script>
        </head>
        <body>
          ${effectiveHtml}
        </body>
      </html>
    `;
  }, [htmlCode, cssCode, showCssInspector, isExternalFolder, customFiles, resolved, activeFile, currentChallenge]);

  const handleSubmitSuccess = async () => {
    if (analysis.cleanScore >= 75) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: [ACCENTS[accent].light, "#30d158", "#ff9f0a", "#bf5af2"],
      });
    }
    setStudents((prev) =>
      prev.map((s) =>
        s.studentId === "st-1"
          ? { ...s, status: "submitted", lastActive: Date.now() }
          : s
      )
    );

    // Nihai çözümü Supabase bulut veritabanına teslim et
    const subResult = await submitToSupabase({
      challengeId: activeChallengeId,
      studentId: String(authState.user?.id || "st-1"),
      studentName: currentUser.name,
      studentNo: currentUser.studentNo,
      html: htmlCode,
      css: cssCode,
      visualMatch: 94.2,
      cleanScore: analysis.cleanScore,
      linesCount: analysis.totalLines,
      unusedCssPercent: analysis.unusedPercent,
    });

    if (subResult.success) {
      setGitToast({
        type: "success",
        message: "✅ Çözümünüz başarıyla Supabase bulutuna teslim edildi!",
      });
    } else {
      setGitToast({
        type: "info",
        message: `Çözüm teslim alındı (${subResult.error || "Yerel kayıt"})`,
      });
    }
    setTimeout(() => setGitToast(null), 4000);
  };

  const handleGradeStudent = async (studentId: string, grade: number, feedback: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.studentId === studentId
          ? { ...s, grade, teacherFeedback: feedback, status: "approved" }
          : s
      )
    );

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from("submissions")
          .update({
            grade,
            teacher_feedback: feedback,
            status: "approved",
            updated_at: new Date().toISOString(),
          })
          .eq("challenge_id", activeChallengeId)
          .eq("student_id", studentId);
      } catch (e) {
        console.warn("[Supabase] Grade sync error", e);
      }
    }
  };

  // Spotlight search palette items
  const spotlightItems: SpotlightItem[] = [
    {
      id: "action-open-folder",
      label: "Bilgisayardan Klasör Aç (Open Folder)",
      group: "Dosyalar",
      icon: <FolderOpen className="size-3.5 text-tint" />,
      hint: "VS Code Gibi",
      keywords: "open folder klasor ac pc proje bilgisayar yerel disk",
      onSelect: () => handleOpenFolder(),
    },
    {
      id: "file-styles",
      label: "styles.css Dosyası",
      group: "Dosyalar",
      icon: <FileCode className="size-3.5" />,
      hint: "CSS Düzenleyici",
      keywords: "css styles style kod",
      onSelect: () => setActiveFile("styles.css"),
    },
    {
      id: "file-html",
      label: "index.html Dosyası",
      group: "Dosyalar",
      icon: <Code2 className="size-3.5" />,
      hint: "HTML Yapısı",
      keywords: "html index markup",
      onSelect: () => setActiveFile("index.html"),
    },
    {
      id: "file-target",
      label: "Hedef Tasarım Şablonu",
      group: "Dosyalar",
      icon: <ImageIcon className="size-3.5" />,
      hint: "Referans Görsel",
      keywords: "target image sablon resim",
      onSelect: () => setActiveFile("target.png"),
    },
    {
      id: "view-inclass-rooms",
      label: "Ders İçi",
      group: "Görünümler",
      icon: <BookOpen className="size-3.5 text-tint" />,
      hint: "Laboratuvar Odaları",
      keywords: "ders ici lab canli sinif odev oturum",
      onSelect: () => setActiveFile("challenges.inclass"),
    },
    {
      id: "view-practice-arena",
      label: "Ders Dışı",
      group: "Görünümler",
      icon: <Swords className="size-3.5 text-tint" />,
      hint: "CSSBattle & Pratik",
      keywords: "ders disi pratik cssbattle arena odev challenge",
      onSelect: () => setActiveFile("challenges.practice"),
    },
    {
      id: "view-radar",
      label: "Kullanıcılar",
      group: "Görünümler",
      icon: <Radio className="size-3.5 text-sys-green" />,
      hint: "Canlı Kullanıcılar",
      keywords: "kullanicilar sinif radar ogrenci canli mission control",
      onSelect: () => setActiveFile("classroom.radar"),
    },
    {
      id: "view-leaderboard",
      label: "Liderlik Tablosu",
      group: "Görünümler",
      icon: <Trophy className="size-3.5 text-sys-yellow" />,
      hint: "Liderlik Sıralaması",
      keywords: "rank liderlik puan skor siralama",
      onSelect: () => setActiveFile("leaderboard.rank"),
    },
    {
      id: "view-git",
      label: "GitHub Kaynak Denetimi (Source Control)",
      group: "Görünümler",
      icon: <GitBranch className="size-3.5 text-label-2" />,
      hint: `${gitChanges.length} Değişiklik`,
      keywords: "git github commit branch dal push pull kaynak denetimi versiyon",
      onSelect: () => setActiveFile("git.sourcecontrol"),
    },
    {
      id: "view-settings",
      label: "Sistem ve Editör Ayarları",
      group: "Sistem",
      icon: <Settings className="size-3.5" />,
      hint: "Ayarlar",
      keywords: "ayarlar config preference font role",
      onSelect: () => setActiveFile("settings.config"),
    },
    {
      id: "action-guideline",
      label: "Görev Yönergesi ve İpuçları",
      group: "Eylemler",
      icon: <BookOpen className="size-3.5 text-tint" />,
      hint: "Yönergeyi Aç",
      keywords: "yönerge talimat ipucu hedef puan",
      onSelect: () => setIsGuidelineOpen(true),
    },
    {
      id: "preview-canvas",
      label: "Tuval (Canvas) Önizleme",
      group: "Önizleme",
      icon: <Monitor className="size-3.5" />,
      keywords: "canvas desktop masaüstü onizleme",
      onSelect: () => {
        setActiveFile("styles.css");
        setPreviewMode("desktop");
      },
    },
    {
      id: "preview-mobile",
      label: "Mobil iPhone Önizleme",
      group: "Önizleme",
      icon: <Smartphone className="size-3.5" />,
      keywords: "mobile iphone telefon onizleme",
      onSelect: () => {
        setActiveFile("styles.css");
        setPreviewMode("mobile");
      },
    },
    {
      id: "preview-diff",
      label: "Canlı Perde Diff Karşılaştırma",
      group: "Önizleme",
      icon: <SplitSquareVertical className="size-3.5" />,
      keywords: "diff perde karsilastir split piksel",
      onSelect: () => {
        setActiveFile("styles.css");
        setPreviewMode("diff");
      },
    },
    {
      id: "action-sidebar",
      label: "Dosya Menüsünü Aç / Kapat",
      group: "Eylemler",
      icon: <PanelLeft className="size-3.5 text-tint" />,
      keywords: "menu sidebar dosya agaci panel drawer ac kapat",
      onSelect: () => setIsSidebarOpen((prev) => !prev),
    },
    {
      id: "action-terminal",
      label: "Entegre Terminali Aç / Kapat",
      group: "Eylemler",
      icon: <TerminalIcon className="size-3.5 text-tint" />,
      keywords: "terminal konsol bash shell prompt komut ac kapat",
      onSelect: () => setIsTerminalOpen((prev) => !prev),
    },
    {
      id: "action-test-update",
      label: "Güncelleme Bildirimini Test Et (Arc Bar Simülasyonu)",
      group: "Eylemler",
      icon: <Bell className="size-3.5 text-tint" />,
      keywords: "guncelleme update bildirim bar arc announcement test indir",
      onSelect: () => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("csspg:simulate-update", { detail: { version: "0.2.0" } })
          );
        }
      },
    },
    {
      id: "action-support",
      label: "Destek & Hata Bildirimi (Teknik Destek)",
      group: "Eylemler",
      icon: <LifeBuoy className="size-3.5 text-tint" />,
      keywords: "destek support hata bug sorun yardim iletisim diagnostic rapor ss screenshot",
      onSelect: () => setIsSupportModalOpen(true),
    },
    {
      id: "action-devdesk",
      label: "Geliştirici Masası (Developer Desk - Onur Acar)",
      group: "Eylemler",
      icon: <ShieldCheck className="size-3.5 text-blue-400" />,
      keywords: "developer admin dev desk onur destek triage gelen kutusu bilet biletler ticket",
      onSelect: () => setIsDevDeskOpen(true),
    },
    {
      id: "theme-light",
      label: "Cupertino Light Teması (Açık)",
      group: "Görünüm & Tema",
      icon: <Sun className="size-3.5 text-sys-orange" />,
      keywords: "light beyaz acik tema cupertino apple",
      onSelect: () => setAppearance("light"),
    },
    {
      id: "theme-dark",
      label: "Space Gray Teması (Koyu)",
      group: "Görünüm & Tema",
      icon: <Moon className="size-3.5 text-sys-indigo" />,
      keywords: "dark koyu siyah tema space gray macos",
      onSelect: () => setAppearance("dark"),
    },
    {
      id: "theme-oled",
      label: "Midnight OLED Teması (Saf Derin Siyah)",
      group: "Görünüm & Tema",
      icon: <Sparkles className="size-3.5 text-label" />,
      keywords: "oled midnight siyah derin true black pil",
      onSelect: () => setAppearance("oled"),
    },
    {
      id: "theme-cream",
      label: "Warm Studio Teması (Krem Kağıt)",
      group: "Görünüm & Tema",
      icon: <Palette className="size-3.5 text-sys-orange" />,
      keywords: "krem fildisi sepia paper kagit goz yormayan studio",
      onSelect: () => setAppearance("cream"),
    },
    {
      id: "theme-nordic",
      label: "Arctic Slate Teması (Kutup Laciverti / Linear)",
      group: "Görünüm & Tema",
      icon: <Zap className="size-3.5 text-sys-teal" />,
      keywords: "nordic kutup lacivert mavi linear raycast",
      onSelect: () => setAppearance("nordic"),
    },
  ];

  return (
    <MacWindow
      topBanner={<AppUpdaterBar currentVersion="0.1.0" githubRepo="onuracar-dev/PixelCut" />}
      toolbarLeft={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={cn(
              "group grid size-7 place-items-center rounded-[8px] border transition-all duration-200 active:scale-95 shadow-mac-xs",
              isSidebarOpen
                ? "bg-fill border-hairline-strong text-label"
                : "bg-surface/80 border-hairline text-label-2 hover:bg-fill hover:text-label"
            )}
            title={isSidebarOpen ? "Menüyü Kapat" : "Menüyü Aç"}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="transition-transform duration-200"
            >
              <rect
                x="2"
                y="2"
                width="12"
                height="12"
                rx="2.5"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <path
                d="M6 2.5V13.5"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <rect
                x="2.5"
                y="2.5"
                width="3"
                height="11"
                rx="1.5"
                fill="currentColor"
                className={cn(
                  "transition-opacity duration-200",
                  isSidebarOpen ? "opacity-40" : "opacity-0 group-hover:opacity-20"
                )}
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!isSidebarOpen) {
                setIsSidebarOpen(true);
                setSidebarTab("git");
              } else if (sidebarTab === "git") {
                setIsSidebarOpen(false);
              } else {
                setSidebarTab("git");
              }
            }}
            className={cn(
              "mac-btn mac-btn-secondary h-7 px-2 text-[11px] font-mono gap-1.5 transition-all cursor-pointer",
              sidebarTab === "git" && isSidebarOpen && "border-hairline-strong bg-well text-label font-semibold"
            )}
            title="GitHub Kaynak Denetimi Paneli (Sidebar)"
          >
            <GitBranch className="size-3 text-label-2" />
            <span>{gitBranch}</span>
            {gitChanges.length > 0 && (
              <span className="size-1.5 rounded-full bg-tint animate-pulse" />
            )}
          </button>
        </div>
      }
      title={
        !activeFile
          ? "PixelCut"
          : activeFile === "classroom.radar"
          ? "Kullanıcılar"
          : activeFile === "challenges.inclass" || activeFile === "challenges.rooms"
          ? "Ders İçi"
          : activeFile === "challenges.practice"
          ? "Ders Dışı"
          : activeFile === "leaderboard.rank"
          ? "Liderlik Tablosu"
          : activeFile === "git.sourcecontrol"
          ? "GitHub Kaynak Denetimi"
          : activeFile === "settings.config"
          ? "Sistem Ayarları"
          : activeFile
      }
      toolbarCenter={
        <AppDock
          position="header"
          activeFile={activeFile}
          onSelectFile={handleSelectFile}
          isTerminalOpen={isTerminalOpen}
          onToggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
          isGuidelineOpen={isGuidelineOpen}
          onToggleGuideline={() => setIsGuidelineOpen(!isGuidelineOpen)}
          previewMode={previewMode}
          onSetPreviewMode={setPreviewMode}
          liveStudentsCount={students.length}
          helpRequestsCount={helpRequestsCount}
          gitChangesCount={gitChanges.length}
          currentBranch={gitBranch}
        />
      }
      toolbarRight={
        <div className="flex items-center gap-2">
          {/* Static Teacher Role Badge for teacher mode only */}
          {userRole === "teacher" && (
            <div className="mac-btn h-[28px] px-2.5 text-[11px] font-semibold gap-1.5 bg-tint/12 border-tint/30 text-tint shadow-mac-xs select-none">
              <span className="size-1.5 rounded-full bg-tint animate-pulse" />
              <span>👨‍🏫 Hoca Modu</span>
            </div>
          )}

          {/* Developer Desk Shortcut */}
          <button
            type="button"
            onClick={() => setIsDevDeskOpen(true)}
            className="mac-btn mac-btn-secondary h-[28px] px-2.5 text-[11px] gap-1.5 text-blue-400 hover:text-blue-300 border-blue-500/25 bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
            title="Geliştirici Masası (Onur Acar)"
          >
            <ShieldCheck className="size-3.5" />
            <span className="font-semibold hidden sm:inline">Dev Desk</span>
          </button>

          {/* Search Trigger */}
          <button
            type="button"
            onClick={() => setIsSpotlightOpen(true)}
            className="mac-btn mac-btn-secondary h-[28px] px-2.5 text-[12px] gap-2"
            title="Ara (Ctrl+K)"
          >
            <Search className="size-3.5 text-label-2" />
            <span className="text-label-2">Ara...</span>
          </button>
        </div>
      }
    >
      {/* Collapsible Animated Push/Pull In-Flow Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isSidebarOpen ? 275 : 0,
          opacity: isSidebarOpen ? 1 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 360,
          damping: 32,
          mass: 0.8,
        }}
        className="relative z-20 flex shrink-0 flex-col overflow-hidden border-r border-hairline bg-surface/95 backdrop-blur-2xl"
      >
        <div className="flex h-full w-[275px] flex-col">
          {/* Sidebar Top Segmented Tab Switcher (Files vs Source Control) */}
          <div className="px-2.5 pt-2 pb-1.5 border-b border-hairline shrink-0">
            <SegmentedControl
              options={[
                { value: "files", label: "📁 Dosyalar" },
                {
                  value: "git",
                  label:
                    gitChanges.length > 0
                      ? `🌿 Git (${gitChanges.length})`
                      : "🌿 Git",
                },
              ]}
              value={sidebarTab}
              onChange={(val) => setSidebarTab(val as "files" | "git")}
              size="sm"
              block
              className="w-full text-[11px]"
            />
          </div>

          {/* Sidebar Body */}
          <div className="flex-1 overflow-y-auto pt-1 pb-3">
            {sidebarTab === "files" ? (
              <FileTreeSidebar
                activeFile={activeFile}
                onSelectFile={handleSelectFile}
                externalNodes={externalNodes}
                workspaceTitle={workspaceTitle}
                isExternalFolder={isExternalFolder}
                onOpenFolder={handleOpenFolder}
                onResetWorkspace={handleResetWorkspace}
                onClose={() => setIsSidebarOpen(false)}
                onFileCreate={handleFileCreate}
                onFileDelete={handleFileDelete}
                unusedCssPercent={analysis.unusedPercent}
                cleanScore={analysis.cleanScore}
                linesCount={analysis.totalLines}
                maxLinesGoal={currentChallenge.maxLinesGoal}
                liveStudents={students.length}
                challengeTitle={currentChallenge.title}
              />
            ) : (
              <GitSidebarPanel
                currentBranch={gitBranch}
                branches={gitBranches}
                commits={gitCommits}
                changes={gitChanges}
                authState={authState}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
                onCommit={handleGitCommit}
                onPush={handleGitPush}
                onDiscardChange={handleGitDiscardChange}
                onSelectFile={(filename) => {
                  setActiveFile(filename as SidebarFileId);
                }}
                onOpenFullScreen={() => {
                  setActiveFile("git.sourcecontrol");
                }}
              />
            )}
          </div>

          {/* Sidebar Footer: Morphing User Menu (Single card that expands upward) */}
          <div className="relative border-t border-hairline p-2 shrink-0 bg-surface/70 backdrop-blur-md">
            <MorphingUserMenu
              user={currentUser}
              status={userStatus}
              onStatusChange={setUserStatus}
              theme={appearance as any}
              onThemeChange={(th) => setAppearance(th as any)}
              items={userMenuItems}
              onSignOut={async () => {
                await new Promise((res) => setTimeout(res, 800));
              }}
            />
          </div>
        </div>
      </motion.aside>

      {/* Floating Bottom-Left Trigger when Sidebar is collapsed */}
      <AnimatePresence>
        {!isSidebarOpen && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.85, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.85, x: -10 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            onClick={() => setIsSidebarOpen(true)}
            className="fixed bottom-3.5 left-3.5 z-30 flex items-center gap-2 rounded-full border border-hairline bg-surface/90 p-1.5 pr-3 backdrop-blur-xl shadow-mac-md hover:bg-fill-2 transition-all cursor-pointer group"
            title="Kullanıcı Menüsünü & Paneli Aç"
          >
            <div className="relative size-7 shrink-0">
              <img
                src={currentUser.avatarSrc}
                alt={currentUser.name}
                className="size-full rounded-full object-cover border border-hairline"
              />
              <span className="absolute -bottom-0.5 -right-0.5 grid place-items-center rounded-full bg-surface p-0.5">
                <span
                  className={cn(
                    "size-2 rounded-full",
                    userStatus === "available" && "bg-sys-green",
                    userStatus === "busy" && "bg-sys-red",
                    userStatus === "away" && "bg-sys-yellow"
                  )}
                />
              </span>
            </div>
            <span className="text-[12px] font-medium text-label group-hover:text-tint transition-colors">
              {currentUser.name}
            </span>
            <ChevronUp className="size-3.5 text-label-3 rotate-90" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main Coding Workspace, Loading Splash, or Empty State Welcome View */}
      {!isAppInitialized ? (
        <div className="dot-canvas relative flex flex-1 flex-col items-center justify-center p-8 select-none">
          <div className="flex flex-col items-center gap-3 animate-in fade-in duration-300">
            <div className="grid size-16 place-items-center rounded-[22px] bg-surface/90 border border-hairline shadow-mac-lg">
              <Code2 className="size-8 text-label animate-pulse" />
            </div>
            <span className="text-[13px] font-medium text-label-2 font-mono">
              PixelCut Studio yükleniyor...
            </span>
          </div>
        </div>
      ) : !activeFile ? (
        <div className="dot-canvas relative flex flex-1 flex-col items-center justify-center p-8 select-none overflow-auto">
          <div className="max-w-xl w-full flex flex-col items-center text-center space-y-6">
            {/* Apple App Mark */}
            <div className="relative">
              <div className="grid size-20 place-items-center rounded-[26px] bg-surface/90 border border-hairline shadow-mac-lg">
                <Code2 className="size-10 text-label" />
              </div>
              <div className="absolute -bottom-1 -right-1 size-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[11px] font-bold shadow-sm">
                ✓
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-label">
                PixelCut Studio
              </h2>
              <p className="text-[13px] text-label-2 max-w-sm">
                Kurulum tamamlandı. Bir laboratuvar odasına katılın, CSSBattle pratiği yapın veya proje klasörü açın.
              </p>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full pt-2">
              <button
                type="button"
                onClick={() => setActiveFile("challenges.inclass")}
                className="group flex items-center gap-3 p-3.5 rounded-2xl border border-hairline bg-surface/70 hover:bg-surface hover:border-hairline-strong transition-all duration-200 text-left shadow-mac-xs cursor-pointer"
              >
                <div className="grid size-10 place-items-center rounded-xl bg-well text-label group-hover:scale-105 transition-transform">
                  <BookOpen className="size-5 text-indigo-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium text-label">Ders İçi Lab</span>
                  <span className="block text-[11px] text-label-3">Canlı sınıf odaları</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveFile("challenges.practice")}
                className="group flex items-center gap-3 p-3.5 rounded-2xl border border-hairline bg-surface/70 hover:bg-surface hover:border-hairline-strong transition-all duration-200 text-left shadow-mac-xs cursor-pointer"
              >
                <div className="grid size-10 place-items-center rounded-xl bg-well text-label group-hover:scale-105 transition-transform">
                  <Swords className="size-5 text-emerald-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium text-label">Ders Dışı Arena</span>
                  <span className="block text-[11px] text-label-3">CSSBattle ve pratikler</span>
                </div>
              </button>

              <button
                type="button"
                onClick={handleOpenFolder}
                className="group flex items-center gap-3 p-3.5 rounded-2xl border border-hairline bg-surface/70 hover:bg-surface hover:border-hairline-strong transition-all duration-200 text-left shadow-mac-xs cursor-pointer"
              >
                <div className="grid size-10 place-items-center rounded-xl bg-well text-label group-hover:scale-105 transition-transform">
                  <FolderOpen className="size-5 text-amber-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium text-label">Klasör Aç</span>
                  <span className="block text-[11px] text-label-3">Bilgisayardan proje seç</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleFileCreate("index.html", "file", "root", "index.html")}
                className="group flex items-center gap-3 p-3.5 rounded-2xl border border-hairline bg-surface/70 hover:bg-surface hover:border-hairline-strong transition-all duration-200 text-left shadow-mac-xs cursor-pointer"
              >
                <div className="grid size-10 place-items-center rounded-xl bg-well text-label group-hover:scale-105 transition-transform">
                  <FilePlus className="size-5 text-sky-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium text-label">Yeni Dosya</span>
                  <span className="block text-[11px] text-label-3">index.html oluştur</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveFile("git.sourcecontrol")}
                className="group flex items-center gap-3 p-3.5 rounded-2xl border border-hairline bg-surface/70 hover:bg-surface hover:border-hairline-strong transition-all duration-200 text-left shadow-mac-xs cursor-pointer"
              >
                <div className="grid size-10 place-items-center rounded-xl bg-well text-label group-hover:scale-105 transition-transform">
                  <GitBranch className="size-5 text-emerald-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium text-label">Kaynak Denetimi</span>
                  <span className="block text-[11px] text-label-3">GitHub reposu bağla</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveFile("classroom.radar")}
                className="group flex items-center gap-3 p-3.5 rounded-2xl border border-hairline bg-surface/70 hover:bg-surface hover:border-hairline-strong transition-all duration-200 text-left shadow-mac-xs cursor-pointer"
              >
                <div className="grid size-10 place-items-center rounded-xl bg-well text-label group-hover:scale-105 transition-transform">
                  <Radio className="size-5 text-rose-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium text-label">Canlı Radar</span>
                  <span className="block text-[11px] text-label-3">Sınıf durumunu izle</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveFile("leaderboard.rank")}
                className="group flex items-center gap-3 p-3.5 rounded-2xl border border-hairline bg-surface/70 hover:bg-surface hover:border-hairline-strong transition-all duration-200 text-left shadow-mac-xs cursor-pointer"
              >
                <div className="grid size-10 place-items-center rounded-xl bg-well text-label group-hover:scale-105 transition-transform">
                  <Trophy className="size-5 text-yellow-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium text-label">Sıralama</span>
                  <span className="block text-[11px] text-label-3">XP ve Liderlik</span>
                </div>
              </button>
            </div>

            {/* Keyboard Shortcuts Hint */}
            <div className="flex items-center gap-4 text-[11.5px] font-mono text-label-3 pt-2">
              <span><kbd className="px-1.5 py-0.5 rounded bg-well border border-hairline text-label">Ctrl+K</kbd> Komut Paleti</span>
              <span>•</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-well border border-hairline text-label">Ctrl+O</kbd> Klasör Aç</span>
            </div>
          </div>
        </div>
      ) : !["classroom.radar", "challenges.rooms", "challenges.inclass", "challenges.practice", "leaderboard.rank", "git.sourcecontrol", "settings.config", "target.png"].includes(activeFile) ? (
        <div className="flex flex-1 overflow-hidden">
          {/* Left Column: Monaco Code Editor */}
          <div className="flex w-full lg:w-1/2 flex-col border-r border-hairline overflow-hidden bg-surface">
            {/* Teacher Connected Banner on Student Screen */}
            {connectedTeacherName && (
              <div className="flex h-8 shrink-0 items-center justify-between border-b border-hairline bg-well/70 px-4 text-[11.5px] font-medium text-label select-none">
                <div className="flex items-center gap-2">
                  <span className="relative flex size-2">
                    <span className="absolute inset-0 animate-ping rounded-full bg-label-3 opacity-75" />
                    <span className="relative size-2 rounded-full bg-label-2" />
                  </span>
                  <span>{connectedTeacherName} masanıza bağlandı — Canlı müdahale oturumu aktif</span>
                </div>
                <span className="pill bg-well border border-hairline text-label-2 font-mono text-[10px]">
                  CANLI YARDIM
                </span>
              </div>
            )}

            {/* File Tab Header with Close Button */}
            <div className="flex h-9 shrink-0 items-center justify-between border-b border-hairline px-4 text-[12px] select-none bg-well/40 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium text-tint truncate max-w-[280px]">{activeFile}</span>
                {analysis.unusedPercent > 35 && activeFile === "styles.css" && !isExternalFolder && (
                  <span className="pill bg-sys-orange/15 text-sys-orange font-mono text-[10px]">
                    %{analysis.unusedPercent} gereksiz
                  </span>
                )}
                {isExternalFolder && (
                  <span className="pill bg-tint/15 text-tint font-mono text-[10px]">
                    Yerel Disk
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setActiveFile(null)}
                className="size-5 rounded flex items-center justify-center text-label-3 hover:text-label hover:bg-well transition-colors cursor-pointer"
                title="Dosyayı Kapat"
              >
                <X className="size-3.5" />
              </button>
            </div>

              {/* Monaco Code Editor */}
              <div className="relative flex-1 min-h-[220px]">
                <Editor
                  height="100%"
                  beforeMount={defineMonacoCustomThemes}
                  onMount={(_editor, monaco) => {
                    monacoRef.current = monaco;
                  }}
                  theme={getMonacoThemeName(resolved)}
                  language={getMonacoLanguage(activeFile)}
                  value={
                    activeFile === "index.html" && !isExternalFolder
                      ? htmlCode
                      : activeFile === "styles.css" && !isExternalFolder
                      ? cssCode
                      : customFiles[activeFile] ?? `/* ${activeFile} */\n`
                  }
                  onChange={(val) => {
                    const nextVal = val || "";
                    if (!isExternalFolder && activeFile === "index.html") {
                      setHtmlCode(nextVal);
                      handleCodeChangeWithBroadcast("html", nextVal);
                    } else if (!isExternalFolder && activeFile === "styles.css") {
                      setCssCode(nextVal);
                      handleCodeChangeWithBroadcast("css", nextVal);
                    } else {
                      setCustomFiles((prev) => ({ ...prev, [activeFile]: nextVal }));
                      if (isExternalFolder) {
                        saveWorkspaceFile(activeFile, nextVal);
                      }
                    }
                  }}
                  options={{
                    minimap: { enabled: false },
                    fontSize: editorFontSize,
                    fontFamily: FONT_FAMILY_MAP[editorFontFamily] || editorFontFamily,
                    fontLigatures: true,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    automaticLayout: true,
                    tabSize: 2,
                    renderLineHighlight: "all",
                    padding: { top: 14, bottom: 14 },
                  }}
                />
              </div>

              {/* Integrated MagicUI Terminal Dock */}
              <TerminalDock
                isOpen={isTerminalOpen}
                onClose={() => setIsTerminalOpen(false)}
                analysis={analysis}
                maxLinesGoal={currentChallenge.maxLinesGoal}
                activeFile={activeFile}
              />
            </div>

            {/* Right Column: Live Preview & Canvas */}
            <div className="dot-canvas relative flex flex-1 flex-col overflow-hidden p-6 pb-20">
              {/* Subtle Minimalist Clean Score Pill */}
              <div className="absolute top-8 right-8 z-20 pointer-events-none select-none">
                <div className="flex items-center gap-1.5 rounded-full border border-hairline/80 bg-surface/85 px-3 py-1 shadow-mac-xs backdrop-blur-md">
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      analysis.cleanScore >= 80 ? "bg-sys-green" : "bg-sys-orange"
                    )}
                  />
                  <span className="text-[11px] font-mono font-medium text-label">
                    %{analysis.cleanScore} Temiz Kod
                  </span>
                </div>
              </div>

              {/* Preview Content */}
              <div className="relative flex flex-1 items-center justify-center overflow-auto">
                {previewMode === "desktop" && (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="relative h-full w-full overflow-hidden rounded-[22px] border border-[var(--mac-hairline-strong)] bg-[var(--mac-surface)] shadow-mac-lg">
                      <iframe
                        srcDoc={liveSrcDoc}
                        sandbox="allow-scripts"
                        title="Tuval Önizleme"
                        className="h-full w-full border-0"
                      />
                    </div>
                  </div>
                )}

                {previewMode === "mobile" && (
                  <MobilePreviewFrame srcDoc={liveSrcDoc} />
                )}

                {previewMode === "diff" && (
                  <div className="flex h-full w-full items-center justify-center">
                    <DiffSlider
                      srcDoc={liveSrcDoc}
                      studentHtml={htmlCode}
                      studentCss={cssCode}
                      targetImageUrl={currentChallenge.targetImageUrl}
                    />
                  </div>
                )}
              </div>

              {/* Floating Live Inspector (Active only when enabled in Settings) */}
              <LiveCssInspector
                isOpen={showCssInspector}
                onClose={() => setShowCssInspector(false)}
              />

              {/* Centered Actions: Submit & Ask Help */}
              <div className="mt-4 flex items-center justify-center gap-3 select-none">
                <AskHelpDialog
                  isHelpActive={myHelpRequested}
                  activeTopic={myHelpTopic}
                  isTeacherConnected={Boolean(connectedTeacherName)}
                  teacherName={connectedTeacherName || undefined}
                  onAskHelp={handleAskHelp}
                  onCancelHelp={handleCancelHelp}
                />
                <TeacherSubmitButton
                  onComplete={handleSubmitSuccess}
                  isSubmitted={students.find((s) => s.studentId === "st-1")?.status === "submitted"}
                />
              </div>
            </div>
          </div>
        ) : null}

        {/* Target Reference Image View */}
        {activeFile === "target.png" && (
          <div className="dot-canvas flex flex-1 flex-col items-center justify-center p-8 pb-24 overflow-auto select-none">
            <div className="max-w-xl text-center mb-6">
              <span className="pill bg-tint/12 text-tint font-mono mb-2">Referans Tasarım</span>
              <h2 className="text-[18px] font-bold text-label">
                Hedef Bileşen Ekran Görüntüsü
              </h2>
              <p className="mt-1 text-[12.5px] text-label-2">
                Hocanızın indirdiği şablondan sadece bu parçayı ayıklayıp sıfır gecikmeyle kodlayacaksınız.
              </p>
            </div>
            <img
              src={currentChallenge.targetImageUrl}
              alt="Hedef Şablon"
              className="max-h-[500px] rounded-[22px] border border-hairline shadow-mac-lg object-contain bg-surface"
            />
          </div>
        )}

        {/* Classroom Live Radar & Teacher Remote Intervention View */}
        {activeFile === "classroom.radar" && (
          <div className="flex flex-1 overflow-hidden pb-16">
            {activeRemoteSession ? (
              <TeacherRemoteWorkspace
                session={activeRemoteSession}
                student={
                  students.find((s) => s.studentId === activeRemoteSession.studentId) || {
                    studentId: activeRemoteSession.studentId,
                    studentName: activeRemoteSession.studentName,
                    studentNo: activeRemoteSession.studentNo,
                    avatarUrl: activeRemoteSession.avatarUrl,
                    html: htmlCode,
                    css: cssCode,
                    visualMatch: 75,
                    linesCount: 50,
                    lastActive: Date.now(),
                    status: "needs_help",
                    helpTopic: activeRemoteSession.helpTopic,
                  }
                }
                targetImageUrl={currentChallenge.targetImageUrl}
                onUpdateStudentCode={handleUpdateRemoteStudentCode}
                onCloseSession={handleCloseRemoteSession}
                onGradeStudent={handleGradeStudent}
                onCompleteAssistance={handleCompleteAssistance}
              />
            ) : (
              <ClassroomGrid
                students={students}
                targetImageUrl={currentChallenge.targetImageUrl}
                onGradeStudent={handleGradeStudent}
                onStartSession={handleStartRemoteSession}
                currentChallenge={currentChallenge}
                challenges={challenges}
                onSelectChallenge={handleSelectChallenge}
                onPublishChallenge={handlePublishChallenge}
                userRole={userRole}
              />
            )}
          </div>
        )}

        {/* Ders İçi Canlı Lab Odaları View */}
        {(activeFile === "challenges.inclass" || activeFile === "challenges.rooms") && (
          <div className="flex flex-1 overflow-hidden pb-16">
            <RoomsArenaView
              mode="in_class"
              challenges={challenges}
              activeChallengeId={activeChallengeId}
              userRole={userRole}
              onSelectChallenge={(ch) => {
                handleSelectChallenge(ch.id);
                setActiveFile("styles.css");
                setGitToast({
                  type: "success",
                  message: `🎯 "${ch.title}" canlı çalışma alanına yüklendi!`,
                });
                setTimeout(() => setGitToast(null), 3500);
              }}
              onBroadcastChallenge={(chId) => {
                handleSelectChallenge(chId);
                setGitToast({
                  type: "info",
                  message: "📢 Görev tüm sınıfa başarıyla yayınlandı!",
                });
                setTimeout(() => setGitToast(null), 3500);
              }}
            />
          </div>
        )}

        {/* Ders Dışı CSSBattle Arenası View */}
        {activeFile === "challenges.practice" && (
          <div className="flex flex-1 overflow-hidden pb-16">
            <RoomsArenaView
              mode="practice"
              challenges={challenges}
              activeChallengeId={activeChallengeId}
              userRole={userRole}
              onSelectChallenge={(ch) => {
                handleSelectChallenge(ch.id);
                setActiveFile("styles.css");
                setGitToast({
                  type: "success",
                  message: `🎯 "${ch.title}" pratik alanına yüklendi!`,
                });
                setTimeout(() => setGitToast(null), 3500);
              }}
              onBroadcastChallenge={(chId) => {
                handleSelectChallenge(chId);
                setGitToast({
                  type: "info",
                  message: "📢 Görev tüm sınıfa başarıyla yayınlandı!",
                });
                setTimeout(() => setGitToast(null), 3500);
              }}
            />
          </div>
        )}

        {/* Leaderboard View */}
        {activeFile === "leaderboard.rank" && (
          <div className="flex flex-1 overflow-hidden pb-16">
            <Leaderboard
              entries={SAMPLE_LEADERBOARD}
              currentStudentId="st-1"
              onSelectPracticeChallenge={(challenge) => {
                handleSelectChallenge(challenge.id);
                setActiveFile("styles.css");
                setGitToast({
                  type: "success",
                  message: `🎯 ${challenge.title} editöre yüklendi! (+${challenge.xpReward} XP)`,
                });
                setTimeout(() => setGitToast(null), 3500);
              }}
            />
          </div>
        )}

        {/* GitHub / Git Source Control View */}
        {activeFile === "git.sourcecontrol" && (
          <div className="flex flex-1 overflow-hidden pb-16">
            <GitSourceControl
              currentBranch={gitBranch}
              branches={gitBranches}
              commits={gitCommits}
              changes={gitChanges}
              activeFileCode={{ html: htmlCode, css: cssCode }}
              authState={authState}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onCommit={handleGitCommit}
              onCreateBranch={handleGitCreateBranch}
              onSwitchBranch={handleGitSwitchBranch}
              onPush={handleGitPush}
              onDiscardChange={handleGitDiscardChange}
              onReturnToEditor={() => setActiveFile("styles.css")}
            />
          </div>
        )}

        {/* Settings View */}
        {activeFile === "settings.config" && (
          <div className="flex flex-1 overflow-hidden pb-16">
            <SettingsView
              currentRole={userRole}
              onRoleChange={handleRoleChange}
              showCssInspector={showCssInspector}
              onToggleCssInspector={setShowCssInspector}
              editorFontFamily={editorFontFamily}
              onFontFamilyChange={setEditorFontFamily}
              editorFontSize={editorFontSize}
              onFontSizeChange={setEditorFontSize}
              onSavePreferences={handleSaveEditorSettings}
            />
          </div>
        )}

        {/* Guidelines Drawer */}
        <GuidelineDrawer
          isOpen={isGuidelineOpen}
          onClose={() => setIsGuidelineOpen(false)}
          title={currentChallenge.title}
          subtitle={`Zorluk: ${currentChallenge.difficulty} • Hedef: En fazla ${currentChallenge.maxLinesGoal} Satır`}
        >
          <div className="space-y-6">
            <div className="rounded-[16px] bg-well p-4 space-y-2">
              <span className="section-label block">Görev Tanımı</span>
              <p className="text-[12.5px] leading-relaxed text-label">
                {currentChallenge.description}
              </p>
            </div>

            <div>
              <span className="section-label block mb-3">İpuçları & Puanlama Kriterleri</span>
              <div className="space-y-2.5">
                {currentChallenge.hints.map((hint, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-[14px] border border-hairline bg-surface p-3.5 shadow-mac-xs text-[12px] text-label-2 leading-relaxed"
                  >
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-sys-yellow/15 text-sys-yellow text-[11px] font-bold">
                      💡
                    </span>
                    <span>{hint}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GuidelineDrawer>

        {/* Spotlight Command Palette (⌘K) */}
        <Spotlight
          open={isSpotlightOpen}
          onOpenChange={setIsSpotlightOpen}
          items={spotlightItems}
          sidebarOffset={isSidebarOpen ? 275 : 0}
        />

        {/* Student Assistance Finished Alert Modal */}
        {assistanceFinishedAlert?.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-in fade-in duration-150">
            <div
              className="relative w-full max-w-sm rounded-[22px] border border-hairline bg-surface p-6 shadow-mac-lg animate-in zoom-in-95 duration-150 text-center select-none"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-3.5 grid size-12 place-items-center rounded-2xl bg-well text-label shadow-mac-xs border border-hairline">
                <CheckCircle2 className="size-6 text-label" />
              </div>

              <h3 className="text-[16px] font-semibold text-label tracking-tight">
                Canlı Yardım Tamamlandı
              </h3>

              <p className="mt-2 text-[12.5px] leading-relaxed text-label-2">
                Hoca kodunuzdaki yardımı tamamladı ve oturumu sonlandırdı. Yapılan düzeltmeler çalışma alanınıza yansıtıldı.
              </p>

              <p className="mt-2 text-[11.5px] text-label-3">
                Yeni bir konuda takılırsanız dilediğiniz zaman tekrar <strong className="text-label">Hocadan Yardım İste</strong> butonunu kullanabilirsiniz.
              </p>

              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={() => setAssistanceFinishedAlert(null)}
                  className="mac-btn mac-btn-primary h-8 px-6 text-[12.5px] font-medium"
                >
                  Tamam, Teşekkürler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* macOS Floating HUD Git Toast */}
        <AnimatePresence>
          {gitToast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-full border border-hairline bg-surface/92 px-4 py-2 text-[12px] font-medium text-label shadow-mac-lg backdrop-blur-xl pointer-events-none select-none"
            >
              {gitToast.type === "success" && <Check className="size-3.5 text-label" />}
              {gitToast.type === "error" && <X className="size-3.5 text-rose-500" />}
              {gitToast.type === "info" && (
                <span className="size-3 animate-spin rounded-full border border-label-3 border-t-label" />
              )}
              <span>{gitToast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* GitHub & Supabase Auth Connection Modal */}
        <GitHubAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          authState={authState}
          onAuthChange={setAuthState}
        />

        {/* First Launch / Setup Onboarding Wizard */}
        <OnboardingWizard
          isOpen={isOnboardingOpen}
          onComplete={handleCompleteOnboarding}
          onClose={() => setIsOnboardingOpen(false)}
          initialRole={userRole}
        />

        {/* Support & Issue Diagnostic Modal */}
        <SupportModal
          isOpen={isSupportModalOpen}
          onClose={() => setIsSupportModalOpen(false)}
          currentUser={{
            name: onboardingProfile?.fullName || "Öğrenci",
            email: authState.user?.email || "ogrenci@lab.edu.tr",
            role: userRole,
          }}
        />

        {/* Developer Support Desk (Inbox Triage & Live Support Conversation) */}
        <DeveloperSupportDesk
          isOpen={isDevDeskOpen}
          onClose={() => setIsDevDeskOpen(false)}
          developerEmail="onuracar.work@gmail.com"
          developerName="Onur Acar"
        />
      </MacWindow>
  );
}
