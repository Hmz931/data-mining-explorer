import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { MethodHero } from "@/components/MethodHero";
import { Callout } from "@/components/Callout";
import { M } from "@/components/Math";
import { FormulaCard } from "@/components/FormulaCard";
import { StepBlock } from "@/components/StepBlock";
import { PCAInteractive } from "@/components/PCAInteractive";
import { PCAStudentsViz, ESB_PCA_DATA, ESB_SUBJECTS, ESB_NAMES } from "@/components/PCAStudentsViz";
import { MethodMeta } from "@/components/MethodMeta";
import { DataPreview } from "@/components/DataPreview";
import { CodeBlock } from "@/components/CodeBlock";
import { Interpretation } from "@/components/Interpretation";

const PYTHON_CODE = `import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt
import seaborn as sns

# 1. Données : 25 étudiants M1 ESB × 15 matières (notes /20)
df = pd.read_csv("notes_esb.csv", index_col=0)
print(df.head())            # aperçu des 5 premières lignes
print(df.describe())        # statistiques descriptives

# 2. Standardisation (centrer-réduire)
scaler = StandardScaler()
Z = scaler.fit_transform(df)

# 3. ACP
acp = PCA(n_components=df.shape[1])
F = acp.fit_transform(Z)            # coordonnées factorielles
eig = acp.explained_variance_       # valeurs propres (Kaiser : > 1)
var_ratio = acp.explained_variance_ratio_

# 4. Critère de Kaiser
print("Axes retenus (lambda > 1) :", (eig > 1).sum())
print("Variance cumulée :", var_ratio.cumsum().round(3))

# 5. Cercle des corrélations : corr(variable, axe_k) = v_k * sqrt(lambda_k)
loadings = acp.components_.T * np.sqrt(eig)
corr_circle = pd.DataFrame(loadings[:, :2], index=df.columns,
                           columns=["F1", "F2"])

# 6. Visualisations
fig, ax = plt.subplots(1, 2, figsize=(14, 6))
sns.heatmap(df.corr(), annot=True, cmap="RdBu_r", center=0, ax=ax[0])
ax[0].set_title("Correlogramme")

ax[1].add_patch(plt.Circle((0, 0), 1, fill=False))
for i, name in enumerate(df.columns):
    ax[1].arrow(0, 0, loadings[i, 0], loadings[i, 1], head_width=0.03)
    ax[1].text(loadings[i, 0]*1.1, loadings[i, 1]*1.1, name)
ax[1].set_xlim(-1.1, 1.1); ax[1].set_ylim(-1.1, 1.1)
ax[1].set_title("Cercle des corrélations")
plt.show()`;

