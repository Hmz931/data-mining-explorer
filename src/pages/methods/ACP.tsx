import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { Callout } from "@/components/Callout";
import { M, BM } from "@/components/Math";
import { PCAInteractive } from "@/components/PCAInteractive";
import { PCAStudentsViz } from "@/components/PCAStudentsViz";

const toc = [
  { id: "intuition", label: "1. Intuition" },
  { id: "standardisation", label: "2. Standardisation" },
  { id: "etapes", label: "3. Les 5 étapes" },
  { id: "exemple", label: "4. Exemple chiffré" },
  { id: "viz", label: "5. Visualisations" },
  { id: "interpretation", label: "6. Interprétation" },
  { id: "synthese", label: "7. À retenir" },
];

const ACP = () => (
  <PageLayout>
    {/* Header */}
    <section className="border-b border-border bg-gradient-hero">
      <div className="container py-16 md:py-20">
        <Link to="/data-mining" className="inline-flex items-center gap-1 text-sm text-accent hover:underline underline-offset-4 mb-6">
          <ChevronLeft className="w-4 h-4" /> Retour au chapitre Data Mining
        </Link>
        <div className="font-mono text-xs text-accent mb-3 tracking-widest">MÉTHODE FACTORIELLE · QUANTITATIVE</div>
        <h1 className="font-serif text-5xl md:text-6xl font-semibold text-primary leading-[1.05] mb-5 max-w-3xl">
          Analyse en Composantes Principales
        </h1>
        <p className="text-lg text-foreground/75 max-w-2xl leading-relaxed">
          Réduire la dimension d'un tableau de données quantitatives en projetant les individus sur de nouveaux axes —
          appelés composantes principales — qui capturent un maximum de variance.
        </p>
      </div>
    </section>

    {/* Content + TOC */}
    <section className="container py-16 grid lg:grid-cols-[220px_1fr] gap-12">
      {/* TOC */}
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-3">Sommaire</div>
          <nav className="space-y-1.5 text-sm">
            {toc.map((t) => (
              <a key={t.id} href={`#${t.id}`} className="block text-foreground/70 hover:text-accent transition py-1 border-l-2 border-transparent hover:border-accent pl-3">
                {t.label}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      <article className="prose-academic max-w-3xl">
        {/* 1. Intuition */}
        <section id="intuition">
          <h2>1. L'intuition en une phrase</h2>
          <p className="drop-cap">
            Imaginez un nuage de points en 19 dimensions — les notes de 25 étudiants dans 19 matières. Impossible à
            visualiser tel quel. L'ACP cherche les <strong>directions</strong> dans cet espace le long desquelles les
            étudiants sont le plus dispersés. On les appelle <em>composantes principales</em>. En projetant le nuage
            sur les 2 ou 3 premières, on obtient une carte 2D/3D qui résume l'essentiel de l'information.
          </p>
          <Callout variant="intuition" title="Image mentale">
            Photographier une statue : l'ombre projetée dépend de l'angle de la lumière. L'ACP choisit l'angle qui rend
            l'ombre <em>la plus large possible</em> — celle qui révèle le plus de détails.
          </Callout>

          <PCAInteractive />
        </section>

        {/* 2. Standardisation */}
        <section id="standardisation">
          <h2>2. Faut-il standardiser ?</h2>
          <p>
            Avant tout calcul, on doit décider : travaille-t-on sur les données brutes (matrice de
            <em> covariance</em>) ou sur les données standardisées (matrice de <em>corrélation</em>) ?
          </p>
          <h3>Obligatoire</h3>
          <p>
            Si les variables sont dans des <strong>unités différentes</strong> (mètres, kilos, euros…), une variable à
            forte variance écraserait artificiellement les autres. Standardiser est <em>indispensable</em>.
          </p>
          <h3>Recommandé (notre choix)</h3>
          <p>
            Même quand les variables ont la même unité (notes sur 20), on standardise par sécurité : une matière
            naturellement plus dispersée dominerait sinon les composantes.
          </p>
          <BM>{`Z_{ij} = \\frac{X_{ij} - \\bar{X}_j}{\\sigma_j}`}</BM>
          <p>
            Après standardisation, chaque variable a une moyenne nulle et un écart-type unitaire. Travailler sur
            <M>{`\\,Z\\,`}</M> revient à diagonaliser la matrice de corrélation.
          </p>
        </section>

        {/* 3. Étapes */}
        <section id="etapes">
          <h2>3. Les 5 étapes mathématiques</h2>

          <h3>Étape 1 — Centrer-réduire</h3>
          <p>
            On construit la matrice <M>{`Z`}</M> des données standardisées : pour chaque colonne <M>j</M>, on retire la
            moyenne et on divise par l'écart-type.
          </p>

          <h3>Étape 2 — Matrice de covariance (= corrélation ici)</h3>
          <BM>{`\\mathbf{C} = \\frac{1}{n-1}\\,\\mathbf{Z}^\\top \\mathbf{Z}`}</BM>
          <p>
            <M>C</M> est une matrice <M>{`p \\times p`}</M> symétrique. Sa diagonale vaut 1 (variances unitaires), ses
            termes hors-diagonale sont les corrélations entre paires de variables.
          </p>

          <h3>Étape 3 — Décomposition spectrale</h3>
          <p>On résout l'équation aux valeurs propres :</p>
          <BM>{`\\mathbf{C}\\,\\mathbf{v}_i = \\lambda_i\\,\\mathbf{v}_i,\\quad i = 1,\\dots,p`}</BM>
          <ul>
            <li><strong>Vecteurs propres</strong> <M>{`\\mathbf{v}_i`}</M> : directions des nouveaux axes (les composantes).</li>
            <li><strong>Valeurs propres</strong> <M>{`\\lambda_i`}</M> : variance portée par chaque composante.</li>
          </ul>
          <Callout variant="math" title="Pourquoi c'est optimal ?">
            Pour un vecteur unitaire <M>{`\\mathbf{u}`}</M>, la variance des projections <M>{`\\mathbf{Zu}`}</M> vaut
            <M>{`\\,\\mathbf{u}^\\top \\mathbf{C}\\,\\mathbf{u}`}</M>. Maximiser cette forme quadratique sous contrainte
            <M>{`\\,\\|\\mathbf{u}\\|=1\\,`}</M> conduit, via les multiplicateurs de Lagrange, à choisir <M>{`\\mathbf{u}`}</M>
            égal au vecteur propre associé à la plus grande valeur propre.
          </Callout>

          <h3>Étape 4 — Variance expliquée</h3>
          <p>
            Comme <M>{`\\sum_i \\lambda_i = \\mathrm{tr}(\\mathbf{C}) = p`}</M>, la part de variance expliquée par la
            <M>{`\\,i`}</M>-ème composante est :
          </p>
          <BM>{`\\tau_i = \\frac{\\lambda_i}{\\sum_j \\lambda_j} = \\frac{\\lambda_i}{p}`}</BM>
          <p>
            On retient typiquement les <M>k</M> premières composantes telles que <M>{`\\sum_{i=1}^k \\tau_i \\geq 80\\%`}</M>,
            ou bien selon le <em>critère du coude</em> sur l'éboulis.
          </p>

          <h3>Étape 5 — Projection des individus</h3>
          <BM>{`\\mathbf{S} = \\mathbf{Z}\\,\\mathbf{V}_k`}</BM>
          <p>
            où <M>{`\\mathbf{V}_k`}</M> est la matrice <M>{`p \\times k`}</M> formée des <M>k</M> premiers vecteurs propres.
            La ligne <M>i</M> de <M>S</M> donne les coordonnées de l'individu <M>i</M> dans le nouveau plan factoriel.
          </p>
          <p>
            Et chaque composante s'interprète comme une <strong>combinaison linéaire</strong> des variables d'origine :
          </p>
          <BM>{`\\mathrm{PC}_i = v_{i1} Z_1 + v_{i2} Z_2 + \\dots + v_{ip} Z_p`}</BM>
        </section>

        {/* 4. Exemple */}
        <section id="exemple">
          <h2>4. Un exemple chiffré complet</h2>
          <p>Prenons un mini-dataset à 2 variables et 5 individus pour tout calculer à la main :</p>
          <BM>{`\\mathbf{X} = \\begin{pmatrix} 2 & 4 \\\\ 3 & 5 \\\\ 5 & 7 \\\\ 7 & 8 \\\\ 8 & 9 \\end{pmatrix}`}</BM>
          <h3>Centrage</h3>
          <p>Moyennes : <M>{`\\bar{x}_1 = 5,\\ \\bar{x}_2 = 6{,}6`}</M>. D'où :</p>
          <BM>{`\\mathbf{X}_c = \\begin{pmatrix} -3 & -2{,}6 \\\\ -2 & -1{,}6 \\\\ 0 & 0{,}4 \\\\ 2 & 1{,}4 \\\\ 3 & 2{,}4 \\end{pmatrix}`}</BM>
          <h3>Covariance</h3>
          <BM>{`\\mathbf{C} = \\frac{1}{4}\\,\\mathbf{X}_c^\\top \\mathbf{X}_c = \\begin{pmatrix} 6{,}5 & 5{,}6 \\\\ 5{,}6 & 5{,}05 \\end{pmatrix}`}</BM>
          <h3>Valeurs propres</h3>
          <p>
            On résout <M>{`\\det(\\mathbf{C}-\\lambda \\mathbf{I})=0`}</M>, c'est-à-dire
            <M>{`\\,\\lambda^2 - 11{,}55\\,\\lambda + 1{,}525 = 0`}</M>.
          </p>
          <BM>{`\\lambda_1 \\approx 11{,}42 \\quad ; \\quad \\lambda_2 \\approx 0{,}13`}</BM>
          <p>
            La première composante capte donc <M>{`\\dfrac{11{,}42}{11{,}55} \\approx 98{,}9\\%`}</M> de la variance.
          </p>
          <h3>Vecteurs propres</h3>
          <p>Pour <M>{`\\lambda_1`}</M>, on résout <M>{`(\\mathbf{C}-\\lambda_1 \\mathbf{I})\\mathbf{v}=0`}</M> :</p>
          <BM>{`\\mathbf{v}_1 \\approx \\begin{pmatrix} 0{,}751 \\\\ 0{,}660 \\end{pmatrix},\\quad \\mathbf{v}_2 \\approx \\begin{pmatrix} -0{,}660 \\\\ 0{,}751 \\end{pmatrix}`}</BM>
          <h3>Score du premier individu</h3>
          <BM>{`s_{1,1} = (-3)\\times 0{,}751 + (-2{,}6) \\times 0{,}660 \\approx -3{,}97`}</BM>
          <Callout variant="info">
            Vérification clé : la somme des valeurs propres vaut <M>{`6{,}5 + 5{,}05 = 11{,}55`}</M>, qui est bien la trace
            de <M>C</M>. Aucun bit de variance n'est perdu en changeant de repère — l'ACP n'est qu'une rotation.
          </Callout>
        </section>

        {/* 5. Viz */}
        <section id="viz">
          <h2>5. Visualisations sur un cas réaliste</h2>
          <p>
            Reprenons un cas plus parlant : 25 étudiants notés sur 19 matières organisées en 4 grands domaines (maths,
            gestion, SI, communication). Voici ce que l'ACP révèle.
          </p>
          <PCAStudentsViz />
          <p>
            Lecture : les matières d'un même groupe pointent dans la même direction sur le cercle des corrélations —
            preuve que l'ACP a bien retrouvé la structure latente sans la connaître à l'avance.
          </p>
        </section>

        {/* 6. Interprétation */}
        <section id="interpretation">
          <h2>6. Comment interpréter les résultats ?</h2>
          <h3>Sur le plan des individus</h3>
          <p>Deux étudiants proches ont des profils de notes similaires sur les composantes affichées. Deux étudiants opposés ont des profils contraires.</p>
          <h3>Sur le cercle des corrélations</h3>
          <ul>
            <li>Une variable proche du cercle est <strong>bien représentée</strong> dans le plan.</li>
            <li>Deux variables avec un <strong>angle aigu</strong> sont positivement corrélées.</li>
            <li>Un <strong>angle droit</strong> indique l'absence de corrélation linéaire.</li>
            <li>Un <strong>angle plat</strong> (180°) indique une anti-corrélation.</li>
          </ul>
          <h3>Nommer une composante</h3>
          <p>
            On regarde les variables qui contribuent le plus (coefficients <M>{`v_{ij}`}</M> les plus grands en valeur
            absolue) et on leur trouve un sens commun : <em>« niveau général »</em>, <em>« opposition gestion vs IT »</em>, etc.
          </p>
        </section>

        {/* 7. Synthèse */}
        <section id="synthese">
          <h2>7. À retenir</h2>
          <Callout variant="info" title="Mémo">
            <ul className="list-disc pl-5 space-y-1">
              <li>L'ACP est une <strong>rotation</strong> du repère, sans perte d'information.</li>
              <li>On standardise <strong>presque toujours</strong>.</li>
              <li>Les <strong>valeurs propres</strong> mesurent la variance, les <strong>vecteurs propres</strong> donnent les axes.</li>
              <li>On retient assez de composantes pour atteindre <M>{`\\geq 80\\%`}</M> de variance cumulée.</li>
              <li>Le <strong>plan des individus</strong> et le <strong>cercle des corrélations</strong> sont les deux outils-clés d'interprétation.</li>
            </ul>
          </Callout>
        </section>

        {/* Nav next */}
        <div className="mt-16 pt-8 border-t border-border flex justify-between items-center">
          <Link to="/data-mining" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition">
            <ChevronLeft className="w-4 h-4" /> Tout le chapitre
          </Link>
          <Link to="/data-mining/afc" className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline underline-offset-4">
            Suivant : AFC <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </article>
    </section>
  </PageLayout>
);

export default ACP;
