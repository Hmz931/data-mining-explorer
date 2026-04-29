import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { MethodHero } from "@/components/MethodHero";
import { Callout } from "@/components/Callout";
import { M } from "@/components/Math";
import { FormulaCard } from "@/components/FormulaCard";
import { PCAInteractive } from "@/components/PCAInteractive";
import { PCAStudentsViz, ESB_PCA_DATA, ESB_SUBJECTS, ESB_NAMES } from "@/components/PCAStudentsViz";
import { MethodMeta } from "@/components/MethodMeta";
import { DataPreview } from "@/components/DataPreview";
import { Interpretation } from "@/components/Interpretation";
import { Notebook, NbCode, NbOutput, NbMarkdown, NbRich } from "@/components/notebook/Notebook";
import { SummaryStats } from "@/components/notebook/SummaryStats";

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
          <>Variables <strong>quantitatives continues</strong>.</>,
          <>Présence de <strong>corrélations</strong> entre variables (sinon ACP inutile).</>,
          <><strong>n &gt; p</strong> recommandé · <M>n \geq 30</M>.</>,
          <>Tester avec <strong>KMO &gt; 0,6</strong> et <strong>Bartlett significatif</strong>.</>,
        ]}
        attention={[
          <><strong>Standardiser obligatoirement</strong> si unités différentes.</>,
          <>Sensible aux <strong>valeurs aberrantes</strong>.</>,
          <>Les axes sont <strong>linéaires</strong>.</>,
        ]}
      />

      <PCAInteractive />

      {/* ───────────────────────── NOTEBOOK ───────────────────────── */}
      <h2 className="font-serif text-3xl font-semibold text-primary mt-14 mb-3 pb-3 border-b border-border">
        Notebook — ACP sur les notes M1 ESB
      </h2>

      <Notebook>
        <NbMarkdown title="1 · Charger les données">
          <p>25 étudiants M1 ESB Business Analytics, notés sur 15 matières du semestre. Objectif : retrouver les <strong>familles
          de matières</strong> (Maths, IT, Gestion, Communication) et identifier des profils étudiants.</p>
        </NbMarkdown>

        <NbCode code={`import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler

df = pd.read_csv("notes_esb.csv", index_col=0)
df.shape`} />
        <NbOutput kind="result">{`(25, 15)`}</NbOutput>

        <NbCode code={`df.head()`} />
        <NbRich>
          <DataPreview
            rowLabels={ESB_NAMES}
            colLabels={ESB_SUBJECTS}
            data={ESB_PCA_DATA}
            defaultRows={5}
            decimals={1}
          />
        </NbRich>

        <NbMarkdown title="2 · Statistiques descriptives">
          <p>On regarde <code>df.describe()</code> : moyenne, écart-type, min/max, quartiles, médiane, mode.
          Les ordres de grandeur sont comparables (toutes les notes sont sur /20) — la standardisation reste
          néanmoins recommandée pour égaliser la <strong>variance</strong>.</p>
        </NbMarkdown>

        <NbCode code={`df.describe().round(2)`} />
        <NbRich><SummaryStats columns={ESB_SUBJECTS} data={ESB_PCA_DATA} /></NbRich>

        <NbMarkdown title="3 · Premier calcul à la main — standardiser une variable">
          <p>Avant l'ACP, on centre-réduit chaque colonne :</p>
          <FormulaCard formula={`Z_{ij} = \\frac{X_{ij} - \\bar{X}_j}{\\sigma_j}`} />
          <p>Exemple sur la première matière (<strong>Maths</strong>) — moyenne ≈ 11, écart-type ≈ 3,2.
          Pour Amel (note 13,4) : <M>{`Z = (13.4 - 11.0)/3.2 \\approx 0.75`}</M>.
          Une fois ce calcul fait pour les 15 colonnes, on a la matrice <M>Z</M>.</p>
        </NbMarkdown>

        <NbCode code={`Z = StandardScaler().fit_transform(df)
pd.DataFrame(Z, index=df.index, columns=df.columns).head().round(2)`} />
        <NbOutput kind="result">{`           Maths  Proba   Stat  ...   Soft  Séminaire
Amel        0.75   0.42   0.61  ...  -0.18      0.05
Yann       -1.10  -0.94  -1.22  ...   0.55     -0.31
Léa         0.18   0.30   0.04  ...  -0.40      0.18
Karim      -0.55  -0.42  -0.71  ...   1.20      0.66
Inès        1.32   1.18   1.05  ...   0.12     -0.25`}</NbOutput>

        <NbMarkdown title="4 · Matrice de corrélation R">
          <p>Comme <M>Z</M> est centré-réduit, <M>{`R = Z^\\top Z / (n-1)`}</M> est une matrice de corrélation
          (diagonale = 1, hors-diagonale ∈ [-1, 1]).</p>
          <p>Premier calcul à la main : <M>{`r(\\text{Maths}, \\text{Stat}) = \\frac{1}{n-1} \\sum_i Z_{i,\\text{Maths}} Z_{i,\\text{Stat}} \\approx 0.82`}</M> →
          ces deux matières mesurent la même dimension latente.</p>
        </NbMarkdown>

        <NbCode code={`R = np.corrcoef(Z, rowvar=False)
print(R.round(2))`} />

        <NbMarkdown title="5 · Tests préalables — KMO &amp; Bartlett">
          <p>Avant de lancer l'ACP, on vérifie que les corrélations sont suffisantes pour qu'une réduction de dimension
          ait du sens.</p>
          <FormulaCard
            label="KMO"
            formula={`\\mathrm{KMO} = \\frac{\\sum_{i\\neq j} r_{ij}^2}{\\sum_{i\\neq j} r_{ij}^2 + \\sum_{i\\neq j} a_{ij}^2}`}
            legend={<><strong>&gt; 0,9</strong> excellent · <strong>0,8-0,9</strong> très bien · <strong>&lt; 0,5</strong> ACP déconseillée.</>}
          />
          <FormulaCard
            label="Bartlett"
            formula={`\\chi^2 = -\\left(n - 1 - \\frac{2p + 5}{6}\\right) \\ln |\\mathbf{R}|, \\quad \\mathrm{ddl} = \\frac{p(p-1)}{2}`}
            legend={<>H₀ : <em>R = I</em> (variables indépendantes). p-value &lt; 0,05 → ACP légitime.</>}
          />
        </NbMarkdown>

        <NbCode code={`from factor_analyzer.factor_analyzer import calculate_kmo, calculate_bartlett_sphericity
chi2, p = calculate_bartlett_sphericity(df)
kmo_per_var, kmo_total = calculate_kmo(df)
print(f"Bartlett  chi2 = {chi2:.1f}  p = {p:.2e}")
print(f"KMO total = {kmo_total:.3f}")`} />
        <NbOutput kind="result">{`Bartlett  chi2 = 218.4  p = 1.7e-22
KMO total = 0.741`}</NbOutput>

        <NbMarkdown>
          <p>✅ Bartlett rejette H₀ (p ≪ 0,05) et KMO = 0,74 (correct). On peut lancer l'ACP.</p>
        </NbMarkdown>

        <NbMarkdown title="6 · Décomposition spectrale">
          <FormulaCard formula={`\\mathbf{R}\\,\\mathbf{v}_k = \\lambda_k\\,\\mathbf{v}_k`} legend="vecteurs propres = nouveaux axes ; valeurs propres = variance portée." />
        </NbMarkdown>

        <NbCode code={`from sklearn.decomposition import PCA
acp = PCA(n_components=df.shape[1]).fit(Z)
eig = acp.explained_variance_
var_ratio = acp.explained_variance_ratio_

print("Valeurs propres :", eig.round(3))
print("Variance %      :", (var_ratio*100).round(1))
print("Cumulé %        :", (var_ratio.cumsum()*100).round(1))`} />
        <NbOutput kind="result">{`Valeurs propres : [5.41 2.71 1.69 1.16 0.81 0.62 ...]
Variance %      : [36.1 18.1 11.3  7.7  5.4  4.1  ...]
Cumulé %        : [36.1 54.2 65.5 73.2 78.6 82.7 ...]`}</NbOutput>

        <NbMarkdown title="7 · Critère de Kaiser — λ &gt; 1">
          <p>On garde les axes dont la valeur propre dépasse 1 (un axe doit porter plus que la variance d'une variable
          standardisée). Ici : <strong>4 axes</strong> retenus, qui correspondent aux 4 familles de matières.</p>
        </NbMarkdown>

        <NbCode code={`(eig > 1).sum(), var_ratio[:4].sum()`} />
        <NbOutput kind="result">{`(4, 0.732)`}</NbOutput>

        <NbMarkdown title="8 · Visualisation : éboulis, cercle, plan des individus">
          <p>Trois graphiques produits ensemble :</p>
          <ul>
            <li><strong>Scree plot</strong> : la cassure (« coude ») confirme le nombre d'axes utiles.</li>
            <li><strong>Cercle des corrélations</strong> : <M>{`\\mathrm{cor}(X_j, F_k) = v_{kj}\\sqrt{\\lambda_k}`}</M>.</li>
            <li><strong>Plan des individus</strong> : <M>{`F_{ik} = \\sum_j v_{kj}\\,Z_{ij}`}</M>.</li>
          </ul>
        </NbMarkdown>

        <NbCode code={`F = acp.transform(Z)
loadings = acp.components_.T * np.sqrt(eig)   # corrélations variables-axes
import matplotlib.pyplot as plt
fig, ax = plt.subplots(1, 3, figsize=(16, 5))
ax[0].bar(range(1, len(eig)+1), eig); ax[0].axhline(1, ls="--"); ax[0].set_title("Scree")
# ...cercle + plan...
plt.show()`} />

        <NbRich label="Sortie graphique"><PCAStudentsViz /></NbRich>

        <NbMarkdown title="9 · Lecture du cercle des corrélations">
          <p>Chaque variable <M>X_j</M> devient un point de coordonnées
          <span className="ml-1"><M>{`\\big(\\mathrm{cor}(X_j, F_1),\\, \\mathrm{cor}(X_j, F_2)\\big)`}</M></span>.
          La <strong>longueur</strong> = qualité de représentation (cos²).</p>
          <ul>
            <li><strong>Angle aigu</strong> entre 2 flèches : variables corrélées positivement.</li>
            <li><strong>Angle droit</strong> : indépendantes (sur ce plan).</li>
            <li><strong>Angle plat</strong> : anti-corrélées.</li>
            <li>Variable <strong>au centre</strong> : mal représentée → chercher d'autres axes.</li>
          </ul>
        </NbMarkdown>

        <NbCode code={`# Profils moyens des "familles" pour vérifier l'interprétation
families = {"math": ["Maths","Proba","Stat","RO"],
            "it":   ["Programmation","BDD","SI","PL/SQL"],
            "mgmt": ["Gestion","Finance","Marketing","Projets"],
            "comm": ["Anglais","Soft skills","Séminaire"]}
for name, cols in families.items():
    print(f"{name:5s} mean={df[cols].mean().mean():.2f}  std={df[cols].mean().std():.2f}")`} />

        <NbMarkdown title="10 · Interprétation">
          <Interpretation>
            <p><strong>F1 (~36%)</strong> oppose les profils <em>scientifico-techniques</em> (Maths/Stat/IT) aux profils
            <em>littéraire-gestion</em>. <strong>F2 (~18%)</strong> isole l'axe <em>communication</em>.</p>
            <p>Les flèches <strong>Maths-Proba-Stat-RO</strong> sont presque colinéaires → une seule dimension latente.
            Idem pour <strong>BDD-SI-Programmation-PL/SQL</strong>.</p>
            <p>Critère de Kaiser : <strong>4 axes</strong> retenus (cumul ≈ 73 %).</p>
          </Interpretation>
        </NbMarkdown>
      </Notebook>

      <h2 className="font-serif text-3xl font-semibold text-primary mt-14 mb-6 pb-3 border-b border-border">Mémo</h2>
      <Callout variant="info" title="À retenir">
        <ul className="list-disc pl-5 space-y-1">
          <li>ACP = <strong>rotation</strong> du repère, sans perte d'information.</li>
          <li>Standardiser <strong>presque toujours</strong>.</li>
          <li>Critère de <strong>Kaiser : λ &gt; 1</strong> · ou cumul ≥ 80 %.</li>
          <li>Plan des individus + cercle des corrélations = duo d'interprétation.</li>
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
