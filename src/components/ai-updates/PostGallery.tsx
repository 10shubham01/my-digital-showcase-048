import { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
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

    return [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [posts, statusFilter, search]);

  // Group posts by date
  const grouped = useMemo(() => {
    const groups: Record<string, AiPost[]> = {};
    for (const post of filtered) {
      const date = new Date(post.created_at).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(post);
    }
    return Object.entries(groups);
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="w-full bg-muted/50 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-1 focus:ring-ring transition-all"
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
      </div>

      {/* Timeline feed */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-sm">No posts found</p>
        </div>
      ) : (
        <div className="max-w-3xl">
          {grouped.map(([date, datePosts]) => (
            <div key={date}>
              {/* Date header */}
              <div className="flex items-center gap-3 mb-4 mt-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.15em]">
                  {date}
                </span>
                <div className="flex-1 h-px bg-border/50" />
              </div>

              {/* Posts for this date */}
              <AnimatePresence>
                {datePosts.map((post) => (
                  <PostCard key={post.id} post={post} onEdit={onEdit} onPreview={setPreviewPost} />
                ))}
              </AnimatePresence>
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
