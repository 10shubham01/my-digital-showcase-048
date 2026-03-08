import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Brain, FileText, CheckCircle, Loader2, Search, Sparkles } from "lucide-react";

interface Step {
  id: string;
  label: string;
  detail: string;
  icon: React.ReactNode;
  duration: number; // ms to stay on this step
}

const STEPS: Step[] = [
  {
    id: "scrape",
    label: "Scraping the web",
    detail: "Searching for the latest AI & tech news across multiple sources...",
    icon: <Globe className="w-5 h-5" />,
    duration: 4000,
  },
  {
    id: "analyze",
    label: "Analyzing articles",
    detail: "Reading and extracting key insights from scraped content...",
    icon: <Search className="w-5 h-5" />,
    duration: 3000,
  },
  {
    id: "thinking",
    label: "AI is crafting your post",
    detail: "Generating engaging headlines, bullet points, and slide layouts...",
    icon: <Brain className="w-5 h-5" />,
    duration: 5000,
  },
  {
    id: "slides",
    label: "Building carousel slides",
    detail: "Structuring cover, news slides, and call-to-action...",
    icon: <FileText className="w-5 h-5" />,
    duration: 3000,
  },
  {
    id: "saving",
    label: "Saving to your studio",
    detail: "Storing the post for your review...",
    icon: <Sparkles className="w-5 h-5" />,
    duration: 2000,
  },
];

interface GenerationProgressProps {
  isGenerating: boolean;
  isSuccess: boolean;
  onComplete: () => void;
}

const GenerationProgress = ({ isGenerating, isSuccess, onComplete }: GenerationProgressProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!isGenerating) {
      setCurrentStep(0);
      setCompleted(false);
      return;
    }

    let stepIndex = 0;
    const advanceStep = () => {
      if (stepIndex < STEPS.length - 1) {
        stepIndex++;
        setCurrentStep(stepIndex);
        setTimeout(advanceStep, STEPS[stepIndex].duration);
      }
    };

    const timer = setTimeout(advanceStep, STEPS[0].duration);
    return () => clearTimeout(timer);
  }, [isGenerating]);

  useEffect(() => {
    if (isSuccess && isGenerating) {
      setCurrentStep(STEPS.length - 1);
      setCompleted(true);
      const timer = setTimeout(onComplete, 1200);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, isGenerating, onComplete]);

  if (!isGenerating) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md mx-4"
      >
        <div className="bg-card rounded-3xl border border-border p-8 space-y-8">
          {/* Current step highlight */}
          <div className="text-center space-y-3">
            <motion.div
              key={currentStep}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-primary"
            >
              {completed ? (
                <CheckCircle className="w-7 h-7 text-emerald-400" />
              ) : (
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  {STEPS[currentStep].icon}
                </motion.div>
              )}
            </motion.div>
            <motion.h3
              key={`label-${currentStep}`}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-lg font-bold"
            >
              {completed ? "Post Generated!" : STEPS[currentStep].label}
            </motion.h3>
            <motion.p
              key={`detail-${currentStep}`}
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-xs text-muted-foreground leading-relaxed"
            >
              {completed ? "Your new post is ready for review." : STEPS[currentStep].detail}
            </motion.p>
          </div>

          {/* Step timeline */}
          <div className="space-y-3">
            {STEPS.map((step, i) => {
              const isActive = i === currentStep && !completed;
              const isDone = i < currentStep || completed;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-primary/10 border border-primary/20"
                      : isDone
                      ? "bg-muted/30"
                      : "opacity-40"
                  }`}
                >
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    {isDone ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : isActive ? (
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isActive ? "text-foreground" : isDone ? "text-muted-foreground" : "text-muted-foreground/50"
                    }`}
                  >
                    {step.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GenerationProgress;
