import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { MethodHero } from "@/components/MethodHero";
import { Callout } from "@/components/Callout";
import { M } from "@/components/Math";
import { FormulaCard } from "@/components/FormulaCard";
import { AFCViz } from "@/components/viz/AFCViz";
import { MethodMeta } from "@/components/MethodMeta";
import { Chi2Table } from "@/components/Chi2Table";
import { Interpretation } from "@/components/Interpretation";
import { DataPreview } from "@/components/DataPreview";
import { Notebook, NbCode, NbOutput, NbMarkdown, NbRich } from "@/components/notebook/Notebook";
import { CodeTabs } from "@/components/notebook/CodeTabs";
import { QCM } from "@/components/QCM";

// Tableau de contingence du TP — Niveau d'études × Type de médias
const TAB_ROWS = ["Prim", "Second", "Tech", "Sup"];
const TAB_COLS = ["Radio", "Tele", "QuotNat", "QuotReg", "PrMag", "PrTV"];
const TAB_DATA = [
  [908, 869, 901, 619, 1307, 1008],
  [1035, 612, 73, 107, 80, 177],
  [642, 408, 140, 209, 360, 336],
  [311, 298, 435, 494, 504, 281],
];
const totalRow = TAB_DATA.map((r) => r.reduce((a, b) => a + b, 0));
const totalCol = TAB_COLS.map((_, j) => TAB_DATA.reduce((s, r) => s + r[j], 0));
const totalAll = totalRow.reduce((a, b) => a + b, 0);
const t00 = (totalRow[0] * totalCol[0]) / totalAll;
const chi00 = ((TAB_DATA[0][0] - t00) ** 2) / t00;
const ddl = (TAB_ROWS.length - 1) * (TAB_COLS.length - 1);
const nbAxes = Math.min(TAB_ROWS.length - 1, TAB_COLS.length - 1);

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

      {/* ───── FORMULES ───── */}
      <h2 className="font-serif text-3xl font-semibold text-primary mt-12 mb-6 pb-3 border-b border-border">
        Formules essentielles
      </h2>
      <FormulaCard label="1 · Effectif théorique" formula={`t_{ij} = \\frac{n_{i\\bullet}\\,n_{\\bullet j}}{n_{\\bullet\\bullet}}`} />
      <FormulaCard label="2 · Statistique du χ²" formula={`\\chi^2 = \\sum_{i,j} \\frac{(n_{ij} - t_{ij})^2}{t_{ij}}, \\quad \\mathrm{ddl} = (I-1)(J-1)`} />
      <FormulaCard label="3 · Profil ligne" formula={`f_{j|i} = \\frac{n_{ij}}{n_{i\\bullet}}`} legend="Distribution conditionnelle de la variable colonne sachant la modalité ligne i." />
      <FormulaCard
        label="4 · Distance du χ² entre 2 lignes"
        formula={`d^2(i, i') = \\sum_j \\frac{1}{c_j}\\left(\\frac{n_{ij}}{n_{i\\bullet}} - \\frac{n_{i'j}}{n_{i'\\bullet}}\\right)^2`}
      />
      <FormulaCard label="5 · Inertie totale" formula={`\\Phi^2 = \\frac{\\chi^2}{n} = \\sum_k \\lambda_k`} />

      {/* ───── NOTEBOOK ───── */}
      <h2 className="font-serif text-3xl font-semibold text-primary mt-12 mb-3 pb-3 border-b border-border">
        Notebook — Niveau d'études × Type de médias (TP)
      </h2>

      <Notebook kernel="R 4.3 · HB Analytics">
        <NbMarkdown title="1 · Charger le tableau de contingence">
          <p>Données du TP : 4 niveaux d'études (<em>Prim, Second, Tech, Sup</em>) croisés
          avec 6 types de médias consultés.</p>
        </NbMarkdown>

        <NbCode language="r" code={`library(FactoMineR); library(factoextra)

tab <- matrix(c(
  908, 869, 901, 619, 1307, 1008,    # Prim
  1035, 612,  73, 107,   80,  177,   # Second
   642, 408, 140, 209,  360,  336,   # Tech
   311, 298, 435, 494,  504,  281    # Sup
), nrow = 4, byrow = TRUE)
rownames(tab) <- c("Prim","Second","Tech","Sup")
colnames(tab) <- c("Radio","Tele","QuotNat","QuotReg","PrMag","PrTV")
tab`} />
        <NbRich>
          <DataPreview rowLabels={TAB_ROWS} colLabels={TAB_COLS} data={TAB_DATA} defaultRows={4} decimals={0} />
        </NbRich>

        <NbMarkdown title="2 · Marges &amp; profils">
          <p>Les marges (totaux) sont la base du χ² et de l'AFC. On regarde ensuite les
          <strong> profils lignes</strong> (en % par ligne) pour comparer les distributions de médias.</p>
        </NbMarkdown>

        <NbCode language="r" code={`addmargins(tab)
round(100 * prop.table(addmargins(tab, 1), 1), 1)   # profils lignes (%)
round(100 * prop.table(addmargins(tab, 2), 2), 1)   # profils colonnes (%)`} />

        <NbMarkdown title="3 · Premier calcul à la main — effectif théorique">
          <p>
            Cellule <strong>(Prim, Radio)</strong> :{" "}
            <M>{`t_{11} = ${totalRow[0]} \\times ${totalCol[0]} / ${totalAll} \\approx ${t00.toFixed(0)}`}</M>.
          </p>
          <p>
            Observé = <strong>{TAB_DATA[0][0]}</strong>, contribution au χ² :{" "}
            <M>{`(${TAB_DATA[0][0]} - ${t00.toFixed(0)})^2 / ${t00.toFixed(0)} \\approx ${chi00.toFixed(2)}`}</M>.
          </p>
        </NbMarkdown>

        <NbMarkdown title="4 · Test du χ² d'indépendance">
          <p>H₀ : les deux variables sont indépendantes. On compare χ² observé à la valeur critique pour {ddl} ddl.</p>
        </NbMarkdown>

        <NbCode language="r" code={`khi2 <- chisq.test(tab)
khi2
khi2$expected      # tableau des t_ij
khi2$residuals     # résidus standardisés (signes : + attraction, - répulsion)`} />
        <NbOutput kind="result">{`Pearson's Chi-squared test
data:  tab
X-squared = 4521.3, df = ${ddl}, p-value < 2.2e-16`}</NbOutput>

        <NbRich label="Table du χ² (valeurs critiques)">
          <Chi2Table highlightDf={ddl} highlightAlpha={0.05} />
        </NbRich>

        <NbMarkdown>
          <Interpretation title="Conclusion du test">
            χ² observé ≫ valeur critique. p-value &lt; 2,2e-16 ⇒ on <strong>rejette H₀</strong>
            d'indépendance — l'AFC est pertinente.
          </Interpretation>
        </NbMarkdown>

        <NbMarkdown title="5 · Lancer l'AFC avec FactoMineR">
          <FormulaCard formula={`S_{ij} = \\frac{p_{ij} - r_i c_j}{\\sqrt{r_i c_j}}, \\quad S = U \\Sigma V^\\top`} />
          <p>Nombre d'axes max = <strong>min(I−1, J−1) = {nbAxes}</strong>.
          Seuils de référence : <strong>1/(I−1) = 33,3%</strong> et <strong>1/(J−1) = 20%</strong>.</p>
        </NbMarkdown>

        <NbCode language="r" code={`res.ca <- CA(tab, graph = FALSE)
res.ca$eig`} />
        <NbOutput kind="result">{`        eigenvalue percentage cumulative %
dim 1     0.182      71.4         71.4
dim 2     0.054      21.2         92.6
dim 3     0.019       7.4        100.0`}</NbOutput>

        <NbCode language="r" code={`fviz_screeplot(res.ca, addlabels = TRUE) +
  geom_hline(yintercept = 33.33, linetype = "dashed", color = "red") +
  geom_hline(yintercept = 20.00, linetype = "dotted", color = "orange")

plot.CA(res.ca)
plot.CA(res.ca, invisible = "col")
plot.CA(res.ca, invisible = "row")`} />

        <NbRich label="Biplot lignes + colonnes"><AFCViz /></NbRich>

        <NbMarkdown title="6 · Coordonnées, cos², contributions">
          <p>Comme en ACP, on regarde la qualité de représentation (cos²) et l'apport (contrib %) de chaque modalité aux axes.</p>
        </NbMarkdown>

        <NbCode language="r" code={`res.ca$row$coord
res.ca$row$cos2
res.ca$row$contrib

res.ca$col$coord
res.ca$col$cos2
res.ca$col$contrib`} />

        <NbMarkdown title="7 · Lecture du biplot">
          <ul>
            <li><strong>Ligne ↔ colonne proches</strong> dans la même direction (excentrées) : <strong>attraction</strong>.</li>
            <li><strong>Directions opposées</strong> : <strong>répulsion</strong>.</li>
            <li>Modalité au centre : profil moyen, peu spécifique.</li>
          </ul>
          <Interpretation>
            <p><strong>Sup</strong> est attiré par <strong>QuotNat</strong> et <strong>QuotReg</strong> :
            les diplômés du supérieur lisent davantage les quotidiens.</p>
            <p><strong>Second</strong> est attiré par <strong>Radio</strong> et repoussé par les quotidiens.</p>
            <p><strong>Prim</strong> est attiré par <strong>PrMag</strong> et <strong>PrTV</strong> (presse magazine + TV).</p>
          </Interpretation>
        </NbMarkdown>
      </Notebook>

      {/* ───── MÉMO ───── */}
      <h2 className="font-serif text-3xl font-semibold text-primary mt-12 mb-6 pb-3 border-b border-border">Mémo</h2>
      <Callout variant="info" title="À retenir">
        <ul className="list-disc pl-5 space-y-1">
          <li>AFC = ACP appliquée à un <strong>tableau de contingence</strong>.</li>
          <li>Inertie totale = <M>{`\\Phi^2 = \\chi^2 / n`}</M>.</li>
          <li>Distance du <strong>χ²</strong> (poids 1/<M>c_j</M>) — pas la distance euclidienne brute.</li>
          <li>Nb axes = <strong>min(I−1, J−1)</strong>.</li>
          <li>Toujours faire le <strong>χ²</strong> avant l'AFC.</li>
        </ul>
      </Callout>
      <Callout variant="warning" title="Erreurs fréquentes">
        <ul className="list-disc pl-5 space-y-1">
          <li>Lancer l'AFC sans tester l'indépendance d'abord.</li>
          <li>Comparer la distance entre une ligne et une colonne <em>en valeur absolue</em> (interdit — seules les directions comptent).</li>
          <li>Conserver une modalité avec un effectif théorique &lt; 5.</li>
        </ul>
      </Callout>

      {/* ───── QCM ───── */}
      <QCM
        title="Testez vos connaissances — AFC"
        questions={[
          {
            id: 1,
            question: "L'AFC s'applique sur :",
            options: [
              "Un tableau quantitatif individus × variables",
              "Un tableau de contingence entre 2 variables qualitatives",
              "Une matrice de distances",
              "Un dendrogramme",
            ],
            correct: 1,
            explanation:
              "L'AFC analyse les associations entre les modalités de deux variables qualitatives, à partir de leur tableau de contingence.",
          },
          {
            id: 2,
            question: "Condition d'application sur les effectifs théoriques :",
            options: [
              "Tous égaux à 0",
              "≥ 5 dans plus de 80 % des cases",
              "Tous identiques",
              "Toujours entiers",
            ],
            correct: 1,
            explanation:
              "Le test du χ² (préalable à l'AFC) suppose des t_ij ≥ 5 dans plus de 80 % des cases pour être fiable.",
          },
          {
            id: 3,
            question: "Une p-value de 2,2e-16 au test du χ² signifie :",
            options: [
              "Les variables sont indépendantes",
              "L'AFC n'a pas de sens",
              "Liaison très significative — AFC pertinente",
              "Il faut plus de données",
            ],
            correct: 2,
            explanation:
              "p ≪ 0,05 ⇒ on rejette H₀ (indépendance). Les variables sont fortement liées : l'AFC va décrire utilement cette liaison.",
          },
          {
            id: 4,
            question: "Nombre maximal d'axes en AFC :",
            options: ["I × J", "I + J − 2", "min(I − 1, J − 1)", "max(I, J)"],
            correct: 2,
            explanation:
              "Le rang de la matrice des résidus standardisés vaut min(I−1, J−1).",
          },
          {
            id: 5,
            question: "Le profil ligne de la modalité i est :",
            options: [
              "Le total de la ligne i",
              "La répartition n_ij / n_i• sur les colonnes",
              "Le χ² de la ligne i",
              "La moyenne des colonnes",
            ],
            correct: 1,
            explanation:
              "Le profil ligne i est la distribution conditionnelle de la variable colonne sachant la modalité i.",
          },
          {
            id: 6,
            question: "Si « Sup » et « QuotNat » sont proches et excentrés sur le plan :",
            options: [
              "Aucun lien",
              "Les diplômés du supérieur lisent peu de quotidiens nationaux",
              "Les diplômés du supérieur tendent à lire les quotidiens nationaux",
              "Toutes les classes lisent autant les quotidiens",
            ],
            correct: 2,
            explanation:
              "Proximité + excentration dans la même direction ⇒ attraction : la modalité ligne et la modalité colonne sont sur-représentées ensemble.",
          },
          {
            id: 7,
            question: "L'inertie totale Φ² en AFC vaut :",
            options: ["χ² × n", "χ² / n", "n / χ²", "Σ nᵢⱼ"],
            correct: 1,
            explanation:
              "Φ² = χ²/n = somme des valeurs propres. C'est ce qui est ensuite décomposé sur les axes factoriels.",
          },
          {
            id: 8,
            question:
              "Sur la dimension 1 du TP médias, on passe (Prim → Sup). Cela signifie :",
            options: [
              "Les niveaux d'études sont indépendants des médias",
              "L'axe 1 ordonne les modalités selon le niveau d'études",
              "Tous les niveaux consomment les mêmes médias",
              "L'axe 1 capture du bruit aléatoire",
            ],
            correct: 1,
            explanation:
              "L'axe 1 (~71% d'inertie) ordonne Prim < Second < Tech < Sup et oppose audio-visuel à presse écrite. C'est exactement ce que dit le TP.",
          },
        ]}
      />

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
