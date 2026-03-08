import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronLeft, ChevronRight, Plus, Trash2, Save, Package,
  Instagram, Loader2, Search, Upload, Image as ImageIcon,
} from "lucide-react";
import type { AiPost, AiPostSlide } from "@/hooks/useAiPosts";
import { useUpdateAiPost } from "@/hooks/useAiPosts";
import CarouselSlide from "./CarouselSlide";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PostEditorProps {
  post: AiPost;
  onClose: () => void;
}

const ACCENT_PRESETS = ["#6366f1", "#06b6d4", "#f97316", "#22c55e", "#ec4899", "#ef4444", "#8b5cf6", "#eab308"];

/* ── Auto-grow textarea ── */
const AutoGrow = ({
  value, onChange, placeholder, className = "",
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string;
}) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "0";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      className={`w-full bg-transparent resize-none outline-none border-none overflow-hidden transition-colors ${className}`}
    />
  );
};

/* ── Image Search Popover ── */
const ImageSearchPopover = ({
  onSelect, onClose, loading, images, onSearch,
}: {
  onSelect: (url: string) => void;
  onClose: () => void;
  loading: boolean;
  images: { url: string; title: string }[];
  onSearch: (q: string) => void;
}) => {
  const [query, setQuery] = useState("");
  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.97 }}
      className="absolute z-30 top-full mt-2 left-0 right-0 bg-popover border border-border rounded-xl shadow-xl p-3 space-y-2"
      style={{ maxHeight: 360, overflowY: "auto" }}
    >
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Search Images</p>
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && query.trim() && onSearch(query.trim())}
          placeholder="Search for relevant images..."
          className="flex-1 bg-muted/50 rounded-lg px-3 py-2 text-xs outline-none"
          autoFocus
        />
        <button
          onClick={() => query.trim() && onSearch(query.trim())}
          disabled={loading || !query.trim()}
          className="px-3 py-1.5 text-[10px] rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50 flex items-center gap-1"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
          {loading ? "Searching..." : "Search"}
        </button>
      </div>
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => onSelect(img.url)}
              className="relative rounded-lg overflow-hidden group h-20 border border-border/30 hover:border-primary/50 transition-colors"
            >
              <img src={img.url} alt={img.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }} />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-[9px] font-medium">Use this</span>
              </div>
            </button>
          ))}
        </div>
      )}
      <div className="flex justify-end">
        <button onClick={onClose} className="px-3 py-1 text-[10px] rounded-lg text-muted-foreground hover:bg-muted">
          Cancel
        </button>
      </div>
    </motion.div>
  );
};

