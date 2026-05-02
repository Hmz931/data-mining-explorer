import { PageLayout } from "@/components/PageLayout";
import { NoSQLHero } from "@/components/NoSQLHero";
import { Notebook, NbMarkdown, NbCode, NbOutput } from "@/components/notebook/Notebook";
import { Callout } from "@/components/Callout";
import { QCM } from "@/components/QCM";

const StageRow = ({ s, d, e }: { s: string; d: string; e: string }) => (
  <tr className="border-b border-border/60">
    <td className="py-2 px-3 font-mono text-xs text-fuchsia-400">{s}</td>
    <td className="py-2 px-3 text-sm">{d}</td>
    <td className="py-2 px-3 font-mono text-[11px] text-muted-foreground">{e}</td>
  </tr>
);

const Stage = ({ name, body }: { name: string; body: string }) => (
  <div className="px-3 py-2 rounded border border-fuchsia-400/40 bg-fuchsia-400/5 font-mono text-[11px] text-center">
    <div className="text-fuchsia-400 font-semibold">{name}</div>
    <div className="text-muted-foreground mt-1 whitespace-pre-line">{body}</div>
  </div>
);

const NoSQLAgg = () => (
  <PageLayout>
    <NoSQLHero
      code="CH.4"
      tag="Pipeline d'agrégation"
      title="aggregate() — le pipeline qui remplace GROUP BY."
      subtitle="$match, $group, $project, $sort, $unwind, $lookup, $out — composables à volonté."
    />

    <article className="container py-10 sm:py-14 max-w-4xl">
      <h2 className="font-serif text-2xl font-semibold text-primary mb-4">
        1 · Le concept de pipeline
      </h2>
      <p className="text-foreground/80 leading-relaxed mb-4">
        L'agrégation MongoDB est un <strong>pipeline</strong> : les documents traversent une série de
        <strong> stages</strong>, chacun transformant la sortie du précédent. Le résultat final
        sort à la dernière étape.
      </p>

      <div className="my-6 rounded-lg border border-border bg-card p-5 overflow-x-auto">
        <div className="flex items-center justify-center gap-3 min-w-[600px]">
          <div className="px-3 py-2 rounded bg-secondary font-mono text-xs">orders</div>
          <span className="text-muted-foreground">→</span>
          <Stage name="$match" body="status: 'A'" />
          <span className="text-muted-foreground">→</span>
          <Stage name="$group" body="par cust_id\nsum(amount)" />
          <span className="text-muted-foreground">→</span>
          <div className="px-3 py-2 rounded bg-accent/15 border border-accent/40 font-mono text-xs">
            résultat
          </div>
        </div>
      </div>

      <Notebook kernel="MongoDB Shell · 5.0">
        <NbMarkdown title="Exemple complet (cf. cours)">
          <p>Sommer le montant des commandes validées par client.</p>
        </NbMarkdown>
        <NbCode language="js" code={`db.orders.insertMany([
  { cust_id: "A123", amount: 500, status: "A" },
  { cust_id: "A123", amount: 250, status: "A" },
  { cust_id: "B212", amount: 200, status: "A" },
  { cust_id: "A123", amount: 300, status: "D" }
])

db.orders.aggregate([
  { $match: { status: "A" } },
  { $group: { _id: "$cust_id", total: { $sum: "$amount" } } }
])`} />
        <NbOutput kind="result">{`{ "_id" : "A123", "total" : 750 }
{ "_id" : "B212", "total" : 200 }`}</NbOutput>
      </Notebook>

      {/* Stages */}
      <h2 className="font-serif text-2xl font-semibold text-primary mt-12 mb-4">
        2 · Les stages essentiels
      </h2>
      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface/60">
            <tr>
              <th className="text-left py-2 px-3 font-mono text-xs">Stage</th>
              <th className="text-left py-2 px-3 font-mono text-xs">Rôle</th>
              <th className="text-left py-2 px-3 font-mono text-xs">SQL équivalent</th>
            </tr>
          </thead>
          <tbody>
            <StageRow s="$match" d="Filtrer les documents (WHERE)" e="WHERE" />
            <StageRow s="$project" d="Choisir / calculer des champs" e="SELECT champs" />
            <StageRow s="$group" d="Regrouper et agréger" e="GROUP BY" />
            <StageRow s="$sort" d="Trier" e="ORDER BY" />
            <StageRow s="$limit" d="Garder n premiers" e="LIMIT n" />
            <StageRow s="$skip" d="Ignorer n premiers" e="OFFSET n" />
            <StageRow s="$unwind" d="Dérouler un tableau" e="UNNEST (array → lignes)" />
            <StageRow s="$lookup" d="Joindre une autre collection" e="LEFT JOIN" />
            <StageRow s="$out" d="Écrire le résultat dans une collection" e="CREATE TABLE AS" />
          </tbody>
        </table>
      </div>

      {/* $group — by example */}
      <h2 className="font-serif text-2xl font-semibold text-primary mt-12 mb-4">
        3 · $group — équivalents SQL
      </h2>
      <Notebook kernel="MongoDB Shell · 5.0">
        <NbMarkdown title="Compter les livres par auteur">
          <p>SQL : <code>SELECT author, COUNT(*) FROM livres GROUP BY author</code></p>
        </NbMarkdown>
        <NbCode language="js" code={`db.livres.aggregate([
  { $group: { _id: "$author", nbr_livre: { $sum: 1 } } }
])`} />
        <NbOutput kind="result">{`{ "_id" : "Gosciny", "nbr_livre" : 24 }
{ "_id" : "Bruchez",  "nbr_livre" :  3 }
{ "_id" : "Hugo",     "nbr_livre" :  7 }`}</NbOutput>

        <NbMarkdown title="Somme et moyenne">
          <p>SQL : <code>SELECT author, SUM(likes), AVG(likes) FROM livres GROUP BY author</code></p>
        </NbMarkdown>
        <NbCode language="js" code={`db.livres.aggregate([
  { $group: {
      _id: "$author",
      total_likes: { $sum: "$likes" },
      moy_likes:   { $avg: "$likes" },
      max_likes:   { $max: "$likes" },
      min_likes:   { $min: "$likes" }
  } }
])`} />
        <NbOutput kind="result">{`{ "_id" : "Gosciny", "total_likes" : 12450, "moy_likes" : 518.7,
  "max_likes" : 1200, "min_likes" : 80 }`}</NbOutput>

        <NbMarkdown title="Group composé : auteur + année" />
        <NbCode language="js" code={`db.livres.aggregate([
  { $group: {
      _id: { auteur: "$author", annee: { $year: "$date_pub" } },
      nbr_livre: { $sum: 1 }
  } },
  { $sort: { "_id.annee": -1 } }
])`} />
        <NbOutput kind="result">{`{ "_id" : { "auteur" : "Gosciny", "annee" : 2018 }, "nbr_livre" : 3 }
{ "_id" : { "auteur" : "Hugo",    "annee" : 2017 }, "nbr_livre" : 1 }`}</NbOutput>
      </Notebook>

      {/* $project tricks */}
      <h2 className="font-serif text-2xl font-semibold text-primary mt-12 mb-4">
        4 · $project — fonctions utiles
      </h2>
      <Notebook kernel="MongoDB Shell · 5.0">
        <NbMarkdown title="Strings, numbers, arrays, dates" />
        <NbCode language="js" code={`db.livres.aggregate([{ $project: {
  _id: 0,
  auteur:  { $toUpper: "$author" },
  titre:   1,
  ttl_len: { $strLenBytes: "$title" },
  prix2:   { $add: ["$price", 3] },
  prix_arr:{ $ceil: "$price" },
  premier_tag: { $arrayElemAt: ["$tags", 0] },
  tags_n:  { $size: "$tags" },
  annee:   { $year: "$date_pub" },
  mois:    { $month: "$date_pub" }
} }])`} />
        <NbOutput kind="result">{`{ "auteur":"GOSCINY","titre":"Astérix...","ttl_len":24,
  "prix2":18.99,"prix_arr":16,"premier_tag":"BD","tags_n":3,
  "annee":1965,"mois":7 }`}</NbOutput>
      </Notebook>

      {/* $unwind + $lookup */}
      <h2 className="font-serif text-2xl font-semibold text-primary mt-12 mb-4">
        5 · $unwind et $lookup
      </h2>
      <Notebook kernel="MongoDB Shell · 5.0">
        <NbMarkdown title="$unwind : 1 doc avec [a,b,c] → 3 docs (a),(b),(c)" />
        <NbCode language="js" code={`db.livres.aggregate([
  { $unwind: "$tags" },
  { $group: { _id: "$tags", n: { $sum: 1 } } },
  { $sort:  { n: -1 } }
])`} />
        <NbOutput kind="result">{`{ "_id" : "roman",  "n" : 14 }
{ "_id" : "BD",     "n" :  9 }
{ "_id" : "thriller","n" :  4 }`}</NbOutput>

        <NbMarkdown title="$lookup : équivalent LEFT JOIN" />
        <NbCode language="js" code={`db.conference.insert({
  title: "Refonte SI",
  speaker_id: "techno_maniac"
})
db.speaker.insert({
  _id: "techno_maniac",
  name: "Jean-Marcel", email: "jm@web2day.org"
})

db.conference.aggregate([{
  $lookup: {
    from: "speaker",
    localField:  "speaker_id",
    foreignField:"_id",
    as: "speaker_infos"
  }
}])`} />
        <NbOutput kind="result">{`{ "_id" : ObjectId("..."),
  "title" : "Refonte SI",
  "speaker_id" : "techno_maniac",
  "speaker_infos" : [
    { "_id" : "techno_maniac", "name" : "Jean-Marcel",
      "email" : "jm@web2day.org" }
  ]
}`}</NbOutput>

        <NbMarkdown title="$out : sauvegarder le résultat" />
        <NbCode language="js" code={`db.livres.aggregate([
  { $unwind: "$tags" },
  { $group: { _id: "$_id", nb_tags: { $sum: 1 } } },
  { $out: "results" }
])

db.results.find().limit(3)`} />
        <NbOutput kind="result">{`{ "_id" : ObjectId("..."), "nb_tags" : 3 }
{ "_id" : ObjectId("..."), "nb_tags" : 2 }
{ "_id" : ObjectId("..."), "nb_tags" : 5 }`}</NbOutput>
      </Notebook>

      <Callout variant="intuition" title="Recette mentale">
        <ol className="list-decimal pl-5 space-y-1">
          <li><strong>$match en premier</strong> (réduit le volume très tôt → utilise un index).</li>
          <li>Puis <strong>$project / $unwind</strong> pour préparer les données.</li>
          <li>Puis <strong>$group</strong> pour les agrégats.</li>
          <li>Enfin <strong>$sort / $limit</strong> et éventuellement <strong>$out</strong>.</li>
        </ol>
      </Callout>

      <QCM
        title="Testez vos connaissances — Agrégation"
        questions={[
          { id: 1, question: "L'agrégation MongoDB se fait via :", options: ["db.col.groupBy()", "db.col.aggregate([...])", "db.col.find().group()", "SELECT … GROUP BY"], correct: 1, explanation: "aggregate() reçoit un tableau de stages." },
          { id: 2, question: "Un stage est :", options: ["Une collection", "Un document opérateur dans le pipeline", "Une transaction", "Un index"], correct: 1, explanation: "Chaque stage = { $opérateur: { … } }." },
          { id: 3, question: "Équivalent SQL de $match :", options: ["SELECT", "WHERE", "GROUP BY", "ORDER BY"], correct: 1, explanation: "$match filtre les documents." },
          { id: 4, question: "Équivalent SQL de $group :", options: ["WHERE", "GROUP BY", "JOIN", "LIMIT"], correct: 1, explanation: "$group regroupe et agrège." },
          { id: 5, question: "Équivalent SQL de $project :", options: ["SELECT champs", "WHERE", "ORDER BY", "DELETE"], correct: 0, explanation: "$project sélectionne / calcule des champs." },
          { id: 6, question: "Équivalent SQL de $sort :", options: ["WHERE", "GROUP BY", "ORDER BY", "HAVING"], correct: 2, explanation: "$sort ordonne." },
          { id: 7, question: "Équivalent SQL de $lookup :", options: ["INNER JOIN", "LEFT JOIN", "UNION", "INTERSECT"], correct: 1, explanation: "$lookup ramène les documents liés (left outer join)." },
          { id: 8, question: "$unwind sur tags=[a,b,c] produit :", options: ["1 document", "3 documents (un par tag)", "Une chaîne 'a,b,c'", "Un tableau aplati"], correct: 1, explanation: "Un document de sortie par élément du tableau." },
          { id: 9, question: "Pour compter par groupe :", options: ["{$count: 1}", "{$sum: 1}", "{$inc: 1}", "{$add: 1}"], correct: 1, explanation: "Dans $group : { $sum: 1 } compte les documents." },
          { id: 10, question: "Pour la moyenne d'un champ :", options: ["$mean", "$average", "$avg", "$median"], correct: 2, explanation: "$avg dans un $group." },
          { id: 11, question: "Pour le maximum :", options: ["$top", "$max", "$highest", "$last"], correct: 1, explanation: "$max retourne le maximum." },
          { id: 12, question: "$first / $last se combinent généralement avec :", options: ["$sort", "$match", "$out", "$lookup"], correct: 0, explanation: "Sans $sort préalable, l'ordre est indéfini." },
          { id: 13, question: "Différence $push vs $addToSet :", options: ["Aucune", "$push autorise les doublons, $addToSet non", "$addToSet est plus rapide", "$push trie"], correct: 1, explanation: "$addToSet = ensemble (pas de doublons)." },
          { id: 14, question: "Quel stage doit être en dernier obligatoirement :", options: ["$match", "$out", "$sort", "$project"], correct: 1, explanation: "$out écrit le résultat dans une collection — c'est terminal." },
          { id: 15, question: "Pour optimiser, $match doit être placé :", options: ["À la fin", "Le plus tôt possible", "Au milieu", "N'importe où, c'est pareil"], correct: 1, explanation: "Plus tôt = moins de docs à traiter ensuite, et utilisation possible d'un index." },
          { id: 16, question: "$year(date) extrait :", options: ["L'année", "Le mois", "Le jour", "Le timestamp"], correct: 0, explanation: "Opérateur de date, retourne l'année." },
          { id: 17, question: "$strLenBytes('Hello') vaut :", options: ["4", "5", "6", "Erreur"], correct: 1, explanation: "Longueur en octets." },
          { id: 18, question: "$arrayElemAt(['a','b','c'], 0) vaut :", options: ["'a'", "'b'", "'c'", "['a']"], correct: 0, explanation: "Indice 0 = premier élément." },
          { id: 19, question: "$size(['a','b','c']) vaut :", options: ["1", "2", "3", "0"], correct: 2, explanation: "Nombre d'éléments du tableau." },
          { id: 20, question: "Un pipeline réécrivant SELECT cust, COUNT(*) FROM orders WHERE status='A' GROUP BY cust commence par :", options: ["$group puis $match", "$match puis $group", "$project puis $sort", "$lookup puis $group"], correct: 1, explanation: "$match filtre d'abord, $group agrège ensuite." },
        ]}
      />
    </article>
  </PageLayout>
);

export default NoSQLAgg;
