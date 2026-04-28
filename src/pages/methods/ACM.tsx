import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { MethodHero } from "@/components/MethodHero";
import { Callout } from "@/components/Callout";
import { M } from "@/components/Math";
import { FormulaCard } from "@/components/FormulaCard";
import { StepBlock } from "@/components/StepBlock";
import { ACMViz } from "@/components/viz/ACMViz";

const ACM = () => (
  <PageLayout>
    <MethodHero
      code="ACM"
      tag="Méthode factorielle · qualitative multivariée"
      title="Analyse des Correspondances Multiples"
      subtitle="Étendre l'AFC à plus de deux variables qualitatives, via le tableau disjonctif complet ou la matrice de Burt."
    />

    <section className="container py-14 max-w-3xl">
      <p className="text-lg text-foreground/85 leading-relaxed mb-6">
        Quand on a plusieurs variables qualitatives (questionnaires, données socio-démographiques…), l'ACM permet de
        positionner sur un même plan les <strong>modalités</strong> et les <strong>individus</strong>.
      </p>

      <ACMViz />

      <h2 className="font-serif text-3xl font-semibold text-primary mt-16 mb-2 pb-3 border-b border-border">
        Le formalisme
      </h2>

      <StepBlock number="1" title="Le tableau disjonctif complet">
        <p>
          Soit <M>n</M> individus, <M>Q</M> variables qualitatives, et <M>m</M> modalités au total. Le tableau
          disjonctif <M>Z</M> est de taille <M>{`n \\times m`}</M> avec :
        </p>
        <FormulaCard formula={`Z_{ij} = \\begin{cases} 1 & \\text{si l'individu } i \\text{ possède la modalité } j \\\\ 0 & \\text{sinon} \\end{cases}`} />
        <p>Chaque ligne contient exactement <M>Q</M> valeurs égales à 1 (une par variable).</p>
      </StepBlock>

      <StepBlock number="2" title="La matrice de Burt">
        <p>Symétrique <M>{`m \\times m`}</M>, elle croise toutes les modalités deux à deux :</p>
        <FormulaCard
          formula={`B = Z^\\top Z`}
          legend={
            <>
              Les blocs diagonaux sont les effectifs marginaux d'une variable. Les blocs hors-diagonale sont les tableaux
              de contingence entre paires de variables.
            </>
          }
        />
      </StepBlock>

      <StepBlock number="3" title="L'ACM = AFC sur Z (ou sur B)">
        <p>On applique exactement la même démarche que l'AFC, sur la matrice <M>Z</M> :</p>
        <FormulaCard formula={`S_{ij} = \\frac{p_{ij} - r_i\\,c_j}{\\sqrt{r_i\\,c_j}}, \\quad p_{ij} = \\frac{Z_{ij}}{nQ}`} />
        <p>
          Avec <M>{`r_i = 1/n`}</M> (poids uniforme des individus) et <M>{`c_j = n_j/(nQ)`}</M> (effectif relatif de la
          modalité <M>j</M>).
        </p>
      </StepBlock>

      <StepBlock number="4" title="Décomposition spectrale">
        <p>La SVD de <M>S</M> (équivalente à diagonaliser <M>{`S^\\top S`}</M>) donne les valeurs propres <M>{`\\lambda_k`}</M>.</p>
        <Callout variant="warning" title="Inertie totale toujours surévaluée">
          En ACM, l'inertie totale vaut artificiellement <M>{`\\,\\frac{m - Q}{Q}\\,`}</M>. Les pourcentages bruts sous-estiment
          l'importance des premiers axes. On utilise la <strong>correction de Benzécri</strong> :
          <FormulaCard
            formula={`\\lambda_k^{\\text{corr}} = \\left(\\frac{Q}{Q-1}\\right)^2\\left(\\lambda_k - \\frac{1}{Q}\\right)^2 \\quad \\text{si}\\ \\lambda_k > \\frac{1}{Q}`}
          />
        </Callout>
      </StepBlock>

      <StepBlock number="5" title="Coordonnées des modalités et individus">
        <FormulaCard formula={`G_j^{(k)} = \\sqrt{\\lambda_k}\\,\\frac{v_{jk}}{\\sqrt{c_j}}, \\quad F_i^{(k)} = \\sqrt{\\lambda_k}\\,\\frac{u_{ik}}{\\sqrt{r_i}}`} />
        <p>Comme en AFC, on obtient un <strong>biplot</strong> où modalités et individus se lisent simultanément.</p>
      </StepBlock>

      <h2 className="font-serif text-3xl font-semibold text-primary mt-16 mb-6 pb-3 border-b border-border">
        Lire un plan ACM
      </h2>
      <Callout variant="info" title="Règles d'or">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Une modalité <strong>loin du centre</strong> est rare ou typique.</li>
          <li>Deux modalités proches sont <strong>souvent associées</strong> chez les mêmes individus.</li>
          <li>Un individu est proche des modalités qu'il possède.</li>
          <li>Modalités d'une même variable : on ne peut pas dire qu'elles sont « associées » (elles s'excluent par construction).</li>
        </ul>
      </Callout>

      <h2 className="font-serif text-3xl font-semibold text-primary mt-16 mb-6 pb-3 border-b border-border">
        À retenir
      </h2>
      <Callout variant="info" title="Mémo">
        <ul className="list-disc pl-5 space-y-1">
          <li>ACM = AFC appliquée au <strong>tableau disjonctif complet</strong>.</li>
          <li>La matrice de <strong>Burt</strong> donne les mêmes axes (à un facteur près).</li>
          <li>Pourcentages d'inertie corrigés via <strong>Benzécri</strong>.</li>
          <li>Outil-roi pour <strong>analyser des questionnaires</strong>.</li>
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
