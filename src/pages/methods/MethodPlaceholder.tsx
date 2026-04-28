import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Construction } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";

const META: Record<string, { code: string; name: string; teaser: string }> = {
  afc: { code: "AFC", name: "Analyse Factorielle des Correspondances", teaser: "Étudier les associations entre deux variables qualitatives via le tableau de contingence." },
  afcm: { code: "AFCM", name: "Analyse Factorielle Multiple", teaser: "Généralisation de l'AFC à plus de deux variables qualitatives via le tableau disjonctif complet." },
  cah: { code: "CAH", name: "Classification Ascendante Hiérarchique", teaser: "Construire un dendrogramme par agrégations successives selon un critère (Ward, lien moyen…)." },
  kmeans: { code: "K-means", name: "Partitionnement K-means", teaser: "Partitionner n individus en K groupes en minimisant la variance intra-cluster." },
};

const MethodPlaceholder = () => {
  const { slug = "" } = useParams();
  const m = META[slug] ?? { code: slug.toUpperCase(), name: "Méthode", teaser: "" };
  return (
    <PageLayout>
      <section className="container py-20">
        <Link to="/data-mining" className="inline-flex items-center gap-1 text-sm text-accent hover:underline underline-offset-4 mb-6">
          <ChevronLeft className="w-4 h-4" /> Retour au chapitre
        </Link>
        <div className="font-mono text-xs text-accent mb-3 tracking-widest">CHAPITRE I · DATA MINING</div>
        <h1 className="font-serif text-5xl md:text-6xl font-semibold text-primary mb-5 max-w-3xl leading-[1.05]">
          {m.name}
        </h1>
        <p className="text-lg text-foreground/75 max-w-2xl">{m.teaser}</p>

        <div className="mt-12 max-w-2xl p-8 rounded-lg border border-dashed border-accent/40 bg-accent/5">
          <div className="flex items-center gap-3 mb-3 text-accent">
            <Construction className="w-5 h-5" />
            <span className="text-xs uppercase tracking-[0.18em] font-semibold">Bientôt disponible</span>
          </div>
          <p className="text-foreground/85 leading-relaxed">
            Cette fiche est en cours de rédaction. Elle suivra le même format que la fiche ACP : intuition,
            démonstration mathématique pas à pas, exemple chiffré et visualisations interactives.
          </p>
          <p className="text-sm text-muted-foreground mt-4 italic">
            Envie de contribuer ? Partagez vos notes de cours sur GitHub.
          </p>
        </div>
      </section>
    </PageLayout>
  );
};

export default MethodPlaceholder;
