import { PageLayout } from "@/components/PageLayout";
import { NoSQLHero } from "@/components/NoSQLHero";
import { Notebook, NbMarkdown, NbCode, NbOutput } from "@/components/notebook/Notebook";
import { Callout } from "@/components/Callout";
import { QCM } from "@/components/QCM";

const NoSQLTd = () => (
  <PageLayout>
    <NoSQLHero
      code="CH.5"
      tag="TP · Modélisation"
      title="Modéliser en orienté document."
      subtitle="Étudiants/Cours, Ventes/Livres/Auteurs : références vs imbrication."
    />

    <article className="container py-10 sm:py-14 max-w-4xl">
      {/* Exo 1 */}
      <h2 className="font-serif text-2xl font-semibold text-primary mb-3">Exercice 1 — Étudiants & Cours</h2>
      <ul className="list-disc pl-6 text-foreground/85 space-y-1 text-sm mb-4">
        <li><strong>Cours</strong> : code, titre, description, crédits, prérequis (autres cours)</li>
        <li><strong>Étudiant</strong> : nom, prénom, adresse (numéro, rue, ville, CP)</li>
        <li>Un étudiant suit plusieurs cours, et un cours est suivi par plusieurs étudiants (n..n)</li>
      </ul>

      <Notebook kernel="Modélisation · 2 approches">
        <NbMarkdown title="Approche A — Références (5 collections, normalisation)">
          <p>On garde des collections séparées et on relie par <code>_id</code>. Pratique pour mettre à jour un cours une seule fois.</p>
        </NbMarkdown>
        <NbCode language="js" code={`// Cours
{ "_id":"C001", "code":"INF101", "titre":"Intro info", "credits":4 }
{ "_id":"C002", "code":"INF201", "titre":"Structures de données", "credits":5 }

// Adresses
{ "_id":"A001", "numero":12, "rue":"Rue de la Paix",
  "ville":"Paris", "codePostal":"75002" }

// Etudiants (référence vers Adresses)
{ "_id":"E001", "nom":"Dupont", "prenom":"Alice", "adresseId":"A001" }

// Prérequis (table d'association cours→cours)
{ "_id":"P001", "cours":"C002", "prerequis":"C001" }

// Suivre (n..n étudiants ↔ cours)
{ "_id":"S001", "etudiant":"E001", "cours":["C001","C002"] }`} />

        <NbMarkdown title="Approche B — Imbrication (centrée étudiant)">
          <p>Tout dans un seul document <strong>Étudiant</strong>. Idéal si on lit toujours « profil + cours suivis » ensemble.</p>
        </NbMarkdown>
        <NbCode language="js" code={`{
  "_id":"E001",
  "nom":"Dupont", "prenom":"Alice",
  "adresse": { "numero":12, "rue":"Rue de la Paix",
               "ville":"Paris", "codePostal":"75002" },
  "coursSuivis": [
    { "code":"INF101", "titre":"Intro info",
      "credits":4, "prerequis":[] },
    { "code":"INF201", "titre":"Structures de données",
      "credits":5,
      "prerequis":[ { "code":"INF101", "titre":"Intro info" } ] }
  ]
}`} />
        <NbOutput kind="result">{`✓ 1 seule requête pour tout afficher
✗ Duplication : titre/credits du cours répétés chez chaque étudiant`}</NbOutput>
      </Notebook>

      <Callout variant="intuition" title="Quel choix ?">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Lecture dominante</strong> (afficher la fiche d'un étudiant) → <strong>imbrication</strong>.</li>
          <li><strong>Mises à jour fréquentes</strong> (titre d'un cours change) → <strong>références</strong>.</li>
        </ul>
      </Callout>

      {/* Exo 2 */}
      <h2 className="font-serif text-2xl font-semibold text-primary mt-12 mb-3">Exercice 2 — Ventes / Livres / Auteurs</h2>
      <p className="text-foreground/80 text-sm mb-4">
        Trois modélisations possibles, selon ce qu'on consulte le plus souvent :
      </p>

      <Notebook kernel="Modélisation centrée">
        <NbMarkdown title="Centrée Vente — un livre + son auteur imbriqués" />
        <NbCode language="js" code={`{
  "_id": 12,
  "date": "02-06-2017",
  "livre": {
    "isbn": "978-2-212-56789-0",
    "titre": "NoSQL",
    "auteur": { "id_auteur": 1, "nom": "Smith", "prenom": "John" }
  }
}`} />

        <NbMarkdown title="Centrée Livre — auteur imbriqué + tableau des ventes" />
        <NbCode language="js" code={`{
  "isbn": "2154889589",
  "titre": "NoSQL",
  "auteur": { "id_auteur": 987, "nom": "Bruchez", "prenom": "Rudi" },
  "ventes": [
    { "id_vente": 12, "date": "02/06/2017" },
    { "id_vente": 20, "date": "12/09/2017" }
  ]
}`} />

        <NbMarkdown title="Centrée Auteur — livres imbriqués + ventes par livre" />
        <NbCode language="js" code={`{
  "id_auteur": 987, "nom": "Bruchez", "prenom": "Rudi",
  "livres": [
    { "isbn": "2154889589", "titre": "NoSQL",
      "ventes": [ { "id_vente":12, "date":"02/06/2017" },
                  { "id_vente":20, "date":"12/09/2017" } ] }
  ]
}`} />
      </Notebook>

      {/* Exo 3 */}
      <h2 className="font-serif text-2xl font-semibold text-primary mt-12 mb-3">
        Exercice 3 — Du document au relationnel
      </h2>
      <p className="text-foreground/80 text-sm mb-4">
        À partir d'un document Étudiant + tableau d'UE, on reconstruit 3 tables relationnelles :
      </p>

      <Notebook kernel="SQL · reconstitution">
        <NbCode language="js" code={`// Document de départ
{ "_id":978, "nom":"ADIMI Meriem",
  "UE":[ {"id":"ue:11","titre":"Java","note":12},
         {"id":"ue:27","titre":"Bases de données","note":17},
         {"id":"ue:37","titre":"Réseaux","note":14} ] }`} />
        <NbOutput kind="result">{`Etudiant(id_etu, nom)
   978 | ADIMI Meriem
   476 | BELABDI Ahmed

UE(id_ue, titre)
   ue:11 | Java
   ue:27 | Bases de données
   ue:37 | Réseaux
   ue:13 | Méthodologie
   ue:76 | Conduite projet

Inscription(id_etu, id_ue, note)   -- table de liaison n..n
   978 | ue:11 | 12
   978 | ue:27 | 17
   978 | ue:37 | 14
   476 | ue:13 | 17
   476 | ue:27 | 10
   476 | ue:76 | 11`}</NbOutput>

        <NbMarkdown title="Représentation alternative — centrée UE" />
        <NbCode language="js" code={`{
  "_id": "ue:27", "titre": "Bases de données",
  "etudiants": [
    { "id_etu": 978, "nom": "ADIMI Meriem", "note": 17 },
    { "id_etu": 476, "nom": "BELABDI Ahmed", "note": 10 }
  ]
}`} />
      </Notebook>

      <QCM
        title="Testez vos connaissances — Modélisation"
        questions={[
          { id: 1, question: "Relation 1..1 lue ensemble :", options: ["Référence", "Imbrication", "Indifférent", "Toujours 2 collections"], correct: 1, explanation: "Imbriquer évite une 2ᵉ requête." },
          { id: 2, question: "Relation n..n :", options: ["Imbrication des deux côtés", "Références (1 ou 2 collections + table d'association)", "Inutile en NoSQL", "Toujours via $lookup"], correct: 1, explanation: "Sinon duplication massive." },
          { id: 3, question: "Imbriquer = duplication :", options: ["Toujours fausse", "Possible si la donnée imbriquée appartient à plusieurs parents", "Impossible", "Sans risque"], correct: 1, explanation: "C'est le coût accepté pour des lectures rapides." },
          { id: 4, question: "Centrée 'Vente' = bonne idée si :", options: ["On consulte surtout l'historique des ventes", "On modifie souvent les auteurs", "Aucun cas", "Toujours mauvais"], correct: 0, explanation: "On choisit l'entité centrale selon le pattern de lecture dominant." },
          { id: 5, question: "Pour passer d'un document avec UE imbriqués au relationnel, on crée :", options: ["1 seule table", "2 tables (Etu + UE)", "3 tables (Etu, UE, Inscription)", "Aucune table"], correct: 2, explanation: "n..n → table de liaison Inscription(id_etu, id_ue, note)." },
          { id: 6, question: "Référencer un autre doc se fait via :", options: ["Son nom", "Son champ _id", "Sa position", "Sa date"], correct: 1, explanation: "_id est la clé primaire." },
          { id: 7, question: "Pour matérialiser une jointure à la lecture :", options: ["$join", "$lookup", "$ref", "$merge"], correct: 1, explanation: "$lookup dans aggregate." },
          { id: 8, question: "Limite stricte d'un document BSON :", options: ["1 Mo", "16 Mo", "1 Go", "Aucune"], correct: 1, explanation: "16 Mo — éviter d'imbriquer des arrays géants." },
          { id: 9, question: "Adresse d'un étudiant unique → préférer :", options: ["Référence", "Imbrication", "Pas d'adresse", "Table SQL"], correct: 1, explanation: "1..1 → imbrication." },
          { id: 10, question: "Catalogue de composants partagé entre voitures :", options: ["Imbrication", "Référence", "Duplication totale", "Index seul"], correct: 1, explanation: "Pour ne pas dupliquer le composant chez chaque voiture." },
          { id: 11, question: "Un cours peut référencer ses prérequis par :", options: ["Tableau d'_id de cours", "Une table SQL", "Un fichier CSV", "Impossible en NoSQL"], correct: 0, explanation: "{ prerequis: ['C001','C002'] }." },
          { id: 12, question: "Les profils de lecture dominent les choix de modélisation :", options: ["Faux", "Vrai", "Seulement en SQL", "Seulement pour > 1 To"], correct: 1, explanation: "On modélise pour les requêtes les plus fréquentes." },
          { id: 13, question: "Le _id peut être :", options: ["Seulement un ObjectId", "N'importe quelle valeur unique", "Toujours un entier", "Toujours une string"], correct: 1, explanation: "_id accepte tout type unique (string, int, ObjectId…)." },
          { id: 14, question: "Modélisation centrée Auteur impose :", options: ["Aucun livre", "Liste des livres imbriqués dans l'auteur", "Ventes en tables séparées uniquement", "Pas de ventes"], correct: 1, explanation: "Auteur ⊃ livres ⊃ ventes." },
          { id: 15, question: "Avantage d'une approche 1-collection imbriquée :", options: ["Économie d'espace", "Une seule requête pour tout afficher", "Pas d'index nécessaire", "Schéma forcé"], correct: 1, explanation: "Lecture en 1 round-trip réseau." },
          { id: 16, question: "Inconvénient principal de l'imbrication forte :", options: ["Lenteur de lecture", "Duplication et mise à jour multi-points", "Aucun", "Empêche find()"], correct: 1, explanation: "Modifier un libellé partout coûte cher." },
          { id: 17, question: "Du relationnel vers le document, une jointure n..n devient souvent :", options: ["Une 3ᵉ collection inchangée", "Un tableau d'_id côté entité dominante", "Impossible", "Un index"], correct: 1, explanation: "ex. coursSuivis: ['C001','C002']." },
          { id: 18, question: "Choisir l'entité centrale dépend de :", options: ["Le hasard", "La requête la plus fréquente / critique", "L'ordre alphabétique", "La taille du nom"], correct: 1, explanation: "On modélise pour le hot path." },
          { id: 19, question: "Si une UE est partagée par 1000 étudiants, l'imbriquer dans chaque étudiant :", options: ["N'a aucun coût", "Duplique l'UE 1000 fois", "Réduit la taille", "Active le sharding"], correct: 1, explanation: "Préférer une référence dans ce cas." },
          { id: 20, question: "Document MongoDB ≈ ", options: ["Ligne SQL plate", "Ligne SQL + ses 'jointures' déjà résolues", "Index", "Vue matérialisée"], correct: 1, explanation: "C'est une vue pré-jointe orientée lecture." },
        ]}
      />
    </article>
  </PageLayout>
);

export default NoSQLTd;
