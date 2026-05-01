import { Link } from "react-router-dom";
import { Github, Mail, BookOpen } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";

const About = () => (
  <PageLayout>
    <section className="container py-20 max-w-3xl">
      <div className="text-xs uppercase tracking-[0.22em] text-accent font-medium mb-4">
        À propos
      </div>

      <div className="flex items-center gap-5 mb-10 flex-wrap">
        <img
          src="https://avatars.githubusercontent.com/Hmz931"
          alt="Hamza Bouguerra"
          className="w-24 h-24 rounded-full object-cover ring-4 ring-accent/30 shadow-card"
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            img.outerHTML = '<div class="w-24 h-24 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-serif text-3xl font-bold shadow-card">HB</div>';
          }}
        />
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-primary leading-tight">
            Hamza Bouguerra
          </h1>
          <p className="text-muted-foreground mt-1">
            Étudiant · Master 1 Business Analytics · Esprit School of Business
          </p>
        </div>
      </div>

      <div className="prose-academic">
        <p className="drop-cap">
          Ce site est un projet personnel. Je suis étudiant en
          Master 1 Business Analytics à l'<strong>Esprit School of Business</strong>,
          et j'ai eu envie de mettre au propre mes notes pour les partager avec la
          promotion. L'idée : un endroit unique, lisible, durable, où retrouver les
          méthodes vues en cours avec des fiches synthétiques, des démonstrations
          rigoureuses et des visualisations qui aident à <em>vraiment</em> comprendre.
        </p>

        <h2>Comment c'est organisé ?</h2>
        <p>
          Chaque chapitre correspond à une matière du programme. Le premier,
          <strong> Data Mining</strong>, regroupe les cinq méthodes fondamentales
          (ACP, AFC, ACM, CAH, K-means). D'autres viendront : ML supervisé, séries
          temporelles, NoSQL, économétrie, NLP…
        </p>

        <h2>Comment contribuer ?</h2>
        <p>
          Le code source est sur GitHub. Toute correction, ajout ou amélioration est
          la bienvenue — pull request ou issue, comme tu préfères.
        </p>

        <div className="not-prose flex flex-wrap gap-3 my-6">
          <a
            href="https://github.com/Hmz931/data-mining-explorer"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border hover:bg-secondary transition text-sm"
          >
            <Github className="w-4 h-4" /> Repo GitHub
          </a>
          <Link
            to="/data-mining"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-accent-foreground hover:-translate-y-0.5 transition-all text-sm"
          >
            <BookOpen className="w-4 h-4" /> Démarrer le Data Mining
          </Link>
        </div>

        <h2>Références bibliographiques</h2>
        <ul>
          <li>
            <strong>Saporta, G.</strong> — <em>Probabilités, analyse des données et
            statistique</em>, Technip, 3ᵉ éd. (2011).
          </li>
          <li>
            <strong>Husson, F., Lê, S., Pagès, J.</strong> — <em>Analyse de données
            avec R</em>, Presses Universitaires de Rennes (2016).
          </li>
          <li>
            <strong>Lebart, L., Morineau, A., Piron, M.</strong> — <em>Statistique
            exploratoire multidimensionnelle</em>, Dunod (2006).
          </li>
        </ul>
      </div>
    </section>
  </PageLayout>
);

export default About;
