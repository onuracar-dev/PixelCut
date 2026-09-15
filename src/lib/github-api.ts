export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string;
  email?: string;
  bio?: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  default_branch: string;
}

/**
 * Fetch authenticated user profile from GitHub
 */
export async function fetchGitHubUserProfile(token: string): Promise<GitHubUser> {
  const res = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`GitHub kullanıcı bilgisi alınamadı (${res.status}): ${errorText}`);
  }

  return res.json();
}

/**
 * Fetch user repositories from GitHub
 */
export async function fetchGitHubUserRepos(token: string): Promise<GitHubRepo[]> {
  const res = await fetch("https://api.github.com/user/repos?sort=updated&per_page=30", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!res.ok) {
    return [];
  }

  return res.json();
}

/**
 * Push files to a GitHub repository using the GitHub Contents API
 */
export async function pushFilesToGitHub(
  token: string,
  owner: string,
  repo: string,
  branch: string,
  files: { path: string; content: string }[],
  commitMessage: string
): Promise<{ success: boolean; commitSha?: string; error?: string }> {
  try {
    for (const file of files) {
      // 1. Check if file already exists to get its current SHA (required by GitHub API for updates)
      let currentSha: string | undefined = undefined;
      try {
        const checkRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}?ref=${branch}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github+json",
            },
          }
        );
        if (checkRes.ok) {
          const fileData = await checkRes.json();
          currentSha = fileData.sha;
        }
      } catch (e) {
        // file doesn't exist yet, which is fine
      }

      // 2. Put file content (Base64 encoded)
      const base64Content = btoa(unescape(encodeURIComponent(file.content)));
      const putBody: any = {
        message: `${commitMessage} (${file.path})`,
        content: base64Content,
        branch: branch,
      };
      if (currentSha) {
        putBody.sha = currentSha;
      }

      const putRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(putBody),
        }
      );

      if (!putRes.ok) {
        const errorText = await putRes.text();
        throw new Error(`Dosya (${file.path}) yüklenemedi: ${errorText}`);
      }
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Push işlemi başarısız oldu" };
  }
}
