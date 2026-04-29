import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { MethodHero } from "@/components/MethodHero";
import { Callout } from "@/components/Callout";
import { M } from "@/components/Math";
import { FormulaCard } from "@/components/FormulaCard";
import { StepBlock } from "@/components/StepBlock";
import { CAHViz } from "@/components/viz/CAHViz";
import { MethodMeta } from "@/components/MethodMeta";
import { CodeBlock } from "@/components/CodeBlock";
import { Interpretation } from "@/components/Interpretation";

const PY = `import pandas as pd
import numpy as np
from scipy.cluster.hierarchy import linkage, dendrogram, fcluster
from scipy.spatial.distance import pdist
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt

# 1. Données : étudiants M1 ESB × matières (notes /20)
df = pd.read_csv("notes_esb.csv", index_col=0)
print(df.head())

# 2. Standardisation
Z = StandardScaler().fit_transform(df)

# 3. Matrice des distances euclidiennes
D = pdist(Z, metric="euclidean")

# 4. CAH avec critère de Ward
Lk = linkage(D, method="ward")

# 5. Dendrogramme
plt.figure(figsize=(12, 5))
dendrogram(Lk, labels=df.index.tolist(), leaf_rotation=90)
plt.axhline(y=8, color="orange", linestyle="--", label="seuil de coupure")
plt.title("CAH (Ward) — étudiants M1 ESB")
plt.legend(); plt.show()

# 6. Couper le dendrogramme à K = 3 clusters
clusters = fcluster(Lk, t=3, criterion="maxclust")
df["cluster"] = clusters
print(df.groupby("cluster").mean().round(2))   # profils moyens`;

