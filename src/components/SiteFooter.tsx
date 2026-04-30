import { Link } from "react-router-dom";

const methods = [
  { code: "ACP", to: "/data-mining/acp" },
  { code: "AFC", to: "/data-mining/afc" },
  { code: "ACM", to: "/data-mining/acm" },
  { code: "CAH", to: "/data-mining/cah" },
  { code: "K-means", to: "/data-mining/kmeans" },
];

export const SiteFooter = () => (
  <footer className="mt-32 border-t border-border bg-surface/60">
    <div className="container py-12 grid md:grid-cols-3 gap-8 text-sm">
      <div>
        <div className="font-serif text-xl text-accent font-semibold mb-2">
          Hamza Bouguerra
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Étudiant M1 Business Analytics · École Supérieure de la Banque.
          Notes & visualisations partagées avec la promotion.
        </p>
      </div>

      <div>
        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">
          Data Mining
        </div>
        <ul className="space-y-1.5">
          {methods.map((m) => (
            <li key={m.code}>
              <Link to={m.to} className="text-foreground/80 hover:text-accent transition">
                {m.code}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">
          À venir
        </div>
        <p className="text-foreground/80 leading-relaxed">
          Machine Learning, Séries temporelles, NoSQL, Économétrie, NLP. Le site
          s'enrichit au fil du programme.
        </p>
      </div>
    </div>
    <div className="border-t border-border">
      <div className="container py-5 text-xs text-muted-foreground flex flex-wrap justify-between gap-2">
        <span>© 2025 Hamza Bouguerra — Master 1 Business Analytics · ESB</span>
        <a
          href="https://github.com/Hmz931/data-mining-explorer"
          target="_blank"
          rel="noreferrer"
          className="font-mono hover:text-accent transition"
        >
          github.com/Hmz931/data-mining-explorer
        </a>
      </div>
    </div>
  </footer>
);
