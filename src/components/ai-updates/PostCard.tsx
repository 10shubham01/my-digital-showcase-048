import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Pencil, Trash2, Clock, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import type { AiPost, AiPostSlide } from "@/hooks/useAiPosts";
import { useUpdateAiPost, useDeleteAiPost } from "@/hooks/useAiPosts";
import CarouselSlide from "./CarouselSlide";
import { toast } from "sonner";

interface PostCardProps {
  post: AiPost;
  onEdit: (post: AiPost) => void;
  onPreview?: (post: AiPost) => void;
}

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  pending: { color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20", label: "Pending Review" },
  approved: { color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20", label: "Approved" },
  rejected: { color: "text-red-400", bg: "bg-red-400/10 border-red-400/20", label: "Rejected" },
  draft: { color: "text-indigo-400", bg: "bg-indigo-400/10 border-indigo-400/20", label: "Draft" },
};

const PostCard = ({ post, onEdit, onPreview }: PostCardProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const updatePost = useUpdateAiPost();
  const deletePost = useDeleteAiPost();
  const slides = (post.slides || []) as AiPostSlide[];
  const status = statusConfig[post.status] || statusConfig.draft;

  const handleApprove = (e: React.MouseEvent) => {
    e.stopPropagation();
    updatePost.mutate({ id: post.id, status: "approved" } as any);
    toast.success("Post approved!");
  };

  const handleReject = (e: React.MouseEvent) => {
    e.stopPropagation();
    updatePost.mutate({ id: post.id, status: "rejected" } as any);
    toast.info("Post rejected");
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deletePost.mutate(post.id);
    toast.success("Post deleted");
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="group"
    >
      {/* Timeline connector */}
      <div className="flex gap-5">
        {/* Left timeline rail */}
        <div className="flex flex-col items-center pt-1 shrink-0">
          <div className={`w-2.5 h-2.5 rounded-full border-2 ${status.bg} ${status.color}`} />
          <div className="w-px flex-1 bg-border/50 mt-1" />
        </div>

        {/* Content */}
        <div className="flex-1 pb-8 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-md border ${status.bg} ${status.color}`}>
              {status.label}
            </span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo(post.created_at)}
            </span>
          </div>

          {/* Main card */}
          <div
            onClick={() => onPreview?.(post)}
            className="bg-card rounded-2xl border border-border hover:border-primary/20 transition-all duration-300 cursor-pointer overflow-hidden"
          >
            {/* Horizontal layout: slides left, info right */}
            <div className="flex flex-col sm:flex-row">
              {/* Slide preview */}
              <div className="relative bg-black/50 flex items-center justify-center p-5 sm:w-[280px] shrink-0">
                {slides.length > 0 && (
                  <div className="transform scale-[0.72] origin-center">
                    <CarouselSlide slide={slides[currentSlide]} index={currentSlide} total={slides.length} />
                  </div>
                )}
                {slides.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); setCurrentSlide((p) => Math.max(0, p - 1)); }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                      disabled={currentSlide === 0}
                    >
                      <ChevronLeft className="w-3.5 h-3.5 text-white" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setCurrentSlide((p) => Math.min(slides.length - 1, p + 1)); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                      disabled={currentSlide === slides.length - 1}
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-white" />
                    </button>
                    {/* Slide dots */}
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                      {slides.map((_, i) => (
                        <button
                          key={i}
                          onClick={(e) => { e.stopPropagation(); setCurrentSlide(i); }}
                          className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentSlide ? "bg-white scale-125" : "bg-white/30"}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Info panel */}
              <div className="flex-1 p-5 flex flex-col min-w-0">
                <h3 className="font-bold text-base leading-snug mb-2 line-clamp-2">{post.title}</h3>
                {post.summary && (
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">{post.summary}</p>
                )}

                {/* Hashtags */}
                {post.hashtags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {post.hashtags.slice(0, 6).map((tag) => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Slide count + sources */}
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-4">
                  <span>{slides.length} slides</span>
                  {post.source_urls?.length > 0 && (
                    <>
                      <span className="w-px h-3 bg-border" />
                      <span className="flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        {post.source_urls.length} sources
                      </span>
                    </>
                  )}
                </div>

                {/* Actions - pushed to bottom */}
                <div className="mt-auto flex items-center gap-2">
                  {post.status === "pending" ? (
                    <>
                      <button
                        onClick={handleApprove}
                        disabled={updatePost.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(post); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={handleReject}
                        disabled={updatePost.isPending}
                        className="flex items-center justify-center p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors ml-auto"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(post); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-xs font-medium hover:bg-muted/80 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={deletePost.isPending}
                        className="flex items-center justify-center p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default PostCard;
