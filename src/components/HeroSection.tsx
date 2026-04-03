import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const HeroSection = ({ onGetStarted }: { onGetStarted: () => void }) => (
  <section className="relative overflow-hidden py-20 md:py-28">
    <div className="absolute inset-0 bg-gradient-to-br from-brand-light via-background to-background" />
    <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
    <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />

    <div className="container mx-auto px-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          Free AI-powered post generator
        </div>

        <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
          Craft LinkedIn posts that{" "}
          <span className="text-primary">stand out</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Generate engaging, professional LinkedIn posts in seconds. Customize the tone, style, and personality — no signup required.
        </p>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGetStarted}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
        >
          <Sparkles className="w-5 h-5" />
          Start generating
        </motion.button>
      </motion.div>
    </div>
  </section>
);

export default HeroSection;
