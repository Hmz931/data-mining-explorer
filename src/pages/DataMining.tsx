import { Link } from "react-router-dom";
import { ArrowRight, GitBranch, Layers, Network, ScatterChart, Shapes } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";

const methods = [
  { code: "ACP", name: "Analyse en Composantes Principales", to: "/data-mining/acp", icon: ScatterChart, status: "ready",
    short: "Réduire la dimension d'un tableau quantitatif tout en préservant un maximum de variance.",
    use: "Données quantitatives, variables corrélées" },
  { code: "AFC", name: "Analyse Factorielle des Correspondances", to: "/data-mining/afc", icon: Network, status: "soon",
    short: "Visualiser les associations entre les modalités de deux variables qualitatives.",
    use: "Tableau de contingence, deux variables qualitatives" },
  { code: "AFCM", name: "Analyse Factorielle Multiple", to: "/data-mining/afcm", icon: Layers, status: "soon",
    short: "Étendre l'AFC à plus de deux variables qualitatives via le tableau disjonctif.",
    use: "Plusieurs variables qualitatives" },
  { code: "CAH", name: "Classification Ascendante Hiérarchique", to: "/data-mining/cah", icon: GitBranch, status: "soon",
    short: "Construire un dendrogramme en agrégeant progressivement les individus les plus proches.",
    use: "Petits/moyens jeux de données, structure hiérarchique" },
  { code: "K-means", name: "Partitionnement K-means", to: "/data-mining/kmeans", icon: Shapes, status: "soon",
    short: "Partitionner n individus en K groupes en minimisant la variance intra-cluster.",
    use: "Grands volumes, K connu ou estimé" },
];

const DataMining = () => (
  <PageLayout>
    <section className="container pt-16 pb-12">
      <div className="text-xs uppercase tracking-[0.22em] text-accent font-medium mb-4">Chapitre I</div>
      <h1 className="font-serif text-5xl md:text-6xl font-semibold text-primary mb-6 max-w-3xl leading-[1.05]">
        Data Mining — explorer, réduire, classifier.
      </h1>
      <p className="text-lg text-foreground/75 max-w-2xl leading-relaxed">
        Le data mining regroupe les méthodes statistiques permettant de tirer du sens d'un tableau de données.
        On distingue généralement les méthodes <em>factorielles</em> (ACP, AFC, AFCM) qui réduisent la dimension,
        et les méthodes de <em>classification</em> (CAH, K-means) qui regroupent les individus.
      </p>
    </section>

    <section className="container pb-24">
      <div className="space-y-4">
        {methods.map((m) => {
          const Icon = m.icon;
          const ready = m.status === "ready";
          const inner = (
            <article className={`grid md:grid-cols-[auto_1fr_auto] gap-6 items-center p-7 rounded-lg border border-border bg-card transition-all ${
              ready ? "hover:border-accent/40 hover:shadow-card hover:-translate-y-0.5" : "opacity-70"
            }`}>
              <div className="w-14 h-14 rounded-md bg-secondary text-primary flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="font-mono text-xs text-accent">{m.code}</span>
                  <span className={`text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded ${
                    ready ? "bg-sage/15 text-sage" : "bg-muted text-muted-foreground"
                  }`}>
                    {ready ? "Disponible" : "À venir"}
                  </span>
                </div>
                <h2 className="font-serif text-2xl font-semibold text-primary mb-1.5">{m.name}</h2>
                <p className="text-foreground/75">{m.short}</p>
                <p className="text-xs text-muted-foreground mt-2 italic">Cas d'usage typique : {m.use}</p>
              </div>
              {ready && <ArrowRight className="hidden md:block w-5 h-5 text-accent" />}
            </article>
          );
          return ready ? (
            <Link key={m.code} to={m.to} className="block group">{inner}</Link>
          ) : (
            <div key={m.code} className="group">{inner}</div>
          );
        })}
      </div>
    </section>
  </PageLayout>
);

export default DataMining;
