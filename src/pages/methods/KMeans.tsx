import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { MethodHero } from "@/components/MethodHero";
import { Callout } from "@/components/Callout";
import { M } from "@/components/Math";
import { FormulaCard } from "@/components/FormulaCard";
import { StepBlock } from "@/components/StepBlock";
import { KMeansViz, ElbowPlot } from "@/components/viz/KMeansViz";
import { MethodMeta } from "@/components/MethodMeta";
import { CodeBlock } from "@/components/CodeBlock";
import { Interpretation } from "@/components/Interpretation";

const PY = `import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
import matplotlib.pyplot as plt

# 1. Données étudiants M1 ESB
df = pd.read_csv("notes_esb.csv", index_col=0)
print(df.head())

# 2. Standardisation
Z = StandardScaler().fit_transform(df)

# 3. Méthode du coude
inerties, silhouettes = [], []
for k in range(2, 9):
    km = KMeans(n_clusters=k, n_init=10, random_state=42).fit(Z)
    inerties.append(km.inertia_)
    silhouettes.append(silhouette_score(Z, km.labels_))

fig, ax = plt.subplots(1, 2, figsize=(12, 4))
ax[0].plot(range(2, 9), inerties, "o-"); ax[0].set_title("Inertie intra (coude)")
ax[1].plot(range(2, 9), silhouettes, "o-"); ax[1].set_title("Silhouette")
plt.show()

# 4. K-means final avec K = 3
km = KMeans(n_clusters=3, n_init=10, random_state=42).fit(Z)
df["cluster"] = km.labels_

# 5. Profils moyens des clusters
print(df.groupby("cluster").mean().round(2))

# 6. Qualité globale = I_B / I_T
I_T = ((Z - Z.mean(axis=0))**2).sum()
I_W = km.inertia_
print(f"R = I_B / I_T = {(I_T - I_W) / I_T:.3f}")`;

