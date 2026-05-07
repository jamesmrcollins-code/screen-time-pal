import { Link } from "react-router-dom";

const LegalFooter = () => {
  return (
    <footer className="border-t border-border bg-background mt-12">
      <div className="max-w-5xl mx-auto px-6 py-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
        <span>&copy; {new Date().getFullYear()} ScreenTime Pal</span>
        <Link to="/pricing" className="hover:text-foreground hover:underline">Pricing</Link>
        <Link to="/privacy" className="hover:text-foreground hover:underline">Privacy</Link>
        <Link to="/terms" className="hover:text-foreground hover:underline">Terms</Link>
        <Link to="/refund" className="hover:text-foreground hover:underline">Refunds</Link>
        <a href="mailto:support@screentimepal.io" className="hover:text-foreground hover:underline">Support</a>
      </div>
    </footer>
  );
};

export default LegalFooter;