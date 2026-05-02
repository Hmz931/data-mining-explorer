import { PageLayout } from "@/components/PageLayout";
import { NoSQLHero } from "@/components/NoSQLHero";
import { Notebook, NbMarkdown, NbCode, NbOutput, NbRich } from "@/components/notebook/Notebook";
import { Callout } from "@/components/Callout";
import { QCM } from "@/components/QCM";
import { Database, Cloud, Zap, Network as NetIcon } from "lucide-react";

const Stat = ({ k, v, sub }: { k: string; v: string; sub?: string }) => (
  <div className="p-4 rounded-lg border border-border bg-card text-center">
    <div className="font-serif text-3xl font-semibold text-accent">{v}</div>
    <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground mt-1">{k}</div>
    {sub && <div className="text-[11px] text-muted-foreground/70 mt-1">{sub}</div>}
  </div>
);

const FamilyCard = ({
  name,
  Icon,
  ex,
  desc,
  use,
}: {
  name: string;
  Icon: typeof Database;
  ex: string;
  desc: string;
  use: string;
}) => (
  <div className="p-5 rounded-lg border border-border bg-card hover:border-accent/40 transition">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded bg-secondary text-primary flex items-center justify-center">
        <Icon className="w-4 h-4" />
      </div>
      <div className="font-serif font-semibold text-primary">{name}</div>
    </div>
    <p className="text-sm text-foreground/80 leading-relaxed mb-3">{desc}</p>
    <div className="text-[11px] font-mono text-muted-foreground">
      <span className="text-accent">ex.</span> {ex}
    </div>
    <div className="text-[11px] font-mono text-muted-foreground mt-1">
      <span className="text-accent">use.</span> {use}
    </div>
  </div>
);

