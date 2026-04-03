import { Pen } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border py-8">
    <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
          <Pen className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-display font-bold text-foreground">InkedIn</span>
      </div>
      <p className="text-sm text-muted-foreground">
        Free AI LinkedIn post generator. No signup required.
      </p>
    </div>
  </footer>
);

export default Footer;
