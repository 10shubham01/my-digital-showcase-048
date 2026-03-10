import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import type { AiPost, AiPostSlide } from "@/hooks/useAiPosts";
import { useUpdateAiPost, useDeleteAiPost } from "@/hooks/useAiPosts";
import CarouselSlide from "./CarouselSlide";
import { toast } from "sonner";

interface PostCardProps {
  post: AiPost;
  onEdit: (post: AiPost) => void;
  onPreview?: (post: AiPost) => void;
}

const statusStyles: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  approved: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  rejected: "bg-red-500/10 text-red-500 border-red-500/20",
  draft: "bg-muted text-muted-foreground border-border",
};

const PostCard = ({ post, onEdit, onPreview }: PostCardProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hovered, setHovered] = useState(false);
  const updatePost = useUpdateAiPost();
  const deletePost = useDeleteAiPost();
  const slides = (post.slides || []) as AiPostSlide[];

  const handleApprove = (e: React.MouseEvent) => {
    e.stopPropagation();
    updatePost.mutate({ id: post.id, status: "approved" } as any);
    toast.success("Approved");
  };

  const handleReject = (e: React.MouseEvent) => {
    e.stopPropagation();
    updatePost.mutate({ id: post.id, status: "rejected" } as any);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deletePost.mutate(post.id);
    toast.success("Deleted");
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onPreview?.(post)}
      className="group cursor-pointer rounded-2xl bg-card border border-border/60 hover:border-border overflow-hidden transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Slide preview */}
        <div className="relative bg-card flex items-center justify-center sm:w-[240px] shrink-0 overflow-hidden">
          <div className="p-4">
            {slides.length > 0 && (
              <div className="transform scale-[0.6] origin-center">
                <CarouselSlide slide={slides[currentSlide]} index={currentSlide} total={slides.length} />
              </div>
            )}
          </div>

          {slides.length > 1 && hovered && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setCurrentSlide((p) => Math.max(0, p - 1)); }}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-foreground/10 backdrop-blur-sm flex items-center justify-center transition-opacity"
                disabled={currentSlide === 0}
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setCurrentSlide((p) => Math.min(slides.length - 1, p + 1)); }}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-foreground/10 backdrop-blur-sm flex items-center justify-center transition-opacity"
                disabled={currentSlide === slides.length - 1}
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </>
          )}

          {/* Slide indicator */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`w-1 h-1 rounded-full transition-all ${i === currentSlide ? "bg-foreground scale-150" : "bg-foreground/20"}`}
              />
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 p-5 flex flex-col min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-bold text-sm leading-snug line-clamp-2 flex-1">{post.title}</h3>
            <span className={`text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full border shrink-0 ${statusStyles[post.status] || statusStyles.draft}`}>
              {post.status}
            </span>
          </div>

          {post.summary && (
            <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">{post.summary}</p>
          )}

          {post.hashtags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.hashtags.slice(0, 5).map((tag) => (
                <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-md bg-muted/50 text-muted-foreground">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground/60">{timeAgo(post.created_at)} ago · {slides.length} slides</span>

            <div className="flex items-center gap-1.5">
              {post.status === "pending" && (
                <>
                  <button onClick={handleApprove} className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-500 transition-colors">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={handleReject} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
              <button onClick={(e) => { e.stopPropagation(); onEdit(post); }} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={handleDelete} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500/60 hover:text-red-500 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PostCard;