const NoSQLIntro = () => (
  <PageLayout>
    <NoSQLHero
      code="CH.1"
      tag="Introduction NoSQL"
      title="Big Data, CAP, et les 4 familles NoSQL."
      subtitle="Pourquoi le relationnel ne suffit plus, et comment NoSQL répond aux 3V du Big Data."
    />

    <article className="container py-10 sm:py-14 max-w-4xl">
      {/* Big Bang du Big Data */}
      <h2 className="font-serif text-2xl font-semibold text-primary mb-4">1 · Le Big Bang du Big Data</h2>
      <div className="grid sm:grid-cols-4 gap-3 my-6">
        <Stat k="2010" v="2 Zo" />
        <Stat k="2015" v="16 Zo" />
        <Stat k="2020" v="64 Zo" />
        <Stat k="2025*" v="181 Zo" sub="prévision" />
      </div>
      <p className="text-foreground/80 leading-relaxed">
        Le volume mondial est passé de <strong>2 Zo</strong> en 2010 à <strong>64 Zo</strong> en 2020 (×30).
        Moteurs : objets connectés (IoT) et 5G. 1 Zo = 1 milliard de To.
      </p>

      <Callout variant="info" title="Pourquoi ça change tout">
        Le SQL traditionnel a été pensé pour quelques To structurés. Le Big Data,
        c'est <strong>volume + variété + vitesse</strong> (les 3V) — d'où NoSQL.
      </Callout>

      {/* 3V */}
      <h2 className="font-serif text-2xl font-semibold text-primary mt-12 mb-4">2 · Les 3 V du Big Data</h2>
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { k: "Volume", v: "Téra → Zetta-octets", c: "Stockage distribué nécessaire." },
          { k: "Variété", v: "Structuré + semi/non", c: "JSON, images, logs, vidéos…" },
          { k: "Vélocité", v: "Temps réel", c: "Streams, capteurs, IoT, clics." },
        ].map((x) => (
          <div key={x.k} className="p-5 rounded-lg border border-border bg-card">
            <div className="font-serif text-lg font-semibold text-accent mb-1">{x.k}</div>
            <div className="font-mono text-[12px] text-muted-foreground mb-2">{x.v}</div>
            <p className="text-sm text-foreground/80">{x.c}</p>
          </div>
        ))}
      </div>

      {/* NoSQL definition */}
      <h2 className="font-serif text-2xl font-semibold text-primary mt-12 mb-4">3 · NoSQL = Not Only SQL</h2>
      <ul className="list-disc pl-6 text-foreground/85 space-y-1.5">
        <li>Modèle de données <strong>sans schéma fixe</strong> (schema-free)</li>
        <li>Architecture <strong>distribuée</strong>, scalabilité <strong>horizontale</strong> (scale-out)</li>
        <li>Compromis <strong>cohérence ↔ disponibilité</strong> (théorème CAP)</li>
        <li>Performances en lecture/écriture sur volumes massifs</li>
      </ul>

      {/* 4 families */}
      <h2 className="font-serif text-2xl font-semibold text-primary mt-12 mb-4">4 · Les 4 familles NoSQL</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <FamilyCard
          name="Clé / Valeur"
          Icon={Zap}
          ex="Redis, Riak, DynamoDB, Memcached"
          desc="Tableau de hachage géant. Get(key), Put(key,value), Delete(key)."
          use="Cache, sessions, panier d'achat."
        />
        <FamilyCard
          name="Orientée Document"
          Icon={Database}
          ex="MongoDB, CouchDB, RavenDB"
          desc="Documents JSON/BSON imbriqués. Schéma flexible, requêtes riches."
          use="Catalogues, profils, contenus."
        />
        <FamilyCard
          name="Orientée Colonnes"
          Icon={Cloud}
          ex="HBase, Cassandra, BigTable"
          desc="Lignes avec colonnes dynamiques regroupées en familles."
          use="Time-series, logs massifs, analytics."
        />
        <FamilyCard
          name="Orientée Graphes"
          Icon={NetIcon}
          ex="Neo4j, OrientDB, InfiniteGraph"
          desc="Nœuds + relations. Optimisé pour parcours et plus courts chemins."
          use="Réseaux sociaux, recommandation, fraude."
        />
      </div>

      {/* Theorem CAP */}
      <h2 className="font-serif text-2xl font-semibold text-primary mt-12 mb-4">5 · Théorème CAP</h2>
      <p className="text-foreground/80 leading-relaxed">
        Un système distribué ne peut garantir simultanément que <strong>2 sur 3</strong> :
      </p>
      <div className="grid sm:grid-cols-3 gap-3 my-5">
        <div className="p-4 rounded-lg border-2 border-accent/40 bg-card text-center">
          <div className="font-serif text-xl text-primary">C</div>
          <div className="text-xs text-muted-foreground">Consistency</div>
          <p className="text-[12px] text-foreground/75 mt-2">Tous les nœuds voient la même donnée.</p>
        </div>
        <div className="p-4 rounded-lg border-2 border-accent/40 bg-card text-center">
          <div className="font-serif text-xl text-primary">A</div>
          <div className="text-xs text-muted-foreground">Availability</div>
          <p className="text-[12px] text-foreground/75 mt-2">Chaque requête reçoit une réponse.</p>
        </div>
        <div className="p-4 rounded-lg border-2 border-accent/40 bg-card text-center">
          <div className="font-serif text-xl text-primary">P</div>
          <div className="text-xs text-muted-foreground">Partition tolerance</div>
          <p className="text-[12px] text-foreground/75 mt-2">Survie aux pannes réseau.</p>
        </div>
      </div>
      <Callout variant="warning" title="Choix typiques">
        <strong>SQL</strong> = CA · <strong>MongoDB</strong> = CP · <strong>Cassandra</strong> = AP.
        En distribué, P est non-négociable → on choisit entre C et A.
      </Callout>

      {/* ACID vs BASE */}
      <h2 className="font-serif text-2xl font-semibold text-primary mt-12 mb-4">6 · ACID vs BASE</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-lg border border-border bg-card">
          <div className="font-mono text-xs text-accent mb-2">ACID — relationnel</div>
          <ul className="text-sm text-foreground/85 space-y-1">
            <li><strong>A</strong>tomicité — tout ou rien</li>
            <li><strong>C</strong>ohérence — contraintes respectées</li>
            <li><strong>I</strong>solation — transactions parallèles</li>
            <li><strong>D</strong>urabilité — données persistées</li>
          </ul>
        </div>
        <div className="p-5 rounded-lg border border-border bg-card">
          <div className="font-mono text-xs text-accent mb-2">BASE — NoSQL</div>
          <ul className="text-sm text-foreground/85 space-y-1">
            <li><strong>B</strong>asically <strong>A</strong>vailable</li>
            <li><strong>S</strong>oft state — état évolutif</li>
            <li><strong>E</strong>ventually consistent — cohérence à terme</li>
          </ul>
        </div>
      </div>

      {/* Scale */}
      <h2 className="font-serif text-2xl font-semibold text-primary mt-12 mb-4">7 · Scale-up vs Scale-out</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-lg border border-border bg-card">
          <div className="font-serif text-lg text-primary mb-2">Scale-up (vertical)</div>
          <p className="text-sm text-foreground/80">
            Ajouter plus de RAM/CPU à <strong>un</strong> serveur. Coût exponentiel, plafond matériel.
          </p>
        </div>
        <div className="p-5 rounded-lg border-2 border-accent/40 bg-card">
          <div className="font-serif text-lg text-accent mb-2">Scale-out (horizontal)</div>
          <p className="text-sm text-foreground/80">
            Ajouter <strong>plusieurs</strong> machines bon marché. Coût linéaire, quasi-illimité.
            <br />→ <strong>la voie NoSQL</strong>.
          </p>
        </div>
      </div>

      {/* Mini démo notebook */}
      <h2 className="font-serif text-2xl font-semibold text-primary mt-12 mb-4">
        8 · Aperçu du shell MongoDB
      </h2>
      <Notebook kernel="MongoDB Shell · 5.0">
        <NbMarkdown title="Premier contact">
          <p>On démarre le serveur, on se connecte, on liste les bases.</p>
        </NbMarkdown>
        <NbCode language="js" code={`// Démarrage du serveur (terminal 1)
mongod

// Connexion (terminal 2)
mongo

// Voir la base courante
db
// Lister les bases
show dbs
// Choisir / créer une base
use mabd`} />
        <NbOutput kind="result">{`test
admin   0.000GB
config  0.000GB
local   0.000GB
switched to db mabd`}</NbOutput>
      </Notebook>

      {/* QCM */}
      <QCM
        title="Testez vos connaissances — Introduction NoSQL"
        questions={[
          { id: 1, question: "Que signifie NoSQL ?", options: ["No SQL — plus jamais de SQL", "Not Only SQL", "New Object SQL", "Network SQL"], correct: 1, explanation: "NoSQL = « Not Only SQL ». Coexiste avec le relationnel selon le besoin." },
          { id: 2, question: "Les 3V du Big Data sont :", options: ["Vue, Variable, Validité", "Volume, Variété, Vélocité", "Vitesse, Verbe, Vérité", "Volume, Vente, Vidéo"], correct: 1, explanation: "Volume (taille), Variété (structuré + non structuré), Vélocité (temps réel)." },
          { id: 3, question: "Une base orientée document stocke :", options: ["Des colonnes par ligne", "Des fichiers PDF", "Des documents JSON/BSON", "Des nœuds + arêtes"], correct: 2, explanation: "Documents JSON imbriqués → MongoDB, CouchDB." },
          { id: 4, question: "Théorème CAP : on ne peut garantir au mieux que :", options: ["Les 3 propriétés", "2 sur 3", "1 seule", "C et P seulement"], correct: 1, explanation: "Au mieux 2 sur 3 (Consistency, Availability, Partition tolerance)." },
          { id: 5, question: "MongoDB se positionne sur :", options: ["CA", "CP", "AP", "Aucune"], correct: 1, explanation: "MongoDB privilégie cohérence (C) et tolérance au partitionnement (P)." },
          { id: 6, question: "Cassandra se positionne sur :", options: ["CA", "CP", "AP", "C seul"], correct: 2, explanation: "Cassandra = AP — disponibilité maximale, cohérence éventuelle." },
          { id: 7, question: "ACID c'est pour :", options: ["NoSQL", "Relationnel", "Les deux", "Aucun"], correct: 1, explanation: "ACID est la garantie transactionnelle classique des SGBDR." },
          { id: 8, question: "BASE signifie :", options: ["Basic ACID Scaled Edition", "Basically Available, Soft state, Eventually consistent", "Binary Asynchronous Storage Engine", "Big Atomic State Engine"], correct: 1, explanation: "B-A-S-E : modèle relâché, cohérence à terme typique de NoSQL." },
          { id: 9, question: "Scalabilité horizontale = ", options: ["Plus de RAM sur 1 machine", "Ajouter des machines au cluster", "Réduire le schéma", "Indexer plus"], correct: 1, explanation: "Scale-out = on ajoute des nœuds bon marché." },
          { id: 10, question: "Famille NoSQL adaptée au cache de session :", options: ["Document", "Graphe", "Clé/Valeur", "Colonne"], correct: 2, explanation: "Clé/Valeur (Redis) : accès ultra-rapide par clé." },
          { id: 11, question: "Famille adaptée à un réseau social (amis d'amis) :", options: ["Clé/Valeur", "Document", "Colonne", "Graphe"], correct: 3, explanation: "Graphe (Neo4j) : parcours de relations efficace." },
          { id: 12, question: "Famille adaptée à des time-series massives :", options: ["Document", "Colonne", "Graphe", "Clé/Valeur"], correct: 1, explanation: "Cassandra/HBase — orientées colonnes, parfaites pour les logs." },
          { id: 13, question: "Quel SGBD est orienté document ?", options: ["Redis", "Neo4j", "MongoDB", "Cassandra"], correct: 2, explanation: "MongoDB stocke des documents BSON." },
          { id: 14, question: "Atome de stockage MongoDB =", options: ["Ligne", "Tuple", "Document", "Colonne"], correct: 2, explanation: "MongoDB manipule des documents BSON, pas des lignes." },
          { id: 15, question: "Cohérence éventuelle (eventual consistency) :", options: ["Toutes les répliques sont à jour immédiatement", "Les répliques convergent à terme", "Le système n'est jamais cohérent", "Cohérence garantie par cadenas"], correct: 1, explanation: "Les nœuds convergent vers la même valeur au bout d'un certain temps." },
          { id: 16, question: "Caractéristique commune des bases NoSQL :", options: ["Schéma rigide", "Transactions ACID strictes", "Distribuée et scale-out", "Une seule machine"], correct: 2, explanation: "Conçues pour la distribution horizontale." },
          { id: 17, question: "Pourquoi pas tout-NoSQL ?", options: ["NoSQL est trop lent", "Le relationnel reste meilleur quand le schéma est stable et qu'on a besoin de jointures et de transactions ACID strictes", "NoSQL est gratuit", "Aucune raison"], correct: 1, explanation: "Le relationnel reste roi pour les transactions financières et schémas stables." },
          { id: 18, question: "BSON =", options: ["Big Standard Object Notation", "Binary JSON", "Boolean Standard Object", "Block Storage Object Notation"], correct: 1, explanation: "BSON = représentation binaire sérialisée d'un document JSON." },
          { id: 19, question: "Avantage du schéma flexible :", options: ["Plus rapide qu'un schéma fixe", "Pas besoin d'ALTER TABLE pour ajouter un champ", "Empêche les erreurs", "Force la normalisation"], correct: 1, explanation: "On peut ajouter des champs à la volée, document par document." },
          { id: 20, question: "Inconvénient du schéma flexible :", options: ["Aucun — c'est parfait", "Cohérence applicative à la charge du développeur", "Empêche l'indexation", "Doublé en taille"], correct: 1, explanation: "Sans contrainte au niveau base, c'est l'application qui doit valider." },
        ]}
      />
    </article>
  </PageLayout>
);

export default NoSQLIntro;
