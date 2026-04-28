import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { MethodHero } from "@/components/MethodHero";
import { Callout } from "@/components/Callout";
import { M } from "@/components/Math";
import { FormulaCard } from "@/components/FormulaCard";
import { StepBlock } from "@/components/StepBlock";
import { KMeansViz, ElbowPlot } from "@/components/viz/KMeansViz";

const KMeans = () => (
  <PageLayout>
    <MethodHero
      code="K-MEANS"
      tag="Classification non hiérarchique"
      title="Partitionnement K-means"
      subtitle="Diviser n individus en K groupes homogènes en minimisant l'inertie intra-cluster, par itérations successives."
    />

    <section className="container py-14 max-w-3xl">
      <p className="text-lg text-foreground/85 leading-relaxed mb-6">
        L'idée : choisir <M>K</M> centroïdes, affecter chaque point au plus proche, recalculer les centroïdes, répéter.
      </p>

      <FormulaCard
        label="Objectif"
        formula={`\\min_{C_1,\\dots,C_K}\\;\\sum_{k=1}^{K}\\sum_{x_i \\in C_k} \\| x_i - \\mu_k \\|^2`}
        legend={
          <>où <M>{`\\mu_k = \\frac{1}{|C_k|}\\sum_{x \\in C_k} x`}</M> est le centre de gravité du cluster <M>{`C_k`}</M>.</>
        }
      />

      <KMeansViz />

      <h2 className="font-serif text-3xl font-semibold text-primary mt-16 mb-2 pb-3 border-b border-border">
        L'algorithme, étape par étape
      </h2>

      <StepBlock number="1" title="Initialisation">
        <p>
          Choisir <M>K</M> centroïdes initiaux <M>{`\\mu_1, \\dots, \\mu_K`}</M>. Plusieurs stratégies :
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-foreground/80">
          <li><strong>Aléatoire</strong> : <M>K</M> points tirés au hasard parmi les données.</li>
          <li><strong>K-means++</strong> : choix probabiliste favorisant les points éloignés — convergence plus stable.</li>
        </ul>
      </StepBlock>

      <StepBlock number="2" title="Affectation">
        <p>Chaque individu rejoint le cluster du centroïde le plus proche au sens de la distance euclidienne :</p>
        <FormulaCard
          formula={`C_k = \\Big\\{\\, x_i \\;:\\; \\|x_i - \\mu_k\\| \\le \\|x_i - \\mu_j\\| \\;\\forall\\, j \\Big\\}`}
        />
      </StepBlock>

      <StepBlock number="3" title="Mise à jour">
        <p>Chaque centroïde devient le barycentre des points qui lui ont été affectés :</p>
        <FormulaCard formula={`\\mu_k \\leftarrow \\frac{1}{|C_k|}\\sum_{x_i \\in C_k} x_i`} />
      </StepBlock>

      <StepBlock number="4" title="Convergence">
        <p>
          On répète <strong>2</strong> et <strong>3</strong> tant que les affectations changent (ou qu'un nombre maximal
          d'itérations n'est pas atteint). L'inertie intra <M>{`I_W`}</M> décroît strictement à chaque itération — donc
          l'algorithme converge en un nombre fini d'étapes.
        </p>
        <Callout variant="warning" title="Optimum local">
          K-means converge vers un minimum <em>local</em>, dépendant de l'initialisation. En pratique : lancer plusieurs
          fois (ex. <code>n_init = 10</code>) et garder la meilleure inertie.
        </Callout>
      </StepBlock>

      <h2 className="font-serif text-3xl font-semibold text-primary mt-16 mb-6 pb-3 border-b border-border">
        Décomposition de l'inertie
      </h2>
      <p className="text-foreground/85 leading-relaxed mb-2">
        L'inertie totale du nuage se décompose en deux parts (théorème de Huygens) :
      </p>
      <FormulaCard
        formula={`\\underbrace{\\sum_{i=1}^n \\|x_i - g\\|^2}_{I_T \\text{ totale}} = \\underbrace{\\sum_{k=1}^K \\sum_{x_i \\in C_k} \\|x_i - \\mu_k\\|^2}_{I_W \\text{ intra}} + \\underbrace{\\sum_{k=1}^K |C_k|\\,\\|\\mu_k - g\\|^2}_{I_B \\text{ inter}}`}
        legend={<>où <M>g</M> est le centre de gravité global. Maximiser <M>I_B</M> ⇔ minimiser <M>I_W</M>.</>}
      />
      <p className="text-foreground/85 leading-relaxed">
        La <strong>qualité</strong> d'une partition se mesure par le ratio <M>{`R = I_B / I_T \\in [0,1]`}</M>. Plus <M>R</M> est proche
        de 1, mieux les clusters sont séparés.
      </p>

      <h2 className="font-serif text-3xl font-semibold text-primary mt-16 mb-6 pb-3 border-b border-border">
        Choisir K — la méthode du coude
      </h2>
      <p className="text-foreground/85 leading-relaxed">
        On trace <M>{`I_W(K)`}</M> pour <M>{`K = 1, 2, \\dots`}</M> et on cherche la cassure : l'endroit où ajouter un
        cluster supplémentaire n'apporte plus grand gain.
      </p>
      <ElbowPlot />

      <Callout variant="info" title="Alternative — score de silhouette">
        Pour chaque point <M>i</M>, on calcule <M>{`s(i) = \\frac{b(i) - a(i)}{\\max(a(i), b(i))}`}</M> où
        <M>{`\\,a(i)\\,`}</M> = distance moyenne aux points du même cluster, <M>{`\\,b(i)\\,`}</M> = distance moyenne au
        cluster voisin le plus proche. Le K maximisant la moyenne des <M>{`s(i)`}</M> est optimal.
      </Callout>

      <h2 className="font-serif text-3xl font-semibold text-primary mt-16 mb-6 pb-3 border-b border-border">
        À retenir
      </h2>
      <Callout variant="info" title="Mémo">
        <ul className="list-disc pl-5 space-y-1">
          <li>Algorithme <strong>itératif</strong> : affectation ↔ recalcul des centroïdes.</li>
          <li>Minimise l'<strong>inertie intra</strong> <M>I_W</M> de manière monotone décroissante.</li>
          <li><strong>Sensible à l'initialisation</strong> → K-means++ et plusieurs lancers.</li>
          <li><strong>K à fixer</strong> : critère du coude ou silhouette.</li>
          <li>Suppose des clusters <strong>sphériques</strong> de taille comparable.</li>
        </ul>
      </Callout>

      <div className="mt-16 pt-8 border-t border-border flex justify-between items-center">
        <Link to="/data-mining/cah" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition">
          <ChevronLeft className="w-4 h-4" /> CAH
        </Link>
        <Link to="/data-mining" className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline underline-offset-4">
          Tout le chapitre <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  </PageLayout>
);

export default KMeans;
