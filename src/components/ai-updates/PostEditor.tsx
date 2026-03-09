import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronLeft, ChevronRight, Plus, Trash2, Save, Package,
  Instagram, Loader2, Search, Upload, Image as ImageIcon,
  Palette, Type, FileText, Hash, Sparkles,
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
  onSelect, onClose, loading, images, onSearch, defaultQuery,
}: {
  onSelect: (url: string) => void;
  onClose: () => void;
  loading: boolean;
  images: { url: string; title: string }[];
  onSearch: (q: string) => void;
  defaultQuery?: string;
}) => {
  const [query, setQuery] = useState(defaultQuery || "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.97 }}
      className="absolute z-30 bottom-full mb-2 left-0 right-0 bg-popover border border-border rounded-xl shadow-xl p-3 space-y-2"
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
          {loading ? "..." : "Go"}
        </button>
      </div>

      {previewUrl && (
        <div className="space-y-2 border border-primary/30 rounded-lg p-2">
          <img src={previewUrl} alt="" className="w-full h-28 object-cover rounded-lg" />
          <div className="flex gap-2">
            <button onClick={() => onSelect(previewUrl)}
              className="flex-1 px-3 py-1.5 text-[10px] rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90">
              Use This
            </button>
            <button onClick={() => setPreviewUrl(null)}
              className="px-3 py-1.5 text-[10px] rounded-lg bg-muted text-muted-foreground hover:text-foreground">
              Back
            </button>
          </div>
        </div>
      )}

      {images.length > 0 && !previewUrl && (
        <div className="grid grid-cols-3 gap-1.5 mt-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setPreviewUrl(img.url)}
              className="relative rounded-lg overflow-hidden group h-16 border border-border/30 hover:border-primary/50 transition-colors"
            >
              <img src={img.url} alt={img.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }} />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-[8px] font-medium">Preview</span>
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

/* ── Editor Tab types ── */
type EditorTab = "content" | "slide" | "image" | "style";

const PostEditor = ({ post, onClose }: PostEditorProps) => {
  const [title, setTitle] = useState(post.title);
  const [summary, setSummary] = useState(post.summary || "");
  const [hashtags, setHashtags] = useState(post.hashtags.join(", "));
  const [slides, setSlides] = useState<AiPostSlide[]>(post.slides || []);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeTab, setActiveTab] = useState<EditorTab>("content");
  const [exporting, setExporting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [imageSearchLoading, setImageSearchLoading] = useState(false);
  const [imageSearchResults, setImageSearchResults] = useState<{ url: string; title: string }[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
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

  const getPostContext = () => {
    const parts = [title];
    if (summary) parts.push(summary);
    if (currentSlide?.headline) parts.push(currentSlide.headline);
    return parts.join(" ").slice(0, 200);
  };

  const handleImageSearch = async (query: string) => {
    setImageSearchLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-slide-image", {
        body: { query, context: getPostContext() },
      });
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploadingImage(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `${post.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("slide-images")
        .upload(path, file, { contentType: file.type, upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage
        .from("slide-images")
        .getPublicUrl(path);
      updateSlide("image_url", publicUrl);
      toast.success("Image uploaded!");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
      const objectUrl = URL.createObjectURL(file);
      updateSlide("image_url", objectUrl);
    } finally {
      setUploadingImage(false);
    }
  };

  const defaultSearchQuery = currentSlide?.headline || title || "";

  const tabs: { id: EditorTab; icon: any; label: string }[] = [
    { id: "content", icon: FileText, label: "Post" },
    { id: "slide", icon: Type, label: "Slide" },
    { id: "image", icon: ImageIcon, label: "Media" },
    { id: "style", icon: Palette, label: "Style" },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ type: "spring", damping: 28, stiffness: 350 }}
        className="fixed inset-4 md:inset-8 z-50 bg-card rounded-2xl overflow-hidden flex flex-col border border-border/50 shadow-2xl"
      >
        {/* ─── Header ─── */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/50 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-fire flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Edit Post</h2>
              <p className="text-[10px] text-muted-foreground">{slides.length} slides · {post.status}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExportZip} disabled={exporting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50 text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50">
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Package className="w-3.5 h-3.5" />}
              Export
            </button>
            <button onClick={handlePublishToInstagram} disabled={publishing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Instagram className="w-3.5 h-3.5" />}
              Publish
            </button>
            <button onClick={handleSave} disabled={updatePost.isPending}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
              <Save className="w-3.5 h-3.5" /> {updatePost.isPending ? "..." : "Save"}
            </button>
            <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ─── Preview Area (top) ─── */}
        <div className="flex-1 flex flex-col items-center justify-center bg-black/40 relative overflow-hidden min-h-0">
          {/* Subtle grid background */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }} />

          <div className="relative z-10 flex flex-col items-center gap-4 py-6">
            <div ref={slideRef}>
              {currentSlide && <CarouselSlide slide={currentSlide} index={activeSlide} total={slides.length} />}
            </div>

            {/* Slide navigation */}
            <div className="flex items-center gap-2">
              <button onClick={() => setActiveSlide((p) => Math.max(0, p - 1))} disabled={activeSlide === 0}
                className="p-1.5 rounded-lg bg-white/10 text-white disabled:opacity-20 hover:bg-white/20 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex gap-1.5 bg-white/5 rounded-lg p-1">
                {slides.map((_, i) => (
                  <button key={i} onClick={() => setActiveSlide(i)}
                    className={`w-7 h-7 rounded-md text-[10px] font-mono font-bold transition-all ${
                      i === activeSlide
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                        : "text-white/40 hover:text-white/70 hover:bg-white/10"
                    }`}>
                    {i + 1}
                  </button>
                ))}
              </div>
              <button onClick={() => setActiveSlide((p) => Math.min(slides.length - 1, p + 1))} disabled={activeSlide === slides.length - 1}
                className="p-1.5 rounded-lg bg-white/10 text-white disabled:opacity-20 hover:bg-white/20 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="w-px h-5 bg-white/10 mx-1" />
              <button onClick={addSlide} className="p-1.5 rounded-lg bg-white/10 text-white/50 hover:text-white hover:bg-white/20 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
              {slides.length > 2 && (
                <button onClick={() => removeSlide(activeSlide)} className="p-1.5 rounded-lg bg-white/10 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ─── Bottom Editor Panel ─── */}
        <div className="border-t border-border/50 bg-card">
          {/* Tabs */}
          <div className="flex items-center gap-0 px-4 border-b border-border/30">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-all border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-4 overflow-x-auto" style={{ maxHeight: 200 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                {/* Post tab */}
                {activeTab === "content" && (
                  <div className="flex gap-6">
                    <div className="flex-1 min-w-0 space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">Title</label>
                      <AutoGrow value={title} onChange={setTitle} className="text-sm font-semibold border-b border-border/30 focus-within:border-primary/50 pb-1" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">Caption</label>
                      <AutoGrow value={summary} onChange={setSummary} placeholder="Write a caption..." className="text-xs text-muted-foreground border-b border-border/30 focus-within:border-primary/50 pb-1" />
                    </div>
                    <div className="w-60 shrink-0 space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium flex items-center gap-1"><Hash className="w-3 h-3" /> Hashtags</label>
                      <AutoGrow value={hashtags} onChange={setHashtags} placeholder="ai, tech" className="text-xs text-muted-foreground border-b border-border/30 focus-within:border-primary/50 pb-1" />
                    </div>
                  </div>
                )}

                {/* Slide tab */}
                {activeTab === "slide" && currentSlide && (
                  <div className="flex gap-6">
                    <div className="flex-1 min-w-0 space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
                        Headline — Slide {activeSlide + 1} ({currentSlide.type})
                      </label>
                      <AutoGrow value={currentSlide.headline} onChange={(v) => updateSlide("headline", v)} className="text-sm font-semibold" />
                    </div>
                    {(currentSlide.type === "cover" || currentSlide.type === "cta") && (
                      <div className="flex-1 min-w-0 space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Subheadline</label>
                        <AutoGrow value={currentSlide.subheadline || ""} onChange={(v) => updateSlide("subheadline", v)} className="text-xs text-muted-foreground" />
                      </div>
                    )}
                    {currentSlide.type === "news" && (
                      <>
                        <div className="w-40 shrink-0 space-y-2">
                          <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Source</label>
                          <AutoGrow value={currentSlide.source || ""} onChange={(v) => updateSlide("source", v)} placeholder="Source" className="text-xs text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Bullets</label>
                          {(currentSlide.bullets || []).map((b, i) => (
                            <div key={i} className="flex gap-1.5 items-center group">
                              <span className="text-muted-foreground text-[10px] shrink-0">•</span>
                              <input
                                value={b}
                                onChange={(e) => {
                                  const nb = [...(currentSlide.bullets || [])]; nb[i] = e.target.value; updateSlide("bullets", nb);
                                }}
                                className="flex-1 bg-transparent text-xs outline-none border-b border-transparent focus:border-border/50"
                              />
                              <button onClick={() => updateSlide("bullets", (currentSlide.bullets || []).filter((_, j) => j !== i))}
                                className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          <button onClick={() => updateSlide("bullets", [...(currentSlide.bullets || []), ""])} className="text-[10px] text-primary hover:underline">
                            + Add
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Image tab */}
                {activeTab === "image" && currentSlide && (
                  <div className="flex gap-4 items-start relative">
                    {currentSlide.image_url && (
                      <div className="relative rounded-lg overflow-hidden group w-32 h-20 shrink-0">
                        <img src={currentSlide.image_url} alt="" className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        {uploadingImage && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Loader2 className="w-4 h-4 text-white animate-spin" />
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2 flex-wrap items-start">
                      <button onClick={() => { setShowImageSearch(true); setImageSearchResults([]); }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border/50 text-[10px] text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">
                        <Search className="w-3.5 h-3.5" /> Search
                      </button>
                      <button onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border/50 text-[10px] text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">
                        <Upload className="w-3.5 h-3.5" /> Upload
                      </button>
                      {currentSlide.image_url && (
                        <button onClick={() => updateSlide("image_url", "")}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-destructive/30 text-[10px] text-destructive/60 hover:border-destructive hover:text-destructive transition-colors">
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      )}
                      <input
                        value={currentSlide.image_url?.startsWith("data:") || currentSlide.image_url?.startsWith("blob:") ? "" : (currentSlide.image_url || "")}
                        onChange={(e) => updateSlide("image_url", e.target.value)}
                        placeholder="Or paste URL..."
                        className="flex-1 min-w-[200px] bg-muted/30 rounded-lg px-3 py-2 text-[10px] text-muted-foreground outline-none border border-border/30 focus:border-primary/30"
                      />
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

                    <AnimatePresence>
                      {showImageSearch && (
                        <ImageSearchPopover
                          loading={imageSearchLoading}
                          images={imageSearchResults}
                          onSearch={handleImageSearch}
                          onSelect={handleSelectImage}
                          onClose={() => setShowImageSearch(false)}
                          defaultQuery={defaultSearchQuery}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Style tab */}
                {activeTab === "style" && currentSlide && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-2 block">Accent Color</label>
                      <div className="flex gap-2">
                        {ACCENT_PRESETS.map((c) => (
                          <button key={c} onClick={() => updateSlide("accent_color", c)}
                            className={`w-7 h-7 rounded-full transition-all ${
                              currentSlide.accent_color === c
                                ? "scale-125 ring-2 ring-ring ring-offset-2 ring-offset-card"
                                : "hover:scale-110"
                            }`}
                            style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default PostEditor;
