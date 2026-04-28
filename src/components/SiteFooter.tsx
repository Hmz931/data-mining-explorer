export const SiteFooter = () => (
  <footer className="mt-32 border-t border-border bg-surface/60">
    <div className="container py-12 grid md:grid-cols-3 gap-8 text-sm">
      <div>
        <div className="font-serif text-xl text-primary font-semibold mb-2">ESB · Carnet d'Analytics</div>
        <p className="text-muted-foreground leading-relaxed">
          Ressources pédagogiques pour le Master 1 Business Analytics — École Supérieure de la Banque.
        </p>
      </div>
      <div>
        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">Méthodes</div>
        <ul className="space-y-1.5 text-foreground/80">
          <li>ACP — Analyse en Composantes Principales</li>
          <li>AFC — Analyse Factorielle des Correspondances</li>
          <li>AFCM — Analyse Factorielle Multiple</li>
          <li>CAH — Classification Hiérarchique</li>
          <li>K-means</li>
        </ul>
      </div>
      <div>
        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">À venir</div>
        <p className="text-foreground/80 leading-relaxed">
          Économétrie, Machine Learning supervisé, Séries temporelles, NLP… Le carnet s'enrichira au fil du programme.
        </p>
      </div>
    </div>
    <div className="border-t border-border">
      <div className="container py-5 text-xs text-muted-foreground flex flex-wrap justify-between gap-2">
        <span>© {new Date().getFullYear()} — Carnet collaboratif Master 1 BA · ESB</span>
        <span className="font-mono">v0.1 — édition Data Mining</span>
      </div>
    </div>
  </footer>
);
