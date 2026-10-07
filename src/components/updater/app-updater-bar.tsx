"use client";

import * as React from "react";
import { AnnouncementBar, Announcement } from "@/components/arc/announcement-bar/announcement-bar";
import styles from "@/components/arc/announcement-bar/announcement-bar.module.css";

interface AppUpdaterBarProps {
  currentVersion?: string;
  githubRepo?: string;
}

export function AppUpdaterBar({
  currentVersion = "0.1.0",
  githubRepo = "onuracar-dev/PixelCut",
}: AppUpdaterBarProps) {
  const [updateStatus, setUpdateStatus] = React.useState<
    "idle" | "available" | "downloading" | "ready"
  >("idle");
  const [newVersion, setNewVersion] = React.useState<string>("");
  const [commitMessage, setCommitMessage] = React.useState<string>("");
  const [commitUrl, setCommitUrl] = React.useState<string>("");
  const [progress, setProgress] = React.useState<number>(0);
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  // 1. Electron Native AutoUpdater Events
  React.useEffect(() => {
    if (typeof window !== "undefined" && (window as any).electronAPI) {
      const api = (window as any).electronAPI;

      const unbindAvailable = api.onUpdateAvailable?.((info: any) => {
        setNewVersion(info?.version || "Yeni Sürüm");
        setUpdateStatus("downloading");
        setIsOpen(true);
      });

      const unbindProgress = api.onUpdateProgress?.((progressObj: any) => {
        setUpdateStatus("downloading");
        setProgress(Math.round(progressObj?.percent || 0));
        setIsOpen(true);
      });

      const unbindDownloaded = api.onUpdateDownloaded?.((info: any) => {
        setNewVersion(info?.version || "Yeni Sürüm");
        setUpdateStatus("ready");
        setIsOpen(true);
      });

      try {
        api.checkForUpdates?.();
      } catch (err) {}

      return () => {
        unbindAvailable?.();
        unbindProgress?.();
        unbindDownloaded?.();
      };
    }
  }, []);

  // 2. Real-time GitHub Commits & Releases Detection
  React.useEffect(() => {
    let timer: NodeJS.Timeout;

    const checkGitHubUpdates = async () => {
      try {
        // A. Check latest commit on main branch
        const commitsRes = await fetch(
          `https://api.github.com/repos/${githubRepo}/commits?per_page=1`,
          { headers: { Accept: "application/vnd.github.v3+json" } }
        );

        if (commitsRes.ok) {
          const commits = await commitsRes.json();
          if (Array.isArray(commits) && commits.length > 0) {
            const latest = commits[0];
            const sha = latest.sha;
            const shortSha = sha.slice(0, 7);
            const msg = latest.commit?.message?.split("\n")[0] || "Yeni PixelCut güncellemesi";

            const localSha = localStorage.getItem("pixelcut_installed_commit");
            if (!localSha) {
              // Store initial known sha
              localStorage.setItem("pixelcut_installed_commit", sha);
            } else if (localSha !== sha) {
              setNewVersion(shortSha);
              setCommitMessage(msg);
              setCommitUrl(latest.html_url || `https://github.com/${githubRepo}/commit/${sha}`);
              setUpdateStatus("ready");
              setIsOpen(true);
              return;
            }
          }
        }

        // B. Check latest releases as fallback
        const releaseRes = await fetch(
          `https://api.github.com/repos/${githubRepo}/releases/latest`,
          { headers: { Accept: "application/vnd.github.v3+json" } }
        );
        if (releaseRes.ok) {
          const release = await releaseRes.json();
          const remoteTag = (release.tag_name || "").replace(/^v/, "");
          if (remoteTag && remoteTag !== currentVersion) {
            setNewVersion(remoteTag);
            setCommitMessage(release.name || "Yeni sürüm yayında");
            setCommitUrl(release.html_url);
            setUpdateStatus("ready");
            setIsOpen(true);
          }
        }
      } catch (e) {
        // Silent catch for network or offline mode
      }
    };

    // Run after mount and then poll every 45s
    const initialCheck = setTimeout(checkGitHubUpdates, 2000);
    const interval = setInterval(checkGitHubUpdates, 45000);

    return () => {
      clearTimeout(initialCheck);
      clearInterval(interval);
    };
  }, [currentVersion, githubRepo]);

  // Simulation listener for manual test / demo
  React.useEffect(() => {
    let timeouts: NodeJS.Timeout[] = [];
    const handleSimulate = (e?: any) => {
      const targetVer = e?.detail?.version || "0.2.0";
      const targetMsg = e?.detail?.message || "PixelCut v0.2.0 performans ve radar geliştirmeleri";
      setNewVersion(targetVer);
      setCommitMessage(targetMsg);
      setUpdateStatus("downloading");
      setProgress(20);
      setIsOpen(true);

      timeouts.push(setTimeout(() => setProgress(55), 600));
      timeouts.push(setTimeout(() => setProgress(88), 1200));
      timeouts.push(
        setTimeout(() => {
          setProgress(100);
          setUpdateStatus("ready");
        }, 1800)
      );
    };

    if (typeof window !== "undefined") {
      window.addEventListener("csspg:simulate-update", handleSimulate);
      (window as any).__testUpdateBar = (msg?: string) =>
        handleSimulate({ detail: { version: "0.2.1", message: msg } });
    }

    return () => {
      timeouts.forEach(clearTimeout);
      if (typeof window !== "undefined") {
        window.removeEventListener("csspg:simulate-update", handleSimulate);
      }
    };
  }, []);

  const handleUpdateAction = () => {
    if (typeof window !== "undefined" && (window as any).electronAPI) {
      const api = (window as any).electronAPI;
      if (api.restartAndInstall) {
        api.restartAndInstall();
        return;
      }
    }
    // Browser or fallback: open commit / release link or reload
    if (commitUrl) {
      window.open(commitUrl, "_blank");
    } else {
      window.open(`https://github.com/${githubRepo}`, "_blank");
    }
  };

  if (!isOpen || updateStatus === "idle") return null;

  const announcements: Announcement[] = [
    {
      id: `update-${newVersion || "latest"}-${updateStatus}`,
      message:
        updateStatus === "ready" ? (
          <span className="inline-flex items-center gap-2.5 flex-wrap justify-center">
            <span className={styles.badge}>
              <span className={styles.badgeDot} />
              {newVersion.startsWith("0.") ? `v${newVersion}` : `Commit ${newVersion}`}
            </span>
            <span className="text-[12.5px] opacity-90">
              <strong className="font-semibold text-white">PixelCut</strong>{" "}
              {commitMessage ? (
                <>
                  güncellemesi yayında: <span className="text-white font-medium">&ldquo;{commitMessage}&rdquo;</span>
                </>
              ) : (
                "güncellemesi hazır — Yenilikler ve laboratuvar araçları indirildi."
              )}
            </span>
          </span>
        ) : updateStatus === "downloading" ? (
          <span className="inline-flex items-center gap-2.5 flex-wrap justify-center">
            <span className={styles.badge}>
              <span className={styles.badgeDotPulse} />
              %{progress} İndiriliyor
            </span>
            <span className="text-[12.5px] opacity-90">
              <strong className="font-semibold text-white">PixelCut {newVersion.startsWith("0.") ? `v${newVersion}` : `commit ${newVersion}`}</strong>{" "}
              {commitMessage ? `(${commitMessage})` : "arka planda indiriliyor..."}
            </span>
            <span className="hidden sm:inline-block">
              <span className={styles.progressTrack}>
                <span
                  className={styles.progressBar}
                  style={{ width: `${progress}%` }}
                />
              </span>
            </span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-2">
            <span className={styles.badge}>
              <span className={styles.badgeDot} />
              {newVersion}
            </span>
            <span className="text-[12.5px] opacity-90">
              Yeni PixelCut sürümü tespit edildi — Hazırlanıyor...
            </span>
          </span>
        ),
      action:
        updateStatus === "ready"
          ? {
              label: commitUrl ? "Yenilikleri İncele & Güncelle" : "Şimdi Yeniden Başlat ve Güncelle",
              onClick: handleUpdateAction,
            }
          : undefined,
    },
  ];

  return (
    <div className="relative z-50 w-full shrink-0">
      <AnnouncementBar
        id={`css-slicer-update-${newVersion}`}
        messages={announcements}
        open={isOpen}
        onOpenChange={setIsOpen}
        tone="neutral"
        dismissible={true}
        autoPlay={false}
      />
    </div>
  );
}