const ACP = () => (
  <PageLayout>
    <MethodHero
      code="ACP"
      tag="Méthode factorielle · quantitative"
      title="Analyse en Composantes Principales"
      subtitle="Réduire la dimension d'un tableau quantitatif en projetant sur de nouveaux axes — les composantes principales — qui capturent un maximum de variance."
    />

    <section className="container py-14 max-w-3xl">
      <MethodMeta
        objectif={[
          <>Résumer p variables <strong>quantitatives</strong> en 2-3 axes synthétiques.</>,
          <>Visualiser les <strong>proximités entre individus</strong> et les <strong>liens entre variables</strong>.</>,
          <>Identifier des <strong>profils</strong> (typologies) sans variable cible.</>,
        ]}
        conditions={[
          <>Variables <strong>quantitatives continues</strong> ou ratios.</>,
          <>Présence de <strong>corrélations</strong> entre variables (sinon ACP inutile).</>,
          <><strong>n &gt; p</strong> recommandé · taille suffisante (souvent <M>n \geq 30</M>).</>,
          <>Tester avec <strong>KMO &gt; 0,6</strong> et test de <strong>Bartlett significatif</strong>.</>,
        ]}
        attention={[
          <><strong>Standardiser obligatoirement</strong> si unités différentes.</>,
          <>Sensible aux <strong>valeurs aberrantes</strong> (outliers).</>,
          <>Les axes sont <strong>linéaires</strong> — non pertinents si relations non-linéaires.</>,
          <>L'interprétation des axes <strong>n'est pas automatique</strong>.</>,
        ]}
      />

      <h2 className="font-serif text-3xl font-semibold text-primary mt-12 mb-3 pb-3 border-b border-border">
        L'idée en une intuition
      </h2>
      <p className="text-foreground/85 leading-relaxed mb-4">
        On cherche les <strong>directions</strong> où le nuage de points est le plus dispersé. Ces directions sont les
        <strong> composantes principales</strong>. Projeter sur les premières donne une carte fidèle du nuage.
      </p>
      <PCAInteractive />

      <h2 className="font-serif text-3xl font-semibold text-primary mt-16 mb-3 pb-3 border-b border-border">
        Tests préalables
      </h2>
      <Callout variant="math" title="KMO — Kaiser-Meyer-Olkin">
        <FormulaCard
          formula={`\\mathrm{KMO} = \\frac{\\sum_{i\\neq j} r_{ij}^2}{\\sum_{i\\neq j} r_{ij}^2 + \\sum_{i\\neq j} a_{ij}^2}`}
          legend={
            <>
              <M>{`r_{ij}`}</M> = corrélations simples ; <M>{`a_{ij}`}</M> = corrélations partielles. Lecture :
              <strong> &gt; 0,9</strong> excellent · <strong>0,8-0,9</strong> très bien · <strong>&lt; 0,5</strong> ACP déconseillée.
            </>
          }
        />
      </Callout>
      <Callout variant="math" title="Test de sphéricité de Bartlett">
        <p>Teste H₀ : <em>la matrice de corrélation est l'identité</em> (variables non corrélées → ACP inutile).</p>
        <FormulaCard
          formula={`\\chi^2 = -\\left(n - 1 - \\frac{2p + 5}{6}\\right) \\ln |\\mathbf{R}|, \\quad \\mathrm{ddl} = \\frac{p(p-1)}{2}`}
          legend={<>Si <strong>p-value &lt; 0,05</strong> → on rejette H₀ → l'ACP est légitime.</>}
        />
      </Callout>

      <h2 className="font-serif text-3xl font-semibold text-primary mt-16 mb-3 pb-3 border-b border-border">
        L'algorithme en 5 étapes
      </h2>

      <StepBlock number="1" title="Standardiser">
        <FormulaCard
          formula={`Z_{ij} = \\frac{X_{ij} - \\bar{X}_j}{\\sigma_j}`}
          legend="Centre + réduit chaque variable. Indispensable si unités différentes."
        />
      </StepBlock>

      <StepBlock number="2" title="Matrice de corrélation">
        <FormulaCard
          formula={`\\mathbf{R} = \\frac{1}{n-1}\\,\\mathbf{Z}^\\top \\mathbf{Z}`}
          legend={<>Symétrique <M>{`p \\times p`}</M>, diagonale = 1.</>}
        />
      </StepBlock>

      <StepBlock number="3" title="Décomposition spectrale">
        <FormulaCard formula={`\\mathbf{R}\\,\\mathbf{v}_k = \\lambda_k\\,\\mathbf{v}_k`} />
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Vecteurs propres</strong> <M>{`\\mathbf{v}_k`}</M> = directions des nouveaux axes.</li>
          <li><strong>Valeurs propres</strong> <M>{`\\lambda_k`}</M> = variance portée par chaque axe.</li>
        </ul>
      </StepBlock>

      <StepBlock number="4" title="Sélection des axes — critères">
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Kaiser</strong> : on garde les axes avec <M>{`\\lambda_k > 1`}</M> (un axe doit porter plus que la variance d'une variable standardisée).</li>
          <li><strong>Coude (scree)</strong> : cassure visible dans l'éboulis.</li>
          <li><strong>Cumul</strong> : <M>{`\\sum_{k\\leq K} \\tau_k \\geq 80\\%`}</M>.</li>
        </ul>
        <FormulaCard formula={`\\tau_k = \\frac{\\lambda_k}{\\sum_j \\lambda_j} = \\frac{\\lambda_k}{p}`} />
      </StepBlock>

      <StepBlock number="5" title="Coordonnées & projection">
        <FormulaCard
          formula={`F_{ik} = \\sum_{j=1}^{p} v_{kj}\\,Z_{ij}, \\qquad \\mathrm{cor}(X_j, F_k) = v_{kj}\\sqrt{\\lambda_k}`}
          legend={<>Première formule = coordonnées des individus. Seconde = coordonnées des variables sur le cercle.</>}
        />
      </StepBlock>

      <h2 className="font-serif text-3xl font-semibold text-primary mt-16 mb-3 pb-3 border-b border-border">
        Cas d'étude — étudiants M1 ESB
      </h2>
      <p className="text-foreground/85 leading-relaxed mb-2">
        25 étudiants de notre promo, notés sur 15 matières du semestre. On veut voir si l'ACP retrouve les <strong>familles</strong>
        de matières (Maths, IT, Gestion, Communication).
      </p>

      <DataPreview
        title="df.head() — notes /20"
        rowLabels={ESB_NAMES}
        colLabels={ESB_SUBJECTS}
        data={ESB_PCA_DATA}
        defaultRows={5}
        decimals={1}
        caption="Échantillon synthétique généré pour les besoins du cours · 25 lignes × 15 colonnes."
      />

      <PCAStudentsViz />

      <Interpretation>
        <p>
          <strong>F1 (~36%)</strong> sépare les étudiants à profil <em>scientifique-technique</em> (Maths/Stat/IT) de ceux à profil
          plus <em>littéraire-gestion</em>. <strong>F2 (~18%)</strong> oppose les matières de <em>communication</em> aux matières
          purement <em>quantitatives</em>.
        </p>
        <p>
          Sur le cercle, les flèches <strong>Maths-Proba-Stat-RO</strong> sont presque colinéaires : ces matières mesurent
          une seule dimension latente. Idem pour le cluster <strong>BDD-SI-Programmation-PL/SQL</strong>. Les vecteurs
          presque <strong>orthogonaux</strong> entre familles signalent une indépendance entre les compétences.
        </p>
        <p>
          Critère de Kaiser : <strong>4 axes</strong> ont λ &gt; 1, ce qui correspond bien aux 4 familles de matières.
          Cumul ≈ <strong>78%</strong> sur ces 4 axes : une bonne synthèse.
        </p>
      </Interpretation>

      <h2 className="font-serif text-3xl font-semibold text-primary mt-16 mb-3 pb-3 border-b border-border">
        Lire le cercle des corrélations
      </h2>
      <Callout variant="info" title="Comment sont tracés les vecteurs ?">
        <p>
          Chaque variable <M>X_j</M> devient un point de coordonnées
          <span className="ml-1"><M>{`\\big(\\,\\mathrm{cor}(X_j, F_1),\\; \\mathrm{cor}(X_j, F_2)\\big)`}</M></span>
          dans le plan factoriel.
        </p>
        <p>
          La <strong>longueur</strong> du vecteur (<M>{`\\sqrt{\\mathrm{cor}^2(X_j, F_1) + \\mathrm{cor}^2(X_j, F_2)}`}</M>) mesure la
          <strong> qualité de représentation</strong> (cos²). Une variable proche du cercle est très bien représentée par les
          deux premiers axes.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Angle aigu</strong> entre deux flèches : variables corrélées positivement.</li>
          <li><strong>Angle droit</strong> : variables indépendantes (du point de vue du plan).</li>
          <li><strong>Angle plat (180°)</strong> : variables anti-corrélées.</li>
          <li>Une variable <strong>au centre</strong> est mal représentée — il faut chercher d'autres axes.</li>
        </ul>
      </Callout>

      <h2 className="font-serif text-3xl font-semibold text-primary mt-16 mb-3 pb-3 border-b border-border">
        Code Python complet
      </h2>
      <CodeBlock title="ACP avec scikit-learn" code={PYTHON_CODE} />

      <h2 className="font-serif text-3xl font-semibold text-primary mt-16 mb-6 pb-3 border-b border-border">
        Mémo
      </h2>
      <Callout variant="info" title="À retenir">
        <ul className="list-disc pl-5 space-y-1">
          <li>ACP = <strong>rotation</strong> du repère, sans perte d'information.</li>
          <li>Standardiser <strong>presque toujours</strong>.</li>
          <li>Critère de <strong>Kaiser : λ &gt; 1</strong> · ou cumul ≥ 80%.</li>
          <li>Plan des individus + cercle des corrélations = duo d'interprétation.</li>
          <li>Variables au centre du cercle = mal représentées par F1-F2.</li>
        </ul>
      </Callout>

      <div className="mt-16 pt-8 border-t border-border flex justify-between items-center">
        <Link to="/data-mining" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition">
          <ChevronLeft className="w-4 h-4" /> Tout le chapitre
        </Link>
        <Link to="/data-mining/afc" className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline underline-offset-4">
          Suivant : AFC <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  </PageLayout>
);

export default ACP;
