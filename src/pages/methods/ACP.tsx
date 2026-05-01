import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { MethodHero } from "@/components/MethodHero";
import { Callout } from "@/components/Callout";
import { M } from "@/components/Math";
import { FormulaCard } from "@/components/FormulaCard";
import { PCAInteractive } from "@/components/PCAInteractive";
import { PCAStudentsViz } from "@/components/PCAStudentsViz";
import { MethodMeta } from "@/components/MethodMeta";
import { Interpretation } from "@/components/Interpretation";
import { Notebook, NbCode, NbOutput, NbMarkdown, NbRich } from "@/components/notebook/Notebook";
import { QCM } from "@/components/QCM";

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
          <>Les axes sont <strong>linéaires</strong> uniquement.</>,
        ]}
      />

      <PCAInteractive />

      <Callout variant="intuition" title="Intuition">
        L'ACP fait <strong>tourner</strong> le repère pour aligner le 1ᵉʳ axe avec la direction
        de plus grande variance. On ne perd rien — on choisit juste un meilleur point de vue.
      </Callout>

      {/* ───── FORMULES ESSENTIELLES ───── */}
      <h2 className="font-serif text-3xl font-semibold text-primary mt-14 mb-6 pb-3 border-b border-border">
        Formules essentielles
      </h2>

      <FormulaCard
        label="1 · Standardisation"
        formula={`Z_{ij} = \\frac{X_{ij} - \\bar{X}_j}{\\sigma_j}`}
        legend="Indispensable si les variables n'ont pas la même unité."
      />
      <FormulaCard
        label="2 · Décomposition spectrale"
        formula={`\\mathbf{R}\\,\\mathbf{v}_k = \\lambda_k\\,\\mathbf{v}_k`}
        legend={<>R = matrice de corrélation. v_k = k-ème axe principal. λ_k = variance portée.</>}
      />
      <FormulaCard
        label="3 · Coordonnées des individus"
        formula={`F_{ik} = \\sum_{j=1}^{p} v_{kj}\\, Z_{ij}`}
        legend="Projection de l'individu i sur l'axe k."
      />
      <FormulaCard
        label="4 · Corrélation variable-axe (cercle)"
        formula={`r(X_j, F_k) = v_{kj}\\,\\sqrt{\\lambda_k}`}
        legend="Pour tracer le cercle des corrélations."
      />
      <FormulaCard
        label="5 · Taux de restitution"
        formula={`\\tau_k = \\frac{\\lambda_k}{\\sum_{\\ell} \\lambda_\\ell} \\times 100`}
        legend="Pourcentage de variance expliquée par l'axe k."
      />

      {/* ───── NOTEBOOK R DECATHLON ───── */}
      <h2 className="font-serif text-3xl font-semibold text-primary mt-14 mb-3 pb-3 border-b border-border">
        Notebook — ACP sur Decathlon (TP)
      </h2>

      <Notebook kernel="R 4.3 · HB Analytics">
        <NbMarkdown title="1 · Charger le jeu de données">
          <p>Données <code>decathlon</code> du package <strong>FactoMineR</strong> :
          performances de 41 décathloniens sur 10 épreuves + variables supplémentaires
          (Rang, Points, Compétition).</p>
        </NbMarkdown>

        <NbCode language="r" code={`install.packages(c("FactoMineR", "factoextra", "corrgram", "plyr"))
library(FactoMineR); library(factoextra)
data(decathlon)
str(decathlon); dim(decathlon)`} />
        <NbOutput kind="result">{`'data.frame': 41 obs. of 13 variables:
 $ 100m         : num  11 10.8 11 11 11.3 ...
 $ Long.jump    : num  7.58 7.4 7.3 7.32 7.27 ...
 $ Shot.put     : num  14.8 14.3 14.8 14.6 13.7 ...
 $ ...
 $ 1500m        : num  291 274 277 282 269 ...
 $ Rank         : int  1 2 3 4 5 6 7 8 9 10 ...
 $ Points       : int  8217 8122 8067 8036 8004 ...
 $ Competition  : Factor w/ 2 levels "Decastar","OlympicG"`}</NbOutput>

        <NbMarkdown title="2 · Comparer Decastar vs OlympicG (plyr)">
          <p>Avant l'ACP, on regarde si la <strong>compétition</strong> influence les résultats.</p>
        </NbMarkdown>

        <NbCode language="r" code={`library(plyr)
ddply(decathlon, .(Competition), function(d) round(colMeans(d[,1:10]), 2))`} />

        <NbMarkdown title="3 · Standardisation + corrélogramme">
          <p>On centre-réduit avec <code>scale()</code> puis on visualise les corrélations entre épreuves.</p>
        </NbMarkdown>

        <NbCode language="r" code={`library(corrgram)
Z <- scale(decathlon[, 1:10])
corrgram(Z, order = TRUE, lower.panel = panel.shade,
         upper.panel = panel.pie, main = "Corrélogramme — épreuves")`} />

        <NbMarkdown title="4 · Lancer l'ACP avec FactoMineR">
          <p>On déclare <strong>Rang</strong> et <strong>Points</strong> en quanti supplémentaires
          (calculées à partir des 10 épreuves → biaiseraient les axes), et <strong>Compétition</strong>
          en quali supplémentaire.</p>
        </NbMarkdown>

        <NbCode language="r" code={`res.pca <- PCA(decathlon, ncp = 10,
               quanti.sup = 11:12,   # Rank, Points
               quali.sup  = 13)      # Competition
res.pca$eig`} />
        <NbOutput kind="result">{`        eigenvalue percentage cumulative %
comp 1   3.272      32.72        32.72
comp 2   1.737      17.37        50.09
comp 3   1.405      14.05        64.14
comp 4   1.057      10.57        74.71
comp 5   0.685       6.85        81.56
...`}</NbOutput>

        <NbMarkdown title="5 · Plans factoriels">
          <p>Plans (1,2) puis (2,3), et un biplot combiné individus + variables.</p>
        </NbMarkdown>

        <NbCode language="r" code={`plot.PCA(res.pca, axes = c(1, 2), choix = "ind", habillage = 13)
plot.PCA(res.pca, axes = c(1, 2), choix = "var")
plot.PCA(res.pca, axes = c(2, 3), choix = "var")
fviz_pca_biplot(res.pca, repel = TRUE)`} />
        <NbRich label="Sortie graphique (notes M1 ESB pour la démo interactive)">
          <PCAStudentsViz />
        </NbRich>

        <NbMarkdown title="6 · Éboulis &amp; critère de Kaiser">
          <p>Critère de Kaiser : on retient les axes avec <strong>λ &gt; 1</strong>.</p>
        </NbMarkdown>

        <NbCode language="r" code={`fviz_eig(res.pca, addlabels = TRUE, ylim = c(0, 50)) +
  geom_hline(yintercept = 100/10, linetype = "dashed", color = "red")

barplot(res.pca$eig[, 1], names.arg = paste0("Dim", 1:nrow(res.pca$eig)),
        main = "Valeurs propres", col = "steelblue")
abline(h = 1, col = "red", lty = 2)`} />

        <NbMarkdown title="7 · Coordonnées, cos², contributions des individus">
          <FormulaCard formula={`\\cos^2(i, k) = \\frac{F_{ik}^2}{\\sum_\\ell F_{i\\ell}^2}`}
            legend="Qualité de représentation de l'individu i sur l'axe k." />
        </NbMarkdown>

        <NbCode language="r" code={`res.pca$ind$coord[1:5, 1:3]   # coordonnées
res.pca$ind$cos2[1:5, 1:3]    # qualité
res.pca$ind$contrib[1:5, 1:3] # contribution (%)
dist(res.pca$ind$coord[1:5, 1:2])  # distances dans le plan 1-2`} />

        <NbMarkdown title="8 · Coordonnées, cos², contributions des variables">
          <p>Les variables proches du bord du cercle sont bien représentées ; celles près du centre, mal.</p>
        </NbMarkdown>

        <NbCode language="r" code={`res.pca$var$coord[, 1:3]
res.pca$var$cos2[, 1:3]
res.pca$var$contrib[, 1:3]
fviz_pca_var(res.pca, col.var = "cos2", repel = TRUE)`} />

        <NbMarkdown title="9 · Interprétation">
          <Interpretation>
            <p><strong>Dim 1 (~33%)</strong> oppose les épreuves de <em>vitesse / saut</em>
            (100m, 110m haies, longueur — corrélées négativement car un meilleur temps = un nombre plus petit)
            aux <em>lancers</em> (poids, disque, javelot).</p>
            <p><strong>Dim 2 (~17%)</strong> isole l'axe <em>vertical</em> (saut en hauteur, perche, 1500m).</p>
            <p>Les variables supplémentaires <strong>Points</strong> (←) et <strong>Rang</strong> (→) sont quasi
            opposées sur Dim 1, ce qui est cohérent (plus de points = meilleur rang = numéro plus petit).</p>
          </Interpretation>
          <p className="mt-3 text-sm text-muted-foreground">
            <em>Adaptation au TP classe :</em>
          </p>
        </NbMarkdown>

      </Notebook>

      {/* ───── 2ND NOTEBOOK — BaseNotes ───── */}
      <h2 className="font-serif text-3xl font-semibold text-primary mt-14 mb-3 pb-3 border-b border-border">
        Notebook bis — ACP sur BaseNotes (TP classe)
      </h2>

      <Notebook kernel="R 4.3 · HB Analytics">
        <NbMarkdown title="1 · Importer le fichier Excel des notes">
          <p>9 élèves notés sur 5 matières (<em>Math, Français, Latin, Musique, Sport</em>) +
          deux variables illustratives : <strong>Rang</strong> (quanti) et <strong>Ecole</strong> (quali).</p>
        </NbMarkdown>

        <NbCode language="r" code={`install.packages("openxlsx")
library(openxlsx); library(FactoMineR); library(factoextra); library(corrgram)

setwd("…/PCA - Principle component analysis")
BaseNotes <- read.xlsx("BaseNotes.xlsx", rowNames = TRUE)
dim(BaseNotes); names(BaseNotes); head(BaseNotes)`} />
        <NbOutput kind="result">{`[1] 9 7
[1] "Math" "Français" "Latin" "Musique" "Sport" "Rang" "Ecole"`}</NbOutput>

        <NbMarkdown title="2 · Statistiques descriptives par matière">
          <p>On regarde moyennes / min / max / écarts-types — c'est <em>la</em> base avant toute analyse.</p>
        </NbMarkdown>

        <NbCode language="r" code={`summary(BaseNotes)
mean(BaseNotes$Math)
min(BaseNotes$Français); max(BaseNotes$Latin)

# Élève qui a la note maximale en Latin
which.max(BaseNotes$Latin)
subset(BaseNotes, Latin == max(Latin), c("Ecole", "Rang"))`} />

        <NbMarkdown title="3 · Matrice de covariance / corrélation + corrélogramme">
          <p>Règle de décision : si <strong>|cor| ≥ 0,5</strong> sur plusieurs paires → l'ACP est pertinente.</p>
        </NbMarkdown>

        <NbCode language="r" code={`cov(BaseNotes[, 1:5])
round(cor(BaseNotes[, 1:5]), 2)
corrgram(BaseNotes[, 1:5], order = TRUE, lower.panel = panel.conf)`} />

        <NbMarkdown title="4 · Lancer l'ACP avec variables sup">
          <p><strong>Rang</strong> = quanti.sup (calculée à partir des notes), <strong>Ecole</strong> = quali.sup.</p>
        </NbMarkdown>

        <NbCode language="r" code={`ResultatACP <- PCA(BaseNotes, ncp = 5,
                   quanti.sup = c("Rang"),
                   quali.sup  = c("Ecole"))

plot.PCA(ResultatACP, choix = "ind")     # nuage des élèves
plot.PCA(ResultatACP, choix = "var")     # cercle des corrélations
fviz_pca_biplot(ResultatACP, habillage = "Ecole", repel = TRUE)

get_eigenvalue(ResultatACP)
fviz_eig(ResultatACP, addlabels = TRUE, ylim = c(0, 50))`} />

        <NbMarkdown title="5 · Lecture du cercle des corrélations">
          <p>
            La coordonnée d'une variable <M>X_j</M> sur l'axe <M>k</M> vaut <M>{`r(X_j, F_k) = v_{kj}\\sqrt{\\lambda_k}`}</M>
            — autrement dit la corrélation linéaire variable ↔ axe. On la place donc dans un cercle de rayon 1.
          </p>
          <ul>
            <li>Variable <strong>au bord</strong> du cercle ⇒ bien représentée par les 2 axes affichés.</li>
            <li>Variable <strong>près du centre</strong> ⇒ il faut regarder un autre plan.</li>
            <li>Angle entre 2 flèches ≈ corrélation (0° = +1, 90° = 0, 180° = −1).</li>
          </ul>
          <Interpretation>
            <p>Sur BaseNotes, <strong>Math + Latin + Français</strong> tirent vers la droite (axe « scolaire »),
            <strong> Sport + Musique</strong> tirent vers le haut (axe « artistique/physique »). La variable
            illustrative <strong>Rang</strong> apparaît opposée à l'axe scolaire (meilleur rang = numéro plus petit).</p>
          </Interpretation>
        </NbMarkdown>
      </Notebook>

      {/* ───── MÉMO ───── */}
      <h2 className="font-serif text-3xl font-semibold text-primary mt-14 mb-6 pb-3 border-b border-border">Mémo</h2>
      <Callout variant="info" title="À retenir">
        <ul className="list-disc pl-5 space-y-1">
          <li>ACP = <strong>rotation</strong> du repère, sans perte d'information.</li>
          <li>Standardiser <strong>presque toujours</strong> (sauf unités identiques + variances comparables).</li>
          <li>Critère de <strong>Kaiser : λ &gt; 1</strong> ; ou cumul ≥ 80 %.</li>
          <li>Plan des individus <strong>+</strong> cercle des corrélations = duo d'interprétation.</li>
          <li>Variables dérivées (Rang, Points…) → en <strong>supplémentaires</strong>.</li>
        </ul>
      </Callout>
      <Callout variant="warning" title="Erreurs fréquentes">
        <ul className="list-disc pl-5 space-y-1">
          <li>Oublier de <strong>standardiser</strong> → un axe dominé par la variable à grande unité.</li>
          <li>Interpréter une variable <strong>près du centre</strong> du cercle (mal représentée).</li>
          <li>Garder trop d'axes (les derniers ne sont que du <strong>bruit</strong>).</li>
          <li>Mettre en actif des variables <strong>redondantes</strong> (Rang, Points dans Decathlon).</li>
        </ul>
      </Callout>

      {/* ───── QCM ───── */}
      <QCM
        title="Testez vos connaissances — ACP"
        questions={[
          {
            id: 1,
            question: "Que représente la valeur propre λₖ ?",
            options: [
              "Le nombre d'individus mal classés",
              "La variance portée par cette composante",
              "Le coefficient de corrélation moyen",
              "L'inverse de l'erreur de projection",
            ],
            correct: 1,
            explanation:
              "λₖ mesure exactement la variance de la k-ième composante principale dans le repère original.",
          },
          {
            id: 2,
            question: "Critère de Kaiser : on retient les composantes avec λ ?",
            options: ["> 0,5", "> 1", "> moyenne des λ", "> n/p"],
            correct: 1,
            explanation:
              "λ > 1 signifie que la composante porte plus que la variance d'une variable standardisée — sinon elle n'apporte rien.",
          },
          {
            id: 3,
            question: "Pourquoi standardiser les données avant l'ACP ?",
            options: [
              "Pour réduire le temps de calcul",
              "Pour que chaque variable ait une variance de 1",
              "Pour rendre les valeurs entières",
              "Pour supprimer les corrélations",
            ],
            correct: 1,
            explanation:
              "Sans standardisation, une variable à grande unité (ex. salaire en €) écrase toutes les autres et domine le 1ᵉʳ axe.",
          },
          {
            id: 4,
            question: "Sur le cercle des corrélations, deux flèches à angle droit signifient :",
            options: [
              "Variables fortement corrélées positivement",
              "Variables anti-corrélées",
              "Variables non corrélées sur ce plan",
              "Variables identiques",
            ],
            correct: 2,
            explanation:
              "L'angle θ entre deux flèches vérifie cos(θ) ≈ r. Donc 90° ⇒ r ≈ 0 ⇒ pas de corrélation linéaire dans ce plan.",
          },
          {
            id: 5,
            question: "Pourquoi Rang et Points sont déclarés supplémentaires dans Decathlon ?",
            options: [
              "Ce sont des variables qualitatives",
              "Elles sont calculées à partir des 10 épreuves et biaiseraient les axes",
              "Elles ont trop de valeurs manquantes",
              "Elles sont mesurées dans une unité différente",
            ],
            correct: 1,
            explanation:
              "Rang et Points sont des résumés des 10 épreuves actives. En actives, elles créeraient une redondance qui gonflerait artificiellement le 1ᵉʳ axe.",
          },
          {
            id: 6,
            question: "Le cos² d'un individu sur un axe mesure :",
            options: [
              "Sa distance au centre",
              "Sa contribution à l'inertie de l'axe",
              "La qualité de sa représentation sur cet axe",
              "Sa probabilité d'appartenir à un cluster",
            ],
            correct: 2,
            explanation:
              "cos² ∈ [0,1]. Proche de 1 → l'individu est très bien représenté sur l'axe. Faible → chercher d'autres axes pour l'interpréter.",
          },
          {
            id: 7,
            question: "Pour tracer le cercle des corrélations, on utilise :",
            options: [
              "r(Xⱼ, Fₖ) = vₖⱼ × √λₖ",
              "r(Xⱼ, Fₖ) = λₖ / Σλ",
              "r(Xⱼ, Fₖ) = cos²(i, k)",
              "r(Xⱼ, Fₖ) = √(n − 1)",
            ],
            correct: 0,
            explanation:
              "La coordonnée d'une variable sur un axe = corrélation linéaire = vₖⱼ × √λₖ. C'est ce qui place la flèche dans le cercle de rayon 1.",
          },
          {
            id: 8,
            question: "D'après le corrélogramme (TP BaseNotes), on applique l'ACP si :",
            options: [
              "Toutes les corrélations sont nulles",
              "Au moins quelques |cor| ≥ 0,5",
              "Les variables sont indépendantes",
              "Toujours, sans regarder",
            ],
            correct: 1,
            explanation:
              "Sans corrélations entre variables, l'ACP n'apporte rien : les axes seront aussi informatifs que les variables d'origine.",
          },
        ]}
      />

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