const KMeans = () => (
  <PageLayout>
    <MethodHero
      code="K-MEANS"
      tag="Classification non hiérarchique"
      title="Partitionnement K-means"
      subtitle="Diviser n individus en K groupes homogènes en minimisant l'inertie intra-cluster, par itérations successives."
    />

    <section className="container py-14 max-w-3xl">
      <MethodMeta
        objectif={[
          <>Segmenter <M>n</M> individus en <strong>K groupes homogènes</strong>.</>,
          <>Minimiser l'<strong>inertie intra-cluster</strong>.</>,
          <>Méthode <strong>rapide</strong>, scalable à de gros volumes.</>,
        ]}
        conditions={[
          <>Données <strong>quantitatives</strong> standardisées.</>,
          <>Clusters <strong>sphériques</strong> et de tailles comparables.</>,
          <>Choisir <strong>K</strong> à l'avance (coude / silhouette).</>,
          <>Lancer <strong>plusieurs initialisations</strong> (n_init ≥ 10).</>,
        ]}
        attention={[
          <>Converge vers un <strong>minimum local</strong>.</>,
          <>Sensible aux <strong>outliers</strong> (le centroïde = moyenne).</>,
          <>Mauvais pour clusters <strong>allongés</strong> ou de densités différentes.</>,
          <>K mal choisi → segmentation aberrante.</>,
        ]}
      />

      <p className="text-foreground/85 leading-relaxed mb-2">
        Choisir <M>K</M> centroïdes, affecter chaque point au plus proche, recalculer les centroïdes, répéter.
      </p>

      <FormulaCard
        label="Objectif"
        formula={`\\min_{C_1,\\dots,C_K}\\;\\sum_{k=1}^{K}\\sum_{x_i \\in C_k} \\| x_i - \\mu_k \\|^2`}
        legend={<>où <M>{`\\mu_k = \\frac{1}{|C_k|}\\sum_{x \\in C_k} x`}</M> est le centre de gravité du cluster <M>{`C_k`}</M>.</>}
      />

      <KMeansViz />

      <h2 className="font-serif text-3xl font-semibold text-primary mt-12 mb-3 pb-3 border-b border-border">
        L'algorithme, étape par étape
      </h2>

      <StepBlock number="1" title="Initialisation">
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Aléatoire</strong> : K points tirés au hasard.</li>
          <li><strong>K-means++</strong> : choix probabiliste favorisant les points éloignés — convergence plus stable.</li>
        </ul>
      </StepBlock>

      <StepBlock number="2" title="Affectation">
        <FormulaCard formula={`C_k = \\Big\\{\\, x_i \\;:\\; \\|x_i - \\mu_k\\| \\le \\|x_i - \\mu_j\\| \\;\\forall\\, j \\Big\\}`} />
      </StepBlock>

      <StepBlock number="3" title="Mise à jour">
        <FormulaCard formula={`\\mu_k \\leftarrow \\frac{1}{|C_k|}\\sum_{x_i \\in C_k} x_i`} />
      </StepBlock>

      <StepBlock number="4" title="Convergence">
        <p>On répète <strong>2</strong> et <strong>3</strong> jusqu'à stabilisation. L'inertie intra <M>{`I_W`}</M> décroît à chaque itération.</p>
        <Callout variant="warning" title="Optimum local">
          Lancer plusieurs fois (<code>n_init = 10</code>) et garder la meilleure inertie.
        </Callout>
      </StepBlock>

      <h2 className="font-serif text-3xl font-semibold text-primary mt-12 mb-3 pb-3 border-b border-border">
        Décomposition de l'inertie (Huygens)
      </h2>
      <FormulaCard
        formula={`\\underbrace{\\sum_{i=1}^n \\|x_i - g\\|^2}_{I_T} = \\underbrace{\\sum_{k=1}^K \\sum_{x_i \\in C_k} \\|x_i - \\mu_k\\|^2}_{I_W \\text{ intra}} + \\underbrace{\\sum_{k=1}^K |C_k|\\,\\|\\mu_k - g\\|^2}_{I_B \\text{ inter}}`}
        legend={<>Qualité d'une partition : <M>{`R = I_B / I_T \\in [0,1]`}</M>. Plus R proche de 1, mieux les clusters sont séparés.</>}
      />

      <h2 className="font-serif text-3xl font-semibold text-primary mt-12 mb-3 pb-3 border-b border-border">
        Choisir K
      </h2>
      <p className="text-foreground/85 leading-relaxed">
        Méthode du coude : tracer <M>{`I_W(K)`}</M> et chercher la cassure.
      </p>
      <ElbowPlot />

      <Callout variant="info" title="Score de silhouette">
        <FormulaCard formula={`s(i) = \\frac{b(i) - a(i)}{\\max(a(i), b(i))} \\in [-1, 1]`} />
        <ul className="list-disc pl-5 space-y-1">
          <li><M>{`a(i)`}</M> = distance moyenne aux points du <strong>même cluster</strong>.</li>
          <li><M>{`b(i)`}</M> = distance moyenne au <strong>cluster voisin le plus proche</strong>.</li>
          <li><strong>s &gt; 0,5</strong> = clusters bien séparés ; <strong>s &lt; 0,25</strong> = chevauchement important.</li>
        </ul>
      </Callout>

      <Interpretation>
        <p>
          Sur les étudiants M1 ESB, K=3 émerge à la fois du coude et de la silhouette. Les clusters obtenus
          correspondent aux mêmes 3 profils que la CAH : <strong>quanti-tech</strong>, <strong>finance</strong>,
          <strong> marketing/com</strong>.
        </p>
        <p>
          On caractérise chaque cluster en regardant <code>df.groupby("cluster").mean()</code> sur les variables
          d'origine — ce qui donne un nom et une signification aux segments.
        </p>
      </Interpretation>

      <h2 className="font-serif text-3xl font-semibold text-primary mt-12 mb-3 pb-3 border-b border-border">
        Code Python
      </h2>
      <CodeBlock title="K-means avec scikit-learn" code={PY} />

      <h2 className="font-serif text-3xl font-semibold text-primary mt-12 mb-6 pb-3 border-b border-border">Mémo</h2>
      <Callout variant="info" title="À retenir">
        <ul className="list-disc pl-5 space-y-1">
          <li>Algorithme <strong>itératif</strong> : affectation ↔ recalcul.</li>
          <li>Minimise <M>I_W</M> de manière monotone décroissante.</li>
          <li>Sensible à l'<strong>initialisation</strong> → K-means++.</li>
          <li>K à fixer : <strong>coude</strong> ou <strong>silhouette</strong>.</li>
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
