import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import type { AiPost } from "@/hooks/useAiPosts";
import PostCard from "./PostCard";
import CarouselPreviewModal from "./CarouselPreviewModal";

interface PostGalleryProps {
  posts: AiPost[];
  onEdit: (post: AiPost) => void;
}

const STATUS_FILTERS = ["all", "pending", "approved", "rejected", "draft"];

const PostGallery = ({ posts, onEdit }: PostGalleryProps) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "status">("date");
  const [previewPost, setPreviewPost] = useState<AiPost | null>(null);

  const filtered = useMemo(() => {
    let result = posts;

    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.summary?.toLowerCase().includes(q) ||
          p.hashtags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (sortBy === "date") {
      result = [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      result = [...result].sort((a, b) => a.status.localeCompare(b.status));
    }

    return result;
  }, [posts, statusFilter, search, sortBy]);

  return (
    <div className="space-y-6">
      {/* Filters bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="w-full bg-muted/50 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-ring transition-all"
          />
        </div>
        <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSortBy(sortBy === "date" ? "status" : "date")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/50 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          {sortBy === "date" ? "By Date" : "By Status"}
        </button>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-sm">No posts found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((post) => (
            <div key={post.id}>
              <PostCard post={post} onEdit={onEdit} onPreview={setPreviewPost} />
            </div>
          ))}
        </div>
      )}

      {/* Carousel preview modal */}
      <AnimatePresence>
        {previewPost && (
          <CarouselPreviewModal
            post={previewPost}
            onClose={() => setPreviewPost(null)}
            onEdit={onEdit}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostGallery;
