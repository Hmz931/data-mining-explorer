import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Github, Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const nav = [
  { to: "/", label: "Accueil" },
  { to: "/data-mining", label: "Data Mining" },
  { to: "/about", label: "À propos" },
];

export const SiteHeader = () => {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/85 border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5 group min-w-0" onClick={() => setOpen(false)}>
          <img
            src="https://avatars.githubusercontent.com/Hmz931"
            alt="Hamza Bouguerra"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-accent/30 shadow-ink group-hover:-translate-y-0.5 transition-transform shrink-0"
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              img.outerHTML = '<div class="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-serif text-sm font-bold shadow-ink shrink-0">HB</div>';
            }}
          />
          <div className="leading-tight min-w-0">
            <div className="font-serif font-semibold text-primary truncate">Hamza Bouguerra</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground truncate">
              M1 Business Analytics · Esprit School of Business
            </div>
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
          <button
            onClick={toggle}
            aria-label="Changer de thème"
            className="ml-1 p-2 rounded-md border border-border hover:bg-secondary transition"
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          <a
            href="https://github.com/Hmz931/data-mining-explorer"
            target="_blank"
            rel="noreferrer"
            className="ml-1 inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border hover:bg-secondary transition"
          >
            <Github className="w-3.5 h-3.5" /> GitHub
          </a>
        </nav>

        <div className="md:hidden flex items-center gap-1">
          <button
            onClick={toggle}
            aria-label="Changer de thème"
            className="p-2 rounded-md border border-border hover:bg-secondary transition"
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            className="p-2 rounded-md border border-border hover:bg-secondary transition"
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-border bg-background/95">
          <div className="container py-3 flex flex-col gap-1 text-sm">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2.5 rounded-md ${
                    isActive
                      ? "text-accent font-medium bg-accent/5"
                      : "text-foreground/80 hover:bg-secondary"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
            <a
              href="https://github.com/Hmz931/data-mining-explorer"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-md hover:bg-secondary transition"
            >
              <Github className="w-3.5 h-3.5" /> GitHub
            </a>
          </div>
        </nav>
      )}
    </header>
  );
};
