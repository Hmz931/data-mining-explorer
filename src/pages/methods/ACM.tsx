import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { MethodHero } from "@/components/MethodHero";
import { Callout } from "@/components/Callout";
import { M } from "@/components/Math";
import { FormulaCard } from "@/components/FormulaCard";
import { StepBlock } from "@/components/StepBlock";
import { ACMViz, ACM_RESP, ACM_NAMES, ACM_QUESTIONS } from "@/components/viz/ACMViz";
import { MethodMeta } from "@/components/MethodMeta";
import { CodeBlock } from "@/components/CodeBlock";
import { Interpretation } from "@/components/Interpretation";
import { DataPreview } from "@/components/DataPreview";

const PY = `import pandas as pd
import prince                          # pip install prince
import matplotlib.pyplot as plt

# 1. Données : questionnaire 12 étudiants M1 ESB × 4 questions
df = pd.read_csv("questionnaire_esb.csv", index_col=0)
print(df.head())                       # 5 premières lignes

# 2. ACM
mca = prince.MCA(n_components=5, random_state=42).fit(df)
print(mca.eigenvalues_summary)

# 3. Critère de Benzécri : ne garder que lambda > 1/Q
Q = df.shape[1]
seuil = 1 / Q
eig = mca.eigenvalues_
print(f"Q = {Q}, seuil 1/Q = {seuil:.3f}")
print("Axes retenus :", (eig > seuil).sum())

# Variance corrigée de Benzécri
benz = ((Q/(Q-1))**2) * (eig - seuil).clip(min=0)**2
benz_pct = benz / benz.sum()
print("Variance corrigée :", benz_pct.round(3))

# 4. Biplot modalités + individus
mca.plot(df, x_component=0, y_component=1,
         show_row_labels=True, show_column_labels=True)
plt.title("ACM — Profils étudiants M1 ESB")
plt.show()

# 5. Contributions et cos² (qualité de représentation)
print(mca.column_coordinates(df).head())
print(mca.row_coordinates(df).head())`;

