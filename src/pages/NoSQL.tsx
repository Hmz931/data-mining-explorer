import { Link } from "react-router-dom";
import { ArrowRight, Database, FileCode, Layers, GitMerge, BookOpen, ChevronLeft } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";

const chapters = [
  {
    n: "1",
    code: "INTRO",
    title: "Introduction aux bases NoSQL",
    to: "/nosql/intro",
    icon: BookOpen,
    short: "Big Data, 3V, ACID/BASE, théorème CAP, scalabilité, 4 familles NoSQL.",
  },
  {
    n: "2",
    code: "MONGO",
    title: "MongoDB — Concepts & modélisation",
    to: "/nosql/mongodb",
    icon: Database,
    short: "Documents BSON, collections, terminologie, sharding, réplication.",
  },
  {
    n: "3",
    code: "CRUD",
    title: "Opérations CRUD",
    to: "/nosql/crud",
    icon: FileCode,
    short: "insert / find / update / remove + opérateurs $gt, $in, $regex, projection.",
  },
  {
    n: "4",
    code: "AGG",
    title: "Pipeline d'agrégation",
    to: "/nosql/aggregation",
    icon: Layers,
    short: "$match, $group, $project, $sort, $unwind, $lookup, $out.",
  },
  {
    n: "5",
    code: "TP",
    title: "TP — Modélisation orientée document",
    to: "/nosql/td-modelisation",
    icon: GitMerge,
    short: "Étudiants/Cours, Ventes/Livres/Auteurs, références vs imbrication.",
  },
];

const NoSQL = () => (
  <PageLayout>
    <section className="container pt-12 sm:pt-16 pb-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-accent hover:underline underline-offset-4 mb-5"
      >
        <ChevronLeft className="w-4 h-4" /> Accueil
      </Link>
      <div className="text-xs uppercase tracking-[0.22em] text-accent font-medium mb-4">Chapitre IV</div>
      <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-semibold text-primary mb-5 max-w-3xl leading-[1.05]">
        NoSQL & MongoDB.
      </h1>
      <p className="text-base sm:text-lg text-foreground/75 max-w-2xl leading-relaxed">
        De la définition du Big Data jusqu'au pipeline d'agrégation MongoDB.
        Cinq fiches courtes, code shell exécutable, sorties commentées et QCM de révision.
      </p>

      <div className="mt-8 sm:mt-10 p-5 rounded-lg border border-border bg-surface/50">
        <div className="text-[11px] uppercase tracking-[0.2em] text-accent font-semibold mb-3">
          Parcours conseillé
        </div>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm font-mono">
          {chapters.map((c, i, arr) => (
            <li key={c.code} className="flex items-center gap-2">
              <Link
                to={c.to}
                className="px-2.5 py-1 rounded border border-border bg-card hover:border-accent hover:text-accent transition"
              >
                {c.n}. {c.code}
              </Link>
              {i < arr.length - 1 && <span className="text-muted-foreground">→</span>}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-muted-foreground">
          Chaque fiche : concepts visuels · commandes Mongo Shell avec sortie · 20 QCM de révision.
        </p>
      </div>
    </section>

    <section className="container pb-24">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {chapters.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.code}
              to={c.to}
              className="group block p-7 rounded-lg border border-border bg-card hover:border-accent/50 hover:shadow-card hover:-translate-y-1 transition-all"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="w-11 h-11 rounded-md bg-secondary text-primary flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-mono text-[11px] tracking-widest text-accent">CH.{c.n}</span>
              </div>
              <h3 className="font-serif text-xl font-semibold text-primary leading-snug mb-2">{c.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">{c.short}</p>
              <div className="inline-flex items-center gap-1.5 text-sm text-accent font-medium">
                Lire la fiche <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  </PageLayout>
);

export default NoSQL;
