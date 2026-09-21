"use client";

import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileIcon, FolderIcon, FolderOpenIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type TreeViewElement = {
  id: string;
  name: string;
  type?: "file" | "folder";
  isSelectable?: boolean;
  children?: TreeViewElement[];
};

export type TreeSortMode =
  | "default"
  | "none"
  | ((a: TreeViewElement, b: TreeViewElement) => number);

export type TreeContextProps = {
  selectedId: string | undefined;
  expandedItems: string[] | undefined;
  indicator: boolean;
  handleExpand: (id: string) => void;
  selectItem: (id: string) => void;
  setExpandedItems?: React.Dispatch<React.SetStateAction<string[] | undefined>>;
  openIcon?: React.ReactNode;
  closeIcon?: React.ReactNode;
  direction: "rtl" | "ltr";
};

const TreeContext = createContext<TreeContextProps | null>(null);

export const useTree = () => {
  const context = useContext(TreeContext);
  if (!context) {
    throw new Error("useTree must be used within a TreeProvider");
  }
  return context;
};

const isFolderElement = (element: TreeViewElement) => {
  if (element.type) {
    return element.type === "folder";
  }
  return Array.isArray(element.children);
};

const mergeExpandedItems = (
  currentItems: string[] | undefined,
  nextItems: string[]
) => [...new Set([...(currentItems ?? []), ...nextItems])];

const treeCollator = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "base",
});

const defaultTreeComparator = (a: TreeViewElement, b: TreeViewElement) => {
  const aIsFolder = isFolderElement(a);
  const bIsFolder = isFolderElement(b);

  if (aIsFolder !== bIsFolder) {
    return aIsFolder ? -1 : 1;
  }

  return treeCollator.compare(a.name, b.name);
};

const getTreeComparator = (sort: TreeSortMode) => {
  if (sort === "none") return undefined;
  if (sort === "default") return defaultTreeComparator;
  return sort;
};

const sortTreeElements = (
  elements: TreeViewElement[],
  sort: TreeSortMode
): TreeViewElement[] => {
  const comparator = getTreeComparator(sort);

  const nextElements = elements.map((element) => {
    if (!Array.isArray(element.children)) {
      return element;
    }

    return {
      ...element,
      children: sortTreeElements(element.children, sort),
    };
  });

  if (!comparator) {
    return nextElements;
  }

  return [...nextElements].sort(comparator);
};

export const renderTreeElements = (
  elements: TreeViewElement[],
  sort: TreeSortMode = "default"
): React.ReactNode =>
  sortTreeElements(elements, sort).map((element) => {
    if (isFolderElement(element)) {
      return (
        <Folder
          key={element.id}
          value={element.id}
          element={element.name}
          isSelectable={element.isSelectable}
        >
          {Array.isArray(element.children)
            ? renderTreeElements(element.children, sort)
            : null}
        </Folder>
      );
    }

    return (
      <File
        key={element.id}
        value={element.id}
        isSelectable={element.isSelectable}
      >
        <span>{element.name}</span>
      </File>
    );
  });

export interface TreeViewProps extends React.HTMLAttributes<HTMLDivElement> {
  initialSelectedId?: string;
  indicator?: boolean;
  elements?: TreeViewElement[];
  initialExpandedItems?: string[];
  openIcon?: React.ReactNode;
  closeIcon?: React.ReactNode;
  sort?: TreeSortMode;
  dir?: "rtl" | "ltr";
}

export const Tree = forwardRef<HTMLDivElement, TreeViewProps>(
  (
    {
      className,
      elements,
      initialSelectedId,
      initialExpandedItems,
      children,
      indicator = true,
      openIcon,
      closeIcon,
      sort = "default",
      dir = "ltr",
      ...props
    },
    ref
  ) => {
    const [selectedId, setSelectedId] = useState<string | undefined>(
      initialSelectedId
    );
    const [expandedItems, setExpandedItems] = useState<string[] | undefined>(
      initialExpandedItems
    );

    const selectItem = useCallback((id: string) => {
      setSelectedId(id);
    }, []);

    const handleExpand = useCallback((id: string) => {
      setExpandedItems((prev) => {
        if (prev?.includes(id)) {
          return prev.filter((item) => item !== id);
        }
        return [...(prev ?? []), id];
      });
    }, []);

    const expandSpecificTargetedElements = useCallback(
      (elements?: TreeViewElement[], selectId?: string) => {
        if (!elements || !selectId) return;
        const findParent = (
          currentElement: TreeViewElement,
          currentPath: string[] = []
        ) => {
          const isSelectable = currentElement.isSelectable ?? true;
          const newPath = [...currentPath, currentElement.id];
          if (currentElement.id === selectId) {
            if (isSelectable) {
              setExpandedItems((prev) => mergeExpandedItems(prev, newPath));
            } else {
              if (newPath.includes(currentElement.id)) {
                newPath.pop();
                setExpandedItems((prev) => mergeExpandedItems(prev, newPath));
              }
            }
            return;
          }
          if (
            Array.isArray(currentElement.children) &&
            currentElement.children.length > 0
          ) {
            currentElement.children.forEach((child) => {
              findParent(child, newPath);
            });
          }
        };
        elements.forEach((element) => {
          findParent(element);
        });
      },
      []
    );

    useEffect(() => {
      if (initialSelectedId) {
        setSelectedId(initialSelectedId);
        expandSpecificTargetedElements(elements, initialSelectedId);
      }
    }, [initialSelectedId, elements, expandSpecificTargetedElements]);

    const direction = dir === "rtl" ? "rtl" : "ltr";
    const treeChildren =
      children ?? (elements ? renderTreeElements(elements, sort) : null);

    return (
      <TreeContext.Provider
        value={{
          selectedId,
          expandedItems,
          handleExpand,
          selectItem,
          setExpandedItems,
          indicator,
          openIcon,
          closeIcon,
          direction,
        }}
      >
        <div
          ref={ref}
          className={cn("w-full overflow-y-auto font-sans select-none", className)}
          dir={direction}
          {...props}
        >
          <div className="flex flex-col gap-0.5">{treeChildren}</div>
        </div>
      </TreeContext.Provider>
    );
  }
);

