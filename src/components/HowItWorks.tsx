import { motion } from "framer-motion";
import { PenLine, SlidersHorizontal, Wand2 } from "lucide-react";

const steps = [
  {
    icon: PenLine,
    title: "Enter your topic",
    desc: "Type a topic, idea, or key message you want to share on LinkedIn.",
  },
  {
    icon: SlidersHorizontal,
    title: "Customize the tone",
    desc: "Use sliders and toggles to fine-tune the style, personality, and format of your post.",
  },
  {
    icon: Wand2,
    title: "Generate & copy",
    desc: "Hit generate, review your AI-crafted post, and copy it to share on LinkedIn.",
  },
];

const HowItWorks = () => (
  <section className="py-16 md:py-20 bg-surface-elevated">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
          How it works
        </h2>
        <p className="text-muted-foreground">Three simple steps to a great LinkedIn post</p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="rounded-2xl bg-card border border-border p-6 text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-accent text-accent-foreground flex items-center justify-center mx-auto mb-4">
              <step.icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
