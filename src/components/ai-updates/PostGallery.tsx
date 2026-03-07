import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Masonry from "react-masonry-css";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import type { AiPost } from "@/hooks/useAiPosts";
import PostCard from "./PostCard";

interface PostGalleryProps {
  posts: AiPost[];
  onEdit: (post: AiPost) => void;
}

const STATUS_FILTERS = ["all", "pending", "approved", "rejected", "draft"];

const PostGallery = ({ posts, onEdit }: PostGalleryProps) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "status">("date");

  const allHashtags = useMemo(() => {
    const tags = new Set<string>();
    posts.forEach((p) => p.hashtags?.forEach((t) => tags.add(t)));
    return Array.from(tags);
  }, [posts]);

  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

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

    if (selectedTags.size > 0) {
      result = result.filter((p) => p.hashtags.some((t) => selectedTags.has(t)));
    }

    if (sortBy === "date") {
      result = [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      result = [...result].sort((a, b) => a.status.localeCompare(b.status));
    }

    return result;
  }, [posts, statusFilter, search, selectedTags, sortBy]);

  return (
    <div className="space-y-6">
      {/* Filters bar */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts, hashtags..."
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

        {/* Hashtag pills */}
        {allHashtags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {allHashtags.slice(0, 20).map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setSelectedTags((prev) => {
                    const next = new Set(prev);
                    next.has(tag) ? next.delete(tag) : next.add(tag);
                    return next;
                  });
                }}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
                  selectedTags.has(tag)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Masonry Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-sm">No posts found</p>
        </div>
      ) : (
        <Masonry
          breakpointCols={{ default: 3, 1024: 2, 640: 1 }}
          className="flex -ml-4 w-auto"
          columnClassName="pl-4 bg-clip-padding"
        >
          {filtered.map((post) => (
            <div key={post.id} className="mb-4">
              <PostCard post={post} onEdit={onEdit} />
            </div>
          ))}
        </Masonry>
      )}
    </div>
  );
};

export default PostGallery;
