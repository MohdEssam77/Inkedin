import { forwardRef, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw, Copy, Check, Loader2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface SliderConfig {
  key: string;
  leftLabel: string;
  rightLabel: string;
}

const SLIDERS: SliderConfig[] = [
  { key: "professional", leftLabel: "Professional", rightLabel: "Friendly" },
  { key: "serious", leftLabel: "Serious", rightLabel: "Casual" },
  { key: "short", leftLabel: "Short", rightLabel: "Detailed" },
  { key: "safe", leftLabel: "Safe", rightLabel: "Bold" },
  { key: "personal", leftLabel: "Personal", rightLabel: "Corporate" },
];

const ROLES = [
  "CEO", "CTO", "Founder", "Student", "Professor", "Marketer", "Recruiter", "Software Engineer",
];

const generatePost = (
  topic: string,
  sliders: Record<string, number>,
  toggles: Record<string, boolean>,
  role: string,
  _profileUrl: string
): string => {
  const friendly = sliders.professional > 5;
  const casual = sliders.serious > 5;
  const detailed = sliders.short > 5;
  const bold = sliders.safe > 5;
  const corporate = sliders.personal > 5;

  const hooks = [
    `Most people get ${topic} completely wrong.`,
    `I spent years learning about ${topic}. Here's what I wish someone told me earlier.`,
    `Hot take: ${topic} is about to change everything.`,
    `Here's an unpopular opinion about ${topic}.`,
    `The truth about ${topic} that nobody talks about.`,
  ];

  const hook = toggles.hook ? hooks[Math.floor(Math.random() * hooks.length)] + "\n\n" : "";

  let body = "";
  if (corporate) {
    body += `As a ${role}, I've seen firsthand how ${topic} impacts our industry. `;
    body += bold
      ? `It's time we stop playing it safe and embrace what's coming.`
      : `We need to thoughtfully consider the implications and opportunities.`;
  } else {
    body += friendly
      ? `I've been thinking a lot about ${topic} lately, and I wanted to share some thoughts. `
      : `Let me share my professional perspective on ${topic}. `;
    body += casual
      ? `No corporate fluff — just real talk.`
      : `Here's a structured breakdown of what I've observed.`;
  }

  if (detailed) {
    body += `\n\nHere are 3 key takeaways:\n\n`;
    body += `1️⃣ Understanding the fundamentals is crucial. Without a solid foundation, everything else falls apart.\n\n`;
    body += `2️⃣ Execution beats perfection every single time. Start before you're ready.\n\n`;
    body += `3️⃣ The people you surround yourself with matter more than the strategy you pick.`;
  } else {
    body += ` The key insight? Focus on what matters and cut the noise.`;
  }

  const emojis = toggles.emojis ? " 🚀💡" : "";
  const cta = toggles.cta
    ? `\n\n${bold ? "Drop your thoughts below 👇 Let's debate." : "What's your take? I'd love to hear your perspective in the comments."}`
    : "";

  return `${hook}${body}${emojis}${cta}`;
};

const PostGenerator = forwardRef<HTMLDivElement>((_, ref) => {
  const [topic, setTopic] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [role, setRole] = useState("CEO");
  const [sliders, setSliders] = useState<Record<string, number>>(
    Object.fromEntries(SLIDERS.map((s) => [s.key, 5]))
  );
  const [toggles, setToggles] = useState({ emojis: true, hook: true, cta: true });
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic or idea");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setResult(generatePost(topic, sliders, toggles, role, profileUrl));
      setLoading(false);
    }, 1200);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section ref={ref} className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-10">
            Generate your post
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              {/* Topic */}
              <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
                <Label className="text-sm font-semibold text-foreground">Topic or idea</Label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Why remote work is the future of productivity..."
                  className="w-full h-24 rounded-xl bg-surface-elevated border border-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />

                <Label className="text-sm font-semibold text-foreground">LinkedIn profile URL (optional)</Label>
                <input
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/yourname"
                  className="w-full rounded-xl bg-surface-elevated border border-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />

                <Label className="text-sm font-semibold text-foreground">Poster identity</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="rounded-xl bg-surface-elevated">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Toggles */}
              <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Options</h3>
                {(["emojis", "hook", "cta"] as const).map((key) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground capitalize">
                      {key === "cta" ? "Add CTA at the end" : key === "hook" ? "Add hook at the beginning" : "Include emojis"}
                    </Label>
                    <Switch
                      checked={toggles[key]}
                      onCheckedChange={(v) => setToggles((p) => ({ ...p, [key]: v }))}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Sliders */}
            <div className="rounded-2xl bg-card border border-border p-6 space-y-5">
              <h3 className="text-sm font-semibold text-foreground">Tone & Style</h3>
              {SLIDERS.map((s) => (
                <div key={s.key} className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{s.leftLabel}</span>
                    <span>{s.rightLabel}</span>
                  </div>
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[sliders[s.key]]}
                    onValueChange={([v]) => setSliders((p) => ({ ...p, [s.key]: v }))}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Generate Buttons */}
          <div className="flex justify-center gap-3 mt-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleGenerate}
              disabled={loading}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-shadow disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {result ? "Regenerate" : "Generate"}
            </motion.button>
          </div>

          {/* Result */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-8 rounded-2xl bg-card border border-border p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Your LinkedIn Post</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleGenerate}
                    className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
                    title="Regenerate"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
                    title="Copy"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {result}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
});

PostGenerator.displayName = "PostGenerator";

export default PostGenerator;
