import { Link } from "react-router-dom";
import {
  ArrowRight,
  Database,
  Brain,
  TrendingUp,
  Sparkles,
  ScatterChart,
  Network,
  Layers,
  GitBranch,
  Shapes,
} from "lucide-react";
import { PageLayout } from "@/components/PageLayout";

const dataMining = [
  { code: "ACP", name: "Composantes Principales", to: "/data-mining/acp", icon: ScatterChart },
  { code: "AFC", name: "Analyse Factorielle des Correspondances", to: "/data-mining/afc", icon: Network },
  { code: "ACM", name: "Analyse des Correspondances Multiples", to: "/data-mining/acm", icon: Layers },
  { code: "CAH", name: "Classification Hiérarchique", to: "/data-mining/cah", icon: GitBranch },
  { code: "K-means", name: "Partitionnement K-means", to: "/data-mining/kmeans", icon: Shapes },
];

const subjects = [
  {
    n: "I",
    code: "DM",
    title: "Data Mining",
    status: "open",
    desc: "Méthodes factorielles et de classification.",
    to: "/data-mining",
  },
  { n: "II", code: "ML", title: "Machine Learning", status: "soon", desc: "Apprentissage supervisé et non supervisé.", icon: Brain },
  { n: "III", code: "TS", title: "Séries Temporelles", status: "soon", desc: "ARIMA, lissage, décomposition saisonnière.", icon: TrendingUp },
  { n: "IV", code: "DB", title: "NoSQL", status: "open", desc: "MongoDB : documents, CRUD, agrégation, modélisation.", to: "/nosql", icon: Database },
  { n: "V", code: "EC", title: "Économétrie", status: "soon", desc: "Régression, tests, modèles à équations.", icon: TrendingUp },
  { n: "VI", code: "NLP", title: "Traitement du Langage", status: "soon", desc: "Vectorisation, sentiment, transformers.", icon: Brain },
];

const Index = () => (
  <PageLayout>
    {/* ───── HERO ───── */}
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero" />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 30%, hsl(var(--accent)) 0, transparent 40%), radial-gradient(circle at 75% 70%, hsl(var(--sage)) 0, transparent 45%)",
        }}
      />
      <div className="container relative pt-16 pb-20 md:pt-28 md:pb-32">
        <div className="max-w-3xl animate-fade-up">
          <div className="inline-flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-[0.22em] text-accent font-medium mb-5 sm:mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Master 1 · Business Analytics · Esprit School of Business</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-semibold leading-[1.05] tracking-tight text-primary mb-5 sm:mb-6">
            Notes & visualisations<br />
            <span className="italic text-accent">de la promotion</span>.
          </h1>
          <p className="text-base sm:text-xl text-foreground/75 leading-relaxed mb-8 sm:mb-10 max-w-2xl">
            Toutes les matières du programme M1 Business Analytics rassemblées en un seul endroit.
            Démonstrations, formules détaillées, code R / Python, visualisations interactives et QCM.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/data-mining"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-md bg-primary text-primary-foreground font-medium shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all text-sm sm:text-base"
            >
              Ouvrir le Data Mining <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-md border border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all text-sm sm:text-base"
            >
              Le projet
            </Link>
          </div>
        </div>
      </div>
    </section>

    {/* ───── SUBJECTS GRID ───── */}
    <section className="container py-24">
      <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-accent font-medium mb-3">Le programme</div>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold text-primary">Six chapitres, un site.</h2>
        </div>
        <span className="text-sm text-muted-foreground">2 / 6 matières disponibles</span>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects.map((s, i) => {
          const open = s.status === "open";
          const card = (
            <article
              className={`group relative h-full p-7 rounded-lg border bg-card transition-all overflow-hidden ${
                open
                  ? "border-primary shadow-card hover:-translate-y-1 hover:shadow-[0_12px_40px_-8px_hsl(220_35%_12%/0.18)]"
                  : "border-border opacity-80"
              }`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {open && (
                <div className="absolute top-0 right-0 px-3 py-1 bg-accent text-accent-foreground text-[10px] uppercase tracking-[0.18em] font-semibold rounded-bl">
                  En cours
                </div>
              )}
              <div className="flex items-center justify-between mb-6">
                <span className="font-serif text-3xl text-muted-foreground/60 italic">{s.n}</span>
                <span className="font-mono text-[11px] tracking-widest text-accent">{s.code}</span>
              </div>
              <h3 className="font-serif text-2xl font-semibold text-primary mb-2 leading-snug">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">{s.desc}</p>
              {open ? (
                <div className="flex items-center gap-1.5 text-sm text-accent font-medium">
                  Explorer <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              ) : (
                <div className="text-xs text-muted-foreground italic">À venir</div>
              )}
            </article>
          );
          return open && s.to ? (
            <Link key={s.code} to={s.to} className="block animate-fade-up">{card}</Link>
          ) : (
            <div key={s.code} className="animate-fade-up">{card}</div>
          );
        })}
      </div>
    </section>

    {/* ───── DATA MINING SECTION PREVIEW ───── */}
    <section className="bg-surface/60 border-y border-border">
      <div className="container py-24">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-12 items-start">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-accent font-medium mb-3">Chapitre I · Disponible</div>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-primary leading-tight mb-5">
              Data Mining
            </h2>
            <p className="text-foreground/75 leading-relaxed mb-6">
              Cinq méthodes fondamentales : trois factorielles pour réduire la dimension, deux de classification
              pour regrouper les individus.
            </p>
            <Link to="/data-mining" className="inline-flex items-center gap-1.5 text-accent font-medium hover:underline underline-offset-4">
              Voir le chapitre complet <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {dataMining.map((m) => {
              const Icon = m.icon;
              return (
                <Link
                  key={m.code}
                  to={m.to}
                  className="group flex items-center gap-4 p-4 rounded-md border border-border bg-card hover:border-accent/50 hover:shadow-soft transition-all"
                >
                  <div className="w-10 h-10 rounded bg-secondary text-primary flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[10px] tracking-widest text-accent">{m.code}</div>
                    <div className="font-serif text-sm font-semibold text-primary truncate">{m.name}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  </PageLayout>
);

export default Index;
