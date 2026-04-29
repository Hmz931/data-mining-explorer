import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { MethodHero } from "@/components/MethodHero";
import { Callout } from "@/components/Callout";
import { M } from "@/components/Math";
import { FormulaCard } from "@/components/FormulaCard";
import { StepBlock } from "@/components/StepBlock";
import { AFCViz, AFC_DATA, AFC_ROWS, AFC_COLS, AFC_DDL } from "@/components/viz/AFCViz";
import { MethodMeta } from "@/components/MethodMeta";
import { Chi2Table } from "@/components/Chi2Table";
import { CodeBlock } from "@/components/CodeBlock";
import { Interpretation } from "@/components/Interpretation";
import { DataPreview } from "@/components/DataPreview";

const PY = `import pandas as pd
import numpy as np
from scipy.stats import chi2_contingency
import prince                          # pip install prince
import matplotlib.pyplot as plt

# 1. Tableau de contingence : spé × matière préférée
df = pd.read_csv("specialisation_matiere.csv", index_col=0)
print(df.head())

# 2. Test du chi-deux d'indépendance
chi2, p, ddl, expected = chi2_contingency(df)
phi2 = chi2 / df.values.sum()
print(f"chi2 = {chi2:.2f}  ddl = {ddl}  p-value = {p:.2e}")
print(f"Inertie totale Phi2 = {phi2:.3f}")

# 3. AFC avec prince
ca = prince.CA(n_components=min(df.shape) - 1).fit(df)
print(ca.eigenvalues_summary)         # variance expliquée par axe

# 4. Biplot lignes + colonnes
ax = ca.plot(df, x_component=0, y_component=1,
             show_row_labels=True, show_column_labels=True)
plt.title("AFC — Spécialisation × Matière (M1 ESB)")
plt.show()

# 5. Résidus standardisés (attraction/répulsion)
residus = (df.values - expected) / np.sqrt(expected)
print(pd.DataFrame(residus, index=df.index, columns=df.columns).round(2))`;

