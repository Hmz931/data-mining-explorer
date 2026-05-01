import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { MethodHero } from "@/components/MethodHero";
import { Callout } from "@/components/Callout";
import { M } from "@/components/Math";
import { FormulaCard } from "@/components/FormulaCard";
import { ACMViz } from "@/components/viz/ACMViz";
import { MethodMeta } from "@/components/MethodMeta";
import { Interpretation } from "@/components/Interpretation";
import { Notebook, NbCode, NbOutput, NbMarkdown, NbRich } from "@/components/notebook/Notebook";
import { QCM } from "@/components/QCM";

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

      {/* ───── FORMULES ───── */}
      <h2 className="font-serif text-3xl font-semibold text-primary mt-12 mb-6 pb-3 border-b border-border">
        Formules essentielles
      </h2>
      <FormulaCard label="1 · Tableau disjonctif Z" formula={`Z_{ij} = \\begin{cases} 1 & \\text{si } i \\text{ a la modalité } j \\\\ 0 & \\text{sinon} \\end{cases}`} />
      <FormulaCard label="2 · Matrice de Burt" formula={`B = Z^\\top Z`} legend="Matrice symétrique m × m croisant toutes les paires de modalités." />
      <FormulaCard label="3 · Sélection des axes (1/Q)" formula={`\\lambda_k > \\frac{1}{Q}`} legend="Q = nombre de variables actives." />
      <FormulaCard
        label="4 · Correction d'inertie de Benzécri"
        formula={`\\lambda_k^{\\mathrm{corr}} = \\left(\\frac{Q}{Q-1}\\right)^2 \\left(\\lambda_k - \\frac{1}{Q}\\right)^2`}
        legend="Compense la sous-estimation des % d'inertie en ACM."
      />
      <FormulaCard label="5 · Inertie totale (sans correction)" formula={`I = \\frac{m - Q}{Q}`} legend="m = nombre total de modalités, Q = nombre de variables actives." />

      {/* ───── NOTEBOOK ───── */}
      <h2 className="font-serif text-3xl font-semibold text-primary mt-12 mb-3 pb-3 border-b border-border">
        Notebook — ACM sur les races canines (TP)
      </h2>

      <Notebook kernel="R 4.3 · HB Analytics">
        <NbMarkdown title="1 · Charger le jeu canines.txt">
          <p>27 races de chiens décrites par 7 variables qualitatives :
          <em> taille, poids, vélocité, intelligence, affection, agressivité, fonction</em>.
          La variable <strong>fonction</strong> sera mise en supplémentaire.</p>
        </NbMarkdown>

        <NbCode language="r" code={`library(FactoMineR); library(factoextra)

canines <- read.table("canines.txt", header = TRUE, row.names = 1)
str(canines); dim(canines)
head(canines)`} />
        <NbOutput kind="result">{`'data.frame': 27 obs. of 7 variables:
 $ taille       : Factor w/ 3 levels "Pet","Moy","Gd"
 $ poids        : Factor w/ 3 levels "Leg","Moy","Lourd"
 $ velocite     : Factor w/ 3 levels "Lent","Moy","Rap"
 $ intelligence : Factor w/ 3 levels "Faib","Moy","Eleve"
 $ affection    : Factor w/ 2 levels "Faib","Eleve"
 $ agressivite  : Factor w/ 2 levels "Faib","Eleve"
 $ fonction     : Factor w/ 3 levels "Comp","Chasse","Util"`}</NbOutput>

        <NbMarkdown title="2 · Tri simple — fréquences par variable">
        </NbMarkdown>

        <NbCode language="r" code={`for (v in colnames(canines)) {
  cat("---", v, "---\\n")
  print(table(canines[[v]]))
  print(round(prop.table(table(canines[[v]])), 2))
}`} />

        <NbMarkdown title="3 · Convertir toutes les colonnes en factor">
        </NbMarkdown>

        <NbCode language="r" code={`for (i in 1:ncol(canines)) {
  canines[, i] <- as.factor(canines[, i])
}
summary(canines)`} />

        <NbMarkdown title="4 · Tri croisé + χ² (fonction × taille)">
        </NbMarkdown>

        <NbCode language="r" code={`tc <- table(canines$fonction, canines$taille)
tc
chisq.test(tc)         # avec un effectif faible, attendre un warning`} />

        <NbMarkdown title="5 · Lancer l'ACM">
          <p>On déclare <strong>fonction</strong> (col. 7) en quali supplémentaire.</p>
        </NbMarkdown>

        <NbCode language="r" code={`canines.acm <- MCA(canines, quali.sup = 7, graph = FALSE)
canines.acm$eig`} />
        <NbOutput kind="result">{`        eigenvalue percentage cumulative %
dim 1     0.412      24.7         24.7
dim 2     0.318      19.1         43.8
dim 3     0.247      14.8         58.6
dim 4     0.198      11.9         70.5
dim 5     0.151       9.0         79.5
...`}</NbOutput>

        <NbMarkdown title="6 · Choix du nombre d'axes">
          <p>Nombre théorique max = (modalités actives) − (variables actives) = 16 − 6 = <strong>10</strong>.
          On cherche un <strong>coude</strong> dans le scree plot — souvent entre dim 2 et dim 3.</p>
        </NbMarkdown>

        <NbCode language="r" code={`plot(canines.acm$eig[, 1], type = "b",
     xlab = "Dimension", ylab = "Valeur propre",
     main = "Scree plot ACM")
abline(h = 1/6, col = "red", lty = 2)   # seuil 1/Q

fviz_screeplot(canines.acm, addlabels = TRUE)`} />

        <NbRich label="Plan factoriel modalités + individus"><ACMViz /></NbRich>

        <NbCode language="r" code={`fviz_mca_ind(canines.acm, repel = TRUE, habillage = "fonction")
fviz_mca_var(canines.acm, repel = TRUE,
             choice = "var.cat",  col.var = "contrib")
fviz_mca_biplot(canines.acm, repel = TRUE)`} />

        <NbMarkdown title="7 · Interprétation">
          <Interpretation>
            <p><strong>Dim 1</strong> oppose les chiens <em>petits / lents / peu agressifs</em>
            (Compagnie) aux chiens <em>grands / rapides / agressifs</em> (Utilité, défense).</p>
            <p><strong>Dim 2</strong> isole les chiens de <em>chasse</em> (intelligence élevée, vélocité moyenne-rapide).</p>
            <p>La variable supplémentaire <strong>fonction</strong> (Comp / Chasse / Util) se positionne
            naturellement entre les groupes correspondants — elle <em>résume</em> la structure
            qu'on a trouvée à partir des autres variables.</p>
          </Interpretation>
        </NbMarkdown>
      </Notebook>

      {/* ───── MÉMO ───── */}
      <h2 className="font-serif text-3xl font-semibold text-primary mt-12 mb-6 pb-3 border-b border-border">Mémo</h2>
      <Callout variant="info" title="À retenir">
        <ul className="list-disc pl-5 space-y-1">
          <li>ACM = AFC sur le <strong>tableau disjonctif complet</strong>.</li>
          <li>Sélection des axes : <strong>λ &gt; 1/Q</strong>.</li>
          <li>% d'inertie <strong>corrigés Benzécri</strong>.</li>
          <li>Nb d'axes max = (modalités actives) − (variables actives).</li>
          <li>Souvent <strong>suivi d'une CAH</strong> sur les coords factorielles.</li>
        </ul>
      </Callout>
      <Callout variant="warning" title="Erreurs fréquentes">
        <ul className="list-disc pl-5 space-y-1">
          <li>Garder une modalité avec un effectif &lt; 5 % (elle dominera un axe parasite).</li>
          <li>Lire les % d'inertie sans correction Benzécri (ils sous-estiment fortement).</li>
          <li>Comparer la position d'une modalité d'une variable à une autre modalité de la <em>même</em> variable.</li>
        </ul>
      </Callout>

      {/* ───── QCM ───── */}
      <QCM
        title="Testez vos connaissances — ACM"
        questions={[
          {
            id: 1,
            question: "L'ACM est utilisée pour :",
            options: [
              "Réduire la dimension d'un tableau quantitatif",
              "Analyser un questionnaire à Q ≥ 3 variables qualitatives",
              "Construire un dendrogramme",
              "Tester l'indépendance entre 2 variables",
            ],
            correct: 1,
            explanation:
              "L'ACM généralise l'AFC à un nombre quelconque de variables qualitatives — typiquement un questionnaire.",
          },
          {
            id: 2,
            question: "Le tableau disjonctif Z contient :",
            options: [
              "Les fréquences observées",
              "Des 0 / 1 indiquant la modalité choisie par chaque individu",
              "Les résidus du χ²",
              "Les coordonnées factorielles",
            ],
            correct: 1,
            explanation:
              "Z_ij = 1 si l'individu i possède la modalité j, 0 sinon. Chaque ligne contient exactement Q valeurs égales à 1.",
          },
          {
            id: 3,
            question: "Critère de sélection des axes en ACM :",
            options: ["λ > 1", "λ > 1/Q", "λ > 0,5", "λ > moyenne des λ"],
            correct: 1,
            explanation:
              "En ACM, l'inertie est artificiellement diluée. Le seuil de Kaiser devient 1/Q (et non 1 comme en ACP).",
          },
          {
            id: 4,
            question: "La correction de Benzécri sert à :",
            options: [
              "Supprimer les modalités rares",
              "Centrer le tableau Z",
              "Corriger les % d'inertie sous-estimés",
              "Faire converger l'algorithme",
            ],
            correct: 2,
            explanation:
              "Les % d'inertie bruts sous-estiment fortement les premiers axes en ACM. La correction de Benzécri rééchelonne ces pourcentages.",
          },
          {
            id: 5,
            question:
              "Dans le TP canines, pourquoi déclarer « fonction » en variable supplémentaire ?",
            options: [
              "Elle est quantitative",
              "Elle a trop de modalités",
              "Pour valider l'interprétation a posteriori sans qu'elle influe sur les axes",
              "C'est obligatoire pour l'ACM",
            ],
            correct: 2,
            explanation:
              "En supplémentaire, elle ne participe pas au calcul des axes mais on la projette pour vérifier que la structure trouvée correspond bien aux fonctions des chiens.",
          },
          {
            id: 6,
            question: "Inertie totale (sans correction) en ACM vaut :",
            options: ["(m − Q)/Q", "1/Q", "Q/(Q−1)", "m × Q"],
            correct: 0,
            explanation:
              "I = (m − Q)/Q où m = nombre total de modalités actives et Q = nombre de variables actives. C'est cette inertie qu'on décompose sur les axes.",
          },
          {
            id: 7,
            question: "Nombre maximal d'axes en ACM :",
            options: ["Q", "m", "m − Q", "min(n, m)"],
            correct: 2,
            explanation:
              "Nb d'axes max = (modalités actives) − (variables actives) = m − Q. Sur le TP canines : 16 − 6 = 10.",
          },
        ]}
      />

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
