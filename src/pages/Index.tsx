import { Link } from "react-router-dom";
import { ArrowRight, GitBranch, Layers, Network, Scatter, Shapes, Sparkles } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";

const methods = [
  { code: "ACP", name: "Analyse en Composantes Principales", to: "/data-mining/acp", icon: Scatter, status: "ready", desc: "Réduction de dimension et visualisation de données quantitatives." },
  { code: "AFC", name: "Analyse Factorielle des Correspondances", to: "/data-mining/afc", icon: Network, status: "soon", desc: "Étudier les liens entre deux variables qualitatives." },
  { code: "AFCM", name: "Analyse Factorielle Multiple", to: "/data-mining/afcm", icon: Layers, status: "soon", desc: "Généralisation de l'AFC à plusieurs variables qualitatives." },
  { code: "CAH", name: "Classification Ascendante Hiérarchique", to: "/data-mining/cah", icon: GitBranch, status: "soon", desc: "Regroupement progressif des individus en dendrogramme." },
  { code: "K-means", name: "Classification par partitionnement", to: "/data-mining/kmeans", icon: Shapes, status: "soon", desc: "Partitionner les données en K groupes homogènes." },
];

const Index = () => (
  <PageLayout>
    {/* HERO */}
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "radial-gradient(circle at 25% 30%, hsl(var(--accent)) 0, transparent 40%), radial-gradient(circle at 75% 70%, hsl(var(--sage)) 0, transparent 45%)" }}
      />
      <div className="container relative pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="max-w-3xl animate-fade-up">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-accent font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Master 1 · Business Analytics · ESB</span>
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-semibold leading-[1.02] tracking-tight text-primary mb-6">
            Le carnet pédagogique<br />
            <span className="italic text-accent">d'Analytics</span>.
          </h1>
          <p className="text-xl text-foreground/75 leading-relaxed mb-10 max-w-2xl">
            Comprendre les algorithmes du programme — sans boîte noire. Théorie, démonstrations pas à pas,
            exemples concrets et visualisations interactives, écrits par et pour la promotion.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/data-mining"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground font-medium shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all"
            >
              Explorer le Data Mining <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/data-mining/acp"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
            >
              Commencer par l'ACP
            </Link>
          </div>
        </div>
      </div>
    </section>

    {/* SECTIONS DU PROGRAMME */}
    <section className="container py-24">
      <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-accent font-medium mb-3">Chapitre I</div>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold text-primary">Data Mining</h2>
          <p className="text-muted-foreground mt-3 max-w-xl">
            Cinq méthodes fondamentales pour explorer, réduire et classifier vos données.
          </p>
        </div>
        <Link to="/data-mining" className="text-sm text-accent hover:underline underline-offset-4">
          Voir tout le chapitre →
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {methods.map((m, i) => {
          const Icon = m.icon;
          const ready = m.status === "ready";
          const Card = (
            <article
              className={`group relative h-full p-7 rounded-lg bg-card border border-border transition-all ${
                ready ? "hover:shadow-card hover:-translate-y-1 hover:border-accent/40" : "opacity-75"
              }`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between mb-5">
                <div className="w-11 h-11 rounded-md bg-secondary text-primary flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] uppercase tracking-[0.18em] px-2 py-1 rounded ${
                  ready ? "bg-sage/15 text-sage" : "bg-muted text-muted-foreground"
                }`}>
                  {ready ? "Disponible" : "À venir"}
                </span>
              </div>
              <div className="font-mono text-xs text-accent mb-2">{m.code}</div>
              <h3 className="font-serif text-xl font-semibold text-primary mb-2 leading-snug">{m.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
              {ready && (
                <div className="mt-5 inline-flex items-center gap-1.5 text-sm text-accent font-medium">
                  Lire la fiche <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </article>
          );
          return ready ? (
            <Link key={m.code} to={m.to} className="block animate-fade-up">{Card}</Link>
          ) : (
            <div key={m.code} className="animate-fade-up">{Card}</div>
          );
        })}
      </div>
    </section>

    {/* PHILOSOPHY */}
    <section className="bg-surface/60 border-y border-border">
      <div className="container py-24 grid md:grid-cols-2 gap-16 items-start">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-accent font-medium mb-3">Notre approche</div>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold text-primary leading-tight">
            Apprendre <span className="italic">en comprenant</span>, pas en mémorisant.
          </h2>
        </div>
        <div className="space-y-8 text-foreground/85 leading-relaxed text-[1.05rem]">
          <div>
            <h3 className="font-serif text-xl font-semibold text-primary mb-2">Théorie & intuition</h3>
            <p>Chaque méthode est introduite par une intuition simple, puis formalisée mathématiquement. Aucune étape n'est passée sous silence.</p>
          </div>
          <div>
            <h3 className="font-serif text-xl font-semibold text-primary mb-2">Démonstrations pas à pas</h3>
            <p>Calculs matriciels détaillés, exemples chiffrés, et explications algorithmiques que vous pouvez reproduire sur papier.</p>
          </div>
          <div>
            <h3 className="font-serif text-xl font-semibold text-primary mb-2">Visualisations interactives</h3>
            <p>Manipulez les paramètres, observez les effets en direct sur les graphiques. La meilleure façon d'ancrer les concepts.</p>
          </div>
        </div>
      </div>
    </section>
  </PageLayout>
);

export default Index;
