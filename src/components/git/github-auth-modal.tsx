"use client";

import * as React from "react";
import {
  Check,
  CheckCircle2,
  ExternalLink,
  KeyRound,
  LogOut,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { AuthState, signInWithSupabaseGitHub, connectWithGitHubToken, clearAuthState, saveAuthState } from "@/lib/supabase-auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface GitHubAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  authState: AuthState;
  onAuthChange: (state: AuthState) => void;
}

export function GitHubAuthModal({
  isOpen,
  onClose,
  authState,
  onAuthChange,
}: GitHubAuthModalProps) {
  const [tokenInput, setTokenInput] = React.useState("");
  const [repoInput, setRepoInput] = React.useState(authState.targetRepo || "ahmet-dev/csspg-lab-04");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<"oauth" | "token">("oauth");

  if (!isOpen) return null;

  const handleOAuthSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    if (isSupabaseConfigured) {
      const res = await signInWithSupabaseGitHub();
      if (res.error) {
        setErrorMessage(res.error);
        setIsLoading(false);
      }
    } else {
      // Offline / Demo fallback: Simulate instant successful connection with rich student profile
      setTimeout(() => {
        const demoUser = {
          login: "ahmet-yilmaz",
          id: 12345678,
          avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          name: "Ahmet Yılmaz",
          email: "ahmet@csspg.dev",
        };
        const nextState: AuthState = {
          isAuthenticated: true,
          user: demoUser,
          gitHubToken: "demo_gh_token_csspg_verified",
          targetRepo: repoInput || "ahmet-yilmaz/csspg-lab-04",
        };
        saveAuthState(nextState.gitHubToken!, demoUser, nextState.targetRepo);
        onAuthChange(nextState);
        setIsLoading(false);
        onClose();
      }, 500);
    }
  };

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    const res = await connectWithGitHubToken(tokenInput.trim(), repoInput.trim());
    if (res.success && res.user) {
      onAuthChange({
        isAuthenticated: true,
        user: res.user,
        gitHubToken: tokenInput.trim(),
        targetRepo: repoInput.trim() || `${res.user.login}/csspg-lab-04`,
      });
      setIsLoading(false);
      onClose();
    } else {
      setErrorMessage(res.error || "GitHub bağlantısı kurulamadı");
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    clearAuthState();
    onAuthChange({
      isAuthenticated: false,
      user: null,
      gitHubToken: null,
      targetRepo: "ahmet-dev/csspg-lab-04",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md rounded-[22px] border border-hairline bg-surface p-6 shadow-mac-lg animate-in zoom-in-95 duration-150 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-well border border-hairline text-label shadow-mac-xs">
              <svg className="size-5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </div>

            <div>
              <h3 className="text-[15px] font-semibold text-label">
                GitHub Bağlantısı
              </h3>
              <p className="text-[12px] text-label-2 mt-0.5">
                {authState.isAuthenticated
                  ? "Hesabınız başarıyla bağlandı."
                  : "Ödevlerinizi doğrudan GitHub'a pushlayın."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mac-icon-btn -mr-1 -mt-1"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body: Connected vs Login State */}
        {authState.isAuthenticated && authState.user ? (
          <div className="mt-5 space-y-4">
            {/* User Profile Card */}
            <div className="flex items-center justify-between rounded-[16px] border border-hairline bg-well p-3.5 shadow-mac-xs">
              <div className="flex items-center gap-3">
                <img
                  src={authState.user.avatar_url}
                  alt={authState.user.login}
                  className="size-11 rounded-[12px] bg-fill object-cover ring-1 ring-hairline shadow-mac-xs"
                />
                <div>
                  <h4 className="text-[13.5px] font-semibold text-label">
                    {authState.user.name || authState.user.login}
                  </h4>
                  <p className="font-mono text-[11.5px] text-label-3">
                    @{authState.user.login}
                  </p>
                </div>
              </div>

              <span className="pill bg-well border border-hairline font-mono text-[11px] text-label-2">
                <Check className="size-3 text-label" />
                <span>Bağlı</span>
              </span>
            </div>

            {/* Target Repo Setting */}
            <div className="rounded-[14px] border border-hairline bg-well/40 p-3 space-y-1.5">
              <label className="text-[11.5px] font-medium text-label-2 block">
                Hedef GitHub Deposu (Repository):
              </label>
              <input
                type="text"
                value={repoInput}
                onChange={(e) => {
                  setRepoInput(e.target.value);
                  saveAuthState(authState.gitHubToken!, authState.user!, e.target.value);
                  onAuthChange({ ...authState, targetRepo: e.target.value });
                }}
                placeholder="kullanici/odev-lab-04"
                className="w-full rounded-[8px] border border-hairline bg-well px-2.5 py-1.5 font-mono text-[12px] text-label outline-none focus:border-tint"
              />
              <p className="text-[10.5px] text-label-3">
                Kodlarınız doğrudan bu depoya commit ve push edilir.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleSignOut}
                className="mac-btn mac-btn-secondary text-[12px] text-rose-500 gap-1.5 hover:bg-rose-500/10"
              >
                <LogOut className="size-3.5" />
                <span>Çıkış Yap</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="mac-btn mac-btn-primary text-[12px] px-4"
              >
                Tamam
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {/* Tab switch */}
            <div className="flex rounded-[10px] bg-well p-0.5 border border-hairline text-[11.5px]">
              <button
                type="button"
                onClick={() => setActiveTab("oauth")}
                className={cn(
                  "flex-1 rounded-[8px] py-1 font-medium transition-all",
                  activeTab === "oauth" ? "bg-surface text-label shadow-mac-xs font-semibold" : "text-label-3 hover:text-label"
                )}
              >
                Tek Tıkla Giriş (OAuth)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("token")}
                className={cn(
                  "flex-1 rounded-[8px] py-1 font-medium transition-all",
                  activeTab === "token" ? "bg-surface text-label shadow-mac-xs font-semibold" : "text-label-3 hover:text-label"
                )}
              >
                Access Token (PAT)
              </button>
            </div>

            {activeTab === "oauth" ? (
              <div className="space-y-3.5 text-center py-2">
                <div className="flex items-center justify-center gap-1.5">
                  {isSupabaseConfigured ? (
                    <span className="pill bg-well border border-hairline font-mono text-[11px] text-label">
                      <span className="size-1.5 rounded-full bg-label inline-block" />
                      Supabase Canlı OAuth
                    </span>
                  ) : (
                    <span className="pill bg-well border border-hairline font-mono text-[11px] text-label-3">
                      <Sparkles className="size-3 text-label-2" />
                      Test / Hızlı Giriş Modu
                    </span>
                  )}
                </div>

                <p className="text-[12.5px] text-label-2 leading-relaxed">
                  {isSupabaseConfigured
                    ? "VS Code gibi GitHub hesabınızla tek tıkla yetkilendirin. Şifre girmeden profiliniz ve hedef reponuz otomatik bağlansın."
                    : "Tek tıkla simüle edilmiş öğrenci profiliyle bağlanabilir veya .env.local dosyasına Supabase ekleyerek doğrudan gerçek OAuth'u açabilirsiniz."}
                </p>

                {errorMessage && (
                  <div className="rounded-[10px] bg-rose-500/10 border border-rose-500/20 p-2 text-[11.5px] text-rose-600 dark:text-rose-400">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleOAuthSignIn}
                  disabled={isLoading}
                  className="mac-btn mac-btn-primary w-full h-9 text-[13px] gap-2 font-medium"
                >
                  <svg className="size-4 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>{isLoading ? "Bağlanıyor..." : "GitHub ile Giriş Yap"}</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleTokenSubmit} className="space-y-3">
                <div>
                  <label className="text-[12px] font-medium text-label-2 block mb-1">
                    GitHub Personal Access Token:
                  </label>
                  <input
                    type="password"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxx"
                    className="w-full rounded-[10px] border border-hairline bg-well p-2 font-mono text-[12px] text-label outline-none focus:border-tint"
                  />
                  <div className="flex items-center justify-between mt-1 text-[11px] text-label-3">
                    <span>repo ve read:user yetkili</span>
                    <a
                      href="https://github.com/settings/tokens"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 hover:underline text-label-2"
                    >
                      <span>Token Al</span>
                      <ExternalLink className="size-2.5" />
                    </a>
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-medium text-label-2 block mb-1">
                    Hedef Repo:
                  </label>
                  <input
                    type="text"
                    value={repoInput}
                    onChange={(e) => setRepoInput(e.target.value)}
                    placeholder="kullanici/odev-lab-04"
                    className="w-full rounded-[10px] border border-hairline bg-well p-2 font-mono text-[12px] text-label outline-none focus:border-tint"
                  />
                </div>

                {errorMessage && (
                  <div className="rounded-[10px] bg-rose-500/10 border border-rose-500/20 p-2 text-[11.5px] text-rose-600 dark:text-rose-400">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !tokenInput.trim()}
                  className="mac-btn mac-btn-primary w-full h-8 text-[12px] font-medium disabled:opacity-40"
                >
                  {isLoading ? "Doğrulanıyor..." : "Hesabı Doğrula ve Bağla"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
