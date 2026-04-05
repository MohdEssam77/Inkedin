import { forwardRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Loader2,
  Key,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  buildPrompt,
  callGemini,
  getApiKey,
  RateLimitError,
} from "@/lib/gemini";

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
  "CEO",
  "CTO",
  "Founder",
  "Student",
  "Professor",
  "Marketer",
  "Recruiter",
  "Software Engineer",
];

type Phase = "idle" | "loading" | "follow-up" | "done" | "rate-limited";

const PostGenerator = forwardRef<HTMLDivElement>((_, ref) => {
  const [topic, setTopic] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [role, setRole] = useState("CEO");
  const [sliders, setSliders] = useState<Record<string, number>>(
    Object.fromEntries(SLIDERS.map((s) => [s.key, 5]))
  );
  const [toggles, setToggles] = useState({ emojis: true, hook: true, cta: true });

  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  // Follow-up questions state
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);

  // API key state
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [userApiKey, setUserApiKey] = useState(
    () => localStorage.getItem("gemini_api_key") ?? ""
  );
  const [keyDraft, setKeyDraft] = useState(
    () => localStorage.getItem("gemini_api_key") ?? ""
  );

  const saveApiKey = () => {
    const trimmed = keyDraft.trim();
    localStorage.setItem("gemini_api_key", trimmed);
    setUserApiKey(trimmed);
    setKeyDraft(trimmed);
    toast.success("API key saved!");
    setShowKeyInput(false);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic or idea");
      return;
    }
    setPhase("loading");
    setResult("");
    setQuestions([]);
    setAnswers([]);

    try {
      const prompt = buildPrompt(topic, role, sliders, toggles);
      const response = await callGemini(prompt, getApiKey());

      if (response.needsMoreInfo === true) {
        setQuestions(response.questions);
        setAnswers(response.questions.map(() => ""));
        setPhase("follow-up");
      } else if (response.needsMoreInfo === false) {
        setResult(response.post);
        setPhase("done");
      }
    } catch (err) {
      if (err instanceof RateLimitError) {
        setPhase("rate-limited");
      } else {
        setPhase("idle");
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    }
  };

  const handleSubmitAnswers = async () => {
    const followUpAnswers = questions.map((q, i) => ({
      question: q,
      answer: answers[i] ?? "",
    }));

    setPhase("loading");

    try {
      const prompt = buildPrompt(topic, role, sliders, toggles, followUpAnswers);
      const response = await callGemini(prompt, getApiKey());

      if (response.needsMoreInfo === true) {
        setQuestions(response.questions);
        setAnswers(response.questions.map(() => ""));
        setPhase("follow-up");
      } else if (response.needsMoreInfo === false) {
        setResult(response.post);
        setPhase("done");
      }
    } catch (err) {
      if (err instanceof RateLimitError) {
        setPhase("rate-limited");
      } else {
        setPhase("follow-up");
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const isLoading = phase === "loading";

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
                  placeholder="e.g. I just won first place at a hackathon..."
                  className="w-full h-24 rounded-xl bg-surface-elevated border border-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />

                <Label className="text-sm font-semibold text-foreground">
                  LinkedIn profile URL (optional)
                </Label>
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
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
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
                      {key === "cta"
                        ? "Add CTA at the end"
                        : key === "hook"
                        ? "Add hook at the beginning"
                        : "Include emojis"}
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
                    onValueChange={([v]) =>
                      setSliders((p) => ({ ...p, [s.key]: v }))
                    }
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* API Key Settings */}
          <div className="mt-6">
            <button
              onClick={() => setShowKeyInput((v) => !v)}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto"
            >
              <Key className="w-3.5 h-3.5" />
              {userApiKey ? "API key saved" : "Use your own API key"}
              <ChevronRight
                className={`w-3.5 h-3.5 transition-transform ${showKeyInput ? "rotate-90" : ""}`}
              />
            </button>

            <AnimatePresence>
              {showKeyInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 rounded-2xl bg-card border border-border p-5 space-y-3">
                    <Label className="text-sm font-semibold text-foreground">
                      Your Gemini API Key
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Your key is stored only in your browser — never sent to our servers.
                    </p>

                    <div className="rounded-xl bg-muted/50 border border-border p-4 space-y-2">
                      <p className="text-xs font-semibold text-foreground">How to get a free key:</p>
                      <ol className="space-y-1.5">
                        {[
                          <>Open <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-primary underline font-medium">aistudio.google.com/apikey</a> and sign in with Google</>,
                          <>Click <span className="font-medium text-foreground">"Create API key"</span></>,
                          <>Select or create a project when prompted</>,
                          <>Copy the key and paste it in the field below</>,
                        ].map((step, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <span className="flex-shrink-0 w-4 h-4 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-bold mt-0.5">
                              {i + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={keyDraft}
                        onChange={(e) => setKeyDraft(e.target.value)}
                        placeholder="AIza..."
                        className="flex-1 rounded-xl bg-surface-elevated border border-input px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <button
                        onClick={saveApiKey}
                        className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center gap-3 mt-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleGenerate}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-shadow disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              {isLoading ? "Thinking..." : phase === "done" ? "Regenerate" : "Generate"}
            </motion.button>
          </div>

          <AnimatePresence mode="wait">
            {/* Follow-up Questions */}
            {phase === "follow-up" && (
              <motion.div
                key="follow-up"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="mt-8 rounded-2xl bg-card border border-border p-6 space-y-5"
              >
                <div>
                  <h3 className="font-semibold text-foreground text-base">
                    A few more details 💬
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    The AI needs a bit more context to write a great post for you.
                  </p>
                </div>

                <div className="space-y-4">
                  {questions.map((q, i) => (
                    <div key={i} className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">
                        {i + 1}. {q}
                      </Label>
                      <textarea
                        value={answers[i]}
                        onChange={(e) =>
                          setAnswers((prev) => {
                            const next = [...prev];
                            next[i] = e.target.value;
                            return next;
                          })
                        }
                        placeholder="Your answer..."
                        rows={2}
                        className="w-full rounded-xl bg-surface-elevated border border-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSubmitAnswers}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md shadow-primary/20 hover:shadow-lg transition-shadow"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate Post
                  </motion.button>
                  <button
                    onClick={() => setPhase("idle")}
                    className="px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Skip
                  </button>
                </div>
              </motion.div>
            )}

            {/* Rate Limit Guide */}
            {phase === "rate-limited" && (
              <motion.div
                key="rate-limited"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 space-y-4"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Daily limit reached
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      The shared API key has hit its daily quota. Get your own free key
                      in under 2 minutes:
                    </p>
                  </div>
                </div>

                <ol className="space-y-2 pl-2">
                  {[
                    <>Go to <strong>aistudio.google.com</strong> and sign in with Google</>,
                    <>Click <strong>"Get API key"</strong> → <strong>"Create API key"</strong></>,
                    "Copy the generated key",
                    <>Click the <strong>🔑 key icon</strong> above, paste it, and hit Save</>,
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-center justify-center font-semibold">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>

                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors"
                >
                  Get Free API Key
                  <ExternalLink className="w-4 h-4" />
                </a>
              </motion.div>
            )}

            {/* Generated Post Result */}
            {phase === "done" && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="mt-8 rounded-2xl bg-card border border-border p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Your LinkedIn Post</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleRegenerate}
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
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
});

PostGenerator.displayName = "PostGenerator";

export default PostGenerator;
