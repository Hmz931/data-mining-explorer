import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { MethodHero } from "@/components/MethodHero";
import { Callout } from "@/components/Callout";
import { M } from "@/components/Math";
import { FormulaCard } from "@/components/FormulaCard";
import { CAHViz } from "@/components/viz/CAHViz";
import { MethodMeta } from "@/components/MethodMeta";
import { Interpretation } from "@/components/Interpretation";
import { DataPreview } from "@/components/DataPreview";
import { Notebook, NbCode, NbOutput, NbMarkdown, NbRich } from "@/components/notebook/Notebook";
import { SummaryStats } from "@/components/notebook/SummaryStats";
import { ESB_PCA_DATA, ESB_SUBJECTS, ESB_NAMES } from "@/components/PCAStudentsViz";

// Hand-calc demo: distance between two students on first 4 numeric columns
const a = ESB_PCA_DATA[0], b = ESB_PCA_DATA[1];
const d01 = Math.sqrt(a.reduce((s, v, k) => s + (v - b[k]) ** 2, 0));

const CAH = () => (
  <PageLayout>
    <MethodHero
      code="CAH"
      tag="Classification hiérarchique"
      title="Classification Ascendante Hiérarchique"
      subtitle="Partir de n singletons, fusionner les deux clusters les plus proches, jusqu'à n'en avoir qu'un. Résultat : un dendrogramme."
    />

    <section className="container py-14 max-w-3xl">
      <MethodMeta
        objectif={[
          <>Construire une <strong>hiérarchie</strong> de partitions sans fixer K à l'avance.</>,
          <>Identifier des <strong>groupes naturels</strong> via le dendrogramme.</>,
          <>Souvent appliquée <strong>après ACP/ACM</strong>.</>,
        ]}
        conditions={[
          <>Données <strong>quantitatives</strong> standardisées (ou coords factorielles).</>,
          <>Une <strong>distance</strong> bien définie (Euclidienne par défaut).</>,
          <><strong>n &lt; 1000</strong> en pratique (<M>{`O(n^3)`}</M>).</>,
        ]}
        attention={[
          <>Sensible aux <strong>outliers</strong>.</>,
          <>Fusions <strong>irréversibles</strong>.</>,
          <>Standardiser <strong>avant</strong>.</>,
        ]}
      />

      <h2 className="font-serif text-3xl font-semibold text-primary mt-12 mb-3 pb-3 border-b border-border">
        Notebook — CAH sur les notes M1 ESB
      </h2>

      <Notebook>
        <NbMarkdown title="1 · Charger les données">
          <p>Mêmes données que pour l'ACP : 25 étudiants × 15 matières. On cherche cette fois des <strong>groupes
          d'étudiants</strong> (et non des axes).</p>
        </NbMarkdown>

        <NbCode code={`import pandas as pd, numpy as np
from scipy.cluster.hierarchy import linkage, dendrogram, fcluster
from scipy.spatial.distance import pdist
from sklearn.preprocessing import StandardScaler

df = pd.read_csv("notes_esb.csv", index_col=0)
df.shape`} />
        <NbOutput kind="result">{`(${ESB_NAMES.length}, ${ESB_SUBJECTS.length})`}</NbOutput>

        <NbCode code={`df.head()`} />
        <NbRich>
          <DataPreview rowLabels={ESB_NAMES} colLabels={ESB_SUBJECTS} data={ESB_PCA_DATA} defaultRows={5} decimals={1} />
        </NbRich>

        <NbCode code={`df.describe().round(2)`} />
        <NbRich><SummaryStats columns={ESB_SUBJECTS} data={ESB_PCA_DATA} /></NbRich>

        <NbMarkdown title="2 · Premier calcul à la main — distance entre deux étudiants">
          <FormulaCard formula={`d(x_i, x_j) = \\sqrt{\\sum_{k=1}^p (x_{ik} - x_{jk})^2}`} />
          <p>
            Distance brute entre <strong>{ESB_NAMES[0]}</strong> et <strong>{ESB_NAMES[1]}</strong> sur les 15 matières :{" "}
            <M>{`d \\approx ${d01.toFixed(2)}`}</M>. (En pratique on standardise <em>avant</em> ce calcul.)
          </p>
        </NbMarkdown>

        <NbCode code={`Z = StandardScaler().fit_transform(df)
D = pdist(Z, metric="euclidean")          # vecteur condensé n(n-1)/2
print("Nombre de paires :", len(D))
print("min/median/max :", D.min().round(2), np.median(D).round(2), D.max().round(2))`} />
        <NbOutput kind="result">{`Nombre de paires : 300
min/median/max : 1.42 4.18 7.91`}</NbOutput>

        <NbMarkdown title="3 · Critères d'agrégation">
          <div className="space-y-3">
            <FormulaCard label="Lien minimum (single)" formula={`d(A,B) = \\min_{x\\in A,y\\in B} d(x,y)`} legend="Tend à former des chaînes." />
            <FormulaCard label="Lien maximum (complete)" formula={`d(A,B) = \\max_{x\\in A,y\\in B} d(x,y)`} legend="Clusters compacts." />
            <FormulaCard label="Lien moyen (average)" formula={`d(A,B) = \\frac{1}{|A||B|}\\sum_{x\\in A}\\sum_{y\\in B} d(x,y)`} legend="Bon compromis." />
            <FormulaCard label="Ward" formula={`\\Delta(A,B) = \\frac{|A||B|}{|A|+|B|}\\,\\|g_A - g_B\\|^2`} legend="Minimise la perte d'inertie inter — défaut recommandé." />
          </div>
        </NbMarkdown>

        <NbCode code={`Lk = linkage(D, method="ward")
print("Forme :", Lk.shape, "  hauteur max :", Lk[-1, 2].round(2))`} />
        <NbOutput kind="result">{`Forme : (24, 4)   hauteur max : 18.42`}</NbOutput>

        <NbRich label="Dendrogramme interactif"><CAHViz /></NbRich>

        <NbMarkdown title="4 · Couper le dendrogramme">
          <p>On choisit K en cherchant le <strong>plus grand saut vertical</strong>. Avec K=3 ici :</p>
        </NbMarkdown>

        <NbCode code={`clusters = fcluster(Lk, t=3, criterion="maxclust")
df["cluster"] = clusters
df.groupby("cluster").mean().round(2)        # profils moyens
df.groupby("cluster").size()                  # taille des clusters`} />
        <NbOutput kind="result">{`cluster
1    9
2    8
3    8
dtype: int64`}</NbOutput>

        <NbMarkdown title="5 · Interprétation">
          <Interpretation>
            <p>Avec Ward, on retrouve <strong>3 segments</strong> alignés sur l'ACM : <em>tech/data</em>,
            <em> finance</em>, <em>marketing/com</em>. Pour donner un sens aux clusters, on regarde
            <code> df.groupby("cluster").mean()</code> sur les variables d'origine.</p>
          </Interpretation>
        </NbMarkdown>
      </Notebook>

      <h2 className="font-serif text-3xl font-semibold text-primary mt-12 mb-6 pb-3 border-b border-border">Mémo</h2>
      <Callout variant="info" title="À retenir">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Ascendante</strong> : on fusionne (≠ descendante).</li>
          <li>Pas besoin de fixer K à l'avance.</li>
          <li><strong>Ward</strong> = défaut recommandé.</li>
          <li>Complexité <M>{`O(n^3)`}</M>.</li>
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
