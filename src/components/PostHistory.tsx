import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, X, Copy, Check, Trash2, ChevronDown } from "lucide-react";
import {
  getHistory,
  clearHistory,
  formatTimestamp,
  type HistoryEntry,
} from "@/lib/history";

const PostHistory = () => {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = useCallback(() => setEntries(getHistory()), []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  // Reload when storage changes (e.g. new post generated)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "inkedin_post_history") load();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [load]);

  // Also expose a custom event so same-tab updates work
  useEffect(() => {
    const handler = () => load();
    window.addEventListener("inkedin:history-updated", handler);
    return () => window.removeEventListener("inkedin:history-updated", handler);
  }, [load]);

  const handleCopy = async (entry: HistoryEntry) => {
    await navigator.clipboard.writeText(entry.post);
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    clearHistory();
    setEntries([]);
    setExpandedId(null);
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-accent transition-colors relative"
        aria-label="Post history"
      >
        <History className="w-5 h-5" />
        {entries.length === 0 && open === false && (
          // Preload count on mount
          <span className="sr-only">History</span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <motion.div
              key="panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 h-full w-full max-w-md z-50 flex flex-col bg-background border-l border-border shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-muted-foreground" />
                  <h2 className="font-semibold text-foreground">Post History</h2>
                  {entries.length > 0 && (
                    <span className="text-xs bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full">
                      {entries.length}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {entries.length > 0 && (
                    <button
                      onClick={handleClear}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-lg hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear all
                    </button>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto py-3 px-4 space-y-2">
                {entries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-center pb-20">
                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                      <History className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground">No posts yet</p>
                    <p className="text-xs text-muted-foreground max-w-[200px]">
                      Your last 10 generated posts will appear here
                    </p>
                  </div>
                ) : (
                  entries.map((entry) => {
                    const isExpanded = expandedId === entry.id;
                    const isCopied = copiedId === entry.id;

                    return (
                      <div
                        key={entry.id}
                        className="rounded-xl border border-border bg-card overflow-hidden"
                      >
                        {/* Entry header — always visible */}
                        <button
                          onClick={() =>
                            setExpandedId(isExpanded ? null : entry.id)
                          }
                          className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <p className="text-sm font-medium text-foreground truncate">
                              {entry.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatTimestamp(entry.timestamp)}
                            </p>
                          </div>
                          <ChevronDown
                            className={`w-4 h-4 text-muted-foreground mt-0.5 shrink-0 transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {/* Expanded post content */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: "auto" }}
                              exit={{ height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                                  {entry.post}
                                </p>
                                <button
                                  onClick={() => handleCopy(entry)}
                                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
                                >
                                  {isCopied ? (
                                    <Check className="w-3.5 h-3.5" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                  {isCopied ? "Copied!" : "Copy post"}
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default PostHistory;