const ACM = () => (
  <PageLayout>
    <MethodHero
      code="ACM"
      tag="Méthode factorielle · qualitative multivariée"
      title="Analyse des Correspondances Multiples"
      subtitle="Étendre l'AFC à plus de deux variables qualitatives, via le tableau disjonctif complet ou la matrice de Burt."
    />

    <section className="container py-14 max-w-3xl">
      <MethodMeta
        objectif={[
          <>Analyser un <strong>questionnaire</strong> (Q ≥ 3 variables qualitatives).</>,
          <>Visualiser sur un <strong>même plan</strong> les modalités et les individus.</>,
          <>Identifier des <strong>profils types</strong> (segments, typologies).</>,
        ]}
        conditions={[
          <>Variables <strong>qualitatives</strong> (nominales ou ordinales).</>,
          <>Effectifs <strong>équilibrés</strong> par modalité (éviter modalités avec n &lt; 5%).</>,
          <>Au moins <strong>Q ≥ 3</strong> variables et <strong>n &gt; 50</strong> recommandé.</>,
          <>Modalités d'une même variable : <strong>exclusives</strong> et <strong>exhaustives</strong>.</>,
        ]}
        attention={[
          <>L'inertie totale <M>{`(m-Q)/Q`}</M> est <strong>artificielle</strong> → utiliser <strong>Benzécri</strong>.</>,
          <>Critère de sélection des axes : <strong>λ &gt; 1/Q</strong>.</>,
          <>Modalités <strong>très rares</strong> = points "satellites" qui dominent les axes.</>,
          <>Deux modalités d'une même variable ne sont jamais "associées" (s'excluent).</>,
        ]}
      />

      <p className="text-lg text-foreground/85 leading-relaxed mb-2">
        Quand on a plusieurs variables qualitatives (questionnaires, données socio-démographiques…), l'ACM positionne sur
        un même plan les <strong>modalités</strong> et les <strong>individus</strong>.
      </p>

      <h2 className="font-serif text-3xl font-semibold text-primary mt-12 mb-3 pb-3 border-b border-border">
        Cas d'étude — questionnaire M1 ESB
      </h2>
      <p className="text-foreground/85 leading-relaxed mb-1">
        12 étudiants ont répondu à 4 questions : <strong>spécialisation visée</strong>, <strong>outil préféré</strong>,
        <strong> type de stage cible</strong>, <strong>format de cours préféré</strong>. On cherche les profils types.
      </p>

      <DataPreview
        title="Réponses brutes (df.head)"
        rowLabels={ACM_NAMES}
        colLabels={ACM_QUESTIONS}
        data={ACM_RESP}
        defaultRows={5}
        caption="Chaque cellule contient une modalité (chaîne de caractères)."
      />

      <ACMViz />

      <h2 className="font-serif text-3xl font-semibold text-primary mt-12 mb-3 pb-3 border-b border-border">
        Le formalisme
      </h2>

      <StepBlock number="1" title="Tableau disjonctif complet Z">
        <p>
          <M>n</M> individus, <M>Q</M> variables qualitatives, <M>m</M> modalités au total. Le tableau <M>Z</M> est de taille
          <M>{`\\,n \\times m\\,`}</M> :
        </p>
        <FormulaCard formula={`Z_{ij} = \\begin{cases} 1 & \\text{si l'individu } i \\text{ possède la modalité } j \\\\ 0 & \\text{sinon} \\end{cases}`} />
        <p>Chaque ligne contient exactement <M>Q</M> valeurs égales à 1.</p>
      </StepBlock>

      <StepBlock number="2" title="Matrice de Burt B = Zᵀ Z">
        <p>Symétrique <M>{`m \\times m`}</M>, croise toutes les paires de modalités :</p>
        <FormulaCard
          formula={`B = Z^\\top Z`}
          legend={<>Diagonale = effectifs marginaux d'une modalité ; hors-diagonale = tableaux de contingence entre deux variables.</>}
        />
      </StepBlock>

      <StepBlock number="3" title="ACM = AFC sur Z">
        <FormulaCard formula={`S_{ij} = \\frac{p_{ij} - r_i\\,c_j}{\\sqrt{r_i\\,c_j}}, \\quad p_{ij} = \\frac{Z_{ij}}{nQ}`} />
        <p>
          Avec <M>{`r_i = 1/n`}</M> (poids uniforme des individus) et <M>{`c_j = n_j/(nQ)`}</M> (effectif relatif de la
          modalité <M>j</M>).
        </p>
      </StepBlock>

      <StepBlock number="4" title="Sélection des axes — critère 1/Q">
        <Callout variant="warning" title="Inertie artificiellement gonflée">
          <p>En ACM, l'inertie totale vaut <M>{`(m - Q)/Q`}</M>. Les pourcentages bruts <strong>sous-estiment</strong>
          l'importance des premiers axes.</p>
        </Callout>
        <p>Règle pratique : on ne conserve que les axes pour lesquels :</p>
        <FormulaCard
          formula={`\\lambda_k > \\frac{1}{Q}`}
          legend={
            <>
              Un axe en dessous porte moins d'inertie que la moyenne — il est dû au bruit. Pour notre cas (Q=4),
              le seuil est <strong>0,25</strong>.
            </>
          }
        />
        <p>On corrige ensuite par <strong>Benzécri</strong> :</p>
        <FormulaCard
          formula={`\\lambda_k^{\\text{corr}} = \\left(\\frac{Q}{Q-1}\\right)^2\\left(\\lambda_k - \\frac{1}{Q}\\right)^2 \\quad \\text{si}\\ \\lambda_k > \\frac{1}{Q}`}
          legend={<>Les pourcentages corrigés reflètent <strong>vraiment</strong> la part d'information portée par chaque axe.</>}
        />
      </StepBlock>

      <StepBlock number="5" title="Coordonnées des modalités et individus">
        <FormulaCard formula={`G_j^{(k)} = \\sqrt{\\lambda_k}\\,\\frac{v_{jk}}{\\sqrt{c_j}}, \\quad F_i^{(k)} = \\sqrt{\\lambda_k}\\,\\frac{u_{ik}}{\\sqrt{r_i}}`} />
        <p>Comme en AFC, on obtient un <strong>biplot</strong> où modalités et individus se lisent simultanément.</p>
      </StepBlock>

      <h2 className="font-serif text-3xl font-semibold text-primary mt-12 mb-3 pb-3 border-b border-border">
        Lecture du plan — attractions / répulsions
      </h2>
      <Callout variant="info" title="Règles d'or">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Une modalité <strong>loin du centre</strong> est <em>spécifique</em> (rare ou typique).</li>
          <li>Deux modalités proches dans le plan sont <strong>souvent co-occurrentes</strong> (attraction).</li>
          <li>Deux modalités opposées sont <strong>rarement choisies ensemble</strong> (répulsion).</li>
          <li>Un individu est proche des modalités qu'il possède.</li>
          <li>Modalités d'une <em>même variable</em> : ne pas interpréter comme association — elles s'excluent par construction.</li>
        </ul>
      </Callout>

      <Interpretation>
        <p>
          <strong>F1 oppose</strong> le profil <em>quanti-tech</em> (Spé:DS · Outil:Python · Stage:Startup ·
          Cours:Pratique) au profil <em>finance-classique</em> (Spé:Fin · Outil:Excel · Stage:Cabinet · Cours:Théorie).
        </p>
        <p>
          <strong>F2 isole</strong> le profil <em>marketing-mixte</em> (Spé:Mkt · Outil:Tableau · Stage:Groupe).
        </p>
        <p>
          Les étudiants se regroupent en <strong>3 segments cohérents</strong> que la CAH (étape suivante) pourra
          confirmer formellement.
        </p>
      </Interpretation>

      <h2 className="font-serif text-3xl font-semibold text-primary mt-12 mb-3 pb-3 border-b border-border">
        Code Python
      </h2>
      <CodeBlock title="ACM avec prince" code={PY} />

      <h2 className="font-serif text-3xl font-semibold text-primary mt-12 mb-6 pb-3 border-b border-border">
        Mémo
      </h2>
      <Callout variant="info" title="À retenir">
        <ul className="list-disc pl-5 space-y-1">
          <li>ACM = AFC sur le <strong>tableau disjonctif complet</strong> (ou matrice de Burt).</li>
          <li>Sélection des axes : <strong>λ &gt; 1/Q</strong>.</li>
          <li>Pourcentages d'inertie <strong>corrigés par Benzécri</strong>.</li>
          <li>Outil-roi pour <strong>analyser des questionnaires</strong>.</li>
          <li>Souvent <strong>suivi d'une CAH</strong> sur les coordonnées factorielles pour identifier des segments.</li>
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
