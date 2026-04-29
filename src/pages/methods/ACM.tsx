import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { MethodHero } from "@/components/MethodHero";
import { Callout } from "@/components/Callout";
import { M } from "@/components/Math";
import { FormulaCard } from "@/components/FormulaCard";
import { ACMViz, ACM_RESP, ACM_NAMES, ACM_QUESTIONS } from "@/components/viz/ACMViz";
import { MethodMeta } from "@/components/MethodMeta";
import { Interpretation } from "@/components/Interpretation";
import { DataPreview } from "@/components/DataPreview";
import { Notebook, NbCode, NbOutput, NbMarkdown, NbRich } from "@/components/notebook/Notebook";
import { ValueCounts } from "@/components/notebook/SummaryStats";

const Q = ACM_QUESTIONS.length;
const seuil = (1 / Q).toFixed(3);

const ACM = () => (
  <PageLayout>
    <MethodHero
      code="ACM"
      tag="Méthode factorielle · qualitative multivariée"
      title="Analyse des Correspondances Multiples"
      subtitle="Étendre l'AFC à plus de deux variables qualitatives via le tableau disjonctif complet ou la matrice de Burt."
    />

    <section className="container py-14 max-w-3xl">
      <MethodMeta
        objectif={[
          <>Analyser un <strong>questionnaire</strong> (Q ≥ 3 variables qualitatives).</>,
          <>Visualiser <strong>modalités + individus</strong> sur un même plan.</>,
          <>Identifier des <strong>profils types</strong>.</>,
        ]}
        conditions={[
          <>Variables <strong>qualitatives</strong>.</>,
          <>Modalités <strong>équilibrées</strong> (éviter n &lt; 5 %).</>,
          <><strong>Q ≥ 3</strong>, <strong>n &gt; 50</strong> recommandé.</>,
        ]}
        attention={[
          <>Inertie brute <strong>artificielle</strong> → utiliser <strong>Benzécri</strong>.</>,
          <>Sélection des axes : <strong>λ &gt; 1/Q</strong>.</>,
          <>Modalités d'une même variable s'excluent par construction.</>,
        ]}
      />

      <h2 className="font-serif text-3xl font-semibold text-primary mt-12 mb-3 pb-3 border-b border-border">
        Notebook — Questionnaire M1 ESB
      </h2>

      <Notebook>
        <NbMarkdown title="1 · Charger le questionnaire">
          <p>{ACM_NAMES.length} étudiants ont répondu à {Q} questions : <strong>{ACM_QUESTIONS.join(", ")}</strong>.
          Objectif : trouver les profils types.</p>
        </NbMarkdown>

        <NbCode code={`import pandas as pd, prince

df = pd.read_csv("questionnaire_esb.csv", index_col=0)
df.shape`} />
        <NbOutput kind="result">{`(${ACM_NAMES.length}, ${Q})`}</NbOutput>

        <NbCode code={`df.head()`} />
        <NbRich><DataPreview rowLabels={ACM_NAMES} colLabels={ACM_QUESTIONS} data={ACM_RESP} defaultRows={5} /></NbRich>

        <NbMarkdown title="2 · Statistiques descriptives — variables qualitatives">
          <p>Pour les colonnes texte, <code>describe</code> donne : count, unique, mode (top), fréquence du mode.
          C'est utile pour repérer les modalités <strong>très rares</strong> (à fusionner pour éviter qu'elles dominent un axe).</p>
        </NbMarkdown>

        <NbCode code={`df.describe(include="object")`} />
        <NbRich><ValueCounts columns={ACM_QUESTIONS} data={ACM_RESP} /></NbRich>

        <NbMarkdown title="3 · Premier calcul — tableau disjonctif Z">
          <FormulaCard formula={`Z_{ij} = \\begin{cases} 1 & \\text{si } i \\text{ a la modalité } j \\\\ 0 & \\text{sinon} \\end{cases}`} />
          <p>Chaque ligne contient exactement <strong>Q = {Q}</strong> valeurs égales à 1.
          Le total général de Z vaut donc <strong>n × Q = {ACM_NAMES.length * Q}</strong>.</p>
        </NbMarkdown>

        <NbCode code={`Z = pd.get_dummies(df).astype(int)
print("Z shape =", Z.shape)
Z.head()`} />

        <NbMarkdown title="4 · Matrice de Burt B = ZᵀZ">
          <p>Matrice symétrique m × m qui croise toutes les paires de modalités.
          Diagonale = effectifs marginaux ; hors-diagonale = mini-tableaux de contingence.</p>
        </NbMarkdown>

        <NbCode code={`B = Z.T @ Z
B.iloc[:6, :6]`} />

        <NbMarkdown title="5 · Lancer l'ACM">
          <FormulaCard formula={`S_{ij} = \\frac{p_{ij} - r_i c_j}{\\sqrt{r_i c_j}}, \\quad p_{ij} = \\frac{Z_{ij}}{nQ}`} />
        </NbMarkdown>

        <NbCode code={`mca = prince.MCA(n_components=5, random_state=42).fit(df)
eig = mca.eigenvalues_
print("Valeurs propres :", eig.round(3))`} />
        <NbOutput kind="result">{`Valeurs propres : [0.412 0.318 0.247 0.198 0.151]`}</NbOutput>

        <NbMarkdown title="6 · Critère 1/Q + correction Benzécri">
          <Callout variant="warning" title="Inertie artificiellement gonflée">
            En ACM, l'inertie totale vaut <M>{`(m - Q)/Q`}</M>. Les % bruts <strong>sous-estiment</strong> les premiers axes.
          </Callout>
          <FormulaCard
            formula={`\\lambda_k > \\frac{1}{Q}, \\qquad \\lambda_k^{\\text{corr}} = \\left(\\frac{Q}{Q-1}\\right)^2\\left(\\lambda_k - \\frac{1}{Q}\\right)^2`}
            legend={<>Pour Q = {Q}, seuil = 1/Q ≈ <strong>{seuil}</strong>. Les axes &gt; seuil sont retenus, les autres ignorés.</>}
          />
        </NbMarkdown>

        <NbCode code={`Q = df.shape[1]
seuil = 1 / Q
mask = eig > seuil
benz = ((Q/(Q-1))**2) * (eig - seuil).clip(min=0)**2
benz_pct = benz / benz.sum() * 100
print(f"Seuil 1/Q = {seuil:.3f}")
print(f"Axes retenus : {mask.sum()}")
print("Variance corrigée %:", benz_pct.round(1))`} />
        <NbOutput kind="result">{`Seuil 1/Q = ${seuil}
Axes retenus : 3
Variance corrigée %: [62.4 24.8 12.8 0.0 0.0]`}</NbOutput>

        <NbRich label="Plan factoriel modalités + individus"><ACMViz /></NbRich>

        <NbMarkdown title="7 · Lecture — attractions / répulsions">
          <ul>
            <li>Modalité <strong>loin du centre</strong> = spécifique.</li>
            <li>Deux modalités proches = <strong>souvent co-occurrentes</strong> (attraction).</li>
            <li>Modalités opposées = <strong>rarement choisies ensemble</strong> (répulsion).</li>
            <li>Un individu est proche des modalités qu'il possède.</li>
            <li>⚠ Modalités d'une <em>même</em> variable s'excluent par construction.</li>
          </ul>
          <Interpretation>
            <p><strong>F1</strong> oppose <em>quanti-tech</em> (DS · Python · Startup · Pratique) à <em>finance-classique</em> (Fin · Excel · Cabinet · Théorie).</p>
            <p><strong>F2</strong> isole le profil <em>marketing-mixte</em> (Mkt · Tableau · Groupe).</p>
            <p>Trois segments cohérents → à confirmer par une <strong>CAH sur les coordonnées factorielles</strong>.</p>
          </Interpretation>
        </NbMarkdown>
      </Notebook>

      <h2 className="font-serif text-3xl font-semibold text-primary mt-12 mb-6 pb-3 border-b border-border">Mémo</h2>
      <Callout variant="info" title="À retenir">
        <ul className="list-disc pl-5 space-y-1">
          <li>ACM = AFC sur le <strong>tableau disjonctif complet</strong>.</li>
          <li>Sélection : <strong>λ &gt; 1/Q</strong>.</li>
          <li>% d'inertie <strong>corrigés Benzécri</strong>.</li>
          <li>Souvent <strong>suivi d'une CAH</strong> sur les coords factorielles.</li>
        </ul>
      </Callout>

      <div className="mt-16 pt-8 border-t border-border flex justify-between items-center">
        <Link to="/data-mining/afc" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition">
          <ChevronLeft className="w-4 h-4" /> AFC
        </Link>
        <Link to="/data-mining/cah" className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline underline-offset-4">
          Suivant : CAH <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  </PageLayout>
);

export default ACM;
