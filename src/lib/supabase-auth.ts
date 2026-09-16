import { supabase, isSupabaseConfigured } from "./supabase";
import { GitHubUser, fetchGitHubUserProfile } from "./github-api";

export interface AuthState {
  isAuthenticated: boolean;
  user: GitHubUser | null;
  gitHubToken: string | null;
  targetRepo: string; // e.g. "username/csspg-lab"
}

const STORAGE_KEY_TOKEN = "csspg_gh_token";
const STORAGE_KEY_REPO = "csspg_gh_repo";
const STORAGE_KEY_USER = "csspg_gh_user";

export function loadSavedAuthState(): AuthState {
  if (typeof window === "undefined") {
    return { isAuthenticated: false, user: null, gitHubToken: null, targetRepo: "ahmet-dev/csspg-lab" };
  }

  const token = localStorage.getItem(STORAGE_KEY_TOKEN);
  const repo = localStorage.getItem(STORAGE_KEY_REPO) || "ahmet-dev/csspg-lab";
  const userJson = localStorage.getItem(STORAGE_KEY_USER);

  let user: GitHubUser | null = null;
  if (userJson) {
    try {
      user = JSON.parse(userJson);
    } catch (e) {
      user = null;
    }
  }

  return {
    isAuthenticated: Boolean(token && user),
    user,
    gitHubToken: token,
    targetRepo: repo,
  };
}

export function saveAuthState(token: string, user: GitHubUser, repo: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_TOKEN, token);
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  localStorage.setItem(STORAGE_KEY_REPO, repo);
}

export function clearAuthState() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY_TOKEN);
  localStorage.removeItem(STORAGE_KEY_USER);
  localStorage.removeItem(STORAGE_KEY_REPO);
}

/**
 * Sign in via Supabase OAuth with GitHub provider
 */
export async function signInWithSupabaseGitHub(): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) {
    return {
      error: "Supabase henüz yapılandırılmamış. .env.local dosyasına Supabase URL ve Anon Key ekleyebilirsiniz.",
    };
  }

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        scopes: "repo read:user user:email",
        redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });

    if (error) {
      return { error: error.message };
    }

    return {};
  } catch (err: any) {
    return { error: err.message || "Giriş işlemi başlatılamadı" };
  }
}

/**
 * Connect with a GitHub Personal Access Token or Demo Token
 */
export async function connectWithGitHubToken(
  token: string,
  preferredRepo?: string
): Promise<{ success: boolean; user?: GitHubUser; error?: string }> {
  try {
    const profile = await fetchGitHubUserProfile(token);
    const repo = preferredRepo || `${profile.login}/csspg-lab-04`;
    saveAuthState(token, profile, repo);
    return { success: true, user: profile };
  } catch (err: any) {
    return { success: false, error: err.message || "Geçersiz GitHub Token" };
  }
}

/**
 * Initialize Supabase Auth Listener for OAuth callbacks
 * Automatically captures provider_token from GitHub OAuth redirect and syncs profile
 */
export function initSupabaseAuthListener(
  onAuthChange: (state: AuthState) => void
): () => void {
  if (typeof window === "undefined" || !isSupabaseConfigured) {
    return () => {};
  }

  const handleSession = async (session: any) => {
    if (!session) return;

    // Check if GitHub provider token is provided in the OAuth response
    const token = session.provider_token;
    if (token) {
      try {
        const profile = await fetchGitHubUserProfile(token);
        const savedRepo =
          localStorage.getItem(STORAGE_KEY_REPO) || `${profile.login}/csspg-lab-04`;
        saveAuthState(token, profile, savedRepo);
        onAuthChange({
          isAuthenticated: true,
          user: profile,
          gitHubToken: token,
          targetRepo: savedRepo,
        });

        // Clean url hash containing access_token to keep address bar clean
        if (window.location.hash.includes("access_token")) {
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname + window.location.search
          );
        }
      } catch (err) {
        console.error("[GitHub Auth] Failed to fetch user profile with provider_token:", err);
      }
    } else if (session.user) {
      // Fallback: If user metadata exists from GitHub provider
      const metadata = session.user.user_metadata || {};
      const login = metadata.user_name || metadata.preferred_username || session.user.email?.split("@")[0] || "student";
      const userProfile: GitHubUser = {
        login,
        id: session.user.id,
        avatar_url: metadata.avatar_url || `https://github.com/${login}.png`,
        name: metadata.full_name || metadata.name || login,
        email: session.user.email,
      };

      const existingToken = localStorage.getItem(STORAGE_KEY_TOKEN);
      const savedRepo = localStorage.getItem(STORAGE_KEY_REPO) || `${login}/csspg-lab-04`;

      if (existingToken) {
        saveAuthState(existingToken, userProfile, savedRepo);
        onAuthChange({
          isAuthenticated: true,
          user: userProfile,
          gitHubToken: existingToken,
          targetRepo: savedRepo,
        });
      }
    }
  };

  // 1. Check existing active session on mount
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      handleSession(session);
    }
  });

  // 2. Listen to auth state transitions (such as SIGNED_IN after OAuth redirect)
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "SIGNED_IN" && session) {
      await handleSession(session);
    } else if (event === "SIGNED_OUT") {
      clearAuthState();
      onAuthChange({
        isAuthenticated: false,
        user: null,
        gitHubToken: null,
        targetRepo: "ahmet-dev/csspg-lab-04",
      });
    }
  });

  return () => {
    subscription.unsubscribe();
  };
}
