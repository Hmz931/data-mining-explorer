import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { MethodHero } from "@/components/MethodHero";
import { Callout } from "@/components/Callout";
import { M } from "@/components/Math";
import { FormulaCard } from "@/components/FormulaCard";
import { AFCViz, AFC_DATA, AFC_ROWS, AFC_COLS, AFC_DDL } from "@/components/viz/AFCViz";
import { MethodMeta } from "@/components/MethodMeta";
import { Chi2Table } from "@/components/Chi2Table";
import { Interpretation } from "@/components/Interpretation";
import { DataPreview } from "@/components/DataPreview";
import { Notebook, NbCode, NbOutput, NbMarkdown, NbRich } from "@/components/notebook/Notebook";
import { SummaryStats } from "@/components/notebook/SummaryStats";

// totals for hand-calculation example
const totalRow = AFC_DATA.map((r) => r.reduce((a, b) => a + b, 0));
const totalCol = AFC_COLS.map((_, j) => AFC_DATA.reduce((s, r) => s + r[j], 0));
const totalAll = totalRow.reduce((a, b) => a + b, 0);
const t00 = (totalRow[0] * totalCol[0]) / totalAll;
const chi00 = ((AFC_DATA[0][0] - t00) ** 2) / t00;

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
          <>Visualiser <strong>lignes et colonnes</strong> sur un même plan.</>,
          <>Identifier <strong>attractions / répulsions</strong>.</>,
        ]}
        conditions={[
          <>Tableau de <strong>contingence</strong> (effectifs ≥ 0).</>,
          <>Effectifs théoriques <strong>≥ 5</strong> dans &gt; 80 % des cases.</>,
          <>Au moins <strong>I ≥ 3</strong>, <strong>J ≥ 3</strong>.</>,
        ]}
        attention={[
          <>Sans liaison significative (<M>\chi^2</M>), l'AFC perd son sens.</>,
          <>Une modalité <strong>très rare</strong> peut dominer un axe.</>,
          <>Distance = <strong>distance du <M>\chi^2</M></strong>.</>,
          <>Nb max d'axes = <strong>min(I−1, J−1)</strong>.</>,
        ]}
      />

      <h2 className="font-serif text-3xl font-semibold text-primary mt-12 mb-3 pb-3 border-b border-border">
        Notebook — Spécialisation × Matière préférée (M1 ESB)
      </h2>

      <Notebook>
        <NbMarkdown title="1 · Charger le tableau de contingence">
          <p>286 étudiants M1 ESB sondés sur leur <strong>spécialisation visée</strong> en M2 et leur <strong>matière préférée</strong>.
          Objectif : voir si certaines spécialités attirent certaines matières.</p>
        </NbMarkdown>

        <NbCode code={`import pandas as pd, numpy as np
from scipy.stats import chi2_contingency

df = pd.read_csv("specialisation_matiere.csv", index_col=0)
df.shape`} />
        <NbOutput kind="result">{`(${AFC_ROWS.length}, ${AFC_COLS.length})`}</NbOutput>

        <NbCode code={`df.head()`} />
        <NbRich>
          <DataPreview rowLabels={AFC_ROWS} colLabels={AFC_COLS} data={AFC_DATA} defaultRows={5} decimals={0} />
        </NbRich>

        <NbMarkdown title="2 · Marges &amp; statistiques">
          <p>Avant tout calcul, on regarde les <strong>effectifs marginaux</strong> (totaux lignes / colonnes) et les
          fréquences. C'est la base du χ² et de l'AFC.</p>
        </NbMarkdown>

        <NbCode code={`df.sum(axis=1)         # totaux par ligne (n_i•)
df.sum(axis=0)         # totaux par colonne (n_•j)
df.values.sum()        # total général n
df.describe().round(2) # stats descriptives par colonne`} />
        <NbRich><SummaryStats columns={AFC_COLS} data={AFC_DATA} decimals={1} /></NbRich>

        <NbMarkdown title="3 · Premier calcul à la main — effectif théorique">
          <FormulaCard formula={`t_{ij} = \\frac{n_{i\\bullet}\\,n_{\\bullet j}}{n_{\\bullet\\bullet}}`} />
          <p>
            Pour la cellule <strong>({AFC_ROWS[0]}, {AFC_COLS[0]})</strong> :{" "}
            <M>{`t_{11} = ${totalRow[0]} \\times ${totalCol[0]} / ${totalAll} \\approx ${t00.toFixed(2)}`}</M>.
          </p>
          <p>
            Observé = <strong>{AFC_DATA[0][0]}</strong>, donc contribution au χ² :{" "}
            <M>{`(${AFC_DATA[0][0]} - ${t00.toFixed(2)})^2 / ${t00.toFixed(2)} \\approx ${chi00.toFixed(2)}`}</M>.
            On somme cette quantité sur toutes les cases pour obtenir <M>\chi^2</M>.
          </p>
        </NbMarkdown>

        <NbMarkdown title="4 · Test du χ² d'indépendance">
          <FormulaCard
            formula={`\\chi^2 = \\sum_{i,j} \\frac{(n_{ij} - t_{ij})^2}{t_{ij}}, \\qquad \\mathrm{ddl} = (I-1)(J-1)`}
          />
        </NbMarkdown>

        <NbCode code={`chi2, p, ddl, expected = chi2_contingency(df)
print(f"chi2 = {chi2:.2f}   ddl = {ddl}   p = {p:.2e}")
print(f"Phi2 (inertie totale) = {chi2/df.values.sum():.3f}")`} />
        <NbOutput kind="result">{`chi2 = 142.7   ddl = ${AFC_DDL}   p = 1.4e-19
Phi2 (inertie totale) = 0.499`}</NbOutput>

        <NbRich label="Table du χ² (valeurs critiques)"><Chi2Table highlightDf={AFC_DDL} highlightAlpha={0.05} /></NbRich>

        <NbMarkdown>
          <Interpretation title="Conclusion du test">
            χ² observé ≫ valeur critique à α = 0,05 et ddl = {AFC_DDL}. On <strong>rejette H₀</strong> :
            les deux variables sont fortement liées → l'AFC est pertinente.
          </Interpretation>
        </NbMarkdown>

        <NbMarkdown title="5 · Résidus standardisés (attractions / répulsions)">
          <FormulaCard formula={`r_{ij} = \\frac{n_{ij} - t_{ij}}{\\sqrt{t_{ij}}}`} legend="≥ +2 → attraction · ≤ −2 → répulsion." />
        </NbMarkdown>

        <NbCode code={`residus = (df.values - expected) / np.sqrt(expected)
pd.DataFrame(residus, index=df.index, columns=df.columns).round(2)`} />

        <NbMarkdown title="6 · Lancer l'AFC">
          <FormulaCard
            formula={`S_{ij} = \\frac{p_{ij} - r_i c_j}{\\sqrt{r_i c_j}}, \\quad S = U\\,\\Sigma\\,V^\\top, \\quad \\sigma_k = \\sqrt{\\lambda_k}`}
          />
          <p>Nombre d'axes = <strong>min(I−1, J−1)</strong> = {AFC_DDL > 0 ? Math.min(AFC_ROWS.length - 1, AFC_COLS.length - 1) : "—"}.</p>
        </NbMarkdown>

        <NbCode code={`import prince
ca = prince.CA(n_components=min(df.shape) - 1).fit(df)
ca.eigenvalues_summary`} />
        <NbOutput kind="result">{`         eig    %     cum %
F1     0.31   62.4   62.4
F2     0.12   24.1   86.5
F3     0.05   10.2   96.7
F4     0.02    3.3  100.0`}</NbOutput>

        <NbRich label="Biplot lignes + colonnes"><AFCViz /></NbRich>

        <NbMarkdown title="7 · Lire le biplot">
          <ul>
            <li><strong>Ligne ↔ colonne proches</strong> dans la même direction (excentrées) : <strong>attraction</strong>.</li>
            <li><strong>Directions opposées</strong> : <strong>répulsion</strong>.</li>
            <li>Modalité au centre : profil moyen, peu spécifique.</li>
            <li>Distance entre 2 lignes ⇒ similarité de profils-colonnes (et inversement).</li>
          </ul>
          <Interpretation>
            <p><strong>Data Science</strong> est attiré par <strong>Maths/Stat</strong> et <strong>Programmation</strong>.</p>
            <p><strong>Marketing</strong> attiré par <strong>Marketing digital</strong> + <strong>Anglais</strong>, repoussé par <strong>Maths/Stat</strong>.</p>
            <p><strong>Conseil/Audit</strong> : profils transverses, près de <strong>Gestion projet</strong>.</p>
          </Interpretation>
        </NbMarkdown>
      </Notebook>

      <h2 className="font-serif text-3xl font-semibold text-primary mt-12 mb-6 pb-3 border-b border-border">Mémo</h2>
      <Callout variant="info" title="À retenir">
        <ul className="list-disc pl-5 space-y-1">
          <li>AFC = ACP pour les <strong>tableaux de contingence</strong>.</li>
          <li>Inertie totale = <M>{`\\Phi^2 = \\chi^2 / n`}</M>.</li>
          <li>Distance du <strong>χ²</strong> (poids 1/<M>c_j</M>).</li>
          <li>Nb axes = <strong>min(I−1, J−1)</strong>.</li>
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
