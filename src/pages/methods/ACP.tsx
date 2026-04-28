import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { MethodHero } from "@/components/MethodHero";
import { Callout } from "@/components/Callout";
import { M } from "@/components/Math";
import { FormulaCard } from "@/components/FormulaCard";
import { StepBlock } from "@/components/StepBlock";
import { PCAInteractive } from "@/components/PCAInteractive";
import { PCAStudentsViz } from "@/components/PCAStudentsViz";

const ACP = () => (
  <PageLayout>
    <MethodHero
      code="ACP"
      tag="Méthode factorielle · quantitative"
      title="Analyse en Composantes Principales"
      subtitle="Réduire la dimension d'un tableau quantitatif en projetant sur de nouveaux axes — les composantes principales — qui capturent un maximum de variance."
    />

    <section className="container py-14 max-w-3xl">
      <p className="text-lg text-foreground/85 leading-relaxed mb-6">
        L'ACP cherche les <strong>directions</strong> de l'espace où le nuage de points est le plus dispersé. Projeter
        sur les premières composantes donne une carte 2D/3D qui résume l'essentiel.
      </p>

      <PCAInteractive />

      <h2 className="font-serif text-3xl font-semibold text-primary mt-16 mb-2 pb-3 border-b border-border">
        L'algorithme
      </h2>

      <StepBlock number="1" title="Standardiser">
        <FormulaCard
          formula={`Z_{ij} = \\frac{X_{ij} - \\bar{X}_j}{\\sigma_j}`}
          legend="Centre + réduit chaque variable. Indispensable si les unités diffèrent ; recommandé sinon."
        />
      </StepBlock>

      <StepBlock number="2" title="Matrice de covariance (= corrélation)">
        <FormulaCard
          formula={`\\mathbf{C} = \\frac{1}{n-1}\\,\\mathbf{Z}^\\top \\mathbf{Z}`}
          legend={<>Symétrique <M>{`p \\times p`}</M>, diagonale = 1, hors-diagonale = corrélations.</>}
        />
      </StepBlock>

      <StepBlock number="3" title="Décomposition spectrale">
        <FormulaCard formula={`\\mathbf{C}\\,\\mathbf{v}_i = \\lambda_i\\,\\mathbf{v}_i`} />
        <ul className="list-disc pl-5 space-y-1 text-foreground/85">
          <li><strong>Vecteurs propres</strong> <M>{`\\mathbf{v}_i`}</M> = directions des nouveaux axes.</li>
          <li><strong>Valeurs propres</strong> <M>{`\\lambda_i`}</M> = variance portée par chaque axe.</li>
        </ul>
        <Callout variant="math" title="Pourquoi c'est optimal">
          La variance d'une projection sur <M>{`\\mathbf{u}`}</M> vaut <M>{`\\mathbf{u}^\\top \\mathbf{C} \\mathbf{u}`}</M>. Sous
          contrainte <M>{`\\|\\mathbf{u}\\|=1`}</M>, le maximum est atteint pour <M>{`\\mathbf{u} = \\mathbf{v}_1`}</M>.
        </Callout>
      </StepBlock>

      <StepBlock number="4" title="Variance expliquée">
        <FormulaCard
          formula={`\\tau_i = \\frac{\\lambda_i}{\\sum_j \\lambda_j} = \\frac{\\lambda_i}{p}`}
          legend={<>Critère du coude ou seuil <M>{`\\sum \\tau_i \\geq 80\\%`}</M>.</>}
        />
      </StepBlock>

      <StepBlock number="5" title="Projection des individus">
        <FormulaCard formula={`\\mathbf{S} = \\mathbf{Z}\\,\\mathbf{V}_k, \\quad \\mathrm{PC}_i = v_{i1} Z_1 + \\dots + v_{ip} Z_p`} />
      </StepBlock>

      <h2 className="font-serif text-3xl font-semibold text-primary mt-16 mb-6 pb-3 border-b border-border">
        Cas réel — 25 étudiants × 19 matières
      </h2>
      <p className="text-foreground/85 leading-relaxed">
        Notes générées avec quatre profils latents (math, gestion, SI, communication). L'ACP retrouve cette structure
        sans la connaître :
      </p>
      <PCAStudentsViz />

      <h2 className="font-serif text-3xl font-semibold text-primary mt-16 mb-6 pb-3 border-b border-border">
        Lecture des graphiques
      </h2>
      <Callout variant="info" title="Plan des individus">
        Deux points proches = profils similaires. Deux points opposés = profils contraires.
      </Callout>
      <Callout variant="info" title="Cercle des corrélations">
        <ul className="list-disc pl-5 space-y-1">
          <li>Variable proche du cercle = bien représentée.</li>
          <li>Angle aigu = corrélation positive ; angle droit = indépendance ; angle plat = anti-corrélation.</li>
        </ul>
      </Callout>

      <h2 className="font-serif text-3xl font-semibold text-primary mt-16 mb-6 pb-3 border-b border-border">
        À retenir
      </h2>
      <Callout variant="info" title="Mémo">
        <ul className="list-disc pl-5 space-y-1">
          <li>ACP = <strong>rotation</strong> du repère, sans perte d'information.</li>
          <li>On standardise <strong>presque toujours</strong>.</li>
          <li>Valeurs propres ↔ variance ; vecteurs propres ↔ axes.</li>
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
