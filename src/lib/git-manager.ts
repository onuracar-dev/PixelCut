import { GitCommit, GitFileChange } from "@/types/git";

export interface DiffLine {
  type: "context" | "add" | "delete";
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

// Initial commit history seeded with early classroom lab progression
export const INITIAL_GIT_COMMITS: GitCommit[] = [
  {
    hash: "7a3e91b4028f8d91c10427ad6498bb892f304561",
    shortHash: "7a3e91b",
    message: "init: Laboratuvar 04 başlangıç iskeleti oluşturuldu",
    author: "Ahmet Yılmaz",
    authorEmail: "ahmet@csspg.dev",
    timestamp: Date.now() - 1000 * 60 * 45, // 45 mins ago
    branch: "main",
    filesChanged: [
      { filename: "index.html", additions: 18, deletions: 0 },
      { filename: "styles.css", additions: 12, deletions: 0 },
    ],
    htmlSnapshot: `<div class="pricing-card">\n  <span class="badge">POPÜLER</span>\n  <h2 class="title">Pro Plan</h2>\n  <div class="price">₺ 299</div>\n  <button class="cta-button">Hemen Başla</button>\n</div>`,
    cssSnapshot: `.pricing-card {\n  background: #18181b;\n  border-radius: 20px;\n  padding: 24px;\n  color: #fff;\n}\n.badge { color: #10b981; }\n.cta-button { background: #3b82f6; color: white; padding: 8px; }`,
  },
  {
    hash: "c29d10e58f273b09aa910c2837bc9029e81b6723",
    shortHash: "c29d10e",
    message: "feat: Fiyatlandırma kartı temel renkleri ve tipografisi ayarlandı",
    author: "Ahmet Yılmaz",
    authorEmail: "ahmet@csspg.dev",
    timestamp: Date.now() - 1000 * 60 * 20, // 20 mins ago
    branch: "main",
    filesChanged: [
      { filename: "styles.css", additions: 8, deletions: 2 },
    ],
    htmlSnapshot: `<div class="pricing-card">\n  <span class="badge">POPÜLER</span>\n  <h2 class="title">Pro Plan</h2>\n  <div class="price">₺ 299</div>\n  <button class="cta-button">Hemen Başla</button>\n</div>`,
    cssSnapshot: `.pricing-card {\n  background: #18181b;\n  border-radius: 20px;\n  padding: 32px;\n  color: #fff;\n}\n.badge { color: #10b981; }\n.cta-button { background: #3b82f6; color: white; padding: 10px; }`,
  },
];

export const INITIAL_GIT_BRANCHES = [
  "main",
  "feature/kart-hizalama",
  "fix/buton-stili",
];

// Helper to calculate line additions and deletions
export function calculateLineDiff(
  oldContent: string,
  newContent: string
): { additions: number; deletions: number; lines: DiffLine[] } {
  const oldLines = oldContent ? oldContent.split("\n") : [];
  const newLines = newContent ? newContent.split("\n") : [];

  let additions = 0;
  let deletions = 0;
  const lines: DiffLine[] = [];

  const maxLen = Math.max(oldLines.length, newLines.length);
  let oldIdx = 1;
  let newIdx = 1;

  for (let i = 0; i < maxLen; i++) {
    const oLine = oldLines[i];
    const nLine = newLines[i];

    if (oLine === undefined && nLine !== undefined) {
      additions++;
      lines.push({
        type: "add",
        content: nLine,
        newLineNumber: newIdx++,
      });
    } else if (nLine === undefined && oLine !== undefined) {
      deletions++;
      lines.push({
        type: "delete",
        content: oLine,
        oldLineNumber: oldIdx++,
      });
    } else if (oLine !== nLine) {
      deletions++;
      lines.push({
        type: "delete",
        content: oLine,
        oldLineNumber: oldIdx++,
      });
      additions++;
      lines.push({
        type: "add",
        content: nLine,
        newLineNumber: newIdx++,
      });
    } else {
      lines.push({
        type: "context",
        content: oLine,
        oldLineNumber: oldIdx++,
        newLineNumber: newIdx++,
      });
    }
  }

  return { additions, deletions, lines };
}

// Generate a random 40-character pseudo git hash
export function generateGitHash(): string {
  const chars = "0123456789abcdef";
  let hash = "";
  for (let i = 0; i < 40; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}
