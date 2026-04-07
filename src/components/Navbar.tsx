import { Pen } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import PostHistory from "./PostHistory";

const Navbar = () => (
  <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
    <div className="container mx-auto flex items-center justify-between h-16 px-4">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
          <Pen className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-display font-bold text-xl text-foreground">InkedIn</span>
      </div>
      <div className="flex items-center gap-2">
        <PostHistory />
        <ThemeToggle />
      </div>
    </div>
  </nav>
);

export default Navbar;
