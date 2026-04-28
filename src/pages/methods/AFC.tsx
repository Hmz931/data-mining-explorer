import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { MethodHero } from "@/components/MethodHero";
import { Callout } from "@/components/Callout";
import { M } from "@/components/Math";
import { FormulaCard } from "@/components/FormulaCard";
import { StepBlock } from "@/components/StepBlock";
import { AFCViz } from "@/components/viz/AFCViz";

const AFC = () => (
  <PageLayout>
    <MethodHero
      code="AFC"
      tag="Méthode factorielle · qualitative"
      title="Analyse Factorielle des Correspondances"
      subtitle="Visualiser les associations entre les modalités de deux variables qualitatives, à partir d'un tableau de contingence."
    />

    <section className="container py-14 max-w-3xl">
      <p className="text-lg text-foreground/85 leading-relaxed mb-6">
        L'AFC est l'équivalent de l'ACP pour des données <strong>qualitatives</strong>. Elle décompose le <M>\chi^2</M> de
        contingence pour produire un plan factoriel sur lequel lignes <em>et</em> colonnes coexistent.
      </p>

      <AFCViz />

      <h2 className="font-serif text-3xl font-semibold text-primary mt-16 mb-2 pb-3 border-b border-border">
        Le formalisme
      </h2>

      <StepBlock number="1" title="Tableau de contingence et profils">
        <p>Soit <M>{`N = (n_{ij})`}</M> de taille <M>{`I \\times J`}</M>, total <M>{`n_{\\bullet\\bullet}`}</M>. On définit :</p>
        <FormulaCard
          formula={`p_{ij} = \\frac{n_{ij}}{n_{\\bullet\\bullet}}, \\quad r_i = \\sum_j p_{ij}, \\quad c_j = \\sum_i p_{ij}`}
          legend={
            <>
              <M>{`p_{ij}`}</M> = fréquence relative ; <M>{`r_i`}</M> = poids de la ligne <M>i</M> ;
              <M>{`\\,c_j\\,`}</M> = poids de la colonne <M>j</M>.
            </>
          }
        />
      </StepBlock>

      <StepBlock number="2" title="Test d'indépendance & inertie">
        <p>Sous l'hypothèse d'indépendance, on attendrait <M>{`t_{ij} = r_i\\,c_j\\,n_{\\bullet\\bullet}`}</M>. L'écart à
        l'indépendance se mesure par :</p>
        <FormulaCard
          formula={`\\chi^2 = \\sum_{i,j}\\frac{(n_{ij} - t_{ij})^2}{t_{ij}}, \\qquad \\Phi^2 = \\frac{\\chi^2}{n_{\\bullet\\bullet}}`}
          legend={<>L'<strong>inertie totale</strong> du nuage en AFC vaut exactement <M>\Phi^2</M>.</>}
        />
        <Callout variant="intuition">
          L'AFC <em>décompose</em> ce <M>\chi^2</M> sur des axes principaux. Plus l'inertie est grande, plus les variables
          sont liées — et plus l'AFC est riche d'enseignements.
        </Callout>
      </StepBlock>

      <StepBlock number="3" title="Profils-lignes et profils-colonnes">
        <p>Chaque ligne <M>i</M> est décrite par son <strong>profil</strong> (distribution conditionnelle) :</p>
        <FormulaCard formula={`f_{j|i} = \\frac{p_{ij}}{r_i}`} />
        <p>L'AFC compare les profils-lignes au profil moyen <M>{`(c_1, \\dots, c_J)`}</M> via la <strong>distance du <M>\chi^2</M></strong> :</p>
        <FormulaCard formula={`d_{\\chi^2}^2(i, i') = \\sum_j \\frac{1}{c_j}\\left(\\frac{p_{ij}}{r_i} - \\frac{p_{i'j}}{r_{i'}}\\right)^2`} />
      </StepBlock>

      <StepBlock number="4" title="Décomposition de la matrice résiduelle">
        <p>On forme la matrice des résidus standardisés :</p>
        <FormulaCard formula={`S_{ij} = \\frac{p_{ij} - r_i\\,c_j}{\\sqrt{r_i\\,c_j}}`} />
        <p>Sa <strong>SVD</strong> donne les axes factoriels :</p>
        <FormulaCard formula={`S = U\\,\\Sigma\\,V^\\top, \\quad \\Sigma = \\mathrm{diag}(\\sqrt{\\lambda_k})`} />
        <p>Les <M>{`\\lambda_k`}</M> sont les inerties expliquées par chaque axe ; <M>{`\\sum_k \\lambda_k = \\Phi^2`}</M>.</p>
      </StepBlock>

      <StepBlock number="5" title="Coordonnées principales">
        <p>Pour la ligne <M>i</M> sur l'axe <M>k</M> :</p>
        <FormulaCard formula={`F_i^{(k)} = \\sqrt{\\lambda_k}\\,\\frac{u_{ik}}{\\sqrt{r_i}}`} />
        <p>Pour la colonne <M>j</M> sur l'axe <M>k</M> :</p>
        <FormulaCard formula={`G_j^{(k)} = \\sqrt{\\lambda_k}\\,\\frac{v_{jk}}{\\sqrt{c_j}}`} />
      </StepBlock>

      <h2 className="font-serif text-3xl font-semibold text-primary mt-16 mb-6 pb-3 border-b border-border">
        Lecture du plan factoriel
      </h2>
      <Callout variant="info" title="Règles d'interprétation">
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Deux lignes proches</strong> : profils similaires sur les colonnes.</li>
          <li><strong>Deux colonnes proches</strong> : profils similaires sur les lignes.</li>
          <li><strong>Ligne ↔ colonne proches</strong> : association forte (effectif observé &gt; attendu).</li>
          <li>Une modalité <strong>loin du centre</strong> contribue beaucoup à l'inertie de l'axe.</li>
        </ul>
      </Callout>

      <h2 className="font-serif text-3xl font-semibold text-primary mt-16 mb-6 pb-3 border-b border-border">
        À retenir
      </h2>
      <Callout variant="info" title="Mémo">
        <ul className="list-disc pl-5 space-y-1">
          <li>AFC = ACP pour les <strong>tableaux de contingence</strong>.</li>
          <li>Inertie totale = <M>{`\\Phi^2 = \\chi^2 / n`}</M>.</li>
          <li>Distance utilisée : <strong>distance du <M>\chi^2</M></strong> (et non euclidienne).</li>
          <li>Lignes et colonnes se représentent sur un <strong>même plan</strong> (biplot).</li>
          <li>Nombre maximal d'axes : <M>{`\\min(I-1, J-1)`}</M>.</li>
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
