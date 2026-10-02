import { Link } from "react-router-dom";
import { useState } from "react";
import { Drone, Globe, ChevronDown, Menu, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
const links = [
  ["Platform", "platform"],
  ["How it works", "mission"],
  ["Advantages", "mission-specs"],
  ["Hardware", "hardware"],

];
export default function Navbar({
  onLogin,
  dashboardHref,
}: {
  onLogin: () => void;
  dashboardHref: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header>
        <div className="nav wrap">
          <a className="brand" href="#" aria-label="RakshaAI home">
            <Drone size={34} />
            <div>
              <strong>
                Raksha<span>AI</span>
              </strong>
              <small>Autonomous Disaster Intelligence</small>
            </div>
          </a>
          <nav aria-label="Main navigation">
            {links.map(([name, id]) => (
              <a href={"#" + id} key={id}>
                {name}
              </a>
            ))}
          </nav>
          <div className="utilities">
            <DropdownMenu>
              <DropdownMenuTrigger
                className="language"
                aria-label="Select language"
              >
                <Globe size={15} /> EN <ChevronDown size={13} />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>English · selected</DropdownMenuItem>
                <DropdownMenuItem disabled>
                  More languages coming soon
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button className="login" onClick={onLogin}>
              Login
            </button>
            <Link className="button dark launch" to={dashboardHref}>
              Launch Dashboard
            </Link>
            <button
              className="mobile-toggle"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {links.map(([name, id]) => (
              <a onClick={() => setOpen(false)} href={"#" + id} key={id}>
                {name}
              </a>
            ))}
            <Link to={dashboardHref} onClick={() => setOpen(false)}>
              Launch Dashboard
            </Link>
          </nav>
        )}
      </header>
    </>
  );
}
