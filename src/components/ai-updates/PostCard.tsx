import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Pencil, Trash2, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import type { AiPost } from "@/hooks/useAiPosts";
import { useUpdateAiPost, useDeleteAiPost } from "@/hooks/useAiPosts";
import CarouselSlide from "./CarouselSlide";
import { toast } from "sonner";

interface PostCardProps {
  post: AiPost;
  onEdit: (post: AiPost) => void;
  layout?: "grid" | "list";
}

const statusColors: Record<string, string> = {
  pending: "#f59e0b",
  approved: "#22c55e",
  rejected: "#ef4444",
  draft: "#6366f1",
};

const PostCard = ({ post, onEdit, layout = "grid" }: PostCardProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const updatePost = useUpdateAiPost();
  const deletePost = useDeleteAiPost();
  const slides = (post.slides || []) as any[];

  const handleApprove = () => {
    updatePost.mutate({ id: post.id, status: "approved" } as any);
    toast.success("Post approved!");
  };

  const handleReject = () => {
    updatePost.mutate({ id: post.id, status: "rejected" } as any);
    toast.info("Post rejected");
  };

  const handleDelete = () => {
    deletePost.mutate(post.id);
    toast.success("Post deleted");
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 transition-all duration-300"
    >
      {/* Slide preview */}
      <div className="relative bg-black flex items-center justify-center p-4">
        {slides.length > 0 && (
          <div className="transform scale-[0.85] origin-center">
            <CarouselSlide slide={slides[currentSlide]} index={currentSlide} total={slides.length} />
          </div>
        )}
        {slides.length > 1 && (
          <>
            <button
              onClick={() => setCurrentSlide((p) => Math.max(0, p - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/10 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              disabled={currentSlide === 0}
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => setCurrentSlide((p) => Math.min(slides.length - 1, p + 1))}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/10 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              disabled={currentSlide === slides.length - 1}
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </>
        )}
        {/* Status badge */}
        <div
          className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
          style={{
            backgroundColor: `${statusColors[post.status] || "#666"}22`,
            color: statusColors[post.status] || "#666",
            border: `1px solid ${statusColors[post.status] || "#666"}44`,
          }}
        >
          {post.status}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-sm leading-snug line-clamp-2">{post.title}</h3>
        {post.summary && <p className="text-xs text-muted-foreground line-clamp-2">{post.summary}</p>}

        {/* Hashtags */}
        {post.hashtags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.hashtags.slice(0, 4).map((tag) => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Date */}
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Clock className="w-3 h-3" />
          {new Date(post.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>

        {/* Actions */}
        {post.status === "pending" && (
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleApprove}
              disabled={updatePost.isPending}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
            >
              <Check className="w-3.5 h-3.5" /> Approve
            </button>
            <button
              onClick={() => onEdit(post)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={handleReject}
              disabled={updatePost.isPending}
              className="flex items-center justify-center p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {post.status !== "pending" && (
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onEdit(post)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-muted text-xs font-medium hover:bg-muted/80 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> View/Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deletePost.isPending}
              className="flex items-center justify-center p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PostCard;
