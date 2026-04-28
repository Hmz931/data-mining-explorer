import { Link } from "react-router-dom";
import { ArrowRight, GitBranch, Layers, Network, ScatterChart, Shapes } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";

const factorielles = [
  { code: "ACP", name: "Analyse en Composantes Principales", to: "/data-mining/acp", icon: ScatterChart,
    short: "Réduction de dimension d'un tableau quantitatif.",
    formula: "\\mathrm{PC}_i = v_{i1} Z_1 + \\dots + v_{ip} Z_p" },
  { code: "AFC", name: "Analyse Factorielle des Correspondances", to: "/data-mining/afc", icon: Network,
    short: "Associations entre deux variables qualitatives.",
    formula: "\\chi^2 = \\sum_{i,j} \\frac{(n_{ij}-t_{ij})^2}{t_{ij}}" },
  { code: "ACM", name: "Analyse des Correspondances Multiples", to: "/data-mining/acm", icon: Layers,
    short: "Généralisation de l'AFC à p variables qualitatives.",
    formula: "\\mathbf{Z}_{n \\times m} \\to \\mathbf{B} = \\mathbf{Z}^\\top \\mathbf{Z}" },
];

const classification = [
  { code: "CAH", name: "Classification Ascendante Hiérarchique", to: "/data-mining/cah", icon: GitBranch,
    short: "Construction d'un dendrogramme par fusions successives.",
    formula: "\\Delta(A,B) = \\frac{|A||B|}{|A|+|B|} \\, d^2(g_A, g_B)" },
  { code: "K-means", name: "Partitionnement K-means", to: "/data-mining/kmeans", icon: Shapes,
    short: "Partition en K groupes minimisant l'inertie intra.",
    formula: "\\min_{C_1,\\dots,C_K} \\sum_{k=1}^K \\sum_{x \\in C_k} \\|x - \\mu_k\\|^2" },
];

import { InlineMath } from "react-katex";

const Card = ({ m }: { m: typeof factorielles[number] }) => {
  const Icon = m.icon;
  return (
    <Link
      to={m.to}
      className="group block p-7 rounded-lg border border-border bg-card hover:border-accent/50 hover:shadow-card hover:-translate-y-1 transition-all"
    >
      <div className="flex items-start justify-between mb-5">
        <div className="w-11 h-11 rounded-md bg-secondary text-primary flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition">
          <Icon className="w-5 h-5" />
        </div>
        <span className="font-mono text-[11px] tracking-widest text-accent">{m.code}</span>
      </div>
      <h3 className="font-serif text-xl font-semibold text-primary leading-snug mb-2">{m.name}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-5">{m.short}</p>
      <div className="px-3 py-2 rounded bg-surface/70 border border-border overflow-x-auto text-[13px]">
        <InlineMath math={m.formula} />
      </div>
      <div className="mt-5 inline-flex items-center gap-1.5 text-sm text-accent font-medium">
        Lire la fiche <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
      </div>
    </Link>
  );
};

const DataMining = () => (
  <PageLayout>
    <section className="container pt-16 pb-10">
      <div className="text-xs uppercase tracking-[0.22em] text-accent font-medium mb-4">Chapitre I</div>
      <h1 className="font-serif text-5xl md:text-6xl font-semibold text-primary mb-6 max-w-3xl leading-[1.05]">
        Data Mining.
      </h1>
      <p className="text-lg text-foreground/75 max-w-2xl leading-relaxed">
        Cinq méthodes pour explorer, réduire et regrouper. Trois factorielles, deux de classification.
      </p>
    </section>

    <section className="container pb-12">
      <div className="flex items-baseline gap-4 mb-6">
        <span className="font-serif text-3xl text-muted-foreground/60 italic">i</span>
        <h2 className="font-serif text-2xl font-semibold text-primary">Méthodes factorielles</h2>
        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Réduction de dimension</span>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {factorielles.map((m) => <Card key={m.code} m={m} />)}
      </div>
    </section>

    <section className="container pb-24">
      <div className="flex items-baseline gap-4 mb-6">
        <span className="font-serif text-3xl text-muted-foreground/60 italic">ii</span>
        <h2 className="font-serif text-2xl font-semibold text-primary">Méthodes de classification</h2>
        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Regroupement</span>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        {classification.map((m) => <Card key={m.code} m={m} />)}
      </div>
    </section>
  </PageLayout>
);

export default DataMining;
