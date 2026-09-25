"use client";

import * as React from "react";
import {
  Braces,
  Check,
  Code2,
  FileCode,
  FileIcon,
  FilePlus,
  FileText,
  FolderIcon,
  FolderOpen,
  FolderOpenIcon,
  FolderPlus,
  Image as ImageIcon,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { Tree, Folder, File } from "@/components/ui/file-tree";
import { ConfirmMorph } from "@/components/arc/confirm-morph/confirm-morph";
import { cn } from "@/lib/utils";

export type SidebarFileId =
  | "styles.css"
  | "index.html"
  | "target.png"
  | "classroom.radar"
  | "leaderboard.rank"
  | "settings.config"
  | string;

export interface TreeItemNode {
  id: string;
  name: string;
  type: "file" | "folder";
  filePath?: string;
  isSystem?: boolean;
  children?: TreeItemNode[];
}

interface FileTreeSidebarProps {
  activeFile: SidebarFileId | null;
  onSelectFile: (file: SidebarFileId) => void;
  externalNodes?: TreeItemNode[] | null;
  workspaceTitle?: string;
  isExternalFolder?: boolean;
  onOpenFolder?: () => void;
  onResetWorkspace?: () => void;
  onClose?: () => void;
  onFileCreate?: (fileName: string, type: "file" | "folder", parentId: string, fullPath: string) => void;
  onFileDelete?: (fileId: string) => void;
  unusedCssPercent?: number;
  cleanScore?: number;
  linesCount?: number;
  maxLinesGoal?: number;
  liveStudents?: number;
  challengeTitle?: string;
}

const DEFAULT_NODES: TreeItemNode[] = [];

export function FileTreeSidebar({
  activeFile,
  onSelectFile,
  externalNodes,
  workspaceTitle,
  isExternalFolder = false,
  onOpenFolder,
  onResetWorkspace,
  onClose,
  onFileCreate,
  onFileDelete,
  unusedCssPercent = 0,
}: FileTreeSidebarProps) {
  // Internal nodes state (initialized with externalNodes if provided, else DEFAULT_NODES)
  const [internalNodes, setInternalNodes] = React.useState<TreeItemNode[]>(externalNodes || DEFAULT_NODES);

  React.useEffect(() => {
    if (externalNodes) {
      setInternalNodes(externalNodes);
    } else {
      setInternalNodes(DEFAULT_NODES);
    }
  }, [externalNodes]);

  // Effective nodes for rendering
  const projectNodes = internalNodes;

  // Inline creation state: parentId can be "root" or any folder ID
  const [creating, setCreating] = React.useState<{
    type: "file" | "folder";
    parentId: string;
  } | null>(null);
  const [newItemName, setNewItemName] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Focus input when creation mode starts
  React.useEffect(() => {
    if (creating) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [creating]);

  // Handle Start Creation (root or specific folder)
  const handleStartCreate = (type: "file" | "folder", parentId: string = "root") => {
    setCreating({ type, parentId });
    if (type === "file") {
      setNewItemName(parentId === "root" ? "README.md" : "yeni-bilesen.css");
    } else {
      setNewItemName("yeni-klasor");
    }
  };

  // Handle Confirm Creation
  const handleConfirmCreate = () => {
    const raw = newItemName.trim();
    if (!raw || !creating) {
      setCreating(null);
      return;
    }

    const parentId = creating.parentId;
    const type = creating.type;
    const newId = parentId === "root" ? raw : `${parentId}/${raw}`;

    const newNode: TreeItemNode = {
      id: newId,
      name: raw,
      type,
      filePath: newId,
      isSystem: false,
      children: type === "folder" ? [] : undefined,
    };

    // Helper to recursively add node to tree
    const addToTree = (nodes: TreeItemNode[]): TreeItemNode[] => {
      if (parentId === "root") {
        return [...nodes, newNode];
      }
      return nodes.map((node) => {
        if (node.id === parentId) {
          return {
            ...node,
            children: [...(node.children || []), newNode],
          };
        }
        if (node.children) {
          return {
            ...node,
            children: addToTree(node.children),
          };
        }
        return node;
      });
    };

    setInternalNodes((prev) => addToTree(prev));
    onFileCreate?.(raw, type, parentId, newId);

    if (type === "file") {
      onSelectFile(newId);
    }

    setCreating(null);
    setNewItemName("");
  };

  // Handle Delete Node
  const handleDeleteNode = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();

    const removeFromTree = (nodes: TreeItemNode[]): TreeItemNode[] => {
      return nodes
        .filter((n) => n.id !== id)
        .map((n) => ({
          ...n,
          children: n.children ? removeFromTree(n.children) : undefined,
        }));
    };

    setInternalNodes((prev) => removeFromTree(prev));
    onFileDelete?.(id);

    if (activeFile === id) {
      onSelectFile("styles.css");
    }
  };

  // Helper for file icon resolution
  const renderFileIcon = (name: string, id: string) => {
    const lower = name.toLowerCase();
    if (lower.endsWith(".css") || lower.endsWith(".scss") || lower.endsWith(".sass")) {
      return <Braces className="size-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />;
    }
    if (lower.endsWith(".html") || lower.endsWith(".htm")) {
      return <Code2 className="size-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />;
    }
    if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".svg") || lower.endsWith(".webp") || lower.endsWith(".gif")) {
      return <ImageIcon className="size-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />;
    }
    if (lower.endsWith(".js") || lower.endsWith(".ts") || lower.endsWith(".tsx") || lower.endsWith(".jsx") || lower.endsWith(".json")) {
      return <FileCode className="size-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />;
    }
    if (lower.endsWith(".md") || lower.endsWith(".txt") || lower.endsWith(".config") || lower.endsWith(".env")) {
      return <FileText className="size-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />;
    }
    return <FileIcon className="size-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />;
  };

  // Inline Creation Input Component
  const renderCreateInput = () => {
    if (!creating) return null;
    return (
      <div className="flex items-center gap-1.5 rounded-[6px] bg-surface dark:bg-white/[0.08] border border-tint/50 px-2 py-1 my-0.5 shadow-mac-xs z-10">
        {creating.type === "folder" ? (
          <FolderIcon className="size-3.5 text-amber-500/80 shrink-0" />
        ) : (
          <FileCode className="size-3.5 text-zinc-500 shrink-0" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleConfirmCreate();
            if (e.key === "Escape") setCreating(null);
          }}
          onBlur={handleConfirmCreate}
          placeholder={creating.type === "folder" ? "klasör-adı" : "dosya-adi.css"}
          className="flex-1 bg-transparent text-[11.5px] font-mono text-label outline-none"
        />
        <button
          type="button"
          onClick={handleConfirmCreate}
          className="text-emerald-600 hover:text-emerald-700"
          title="Onayla"
        >
          <Check className="size-3" />
        </button>
        <button
          type="button"
          onClick={() => setCreating(null)}
          className="text-label-3 hover:text-label"
          title="İptal"
        >
          <X className="size-3" />
        </button>
      </div>
    );
  };

  // Recursive Tree Node Renderer (Arbitrary Depth)
  const renderTreeNode = (node: TreeItemNode) => {
    if (node.type === "folder") {
      return (
        <Folder
          key={node.id}
          value={node.id}
          element={
            <div className="group/folder flex w-full items-center justify-between pr-1 min-w-0">
              <span className="truncate">{node.name}</span>
              {/* Folder quick action buttons on hover */}
              <div className="opacity-0 group-hover/folder:opacity-100 flex items-center gap-0.5 transition-opacity shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartCreate("file", node.id);
                  }}
                  title={`"${node.name}" içine dosya ekle`}
                  className="flex size-4.5 items-center justify-center rounded text-label-3 hover:text-label hover:bg-fill-2 transition-colors"
                >
                  <FilePlus className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartCreate("folder", node.id);
                  }}
                  title={`"${node.name}" içine klasör ekle`}
                  className="flex size-4.5 items-center justify-center rounded text-label-3 hover:text-label hover:bg-fill-2 transition-colors"
                >
                  <FolderPlus className="size-3" />
                </button>
                {!node.isSystem && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="flex items-center ml-0.5"
                  >
                    <ConfirmMorph
                      label=""
                      icon={<Trash2 className="size-3 text-rose-500" />}
                      prompt="Sil?"
                      cancelLabel="Vazgeç"
                      confirmLabel="Sil"
                      pendingLabel="Siliniyor..."
                      doneLabel="Silindi"
                      tone="danger"
                      confirmTimeout={6000}
                      resultTimeout={500}
                      className="file-tree-confirm"
                      onConfirm={async () => {
                        await new Promise((r) => setTimeout(r, 350));
                        setTimeout(() => {
                          handleDeleteNode(node.id);
                        }, 350);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          }
          openIcon={<FolderOpenIcon className="size-4 text-amber-500/80 dark:text-amber-400/80" />}
          closeIcon={<FolderIcon className="size-4 text-amber-500/80 dark:text-amber-400/80" />}
        >
          {/* Creation input if creating inside this folder */}
          {creating && creating.parentId === node.id && renderCreateInput()}

          {/* Child nodes */}
          {node.children && node.children.length > 0 ? (
            node.children.map((child) => renderTreeNode(child))
          ) : (
            <div className="pl-5 py-0.5 text-[10.5px] text-label-4 italic">Boş klasör</div>
          )}
        </Folder>
      );
    }

    // File Node
    return (
      <div key={node.id} className="group relative flex items-center min-w-0">
        <File
          value={node.id}
          isSelect={activeFile === node.id}
          fileIcon={renderFileIcon(node.name, node.id)}
          handleSelect={(id) => onSelectFile(id as SidebarFileId)}
          className="flex-1 pr-7"
        >
          <span className="truncate">{node.name}</span>
        </File>

        {!node.isSystem && (
          <div
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute right-1 z-20 flex items-center"
          >
            <ConfirmMorph
              label=""
              icon={<Trash2 className="size-3 text-rose-500" />}
              prompt="Sil?"
              cancelLabel="Vazgeç"
              confirmLabel="Sil"
              pendingLabel="Siliniyor..."
              doneLabel="Silindi"
              tone="danger"
              confirmTimeout={6000}
              resultTimeout={500}
              className="file-tree-confirm"
              onConfirm={async () => {
                await new Promise((r) => setTimeout(r, 350));
                setTimeout(() => {
                  handleDeleteNode(node.id);
                }, 350);
              }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col px-2 pb-3 font-mono select-none">
      {/* Explorer Action Toolbar (VS Code / Xcode style) */}
      <div className="flex h-7 items-center justify-between px-2 mb-1 border-b border-hairline/60">
        <div className="flex items-center gap-1.5 min-w-0 pr-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-label-3 truncate">
            {workspaceTitle || "Proje Gezgini"}
          </span>
          {isExternalFolder && (
            <span
              className="size-1.5 rounded-full bg-sys-blue shrink-0 animate-pulse"
              title="Yerel PC Klasörü Açık"
            />
          )}
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          {/* Add file at ROOT level (outside src) */}
          <button
            type="button"
            onClick={() => handleStartCreate("file", "root")}
            title="Kök Dizine Yeni Dosya Ekle"
            className="flex size-5.5 items-center justify-center rounded-[4px] text-label-3 hover:text-label hover:bg-fill-2 dark:hover:bg-white/[0.08] transition-colors"
          >
            <FilePlus className="size-3.5" />
          </button>

          {/* Add folder at ROOT level (outside src) */}
          <button
            type="button"
            onClick={() => handleStartCreate("folder", "root")}
            title="Kök Dizine Yeni Klasör Ekle"
            className="flex size-5.5 items-center justify-center rounded-[4px] text-label-3 hover:text-label hover:bg-fill-2 dark:hover:bg-white/[0.08] transition-colors"
          >
            <FolderPlus className="size-3.5" />
          </button>

          {/* Open Folder from PC (VS Code style) */}
          <button
            type="button"
            onClick={onOpenFolder}
            title="Bilgisayardan Klasör Aç (VS Code Open Folder)"
            className="flex size-5.5 items-center justify-center rounded-[4px] text-label-3 hover:text-tint hover:bg-tint/10 transition-colors"
          >
            <FolderOpen className="size-3.5" />
          </button>

          {/* Reset back to default PixelCut project */}
          {isExternalFolder && onResetWorkspace && (
            <button
              type="button"
              onClick={onResetWorkspace}
              title="Varsayılan PixelCut Projesine Dön"
              className="flex size-5.5 items-center justify-center rounded-[4px] text-label-3 hover:text-label hover:bg-fill-2 transition-colors"
            >
              <RotateCcw className="size-3" />
            </button>
          )}

          {/* Close Sidebar button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              title="Menüyü Kapat"
              className="flex size-5.5 items-center justify-center rounded-[4px] text-label-3 hover:text-label hover:bg-fill-2 transition-colors ml-0.5"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main File Tree Area using MagicUI FileTree */}
      <div className="flex-1 overflow-y-auto px-1 py-1">
        <Tree
          initialSelectedId={activeFile ?? undefined}
          initialExpandedItems={["src", "root", ...(projectNodes.map((n) => n.id))]}
          className="w-full text-[12px]"
        >
          {/* Inline creation at ROOT level (outside src) */}
          {creating && creating.parentId === "root" && renderCreateInput()}

          {/* Render all project nodes recursively */}
          {projectNodes.map((node) => renderTreeNode(node))}
        </Tree>

        {projectNodes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center px-3 space-y-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-well border border-hairline text-label-3">
              <FolderOpen className="size-6 text-label-3" />
            </div>
            <div className="space-y-1">
              <p className="text-[12px] font-medium text-label">Açık Klasör Yok</p>
              <p className="text-[11px] text-label-3 leading-relaxed">
                Dosyaları görmek ve düzenlemek için bir klasör açın.
              </p>
            </div>
            {onOpenFolder && (
              <button
                type="button"
                onClick={onOpenFolder}
                className="mac-btn mac-btn-secondary text-[11.5px] px-3 py-1.5 gap-1.5 shadow-mac-xs cursor-pointer"
              >
                <FolderOpen className="size-3.5" />
                <span>Klasör Aç</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default FileTreeSidebar;
