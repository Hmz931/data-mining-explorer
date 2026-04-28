import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { MethodHero } from "@/components/MethodHero";
import { Callout } from "@/components/Callout";
import { M } from "@/components/Math";
import { FormulaCard } from "@/components/FormulaCard";
import { StepBlock } from "@/components/StepBlock";
import { CAHViz } from "@/components/viz/CAHViz";

const CAH = () => (
  <PageLayout>
    <MethodHero
      code="CAH"
      tag="Classification hiérarchique"
      title="Classification Ascendante Hiérarchique"
      subtitle="Partir de n singletons, fusionner à chaque étape les deux clusters les plus proches, jusqu'à n'en avoir qu'un seul. Le résultat : un dendrogramme."
    />

    <section className="container py-14 max-w-3xl">
      <p className="text-lg text-foreground/85 leading-relaxed mb-6">
        Contrairement à K-means, la CAH ne demande pas de fixer <M>K</M> à l'avance. On obtient une <em>hiérarchie</em> de
        partitions qu'on peut couper à n'importe quel niveau.
      </p>

      <CAHViz />

      <h2 className="font-serif text-3xl font-semibold text-primary mt-16 mb-2 pb-3 border-b border-border">
        L'algorithme
      </h2>

      <StepBlock number="1" title="Initialisation : n singletons">
        <p>
          Chaque individu est son propre cluster : <M>{`P_0 = \\{\\{x_1\\}, \\{x_2\\}, \\dots, \\{x_n\\}\\}`}</M>. La distance
          entre deux singletons est simplement la distance entre les points.
        </p>
      </StepBlock>

      <StepBlock number="2" title="Calcul de la matrice des distances">
        <p>On choisit une distance — typiquement euclidienne :</p>
        <FormulaCard formula={`d(x_i, x_j) = \\sqrt{\\sum_{k=1}^p (x_{ik} - x_{jk})^2}`} />
      </StepBlock>

      <StepBlock number="3" title="Fusion des deux clusters les plus proches">
        <p>
          Au sens d'un <strong>critère d'agrégation</strong> à choisir (voir tableau ci-dessous). On note la hauteur de
          fusion sur le dendrogramme.
        </p>
      </StepBlock>

      <StepBlock number="4" title="Mise à jour & itération">
        <p>
          On recalcule les distances entre le nouveau cluster et les autres, puis on répète jusqu'à n'avoir qu'un seul
          cluster contenant tous les individus.
        </p>
      </StepBlock>

      <h2 className="font-serif text-3xl font-semibold text-primary mt-16 mb-6 pb-3 border-b border-border">
        Les critères d'agrégation
      </h2>

      <div className="space-y-5">
        <FormulaCard
          label="Lien minimum (single linkage)"
          formula={`d(A, B) = \\min_{x \\in A,\\, y \\in B} d(x, y)`}
          legend="Tend à produire des chaînes — sensible aux outliers."
        />
        <FormulaCard
          label="Lien maximum (complete linkage)"
          formula={`d(A, B) = \\max_{x \\in A,\\, y \\in B} d(x, y)`}
          legend="Produit des clusters compacts et de diamètre limité."
        />
        <FormulaCard
          label="Lien moyen (average linkage)"
          formula={`d(A, B) = \\frac{1}{|A|\\,|B|}\\sum_{x \\in A}\\sum_{y \\in B} d(x, y)`}
          legend="Bon compromis entre les deux précédents."
        />
        <FormulaCard
          label="Critère de Ward"
          formula={`\\Delta(A, B) = \\frac{|A|\\cdot|B|}{|A|+|B|}\\;\\| g_A - g_B \\|^2`}
          legend={
            <>
              Minimise la perte d'inertie inter-cluster à chaque fusion. <strong>Le critère le plus utilisé</strong> en
              pratique : produit des clusters équilibrés et homogènes.
            </>
          }
        />
      </div>

      <Callout variant="math" title="Pourquoi Ward fonctionne si bien">
        Lors d'une fusion, l'inertie intra augmente exactement de <M>{`\\Delta(A, B)`}</M>. Choisir à chaque étape la
        fusion minimisant ce <M>\Delta</M> revient à conserver la partition la plus <em>compacte possible</em>. C'est
        l'analogue de K-means en mode hiérarchique.
      </Callout>

      <h2 className="font-serif text-3xl font-semibold text-primary mt-16 mb-6 pb-3 border-b border-border">
        Lire un dendrogramme
      </h2>
      <ul className="prose-academic">
        <li>L'axe vertical mesure la <strong>distance de fusion</strong> (ou perte d'inertie pour Ward).</li>
        <li>Plus une fusion est <strong>basse</strong>, plus les éléments fusionnés sont similaires.</li>
        <li>Pour obtenir <M>K</M> clusters, on coupe horizontalement à la hauteur où apparaissent <M>K</M> branches.</li>
        <li>Un <strong>grand saut</strong> de hauteur entre deux fusions consécutives suggère un nombre naturel de clusters juste avant le saut.</li>
      </ul>

      <h2 className="font-serif text-3xl font-semibold text-primary mt-16 mb-6 pb-3 border-b border-border">
        À retenir
      </h2>
      <Callout variant="info" title="Mémo">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Ascendante</strong> : on fusionne (≠ descendante qui divise).</li>
          <li>Pas besoin de fixer <M>K</M> à l'avance.</li>
          <li>Le choix du <strong>critère d'agrégation</strong> change radicalement la forme des clusters.</li>
          <li><strong>Ward</strong> est le défaut recommandé.</li>
          <li>Complexité <M>{`O(n^3)`}</M> ou <M>{`O(n^2 \\log n)`}</M> — peu adapté aux très gros volumes.</li>
        </ul>
      </Callout>

      <div className="mt-16 pt-8 border-t border-border flex justify-between items-center">
        <Link to="/data-mining/acm" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition">
          <ChevronLeft className="w-4 h-4" /> ACM
        </Link>
        <Link to="/data-mining/kmeans" className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline underline-offset-4">
          Suivant : K-means <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  </PageLayout>
);

export default CAH;
