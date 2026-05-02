import { PageLayout } from "@/components/PageLayout";
import { NoSQLHero } from "@/components/NoSQLHero";
import { Notebook, NbMarkdown, NbCode, NbOutput } from "@/components/notebook/Notebook";
import { Callout } from "@/components/Callout";
import { QCM } from "@/components/QCM";

const Row = ({ a, b }: { a: string; b: string }) => (
  <tr className="border-b border-border/60">
    <td className="py-2 px-3 font-mono text-xs text-muted-foreground">{a}</td>
    <td className="py-2 px-3 font-mono text-xs text-primary">{b}</td>
  </tr>
);

const NoSQLMongo = () => (
  <PageLayout>
    <NoSQLHero
      code="CH.2"
      tag="MongoDB · Concepts"
      title="MongoDB : documents, collections, sharding."
      subtitle="Le SGBD documentaire le plus déployé. Modélisation, partitionnement, réplication."
    />

    <article className="container py-10 sm:py-14 max-w-4xl">
      <h2 className="font-serif text-2xl font-semibold text-primary mb-4">1 · Carte d'identité</h2>
      <ul className="list-disc pl-6 text-foreground/85 space-y-1.5">
        <li>Base NoSQL <strong>orientée documents</strong>, schéma flexible</li>
        <li>Écrite en <strong>C++</strong>, créée en <strong>2007</strong></li>
        <li>Stockage en <strong>BSON</strong> (Binary JSON) — types riches : Date, ObjectId, tableaux, sous-documents</li>
        <li>Documents groupés en <strong>collections</strong> (équivalent table)</li>
      </ul>

      <h2 className="font-serif text-2xl font-semibold text-primary mt-12 mb-4">
        2 · Vocabulaire SQL ↔ MongoDB
      </h2>
      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface/60">
            <tr><th className="text-left py-2 px-3 font-mono text-xs">SQL</th><th className="text-left py-2 px-3 font-mono text-xs">MongoDB</th></tr>
          </thead>
          <tbody>
            <Row a="Database" b="Database" />
            <Row a="Table" b="Collection" />
            <Row a="Row / Tuple" b="Document" />
            <Row a="Column" b="Field" />
            <Row a="Index" b="Index" />
            <Row a="Foreign Key + JOIN" b="Référence ou Imbrication" />
            <Row a="Primary Key" b="_id (ObjectId)" />
          </tbody>
        </table>
      </div>

      <h2 className="font-serif text-2xl font-semibold text-primary mt-12 mb-4">
        3 · Anatomie d'un document
      </h2>
      <Notebook kernel="MongoDB Shell · 5.0">
        <NbMarkdown title="3 documents équivalents (schéma flexible)">
          <p>Trois personnes — chaque document peut avoir <strong>des champs différents</strong>.</p>
        </NbMarkdown>
        <NbCode language="js" code={`// Document plat
{ nom: "Ben Ali", tel: 21577860, email: "agb@abc.com" }

// Sous-document imbriqué
{
  nom: { prenom: "Mohamed", famille: "Ben Ali" },
  tel: 21577860,
  email: "agb@abc.com"
}

// Tableau de valeurs
{ name: "Mohamed", tels: [21577860, 24987620] }`} />
      </Notebook>

      <Callout variant="intuition" title="Quand imbriquer, quand référencer ?">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Imbriquer (1..1 ou 1..peu)</strong> : carte vitale dans une personne, adresse dans un client.</li>
          <li><strong>Référencer (1..beaucoup ou n..n)</strong> : voiture → composants par <code>_id</code>.</li>
          <li>Règle d'or : <strong>regroupez ce qu'on lit ensemble</strong>.</li>
        </ul>
      </Callout>

      <h2 className="font-serif text-2xl font-semibold text-primary mt-12 mb-4">
        4 · Modélisation — exemples
      </h2>
      <Notebook kernel="Modélisation">
        <NbMarkdown title="Personne ↔ Carte vitale (1..1) → 1 collection imbriquée" />
        <NbCode language="js" code={`// Collection "Personne"
{
  nom: "Hamza",
  carte_vitale: {
    date_emission: ISODate("2022-01-15"),
    cnam: "AB-12345"
  }
}`} />
        <NbMarkdown title="Voiture ↔ Composants (1..beaucoup) → 2 collections + références" />
        <NbCode language="js" code={`// Collection "Voiture"
{ marque: "Renault", modele: "Clio",
  composants: ["Id_101", "Id_22", "Id_345"] }

// Collection "Composant"
{ _id: "Id_101", type: "Moteur", prix: 4500 }`} />
      </Notebook>

      <h2 className="font-serif text-2xl font-semibold text-primary mt-12 mb-4">
        5 · Sharding (partitionnement horizontal)
      </h2>
      <p className="text-foreground/80 leading-relaxed mb-4">
        Pour faire de la scalabilité horizontale, MongoDB répartit les documents
        d'une collection sur plusieurs nœuds (<strong>shards</strong>) selon une <strong>shard key</strong>.
      </p>

      <div className="my-6 rounded-lg border border-border bg-card p-5">
        <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground mb-4">
          Architecture d'un sharded cluster
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="px-4 py-2 rounded border border-accent bg-accent/10 font-mono text-xs">
            Application
          </div>
          <div className="text-xl text-muted-foreground">↕</div>
          <div className="grid grid-cols-2 gap-3 w-full max-w-md">
            <div className="px-4 py-2 rounded border border-border bg-surface text-center font-mono text-xs">
              mongos<br /><span className="text-[10px] text-muted-foreground">(routeur)</span>
            </div>
            <div className="px-4 py-2 rounded border border-border bg-surface text-center font-mono text-xs">
              Config Server<br /><span className="text-[10px] text-muted-foreground">(métadonnées)</span>
            </div>
          </div>
          <div className="text-xl text-muted-foreground">↕</div>
          <div className="grid grid-cols-3 gap-3 w-full">
            {["Shard 1", "Shard 2", "Shard 3"].map((s) => (
              <div key={s} className="px-3 py-3 rounded border border-border bg-card text-center font-mono text-xs">
                {s}
                <div className="text-[10px] text-muted-foreground mt-1">~ 1/3 des données</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ul className="list-disc pl-6 text-foreground/85 space-y-1.5">
        <li><strong>Routeur (mongos)</strong> : reçoit les requêtes du client.</li>
        <li><strong>Config server</strong> : sait où se trouve chaque chunk de données.</li>
        <li><strong>Shards</strong> : nœuds qui stockent un sous-ensemble des documents.</li>
      </ul>

      <Callout variant="warning" title="Choix de la shard key">
        Une mauvaise clé de partitionnement crée des <strong>hotspots</strong> (un shard reçoit tout
        le trafic). Préférer une clé à <strong>haute cardinalité</strong> et <strong>distribution uniforme</strong>.
      </Callout>

      <h2 className="font-serif text-2xl font-semibold text-primary mt-12 mb-4">
        6 · Réplication — Replica Set
      </h2>
      <p className="text-foreground/80 leading-relaxed">
        Un <strong>replica set</strong> = 1 nœud <strong>Primary</strong> (lectures/écritures) + 2+ <strong>Secondaries</strong>
        (réplicas synchrones). En cas de panne du primary, une élection promeut un secondary.
        ⇒ <strong>haute disponibilité</strong>.
      </p>

      <QCM
        title="Testez vos connaissances — MongoDB"
        questions={[
          { id: 1, question: "MongoDB est de quel type ?", options: ["Relationnel", "Clé/valeur", "Document", "Graphe"], correct: 2, explanation: "Document store, stocke du BSON." },
          { id: 2, question: "Format de stockage interne :", options: ["XML", "JSON", "BSON", "YAML"], correct: 2, explanation: "BSON = Binary JSON, supporte plus de types (Date, ObjectId…)." },
          { id: 3, question: "Une collection MongoDB correspond à :", options: ["Une base", "Une table SQL", "Une ligne", "Un index"], correct: 1, explanation: "Collection ↔ Table en SQL." },
          { id: 4, question: "Clé primaire d'un document :", options: ["pk", "id", "_id", "key"], correct: 2, explanation: "Le champ _id (auto-généré ObjectId) est la clé primaire." },
          { id: 5, question: "Un ObjectId est généré automatiquement si :", options: ["On force avec NumberInt", "On ne le fournit pas à l'insert", "Jamais", "Toujours, même si on en fournit un"], correct: 1, explanation: "Si on n'insère pas _id, MongoDB en crée un automatiquement." },
          { id: 6, question: "Schéma flexible signifie :", options: ["Tous les documents doivent avoir les mêmes champs", "Les documents d'une collection peuvent avoir des champs différents", "Le schéma est validé par le serveur SQL", "Pas d'index possible"], correct: 1, explanation: "Schema-free : chaque document peut avoir sa propre structure." },
          { id: 7, question: "Une jointure SQL devient en MongoDB :", options: ["JOIN", "Référence + $lookup ou imbrication", "MERGE", "INSERT INTO"], correct: 1, explanation: "Soit on imbrique, soit on référence et on fait un $lookup." },
          { id: 8, question: "Sharding =", options: ["Réplication", "Partitionnement horizontal", "Indexation", "Compression"], correct: 1, explanation: "Le sharding répartit les documents sur plusieurs serveurs." },
          { id: 9, question: "Le routeur d'un sharded cluster s'appelle :", options: ["mongod", "mongos", "mongoshard", "mongor"], correct: 1, explanation: "mongos route les requêtes vers le bon shard." },
          { id: 10, question: "Le config server stocke :", options: ["Les données utilisateur", "Les métadonnées du cluster", "Les logs", "Les sauvegardes"], correct: 1, explanation: "Il sait où sont les chunks de données." },
          { id: 11, question: "Replica Set =", options: ["Partitionnement", "Cache", "Plusieurs copies des données pour HA", "Backup hebdomadaire"], correct: 2, explanation: "Réplication synchrone Primary + Secondaries → haute disponibilité." },
          { id: 12, question: "Dans un replica set, les écritures vont sur :", options: ["Tous les nœuds", "Le Primary", "Un Secondary", "Le config server"], correct: 1, explanation: "Seul le Primary accepte les écritures par défaut." },
          { id: 13, question: "Imbriquer plutôt que référencer quand :", options: ["Relation 1..beaucoup", "Relation 1..1 ou 1..peu lue ensemble", "Relation n..n", "Toujours"], correct: 1, explanation: "Imbriquer = lecture en 1 requête, parfait pour 1..1." },
          { id: 14, question: "Référencer plutôt qu'imbriquer quand :", options: ["1..1", "Données lues séparément ou n..n", "Petit volume", "Toujours"], correct: 1, explanation: "Référencer évite la duplication massive et les documents > 16 Mo." },
          { id: 15, question: "Taille max d'un document BSON :", options: ["1 Mo", "16 Mo", "1 Go", "Illimitée"], correct: 1, explanation: "Limite dure de 16 Mo par document." },
          { id: 16, question: "Sélectionner la base 'mabd' :", options: ["select mabd", "use mabd", "db mabd", "open mabd"], correct: 1, explanation: "Dans le shell : use <name>." },
          { id: 17, question: "Lister les collections :", options: ["show tables", "list collections", "show collections", "db.collections()"], correct: 2, explanation: "show collections (ou db.getCollectionNames())." },
          { id: 18, question: "Supprimer la base courante :", options: ["drop database", "db.drop()", "db.dropDatabase()", "delete db"], correct: 2, explanation: "db.dropDatabase()." },
          { id: 19, question: "Une bonne shard key doit être :", options: ["À très faible cardinalité", "À haute cardinalité et distribution uniforme", "Toujours croissante", "Le _id obligatoirement"], correct: 1, explanation: "Évite les hotspots — répartition uniforme du trafic." },
          { id: 20, question: "Avantage clé du scale-out MongoDB :", options: ["Schéma fixe", "Coût matériel ~ linéaire avec le volume", "Garantie ACID stricte sur tout le cluster", "Pas besoin d'index"], correct: 1, explanation: "Ajouter une machine = ajouter de la capacité, à coût raisonnable." },
        ]}
      />
    </article>
  </PageLayout>
);

export default NoSQLMongo;
