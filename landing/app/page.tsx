"use client";
import { useState } from "react";
import Navbar from "@/components/raksha/Navbar";
import HeroDfr, { MissionVisual } from "@/components/raksha/HeroDfr";
import PainpointsAdvantages from "@/components/raksha/PainpointsAdvantages";
import SpecsGrid from "@/components/raksha/SpecsGrid";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drone } from "lucide-react";

export default function Home() {
  const [modal, setModal] = useState<"login" | null>(null);
  const dashboardHref = process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3000";
  return (
    <>
      <Navbar onLogin={() => setModal("login")} dashboardHref={dashboardHref} />
      <main id="main">
        <HeroDfr />
        <PainpointsAdvantages />
        <MissionVisual />
        <SpecsGrid />
        <section className="dashboard-cta wrap" id="dashboard" aria-label="Launch Dashboard">
          <a className="button dark dashboard-launch" href={dashboardHref}>
            Launch Dashboard
          </a>
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