const AFC = () => (
  <PageLayout>
    <MethodHero
      code="AFC"
      tag="Méthode factorielle · qualitative"
      title="Analyse Factorielle des Correspondances"
      subtitle="Visualiser les associations entre les modalités de deux variables qualitatives, à partir d'un tableau de contingence."
    />

    <section className="container py-14 max-w-3xl">
      <MethodMeta
        objectif={[
          <>Décrire l'<strong>association</strong> entre 2 variables qualitatives.</>,
          <>Visualiser <strong>lignes et colonnes</strong> sur un même plan (biplot).</>,
          <>Identifier des <strong>attractions et répulsions</strong> entre modalités.</>,
        ]}
        conditions={[
          <>Données dans un <strong>tableau de contingence</strong> (effectifs ≥ 0).</>,
          <>Effectifs théoriques <strong>≥ 5</strong> dans &gt; 80% des cases (validité du χ²).</>,
          <>Variables <strong>qualitatives</strong> ou variables quanti découpées en classes.</>,
          <>Au moins <strong>I ≥ 3</strong> et <strong>J ≥ 3</strong> pour produire 2 axes utiles.</>,
        ]}
        attention={[
          <>Sans <strong>liaison</strong> significative (χ² non significatif), l'AFC perd son sens.</>,
          <>Une modalité <strong>très rare</strong> peut dominer un axe entier.</>,
          <>Distance utilisée = <strong>distance du χ²</strong>, pas l'euclidienne.</>,
          <>Nb max d'axes = <strong>min(I−1, J−1)</strong>.</>,
        ]}
      />

      <p className="text-lg text-foreground/85 leading-relaxed mb-2">
        L'AFC est l'<strong>équivalent de l'ACP pour des données qualitatives</strong>. Elle décompose le <M>\chi^2</M> de
        contingence pour produire un plan factoriel sur lequel lignes <em>et</em> colonnes coexistent.
      </p>

      <h2 className="font-serif text-3xl font-semibold text-primary mt-12 mb-3 pb-3 border-b border-border">
        Cas d'étude — choix de spécialisation à l'ESB
      </h2>
      <p className="text-foreground/85 leading-relaxed mb-1">
        On a interrogé 286 étudiants M1 sur leur <strong>spécialisation visée en M2</strong> et leur <strong>matière préférée</strong>.
        L'AFC va révéler les liens.
      </p>

      <DataPreview
        title="Tableau de contingence (extrait)"
        rowLabels={AFC_ROWS}
        colLabels={AFC_COLS}
        data={AFC_DATA}
        defaultRows={5}
        decimals={0}
        caption="Effectifs observés · les lignes ne sont pas normalisées."
      />

      <AFCViz />

      <h2 className="font-serif text-3xl font-semibold text-primary mt-12 mb-3 pb-3 border-b border-border">
        Test préalable — le χ² d'indépendance
      </h2>
      <p className="text-foreground/85 leading-relaxed">
        Avant toute AFC, on teste H₀ : « les deux variables sont indépendantes ». Si on ne la rejette pas, l'AFC n'a pas
        d'intérêt.
      </p>
      <FormulaCard
        formula={`\\chi^2 = \\sum_{i,j} \\frac{(n_{ij} - t_{ij})^2}{t_{ij}}, \\qquad t_{ij} = \\frac{n_{i\\bullet}\\, n_{\\bullet j}}{n_{\\bullet\\bullet}}, \\qquad \\mathrm{ddl} = (I-1)(J-1)`}
        legend={
          <>
            Sur notre tableau : χ² ≈ <strong>résultat dans la viz ci-dessus</strong>, ddl = <strong>{AFC_DDL}</strong>. On compare à la
            valeur critique de la table.
          </>
        }
      />
      <Chi2Table highlightDf={AFC_DDL} highlightAlpha={0.05} />
      <Interpretation title="Conclusion du test">
        χ² observé <strong>≫</strong> χ²<sub>0,05 ; {AFC_DDL}</sub> = {[
          7.815, 9.488, 11.143, 13.277, 15.507, 18.307, 24.996, 31.41,
        ][[3, 4, 5, 6, 8, 10, 15, 20].indexOf(AFC_DDL)] ?? "—"}. On rejette H₀ avec une <strong>p-value &lt; 0,001</strong> →
        les variables sont fortement liées, l'AFC est pertinente.
      </Interpretation>

      <h2 className="font-serif text-3xl font-semibold text-primary mt-12 mb-3 pb-3 border-b border-border">
        Le formalisme
      </h2>

      <StepBlock number="1" title="Tableau de contingence et profils">
        <p>Soit <M>{`N = (n_{ij})`}</M> de taille <M>{`I \\times J`}</M>, total <M>{`n_{\\bullet\\bullet}`}</M>.</p>
        <FormulaCard
          formula={`p_{ij} = \\frac{n_{ij}}{n_{\\bullet\\bullet}}, \\quad r_i = \\sum_j p_{ij}, \\quad c_j = \\sum_i p_{ij}`}
          legend={<><M>{`r_i`}</M> = poids de la ligne ; <M>{`c_j`}</M> = poids de la colonne.</>}
        />
      </StepBlock>

      <StepBlock number="2" title="Inertie totale">
        <FormulaCard
          formula={`\\Phi^2 = \\frac{\\chi^2}{n_{\\bullet\\bullet}} = \\sum_{i,j} \\frac{(p_{ij} - r_i c_j)^2}{r_i c_j}`}
          legend={<>L'AFC <em>décompose</em> cette inertie sur ses axes principaux : <M>{`\\sum_k \\lambda_k = \\Phi^2`}</M>.</>}
        />
      </StepBlock>

      <StepBlock number="3" title="Distance du χ² entre profils">
        <FormulaCard formula={`d_{\\chi^2}^2(i, i') = \\sum_j \\frac{1}{c_j}\\left(\\frac{p_{ij}}{r_i} - \\frac{p_{i'j}}{r_{i'}}\\right)^2`} />
        <p>Le <strong>poids 1/<M>c_j</M></strong> donne plus d'importance aux modalités rares — c'est la spécificité de l'AFC.</p>
      </StepBlock>

      <StepBlock number="4" title="Matrice résiduelle & SVD">
        <FormulaCard formula={`S_{ij} = \\frac{p_{ij} - r_i c_j}{\\sqrt{r_i c_j}}, \\qquad S = U\\,\\Sigma\\,V^\\top`} />
        <p>Les valeurs singulières <M>{`\\sigma_k = \\sqrt{\\lambda_k}`}</M> donnent la part d'inertie de chaque axe.</p>
      </StepBlock>

      <StepBlock number="5" title="Coordonnées principales">
        <FormulaCard
          formula={`F_i^{(k)} = \\sqrt{\\lambda_k}\\,\\frac{u_{ik}}{\\sqrt{r_i}}, \\qquad G_j^{(k)} = \\sqrt{\\lambda_k}\\,\\frac{v_{jk}}{\\sqrt{c_j}}`}
        />
        <p>Lignes et colonnes sont représentables sur le <strong>même plan</strong> car les axes sont reliés par les
        formules de transition.</p>
      </StepBlock>

      <h2 className="font-serif text-3xl font-semibold text-primary mt-12 mb-3 pb-3 border-b border-border">
        Lecture du biplot — attractions / répulsions
      </h2>
      <Callout variant="info" title="Règles d'interprétation">
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Ligne ↔ colonne proches du centre</strong> : profils proches du profil moyen, peu spécifiques.</li>
          <li><strong>Ligne ↔ colonne proches et excentrées dans la même direction</strong> : <strong>attraction forte</strong> — observé ≫ théorique.</li>
          <li><strong>Ligne ↔ colonne dans des directions opposées</strong> : <strong>répulsion</strong> — observé ≪ théorique.</li>
          <li>Deux lignes proches = profils-colonnes similaires. Idem pour deux colonnes.</li>
          <li>Une modalité <strong>loin du centre</strong> contribue beaucoup à l'inertie de l'axe.</li>
        </ul>
      </Callout>

      <Interpretation title="Lecture du cas ESB">
        <p>
          <strong>Data Science</strong> est fortement attiré par <strong>Maths/Stat</strong> et <strong>Programmation</strong> →
          ces étudiants viennent surtout des matières quanti.
        </p>
        <p>
          <strong>Marketing</strong> est attiré par <strong>Marketing digital</strong> et <strong>Anglais</strong>, mais
          repoussé par <strong>Maths/Stat</strong> (résidu très négatif).
        </p>
        <p>
          <strong>Conseil</strong> et <strong>Audit</strong> se positionnent près de <strong>Gestion projet</strong> :
          profils transverses, ni purement techniques ni purement commerciaux.
        </p>
      </Interpretation>

      <h2 className="font-serif text-3xl font-semibold text-primary mt-12 mb-3 pb-3 border-b border-border">
        Code Python
      </h2>
      <CodeBlock title="AFC avec scipy + prince" code={PY} />

      <h2 className="font-serif text-3xl font-semibold text-primary mt-12 mb-6 pb-3 border-b border-border">
        Mémo
      </h2>
      <Callout variant="info" title="À retenir">
        <ul className="list-disc pl-5 space-y-1">
          <li>AFC = ACP pour les <strong>tableaux de contingence</strong>.</li>
          <li>Inertie totale = <M>{`\\Phi^2 = \\chi^2 / n`}</M>.</li>
          <li>Distance = <strong>χ²</strong> (poids 1/<M>c_j</M> sur les colonnes).</li>
          <li>Biplot lignes + colonnes : proximité = attraction, opposition = répulsion.</li>
          <li>Nb max d'axes = <strong>min(I−1, J−1)</strong>.</li>
        </ul>
      </Callout>

      <div className="mt-16 pt-8 border-t border-border flex justify-between items-center">
        <Link to="/data-mining/acp" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition">
          <ChevronLeft className="w-4 h-4" /> ACP
        </Link>
        <Link to="/data-mining/acm" className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline underline-offset-4">
          Suivant : ACM <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  </PageLayout>
);

export default AFC;
