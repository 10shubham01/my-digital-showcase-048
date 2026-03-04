import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Terminal, Eye, EyeOff } from "lucide-react";

interface TerminalLoginProps {
  onLogin: (email: string, password: string) => Promise<{ error: any }>;
  onSignUp: (email: string, password: string) => Promise<{ error: any }>;
}

const TerminalLogin = ({ onLogin, onSignUp }: TerminalLoginProps) => {
  const [lines, setLines] = useState<{ text: string; type: "system" | "input" | "error" | "success" }[]>([
    { text: "▸ SHUBHAM_OS v4.0.1 — Private Terminal", type: "system" },
    { text: "▸ Access restricted. Authenticate to continue.", type: "system" },
    { text: "", type: "system" },
  ]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState<"email" | "password" | "processing">("email");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [step]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [lines]);

  const addLine = (text: string, type: "system" | "input" | "error" | "success") => {
    setLines((prev) => [...prev, { text, type }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "processing" || !input.trim()) return;

    // Save to history (only email step, not passwords)
    if (step === "email") {
      setHistory((prev) => [input, ...prev].slice(0, 50));
    }
    setHistoryIdx(-1);

    if (step === "email") {
      addLine(`$ email: ${input}`, "input");
      setEmail(input);
      setInput("");
      setStep("password");
      addLine("▸ Enter passphrase:", "system");
    } else if (step === "password") {
      addLine(`$ pass: ${"•".repeat(input.length)}`, "input");
      addLine("▸ Authenticating...", "system");
      setStep("processing");
      const password = input;
      setInput("");

      const fn = isSignUp ? onSignUp : onLogin;
      const { error } = await fn(email, password);

      if (error) {
        addLine(`✗ ${error.message}`, "error");
        setStep("email");
        addLine("", "system");
        addLine("▸ Try again. Enter email:", "system");
      } else {
        addLine("✓ Access granted. Welcome back.", "success");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (step !== "email") return;
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(historyIdx + 1, history.length - 1);
      setHistoryIdx(next);
      if (history[next]) setInput(history[next]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = historyIdx - 1;
      if (next < 0) {
        setHistoryIdx(-1);
        setInput("");
      } else {
        setHistoryIdx(next);
        setInput(history[next]);
      }
    }
  };

  const prompt = step === "email" ? "▸ Enter email:" : step === "password" ? "" : "▸ Processing...";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl"
      >
        {/* Terminal window */}
        <div className="rounded-xl border border-border overflow-hidden shadow-2xl">
          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive/70" />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(var(--accent-orange) / 0.7)" }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(var(--accent-green) / 0.7)" }} />
            </div>
            <div className="flex-1 text-center">
              <span className="text-xs font-mono text-muted-foreground flex items-center justify-center gap-1.5">
                <Lock className="w-3 h-3" /> private-terminal
              </span>
            </div>
          </div>

          {/* Terminal body */}
          <div
            ref={scrollRef}
            className="bg-background p-5 h-80 overflow-y-auto font-mono text-sm space-y-1"
          >
            <AnimatePresence>
              {lines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={
                    line.type === "error"
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }
                  style={
                    line.type === "success"
                      ? { color: "hsl(var(--accent-green))" }
                      : line.type === "input"
                      ? { color: "hsl(var(--accent-cyan))" }
                      : {}
                  }
                >
                  {line.text || "\u00A0"}
                </motion.div>
              ))}
            </AnimatePresence>

            {step !== "processing" && (
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <span style={{ color: "hsl(var(--accent-pop))" }}>$</span>
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type={step === "password" && !showPassword ? "password" : "text"}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent outline-none text-foreground font-mono"
                    style={{ caretColor: "hsl(var(--accent-pop))" }}
                    autoFocus
                    placeholder={step === "email" ? "you@email.com" : "••••••••"}
                  />
                </div>
                {step === "password" && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-border bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Terminal className="w-3.5 h-3.5" />
              <span>Secure shell · ↑↓ history</span>
            </div>
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setLines([
                  { text: `▸ Mode: ${!isSignUp ? "REGISTER" : "LOGIN"}`, type: "system" },
                  { text: "▸ Enter email:", type: "system" },
                ]);
                setStep("email");
                setInput("");
              }}
              className="text-xs hover:text-foreground transition-colors"
              style={{ color: "hsl(var(--accent-blue))" }}
            >
              {isSignUp ? "← Back to login" : "First time? Register →"}
            </button>
          </div>
        </div>

        {/* Hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-xs text-muted-foreground mt-4"
        >
          {prompt}
        </motion.p>
      </motion.div>
    </div>
  );
};

export default TerminalLogin;