Tree.displayName = "Tree";

export const TreeIndicator = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { direction } = useTree();

  return (
    <div
      dir={direction}
      ref={ref}
      className={cn(
        "bg-hairline dark:bg-white/[0.08] absolute left-2 h-full w-px rounded-md py-1 duration-200 rtl:right-2",
        className
      )}
      {...props}
    />
  );
});

TreeIndicator.displayName = "TreeIndicator";

export interface FolderProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  element: React.ReactNode;
  isSelectable?: boolean;
  isSelect?: boolean;
  openIcon?: React.ReactNode;
  closeIcon?: React.ReactNode;
}

export const Folder = forwardRef<HTMLDivElement, FolderProps>(
  (
    {
      className,
      element,
      value,
      isSelectable = true,
      isSelect,
      openIcon: customOpenIcon,
      closeIcon: customCloseIcon,
      children,
      ...props
    },
    ref
  ) => {
    const {
      direction,
      handleExpand,
      expandedItems,
      indicator,
      selectedId,
      selectItem,
      openIcon,
      closeIcon,
    } = useTree();
    const isSelected = isSelect ?? selectedId === value;
    const isExpanded = expandedItems?.includes(value) ?? false;

    return (
      <div
        ref={ref}
        className="relative w-full overflow-hidden"
        {...props}
      >
        <div
          role="button"
          tabIndex={isSelectable ? 0 : -1}
          aria-disabled={!isSelectable}
          className={cn(
            "flex w-full items-center gap-2 rounded-[6px] px-2 py-1 text-[13px] text-label transition-colors select-none text-left",
            isSelected && isSelectable
              ? "bg-fill dark:bg-white/[0.08] font-medium"
              : "hover:bg-fill-2 dark:hover:bg-white/[0.04]",
            isSelectable ? "cursor-pointer" : "cursor-not-allowed opacity-50",
            className
          )}
          onClick={() => {
            selectItem(value);
            handleExpand(value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              selectItem(value);
              handleExpand(value);
            }
          }}
        >
          {isExpanded
            ? (customOpenIcon ?? openIcon ?? <FolderOpenIcon className="size-4 text-amber-500/80 dark:text-amber-400/80 shrink-0" />)
            : (customCloseIcon ?? closeIcon ?? <FolderIcon className="size-4 text-amber-500/80 dark:text-amber-400/80 shrink-0" />)}
          <span className="truncate flex-1 font-medium">{element}</span>
        </div>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="relative overflow-hidden"
            >
              {indicator && <TreeIndicator aria-hidden="true" />}
              <div
                dir={direction}
                className="ml-4 flex flex-col gap-0.5 py-0.5 rtl:mr-4"
              >
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Folder.displayName = "Folder";

export interface FileProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  handleSelect?: (id: string) => void;
  isSelectable?: boolean;
  isSelect?: boolean;
  fileIcon?: React.ReactNode;
}

export const File = forwardRef<HTMLButtonElement, FileProps>(
  (
    {
      value,
      className,
      handleSelect,
      onClick,
      isSelectable = true,
      isSelect,
      fileIcon,
      children,
      ...props
    },
    ref
  ) => {
    const { direction, selectedId, selectItem } = useTree();
    const isSelected = isSelect ?? selectedId === value;

    return (
      <button
        ref={ref}
        type="button"
        disabled={!isSelectable}
        className={cn(
          "flex w-full items-center gap-2 rounded-[6px] px-2 py-1 text-[13px] text-label duration-150 select-none text-left",
          isSelected && isSelectable
            ? "bg-fill dark:bg-white/[0.08] font-medium"
            : "hover:bg-fill-2 dark:hover:bg-white/[0.04]",
          isSelectable ? "cursor-pointer" : "cursor-not-allowed opacity-50",
          direction === "rtl" ? "rtl" : "ltr",
          className
        )}
        onClick={(event) => {
          selectItem(value);
          handleSelect?.(value);
          onClick?.(event);
        }}
        {...props}
      >
        {fileIcon ?? <FileIcon className="size-4 text-zinc-400 dark:text-zinc-500 shrink-0" />}
        <span className="truncate flex-1 text-left flex items-center justify-between">{children}</span>
      </button>
    );
  }
);

File.displayName = "File";

export default Tree;