const CAH = () => (
  <PageLayout>
    <MethodHero
      code="CAH"
      tag="Classification hiérarchique"
      title="Classification Ascendante Hiérarchique"
      subtitle="Partir de n singletons, fusionner à chaque étape les deux clusters les plus proches, jusqu'à n'en avoir qu'un seul. Le résultat : un dendrogramme."
    />

    <section className="container py-14 max-w-3xl">
      <MethodMeta
        objectif={[
          <>Construire une <strong>hiérarchie de partitions</strong> sans fixer K à l'avance.</>,
          <>Identifier des <strong>groupes naturels</strong> via le dendrogramme.</>,
          <>Souvent appliquée <strong>après une ACP/ACM</strong> pour segmenter les individus.</>,
        ]}
        conditions={[
          <>Données <strong>quantitatives</strong> standardisées (ou coords factorielles).</>,
          <>Une <strong>distance</strong> bien définie entre individus (Euclidienne par défaut).</>,
          <><strong>n &lt; 1000</strong> en pratique (complexité <M>{`O(n^3)`}</M>).</>,
          <>Choisir un <strong>critère d'agrégation</strong> adapté (Ward par défaut).</>,
        ]}
        attention={[
          <><strong>Sensible aux outliers</strong>, surtout en lien simple/complet.</>,
          <>Les fusions sont <strong>irréversibles</strong> : pas de retour en arrière.</>,
          <>Standardiser <strong>avant</strong> sinon les variables à grande échelle dominent.</>,
          <>Le choix du critère change <strong>radicalement</strong> la forme des clusters.</>,
        ]}
      />

      <p className="text-foreground/85 leading-relaxed mb-2">
        Contrairement à K-means, la CAH ne demande pas de fixer <M>K</M> à l'avance. On obtient une <em>hiérarchie</em> de
        partitions qu'on peut couper à n'importe quel niveau.
      </p>

      <CAHViz />

      <h2 className="font-serif text-3xl font-semibold text-primary mt-12 mb-3 pb-3 border-b border-border">
        L'algorithme
      </h2>

      <StepBlock number="1" title="Initialisation : n singletons">
        <p>Chaque individu est son propre cluster : <M>{`P_0 = \\{\\{x_1\\}, \\dots, \\{x_n\\}\\}`}</M>.</p>
      </StepBlock>

      <StepBlock number="2" title="Matrice des distances">
        <FormulaCard formula={`d(x_i, x_j) = \\sqrt{\\sum_{k=1}^p (x_{ik} - x_{jk})^2}`} />
      </StepBlock>

      <StepBlock number="3" title="Fusion des deux clusters les plus proches">
        <p>Au sens d'un <strong>critère d'agrégation</strong> (voir ci-dessous). On note la hauteur de fusion sur le dendrogramme.</p>
      </StepBlock>

      <StepBlock number="4" title="Mise à jour & itération">
        <p>On recalcule les distances entre le nouveau cluster et les autres, puis on répète jusqu'à n'avoir qu'un seul cluster.</p>
      </StepBlock>

      <h2 className="font-serif text-3xl font-semibold text-primary mt-12 mb-3 pb-3 border-b border-border">
        Les critères d'agrégation
      </h2>
      <div className="space-y-5">
        <FormulaCard label="Lien minimum (single)" formula={`d(A, B) = \\min_{x \\in A, y \\in B} d(x, y)`} legend="Tend à produire des chaînes — sensible aux outliers." />
        <FormulaCard label="Lien maximum (complete)" formula={`d(A, B) = \\max_{x \\in A, y \\in B} d(x, y)`} legend="Produit des clusters compacts." />
        <FormulaCard label="Lien moyen (average)" formula={`d(A, B) = \\frac{1}{|A||B|}\\sum_{x \\in A}\\sum_{y \\in B} d(x, y)`} legend="Bon compromis." />
        <FormulaCard label="Critère de Ward" formula={`\\Delta(A, B) = \\frac{|A|\\cdot|B|}{|A|+|B|}\\;\\| g_A - g_B \\|^2`} legend="Minimise la perte d'inertie inter-cluster — défaut recommandé." />
      </div>

      <Callout variant="math" title="Pourquoi Ward fonctionne si bien">
        Lors d'une fusion, l'inertie intra augmente exactement de <M>{`\\Delta(A, B)`}</M>. Choisir la fusion qui minimise
        <M>{`\\,\\Delta\\,`}</M> revient à conserver la partition la plus <em>compacte possible</em>.
      </Callout>

      <h2 className="font-serif text-3xl font-semibold text-primary mt-12 mb-3 pb-3 border-b border-border">
        Lire un dendrogramme
      </h2>
      <ul className="list-disc pl-6 space-y-1.5 text-foreground/85">
        <li>Axe vertical = <strong>distance de fusion</strong> (ou perte d'inertie pour Ward).</li>
        <li>Plus une fusion est <strong>basse</strong>, plus les éléments sont similaires.</li>
        <li>Pour <M>K</M> clusters : couper à la hauteur où apparaissent <M>K</M> branches.</li>
        <li>Un <strong>grand saut</strong> entre deux fusions consécutives suggère un nombre naturel de clusters juste avant le saut.</li>
      </ul>

      <Interpretation>
        <p>
          Sur les étudiants M1 ESB, la CAH avec Ward fait apparaître typiquement <strong>3 ou 4 segments</strong>
          correspondant aux profils repérés par l'ACM : tech/data, finance, marketing, et parfois un petit cluster
          "transverse".
        </p>
        <p>
          On caractérise ensuite chaque cluster en calculant la <strong>moyenne des variables d'origine</strong> par
          cluster (<code>df.groupby("cluster").mean()</code>) — c'est ce qui donne du sens aux groupes.
        </p>
      </Interpretation>

      <h2 className="font-serif text-3xl font-semibold text-primary mt-12 mb-3 pb-3 border-b border-border">
        Code Python
      </h2>
      <CodeBlock title="CAH avec scipy" code={PY} />

      <h2 className="font-serif text-3xl font-semibold text-primary mt-12 mb-6 pb-3 border-b border-border">Mémo</h2>
      <Callout variant="info" title="À retenir">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Ascendante</strong> : on fusionne (≠ descendante qui divise).</li>
          <li>Pas besoin de fixer <M>K</M> à l'avance.</li>
          <li><strong>Ward</strong> est le défaut recommandé.</li>
          <li>Complexité <M>{`O(n^3)`}</M> — peu adapté aux très gros volumes.</li>
          <li>Souvent enchaînée après ACP/ACM pour segmenter sur les axes factoriels.</li>
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
