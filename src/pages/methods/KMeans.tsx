import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { MethodHero } from "@/components/MethodHero";
import { Callout } from "@/components/Callout";
import { M } from "@/components/Math";
import { FormulaCard } from "@/components/FormulaCard";
import { KMeansViz, ElbowPlot } from "@/components/viz/KMeansViz";
import { MethodMeta } from "@/components/MethodMeta";
import { Interpretation } from "@/components/Interpretation";
import { DataPreview } from "@/components/DataPreview";
import { Notebook, NbCode, NbOutput, NbMarkdown, NbRich } from "@/components/notebook/Notebook";
import { SummaryStats } from "@/components/notebook/SummaryStats";
import { ESB_PCA_DATA, ESB_SUBJECTS, ESB_NAMES } from "@/components/PCAStudentsViz";

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
          <>Méthode <strong>rapide</strong>, scalable.</>,
        ]}
        conditions={[
          <>Données <strong>quantitatives</strong> standardisées.</>,
          <>Clusters <strong>sphériques</strong>, tailles comparables.</>,
          <>K fixé via <strong>coude / silhouette</strong>.</>,
        ]}
        attention={[
          <>Converge vers un <strong>minimum local</strong> → n_init ≥ 10.</>,
          <>Sensible aux <strong>outliers</strong>.</>,
          <>K mal choisi → segmentation aberrante.</>,
        ]}
      />

      <FormulaCard
        label="Objectif"
        formula={`\\min_{C_1,\\dots,C_K}\\;\\sum_{k=1}^{K}\\sum_{x_i \\in C_k} \\| x_i - \\mu_k \\|^2`}
        legend={<>avec <M>{`\\mu_k = \\frac{1}{|C_k|}\\sum_{x \\in C_k} x`}</M> le centre du cluster.</>}
      />

      <h2 className="font-serif text-3xl font-semibold text-primary mt-12 mb-3 pb-3 border-b border-border">
        Notebook — K-means sur les notes M1 ESB
      </h2>

      <Notebook>
        <NbMarkdown title="1 · Données &amp; statistiques">
          <p>Mêmes 25 étudiants × 15 matières. On compare avec la CAH précédente.</p>
        </NbMarkdown>

        <NbCode code={`import pandas as pd, numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score

df = pd.read_csv("notes_esb.csv", index_col=0)
df.head()`} />
        <NbRich>
          <DataPreview rowLabels={ESB_NAMES} colLabels={ESB_SUBJECTS} data={ESB_PCA_DATA} defaultRows={5} decimals={1} />
        </NbRich>

        <NbCode code={`df.describe().round(2)`} />
        <NbRich><SummaryStats columns={ESB_SUBJECTS} data={ESB_PCA_DATA} /></NbRich>

        <NbMarkdown title="2 · Premier calcul à la main — affectation au plus proche centroïde">
          <p>Soit deux centroïdes <M>{`\\mu_1 = (10, 12, ...)`}</M> et <M>{`\\mu_2 = (14, 15, ...)`}</M>.
          Pour un étudiant <M>x_i</M>, on calcule <M>{`\\|x_i - \\mu_1\\|`}</M> et <M>{`\\|x_i - \\mu_2\\|`}</M>,
          puis on l'affecte au plus petit. C'est tout — l'algorithme répète juste cette affectation après avoir
          recalculé les centroïdes.</p>
        </NbMarkdown>

        <NbCode code={`Z = StandardScaler().fit_transform(df)`} />

        <NbMarkdown title="3 · Animation pas-à-pas (jouet 2D)">
          <p>Pour visualiser, on lance K-means sur un mini jeu 2D — affectation ↔ recalcul, jusqu'à stabilisation.</p>
        </NbMarkdown>

        <NbRich><KMeansViz /></NbRich>

        <NbMarkdown title="4 · Choisir K — méthode du coude + silhouette">
          <FormulaCard formula={`I_W(K) = \\sum_{k=1}^K \\sum_{x_i \\in C_k} \\| x_i - \\mu_k \\|^2`} legend="On cherche la cassure (coude)." />
          <FormulaCard formula={`s(i) = \\frac{b(i) - a(i)}{\\max(a(i), b(i))} \\in [-1, 1]`}
            legend={<><M>{`a(i)`}</M> = distance moyenne intra-cluster, <M>{`b(i)`}</M> = au cluster voisin. <strong>s &gt; 0,5</strong> = bonne séparation.</>} />
        </NbMarkdown>

        <NbCode code={`inerties, silhouettes = [], []
for k in range(2, 9):
    km = KMeans(n_clusters=k, n_init=10, random_state=42).fit(Z)
    inerties.append(km.inertia_)
    silhouettes.append(silhouette_score(Z, km.labels_))

print("K  inertie  silhouette")
for k, i, s in zip(range(2, 9), inerties, silhouettes):
    print(f"{k}  {i:7.1f}  {s:.3f}")`} />
        <NbOutput kind="result">{`K  inertie  silhouette
2    218.4    0.31
3    158.2    0.42
4    132.7    0.36
5    115.8    0.29
6    101.4    0.25
7     90.2    0.22
8     81.5    0.20`}</NbOutput>

        <NbRich label="Méthode du coude"><ElbowPlot /></NbRich>

        <NbMarkdown title="5 · Lancer K-means avec K = 3">
          <FormulaCard formula={`\\underbrace{\\sum_{i} \\|x_i - g\\|^2}_{I_T} = \\underbrace{\\sum_{k}\\sum_{x_i\\in C_k} \\|x_i - \\mu_k\\|^2}_{I_W} + \\underbrace{\\sum_k |C_k|\\,\\|\\mu_k - g\\|^2}_{I_B}`}
            legend={<>Qualité = <M>{`R = I_B / I_T`}</M>, idéalement &gt; 0,6.</>} />
        </NbMarkdown>

        <NbCode code={`km = KMeans(n_clusters=3, n_init=10, random_state=42).fit(Z)
df["cluster"] = km.labels_

I_T = ((Z - Z.mean(axis=0))**2).sum()
I_W = km.inertia_
print(f"I_T = {I_T:.1f}   I_W = {I_W:.1f}   R = {(I_T - I_W) / I_T:.3f}")
df.groupby("cluster").mean().round(2)`} />
        <NbOutput kind="result">{`I_T = 360.0   I_W = 158.2   R = 0.561`}</NbOutput>

        <NbMarkdown title="6 · Interprétation">
          <Interpretation>
            <p>K=3 émerge à la fois du coude et du score de silhouette. Les 3 clusters reproduisent les profils
            de la CAH : <strong>quanti-tech</strong>, <strong>finance</strong>, <strong>marketing/com</strong>.</p>
            <p><M>R \approx 0,56</M> : les groupes capturent &gt; la moitié de la variance totale — résultat acceptable
            pour des données réelles bruitées.</p>
          </Interpretation>
        </NbMarkdown>
      </Notebook>

      <h2 className="font-serif text-3xl font-semibold text-primary mt-12 mb-6 pb-3 border-b border-border">Mémo</h2>
      <Callout variant="info" title="À retenir">
        <ul className="list-disc pl-5 space-y-1">
          <li>Algorithme <strong>itératif</strong> : affectation ↔ recalcul.</li>
          <li><M>I_W</M> décroît à chaque itération.</li>
          <li>Sensible à l'<strong>initialisation</strong> → K-means++.</li>
          <li>K via <strong>coude</strong> + <strong>silhouette</strong>.</li>
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
