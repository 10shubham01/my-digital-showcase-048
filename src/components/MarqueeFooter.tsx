import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, forwardRef } from "react";
import { Github, Linkedin, Mail, ExternalLink, X, Send } from "lucide-react";

const socials = [
  { icon: Github, label: "GitHub", href: "https://github.com/10shubham01", color: "accent-orange" },
  { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/10shubham01", color: "accent-blue" },
  { icon: Mail, label: "Email", href: "mailto:shubhamedu.01@gmail.com", color: "accent-green", isEmail: true },
];

const MarqueeFooter = forwardRef<HTMLElement>((_, ref) => {
  const [emailModal, setEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({
    subject: "Hey Shubham — Let's Build Something Awesome 🚀",
    body: "Hi Shubham,\n\nI stumbled upon your portfolio and I'm genuinely impressed by your work. The way you blend clean code with creative design is exactly what we're looking for.\n\nI'd love to chat about a potential collaboration — whether it's a freelance project, a full-time role, or just geeking out over code.\n\nLet me know when you're free for a quick call!\n\nCheers,\n[Your Name]"
  });

  const line1 = "FRONTEND DEVELOPER • FULL-STACK ENGINEER • UI/UX ENTHUSIAST • ";
  const line2 = "REACT • VUE • NEXT.JS • TYPESCRIPT • NODE.JS • AWS • ";
  const repeated1 = line1.repeat(4);
  const repeated2 = line2.repeat(4);

  const handleEmailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setEmailModal(true);
  };

  const handleSendEmail = () => {
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=shubhamedu.01@gmail.com&su=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
    window.open(gmailUrl, "_blank");
    setEmailModal(false);
  };

  return (
    <footer ref={ref} className="relative min-h-[60vh] flex flex-col justify-center overflow-hidden border-t border-border bg-background">
      {/* Marquee lines */}
      <div className="space-y-6 py-16">
        <motion.div
          animate={{ x: [0, -2400] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap"
        >
          <span className="font-display italic text-6xl md:text-8xl lg:text-9xl text-foreground/[0.06] tracking-tight">
            {repeated1}
          </span>
        </motion.div>

        <motion.div
          animate={{ x: [-2400, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap"
        >
          <span className="font-heading text-5xl md:text-7xl lg:text-8xl text-foreground/[0.04] tracking-[0.2em] uppercase">
            {repeated2}
          </span>
        </motion.div>

        <motion.div
          animate={{ x: [0, -2000] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap"
        >
          <span className="font-display italic text-6xl md:text-8xl lg:text-9xl text-foreground/[0.06] tracking-tight">
            {repeated1}
          </span>
        </motion.div>
      </div>

      {/* Footer bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 lg:px-24 py-6 border-t border-border flex items-center justify-between">
        <p className="text-xs font-mono text-muted-foreground tracking-wider">
          © {new Date().getFullYear()} <span className="text-foreground">Shubham Gupta</span>
        </p>

        {/* Social icons */}
        <div className="flex items-center gap-4">
          {socials.map((s) => (
            <motion.a
              key={s.label}
              href={s.href}
              onClick={s.isEmail ? handleEmailClick : undefined}
              target={s.isEmail ? undefined : "_blank"}
              rel="noopener noreferrer"
              whileHover={{ scale: 1.15, y: -2 }}
              whileTap={{ scale: 0.9 }}
              className={`group relative w-9 h-9 flex items-center justify-center border border-border hover:border-${s.color}/40 hover:bg-${s.color}/10 transition-all duration-300`}
              title={s.label}
            >
              <s.icon size={16} className={`text-muted-foreground group-hover:text-${s.color} transition-colors`} />
              <span className={`absolute -bottom-5 text-[9px] font-mono text-${s.color} opacity-0 group-hover:opacity-100 transition-opacity tracking-wider`}>
                {s.label}
              </span>
            </motion.a>
          ))}
        </div>

        {/* Quick links */}
        <div className="hidden md:flex items-center gap-6">
          {["About", "Experience", "Contact"].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-[10px] font-mono text-muted-foreground hover:text-foreground tracking-widest uppercase transition-colors story-link"
            >
              {link}
            </a>
          ))}
        </div>
      </div>

      {/* Email Compose Modal */}
      <AnimatePresence>
        {emailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm px-4"
            onClick={() => setEmailModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", bounce: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg border border-accent-green/20 bg-card shadow-[0_0_60px_-15px_hsl(var(--accent-green)/0.15)]"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-accent-green" />
                  <span className="text-xs font-mono text-foreground tracking-wider uppercase">New Message</span>
                </div>
                <button onClick={() => setEmailModal(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X size={14} />
                </button>
              </div>

              {/* To field */}
              <div className="px-5 py-2 border-b border-border/50 flex items-center gap-3">
                <span className="text-[10px] font-mono text-muted-foreground tracking-wider">TO</span>
                <span className="text-xs font-mono text-accent-green">shubhamedu.01@gmail.com</span>
              </div>

              {/* Subject */}
              <div className="px-5 py-2 border-b border-border/50">
                <input
                  type="text"
                  placeholder="Subject..."
                  value={emailData.subject}
                  onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full bg-transparent text-sm font-body text-foreground placeholder:text-muted-foreground/40 outline-none"
                />
              </div>

              {/* Body */}
              <div className="px-5 py-4">
                <textarea
                  placeholder="Write your message..."
                  rows={6}
                  value={emailData.body}
                  onChange={(e) => setEmailData(prev => ({ ...prev, body: e.target.value }))}
                  className="w-full bg-transparent text-sm font-body text-foreground placeholder:text-muted-foreground/40 outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Actions */}
              <div className="px-5 py-3 border-t border-border flex items-center justify-between">
                <button
                  onClick={() => setEmailModal(false)}
                  className="text-[10px] font-mono text-muted-foreground hover:text-foreground tracking-wider uppercase transition-colors"
                >
                  Discard
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSendEmail}
                  className="flex items-center gap-2 bg-accent-green/10 hover:bg-accent-green/20 border border-accent-green/30 text-accent-green px-4 py-2 text-xs font-mono tracking-widest uppercase transition-all duration-300"
                >
                  <Send size={12} />
                  Send
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
});

MarqueeFooter.displayName = "MarqueeFooter";

export default MarqueeFooter;