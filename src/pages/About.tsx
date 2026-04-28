import { Link } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";

const About = () => (
  <PageLayout>
    <section className="container py-20 max-w-3xl">
      <div className="text-xs uppercase tracking-[0.22em] text-accent font-medium mb-4">À propos</div>
      <h1 className="font-serif text-5xl font-semibold text-primary mb-8 leading-[1.05]">
        Un carnet écrit par et pour la promotion.
      </h1>
      <div className="prose-academic">
        <p className="drop-cap">
          Ce site est né d'une envie simple : disposer d'un endroit unique, clair et durable pour rassembler les
          méthodes vues en Master 1 Business Analytics à l'<strong>École Supérieure de la Banque</strong>. Pas de cours
          recopiés, pas de copier-coller de Wikipedia : des fiches synthétiques, démonstrations rigoureuses, et
          visualisations qui aident à <em>vraiment</em> comprendre.
        </p>
        <h2>Comment c'est organisé ?</h2>
        <p>
          Le contenu est découpé en chapitres correspondant aux grandes matières du programme. Le premier chapitre,
          <strong> Data Mining</strong>, regroupe les cinq méthodes fondamentales d'analyse exploratoire et de
          classification. D'autres chapitres viendront — économétrie, ML supervisé, séries temporelles…
        </p>
        <h2>Comment contribuer ?</h2>
        <p>
          Le code source est hébergé sur GitHub. Chacun peut proposer des corrections, ajouter une fiche, enrichir
          un exemple ou améliorer une visualisation. Le site est conçu pour grandir avec la promotion.
        </p>
        <h2>Crédits</h2>
        <p>
          Inspiration pédagogique : Distill.pub, Stripe Press, et les manuels de référence (Saporta, Lebart, Husson).
        </p>
        <p>
          <Link to="/data-mining" className="text-accent">→ Démarrer par le Data Mining</Link>
        </p>
      </div>
    </section>
  </PageLayout>
);

export default About;
