import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import type { AiPost } from "@/hooks/useAiPosts";
import PostCard from "./PostCard";
import CarouselPreviewModal from "./CarouselPreviewModal";

interface PostGalleryProps {
  posts: AiPost[];
  onEdit: (post: AiPost) => void;
}

const FILTERS = ["all", "pending", "approved", "rejected"] as const;

const PostGallery = ({ posts, onEdit }: PostGalleryProps) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [previewPost, setPreviewPost] = useState<AiPost | null>(null);

  const filtered = useMemo(() => {
    let result = posts;
    if (statusFilter !== "all") result = result.filter((p) => p.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        p.title.toLowerCase().includes(q) || p.summary?.toLowerCase().includes(q)
      );
    }
    return [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [posts, statusFilter, search]);

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full bg-card border border-border/50 rounded-full pl-9 pr-4 py-2 text-xs outline-none focus:border-border transition-colors"
          />
        </div>
        <div className="flex items-center gap-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] transition-all ${
                statusFilter === f
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Posts grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-xs">No posts match your filters</p>
        </div>
      ) : (
        <motion.div layout className="grid gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((post) => (
              <PostCard key={post.id} post={post} onEdit={onEdit} onPreview={setPreviewPost} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {previewPost && (
          <CarouselPreviewModal post={previewPost} onClose={() => setPreviewPost(null)} onEdit={onEdit} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostGallery;
