export interface GitCommit {
  hash: string;
  shortHash: string;
  message: string;
  author: string;
  authorEmail: string;
  timestamp: number;
  branch: string;
  filesChanged: {
    filename: string;
    additions: number;
    deletions: number;
  }[];
  htmlSnapshot: string;
  cssSnapshot: string;
}

export interface GitFileChange {
  filename: "styles.css" | "index.html" | string;
  status: "modified" | "added" | "deleted";
  additions: number;
  deletions: number;
  previousContent: string;
  currentContent: string;
}

export interface GitBranch {
  name: string;
  isCurrent: boolean;
  lastCommitHash: string;
  lastCommitMessage: string;
}
