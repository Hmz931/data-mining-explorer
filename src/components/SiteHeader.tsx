import { Link, NavLink } from "react-router-dom";
import { BookOpen } from "lucide-react";

const nav = [
  { to: "/", label: "Accueil" },
  { to: "/data-mining", label: "Data Mining" },
  { to: "/about", label: "À propos" },
];

export const SiteHeader = () => (
  <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border">
    <div className="container flex items-center justify-between h-16">
      <Link to="/" className="flex items-center gap-2.5 group">
        <div className="w-9 h-9 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-serif text-lg font-bold shadow-ink group-hover:-translate-y-0.5 transition-transform">
          ε
        </div>
        <div className="leading-tight">
          <div className="font-serif font-semibold text-primary">ESB · Analytics</div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Carnet pédagogique</div>
        </div>
      </Link>
      <nav className="hidden md:flex items-center gap-1 text-sm">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === "/"}
            className={({ isActive }) =>
              `px-3 py-2 rounded-md transition ${
                isActive
                  ? "text-accent font-medium"
                  : "text-foreground/70 hover:text-primary hover:bg-secondary"
              }`
            }
          >
            {n.label}
          </NavLink>
        ))}
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="ml-2 inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border hover:bg-secondary transition"
        >
          <BookOpen className="w-3.5 h-3.5" /> GitHub
        </a>
      </nav>
    </div>
  </header>
);