const PostEditor = ({ post, onClose }: PostEditorProps) => {
  const [title, setTitle] = useState(post.title);
  const [summary, setSummary] = useState(post.summary || "");
  const [hashtags, setHashtags] = useState(post.hashtags.join(", "));
  const [slides, setSlides] = useState<AiPostSlide[]>(post.slides || []);
  const [activeSlide, setActiveSlide] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [imageSearchLoading, setImageSearchLoading] = useState(false);
  const [imageSearchResults, setImageSearchResults] = useState<{ url: string; title: string }[]>([]);
  const updatePost = useUpdateAiPost();
  const slideRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentSlide = slides[activeSlide];

  const updateSlide = (field: string, value: any) => {
    setSlides((prev) =>
      prev.map((s, i) => (i === activeSlide ? { ...s, [field]: value } : s))
    );
  };

  const addSlide = () => {
    const newSlide: AiPostSlide = {
      type: "news", headline: "New Slide", bullets: ["Point 1"],
      accent_color: ACCENT_PRESETS[slides.length % ACCENT_PRESETS.length],
    };
    setSlides((prev) => [...prev.slice(0, -1), newSlide, ...prev.slice(-1)]);
    setActiveSlide(slides.length - 1);
  };

  const removeSlide = (index: number) => {
    if (slides.length <= 2) return;
    setSlides((prev) => prev.filter((_, i) => i !== index));
    setActiveSlide((p) => Math.min(p, slides.length - 2));
  };

  const handleSave = async () => {
    await updatePost.mutateAsync({
      id: post.id, title, summary,
      hashtags: hashtags.split(",").map((t) => t.trim().replace(/^#/, "")),
      slides: slides as any, status: "draft",
    } as any);
    toast.success("Post saved as draft");
  };

  const renderSlideForExport = async (slideIndex: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      setActiveSlide(slideIndex);
      setTimeout(async () => {
        if (!slideRef.current) return reject("No ref");
        try { resolve(await toPng(slideRef.current, { pixelRatio: 3 })); }
        catch (e) { reject(e); }
      }, 300);
    });
  };

  const handleExportZip = async () => {
    if (!slideRef.current) return;
    setExporting(true);
    const originalSlide = activeSlide;
    try {
      const zip = new JSZip();
      const imgFolder = zip.folder("slides")!;
      for (let i = 0; i < slides.length; i++) {
        const dataUrl = await renderSlideForExport(i);
        imgFolder.file(`slide-${String(i + 1).padStart(2, "0")}.png`, dataUrl.split(",")[1], { base64: true });
      }
      const hashtagStr = hashtags.split(",").map((t) => `#${t.trim().replace(/^#/, "")}`).join(" ");
      const captionContent = [
        `Title: ${title}`, "", `Caption:`, summary, "", `Hashtags:`, hashtagStr, "", `Slides:`,
        ...slides.map((s, i) => {
          let text = `\n--- Slide ${i + 1} (${s.type}) ---\nHeadline: ${s.headline}`;
          if (s.subheadline) text += `\nSubheadline: ${s.subheadline}`;
          if (s.bullets?.length) text += `\nBullets:\n${s.bullets.map((b) => `  - ${b}`).join("\n")}`;
          if (s.source) text += `\nSource: ${s.source}`;
          return text;
        }),
        "", `Source URLs:`, ...(post.source_urls || []).map((u) => `  ${u}`),
        "", `Generated: ${new Date(post.created_at).toISOString()}`,
      ].join("\n");
      zip.file("caption.txt", captionContent);
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `${title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 40)}_slides.zip`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      setActiveSlide(originalSlide);
      toast.success("Exported zip with all slides and caption!");
    } catch (e) {
      console.error("Export error:", e);
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const handlePublishToInstagram = async () => {
    setPublishing(true);
    try {
      const imageDataUrls: string[] = [];
      for (let i = 0; i < slides.length; i++) imageDataUrls.push(await renderSlideForExport(i));
      const hashtagStr = hashtags.split(",").map((t) => `#${t.trim().replace(/^#/, "")}`).join(" ");
      const { data, error } = await supabase.functions.invoke("publish-to-instagram", {
        body: { post_id: post.id, caption: `${summary}\n\n${hashtagStr}`, image_data: imageDataUrls },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      await updatePost.mutateAsync({ id: post.id, status: "posted", posted_at: new Date().toISOString() } as any);
      toast.success("Published to Instagram!");
    } catch (e: any) {
      toast.error(e.message || "Failed to publish");
    } finally {
      setPublishing(false);
      setActiveSlide(0);
    }
  };

  /* ── Firecrawl Image Search ── */
  const handleImageSearch = async (query: string) => {
    setImageSearchLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-slide-image", { body: { query } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setImageSearchResults(data?.images || []);
      if (!data?.images?.length) toast.info("No images found, try a different query");
    } catch (e: any) {
      toast.error(e.message || "Image search failed");
    } finally {
      setImageSearchLoading(false);
    }
  };

  const handleSelectImage = (url: string) => {
    updateSlide("image_url", url);
    setShowImageSearch(false);
    setImageSearchResults([]);
    toast.success("Image updated!");
  };

  /* ── File upload — use object URL, no base64 ── */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    updateSlide("image_url", objectUrl);
    toast.success("Image replaced!");
    e.target.value = "";
  };

  const getImageLabel = (url: string) => {
    if (!url) return "";
    if (url.startsWith("data:image")) return "Embedded image";
    if (url.startsWith("blob:")) return "Uploaded image";
    try { return new URL(url).hostname; } catch { return "Image"; }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 top-12 z-50 bg-background rounded-t-3xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border">
          <h2 className="text-sm font-bold tracking-tight text-muted-foreground uppercase">Edit Post</h2>
          <div className="flex items-center gap-2">
            <button onClick={handleExportZip} disabled={exporting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-xs font-medium hover:bg-muted/80 transition-colors disabled:opacity-50">
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Package className="w-3.5 h-3.5" />}
              {exporting ? "Exporting..." : "Export Zip"}
            </button>
            <button onClick={handlePublishToInstagram} disabled={publishing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Instagram className="w-3.5 h-3.5" />}
              {publishing ? "Publishing..." : "Publish"}
            </button>
            <button onClick={handleSave} disabled={updatePost.isPending}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              <Save className="w-3.5 h-3.5" /> {updatePost.isPending ? "Saving..." : "Save"}
            </button>
            <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* ─── Preview ─── */}
          <div className="flex-1 flex flex-col items-center justify-center bg-black/50 p-6">
            <div ref={slideRef}>
              {currentSlide && <CarouselSlide slide={currentSlide} index={activeSlide} total={slides.length} />}
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button onClick={() => setActiveSlide((p) => Math.max(0, p - 1))} disabled={activeSlide === 0}
                className="p-2 rounded-full bg-white/10 text-white disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex gap-2">
                {slides.map((_, i) => (
                  <button key={i} onClick={() => setActiveSlide(i)}
                    className={`w-8 h-8 rounded-lg text-xs font-mono transition-all ${i === activeSlide ? "bg-primary text-primary-foreground" : "bg-white/10 text-white/50 hover:bg-white/20"}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
              <button onClick={() => setActiveSlide((p) => Math.min(slides.length - 1, p + 1))} disabled={activeSlide === slides.length - 1}
                className="p-2 rounded-full bg-white/10 text-white disabled:opacity-30">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ─── Editor Panel ─── */}
          <div className="w-[380px] border-l border-border overflow-y-auto p-5 space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">Title</label>
              <AutoGrow value={title} onChange={setTitle} className="text-sm font-semibold border-b border-border/30 focus-within:border-primary/50 pb-1" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">Caption</label>
              <AutoGrow value={summary} onChange={setSummary} placeholder="Write an engaging caption..." className="text-xs text-muted-foreground border-b border-border/30 focus-within:border-primary/50 pb-1" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">Hashtags</label>
              <AutoGrow value={hashtags} onChange={setHashtags} placeholder="ai, machinelearning, tech" className="text-xs text-muted-foreground border-b border-border/30 focus-within:border-primary/50 pb-1" />
            </div>

            <div className="h-px bg-border/50" />

            {currentSlide && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    Slide {activeSlide + 1} / {slides.length} -- {currentSlide.type}
                  </h3>
                  <div className="flex gap-1">
                    <button onClick={addSlide} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    {slides.length > 2 && (
                      <button onClick={() => removeSlide(activeSlide)} className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Headline */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Headline</label>
                  <AutoGrow value={currentSlide.headline} onChange={(v) => updateSlide("headline", v)} className="text-sm font-semibold" />
                </div>

                {(currentSlide.type === "cover" || currentSlide.type === "cta") && (
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Subheadline</label>
                    <AutoGrow value={currentSlide.subheadline || ""} onChange={(v) => updateSlide("subheadline", v)} className="text-xs text-muted-foreground" />
                  </div>
                )}

                {currentSlide.type === "news" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Source</label>
                      <AutoGrow value={currentSlide.source || ""} onChange={(v) => updateSlide("source", v)} placeholder="Source name" className="text-xs text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Bullets</label>
                      {(currentSlide.bullets || []).map((b, i) => (
                        <div key={i} className="flex gap-2 items-start group">
                          <span className="text-muted-foreground text-xs mt-0.5 shrink-0">--</span>
                          <AutoGrow value={b} onChange={(v) => {
                            const nb = [...(currentSlide.bullets || [])]; nb[i] = v; updateSlide("bullets", nb);
                          }} className="text-xs flex-1" />
                          <button onClick={() => updateSlide("bullets", (currentSlide.bullets || []).filter((_, j) => j !== i))}
                            className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => updateSlide("bullets", [...(currentSlide.bullets || []), ""])} className="text-[10px] text-primary hover:underline">
                        + Add bullet
                      </button>
                    </div>
                  </>
                )}

                <div className="h-px bg-border/30" />

                {/* ─── Image Section ─── */}
                <div className="space-y-2 relative">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">Slide Image</label>

                  {currentSlide.image_url ? (
                    <div className="space-y-2">
                      <div className="relative rounded-lg overflow-hidden group">
                        <img src={currentSlide.image_url} alt="" className="w-full h-24 object-cover rounded-lg"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button onClick={() => { setShowImageSearch(true); setImageSearchResults([]); }}
                            className="p-2 rounded-lg bg-white/20 text-white text-[10px] flex items-center gap-1 hover:bg-white/30">
                            <Search className="w-3 h-3" /> Find New
                          </button>
                          <button onClick={() => fileInputRef.current?.click()}
                            className="p-2 rounded-lg bg-white/20 text-white text-[10px] flex items-center gap-1 hover:bg-white/30">
                            <Upload className="w-3 h-3" /> Upload
                          </button>
                          <button onClick={() => updateSlide("image_url", "")}
                            className="p-2 rounded-lg bg-white/20 text-white text-[10px] flex items-center gap-1 hover:bg-white/30">
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        </div>
                      </div>
                      <p className="text-[9px] text-muted-foreground/40 truncate">{getImageLabel(currentSlide.image_url)}</p>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => { setShowImageSearch(true); setImageSearchResults([]); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-lg border border-dashed border-border/50 text-[10px] text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">
                        <Search className="w-3.5 h-3.5" /> Search Images
                      </button>
                      <button onClick={() => fileInputRef.current?.click()}
                        className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-lg border border-dashed border-border/50 text-[10px] text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">
                        <Upload className="w-3.5 h-3.5" /> Upload
                      </button>
                    </div>
                  )}

                  {/* Paste URL — hide raw base64/blob */}
                  <input
                    value={currentSlide.image_url?.startsWith("data:") || currentSlide.image_url?.startsWith("blob:") ? "" : (currentSlide.image_url || "")}
                    onChange={(e) => updateSlide("image_url", e.target.value)}
                    placeholder="Or paste image URL..."
                    className="w-full bg-transparent text-[10px] text-muted-foreground/50 outline-none border-none"
                  />

                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

                  <AnimatePresence>
                    {showImageSearch && (
                      <ImageSearchPopover
                        loading={imageSearchLoading}
                        images={imageSearchResults}
                        onSearch={handleImageSearch}
                        onSelect={handleSelectImage}
                        onClose={() => setShowImageSearch(false)}
                      />
                    )}
                  </AnimatePresence>
                </div>

                <div className="h-px bg-border/30" />

                {/* Accent color */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Accent Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {ACCENT_PRESETS.map((c) => (
                      <button key={c} onClick={() => updateSlide("accent_color", c)}
                        className={`w-6 h-6 rounded-full transition-transform ${currentSlide.accent_color === c ? "scale-125 ring-2 ring-ring ring-offset-2 ring-offset-background" : "hover:scale-110"}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default PostEditor;