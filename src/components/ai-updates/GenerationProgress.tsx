import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, FileText, CheckCircle, Loader2, Sparkles, Image } from "lucide-react";

interface Step {
  id: string;
  label: string;
  icon: React.ReactNode;
  duration: number;
}

const STEPS: Step[] = [
  { id: "thinking", label: "AI is curating news", icon: <Brain className="w-5 h-5" />, duration: 5000 },
  { id: "slides", label: "Crafting slide content", icon: <FileText className="w-5 h-5" />, duration: 4000 },
  { id: "images", label: "Generating images", icon: <Image className="w-5 h-5" />, duration: 6000 },
  { id: "saving", label: "Saving post", icon: <Sparkles className="w-5 h-5" />, duration: 2000 },
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
    if (!isGenerating) { setCurrentStep(0); setCompleted(false); return; }
    let step = 0;
    const advance = () => {
      if (step < STEPS.length - 1) { step++; setCurrentStep(step); setTimeout(advance, STEPS[step].duration); }
    };
    const t = setTimeout(advance, STEPS[0].duration);
    return () => clearTimeout(t);
  }, [isGenerating]);

  useEffect(() => {
    if (isSuccess && isGenerating) {
      setCurrentStep(STEPS.length - 1);
      setCompleted(true);
      const t = setTimeout(onComplete, 1000);
      return () => clearTimeout(t);
    }
  }, [isSuccess, isGenerating, onComplete]);

  if (!isGenerating) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-background/90 backdrop-blur-xl flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm mx-4 space-y-8"
      >
        {/* Current step */}
        <div className="text-center space-y-4">
          <motion.div
            key={currentStep}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center mx-auto"
          >
            {completed ? (
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            ) : (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                {STEPS[currentStep].icon}
              </motion.div>
            )}
          </motion.div>
          <motion.p
            key={`l-${currentStep}`}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-sm font-semibold"
          >
            {completed ? "Done" : STEPS[currentStep].label}
          </motion.p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 justify-center">
          {STEPS.map((step, i) => {
            const isDone = i < currentStep || completed;
            const isActive = i === currentStep && !completed;
            return (
              <div key={step.id} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  isDone ? "bg-emerald-500" : isActive ? "bg-foreground animate-pulse" : "bg-muted-foreground/20"
                }`} />
                {i < STEPS.length - 1 && (
                  <div className={`w-8 h-px transition-colors duration-500 ${isDone ? "bg-emerald-500/50" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GenerationProgress;
