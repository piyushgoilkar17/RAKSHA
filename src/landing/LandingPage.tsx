import { Link } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";
import HeroDfr, { MissionVisual } from "./components/HeroDfr";
import PainpointsAdvantages from "./components/PainpointsAdvantages";
import SpecsGrid from "./components/SpecsGrid";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Drone } from "lucide-react";

export default function Home() {
  const [modal, setModal] = useState<"login" | null>(null);
  const dashboardHref = "/dashboard";
  return (
    <>
      <Navbar onLogin={() => setModal("login")} dashboardHref={dashboardHref} />
      <main id="main">
        <HeroDfr />
        <PainpointsAdvantages />
        <MissionVisual />
        <SpecsGrid />
        <section className="dashboard-cta wrap" id="dashboard" aria-label="Launch Dashboard">
          <Link className="button dark dashboard-launch" to={dashboardHref}>
            Launch Dashboard
          </Link>
        </section>
      </main>
      <footer>
        <div className="wrap footer-simple">
          <a className="brand" href="#" aria-label="RakshaAI home"><Drone /><strong>Raksha<span>AI</span></strong></a>
          <span>© 2026 RakshaAI</span>
        </div>
      </footer>
      <Dialog open={modal !== null} onOpenChange={(open) => !open && setModal(null)}>
        <DialogContent>
          <DialogTitle>Login</DialogTitle>
          <DialogDescription>
            Sign-in is not configured yet.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
}
