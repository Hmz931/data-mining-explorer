import { PageLayout } from "@/components/PageLayout";
import { NoSQLHero } from "@/components/NoSQLHero";
import { Notebook, NbMarkdown, NbCode, NbOutput } from "@/components/notebook/Notebook";
import { Callout } from "@/components/Callout";
import { QCM } from "@/components/QCM";

const Op = ({ k, v, ex }: { k: string; v: string; ex: string }) => (
  <tr className="border-b border-border/60">
    <td className="py-2 px-3 font-mono text-xs text-accent">{k}</td>
    <td className="py-2 px-3 text-sm">{v}</td>
    <td className="py-2 px-3 font-mono text-[11px] text-muted-foreground">{ex}</td>
  </tr>
);

const NoSQLCrud = () => (
  <PageLayout>
    <NoSQLHero
      code="CH.3"
      tag="CRUD MongoDB"
      title="Create · Read · Update · Delete."
      subtitle="Tout commence par insert / find / update / remove. Avec opérateurs et projections."
    />

    <article className="container py-10 sm:py-14 max-w-4xl">
      <h2 className="font-serif text-2xl font-semibold text-primary mb-4">1 · Les 4 commandes essentielles</h2>
      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface/60">
            <tr>
              <th className="text-left py-2 px-3 font-mono text-xs">Op</th>
              <th className="text-left py-2 px-3 font-mono text-xs">Méthode</th>
              <th className="text-left py-2 px-3 font-mono text-xs">SQL équivalent</th>
            </tr>
          </thead>
          <tbody>
            <Op k="C" v="db.col.insert(doc)" ex="INSERT INTO" />
            <Op k="R" v="db.col.find(query, projection)" ex="SELECT … WHERE" />
            <Op k="U" v="db.col.update(query, update, opts)" ex="UPDATE … SET" />
            <Op k="D" v="db.col.remove(query)" ex="DELETE FROM" />
          </tbody>
        </table>
      </div>

      {/* Notebook démo */}
      <h2 className="font-serif text-2xl font-semibold text-primary mt-12 mb-4">
        2 · Démo complète — collection <code>people</code>
      </h2>
      <Notebook kernel="MongoDB Shell · 5.0">
        <NbMarkdown title="Insert — un document" />
        <NbCode language="js" code={`db.people.insert({ nom: "smith", age: 30, profession: "ingenieur" })`} />
        <NbOutput kind="result">{`WriteResult({ "nInserted" : 1 })`}</NbOutput>

        <NbMarkdown title="Find — tout afficher" />
        <NbCode language="js" code={`db.people.find()`} />
        <NbOutput kind="result">{`{ "_id" : ObjectId("5444f7e49f88b7a61cd8d8b2"),
  "nom" : "smith", "age" : 30, "profession" : "ingenieur" }`}</NbOutput>

        <NbMarkdown title="Insert — un 2ᵉ document">
          <p>Notez le champ <code>_id</code> auto-généré.</p>
        </NbMarkdown>
        <NbCode language="js" code={`db.people.insert({ nom: "Jean", age: 38, profession: "medecin" })
db.people.insert({ nom: "Mona", age: 27, profession: "data analyst" })`} />
        <NbOutput kind="result">{`WriteResult({ "nInserted" : 1 })
WriteResult({ "nInserted" : 1 })`}</NbOutput>

        <NbMarkdown title="Find avec critère + projection" />
        <NbCode language="js" code={`// 1er argument = WHERE,  2e = SELECT (1=montrer, 0=cacher)
db.people.find({ nom: "smith" }, { nom: true, age: true })`} />
        <NbOutput kind="result">{`{ "_id" : ObjectId("5444f7e49f88b7a61cd8d8b2"),
  "nom" : "smith", "age" : 30 }`}</NbOutput>

        <NbMarkdown title="findOne — un seul résultat, joli formatage" />
        <NbCode language="js" code={`db.people.findOne({ nom: "Jean" })
db.people.find().pretty()`} />
        <NbOutput kind="result">{`{
  "_id" : ObjectId("5444f8b29f88b7a61cd8d8b3"),
  "nom" : "Jean",
  "age" : 38,
  "profession" : "medecin"
}`}</NbOutput>
      </Notebook>

      {/* Operators */}
      <h2 className="font-serif text-2xl font-semibold text-primary mt-12 mb-4">
        3 · Opérateurs de requête
      </h2>
      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface/60">
            <tr>
              <th className="text-left py-2 px-3 font-mono text-xs">Opérateur</th>
              <th className="text-left py-2 px-3 font-mono text-xs">Sens</th>
              <th className="text-left py-2 px-3 font-mono text-xs">Exemple</th>
            </tr>
          </thead>
          <tbody>
            <Op k="$gt / $gte" v="strictement > / ≥" ex='{ age: { $gt: 30 } }' />
            <Op k="$lt / $lte" v="strictement < / ≤" ex='{ age: { $lte: 25 } }' />
            <Op k="$ne" v="différent de" ex='{ nom: { $ne: "smith" } }' />
            <Op k="$in" v="dans la liste" ex='{ nom: { $in: ["smith","Bob"] } }' />
            <Op k="$nin" v="hors liste" ex='{ age: { $nin: [25,30] } }' />
            <Op k="$exists" v="champ présent" ex='{ age: { $exists: true } }' />
            <Op k="$regex" v="expression régulière" ex='{ nom: { $regex: "^s" } }' />
            <Op k="$and / $or" v="combiner clauses" ex='{ $or: [{age:{$gt:30}}, {nom:"Jean"}] }' />
            <Op k="$all" v="tous les éléments d'un array" ex='{ favs: { $all: ["sport","musique"] } }' />
          </tbody>
        </table>
      </div>

      <Notebook kernel="MongoDB Shell · 5.0">
        <NbMarkdown title="Filtrer avec $gt / $in / $regex" />
        <NbCode language="js" code={`// Personnes de plus de 30 ans
db.people.find({ age: { $gt: 30 } })

// Nom Smith ou Bob
db.people.find({ nom: { $in: ["smith", "Bob"] } })

// Nom commençant par 's'
db.people.find({ nom: { $regex: "^s" } })

// Compter
db.people.find({ age: { $gte: 30 } }).count()

// Limiter et trier
db.people.find().sort({ age: -1 }).limit(2)`} />
        <NbOutput kind="result">{`{ "_id" : ObjectId("..."), "nom" : "Jean", "age" : 38, ... }
{ "_id" : ObjectId("..."), "nom" : "smith", "age" : 30, ... }
2`}</NbOutput>
      </Notebook>

      {/* Update */}
      <h2 className="font-serif text-2xl font-semibold text-primary mt-12 mb-4">
        4 · Update — opérateurs $set, $inc, $push
      </h2>
      <Notebook kernel="MongoDB Shell · 5.0">
        <NbMarkdown title="$set : ajouter / modifier un champ" />
        <NbCode language="js" code={`db.people.update(
  { nom: "Jean" },
  { $set: { salaire: 5000 } }
)
db.people.find({ nom: "Jean" })`} />
        <NbOutput kind="result">{`WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })
{ "_id" : ObjectId("..."), "nom" : "Jean", "age" : 38,
  "profession" : "medecin", "salaire" : 5000 }`}</NbOutput>

        <NbMarkdown title="$inc : incrémenter un entier" />
        <NbCode language="js" code={`db.people.update({ nom: "Jean" }, { $inc: { age: 1 } })
db.people.findOne({ nom: "Jean" })`} />
        <NbOutput kind="result">{`{ "_id" : ObjectId("..."), "nom" : "Jean", "age" : 39, ... }`}</NbOutput>

        <NbMarkdown title="$push / $pop : tableau" />
        <NbCode language="js" code={`db.people.update({ nom: "smith" },
  { $set: { activite: ["sport","camping","musique"] } })

db.people.update({ nom: "smith" }, { $pop: { activite: 1 } })   // retire dernier
db.people.find({ nom: "smith" })`} />
        <NbOutput kind="result">{`{ "_id" : ObjectId("..."), "nom" : "smith", "age" : 30,
  "activite" : [ "sport", "camping" ] }`}</NbOutput>

        <NbMarkdown title="updateMany : plusieurs documents">
          <p>Par défaut <code>update</code> ne modifie qu'1 document. Pour tous : <code>{`{ multi: true }`}</code> (ou <code>updateMany</code>).</p>
        </NbMarkdown>
        <NbCode language="js" code={`db.people.update({}, { $set: { actif: true } }, { multi: true })`} />
        <NbOutput kind="result">{`WriteResult({ "nMatched" : 3, "nUpserted" : 0, "nModified" : 3 })`}</NbOutput>
      </Notebook>

      {/* Delete + Import/Export */}
      <h2 className="font-serif text-2xl font-semibold text-primary mt-12 mb-4">
        5 · Suppression et Import/Export
      </h2>
      <Notebook kernel="MongoDB Shell · 5.0">
        <NbMarkdown title="remove + drop" />
        <NbCode language="js" code={`// Supprimer tous les documents 'Jean'
db.people.remove({ nom: "Jean" })

// Supprimer la collection entière
db.people.drop()`} />
        <NbOutput kind="result">{`WriteResult({ "nRemoved" : 1 })
true`}</NbOutput>

        <NbMarkdown title="Import / Export (terminal, hors shell)" />
        <NbCode language="js" code={`// Export en JSON
mongoexport --db test --collection people --out people.json

// Import depuis JSON
mongoimport --db test --collection people --type json --file people.json

// Sauvegarde / restauration BSON
mongodump   --db test --out backup
mongorestore backup`} />
      </Notebook>

      <Callout variant="warning" title="À retenir">
        <ul className="list-disc pl-5 space-y-1">
          <li><code>find()</code> renvoie un <strong>cursor</strong>, <code>findOne()</code> un <strong>document</strong>.</li>
          <li>Projection : <code>1</code> = inclure, <code>0</code> = exclure (sauf <code>_id</code> qui s'exclut).</li>
          <li><code>update()</code> sans opérateur <strong>remplace tout le document</strong> ! Toujours utiliser <code>$set</code>.</li>
        </ul>
      </Callout>

      <QCM
        title="Testez vos connaissances — CRUD"
        questions={[
          { id: 1, question: "Pour insérer un document :", options: ["db.col.add()", "db.col.insert()", "db.col.create()", "INSERT INTO col"], correct: 1, explanation: "db.collection.insert(doc) (ou insertOne / insertMany)." },
          { id: 2, question: "Pour lire tous les documents :", options: ["db.col.read()", "db.col.find()", "db.col.select()", "SELECT * FROM col"], correct: 1, explanation: "find() sans argument renvoie tout." },
          { id: 3, question: "Différence find vs findOne :", options: ["find = 1 doc, findOne = tous", "find = cursor multiple, findOne = un seul document", "find = sync, findOne = async", "Aucune"], correct: 1, explanation: "findOne renvoie le premier document, find renvoie un cursor." },
          { id: 4, question: "Projection : afficher seulement nom et age :", options: ["find({},{nom,age})", "find({},{nom:1, age:1})", "find().select(nom,age)", "find('nom,age')"], correct: 1, explanation: "find({}, { nom: 1, age: 1 })." },
          { id: 5, question: "Cacher _id du résultat :", options: ["{_id: false}", "{_id: 0}", "Les deux", "Impossible"], correct: 2, explanation: "0 ou false fonctionne." },
          { id: 6, question: "Opérateur 'plus grand que' :", options: ["$gt", ">", "$above", "$more"], correct: 0, explanation: "$gt (greater than)." },
          { id: 7, question: "Opérateur 'dans la liste' :", options: ["$inside", "$any", "$in", "$contains"], correct: 2, explanation: "$in : { age: { $in: [25,30,35] } }." },
          { id: 8, question: "Opérateur 'champ présent' :", options: ["$exists", "$has", "$present", "$defined"], correct: 0, explanation: "$exists: true." },
          { id: 9, question: "Pour une recherche par regex :", options: ["$like", "$match", "$regex", "$pattern"], correct: 2, explanation: "{ nom: { $regex: '^s' } }." },
          { id: 10, question: "ET logique entre conditions :", options: ["$and obligatoire", "Mettre les conditions côte à côte (implicit AND)", "$concat", "AND keyword"], correct: 1, explanation: "Conditions multiples = ET implicite. $and explicite si conflit de clés." },
          { id: 11, question: "OU logique :", options: ["$or", "OR", "||", "$any"], correct: 0, explanation: "$or: [ {…}, {…} ]." },
          { id: 12, question: "Compter les résultats :", options: ["size()", "count()", "COUNT(*)", "length()"], correct: 1, explanation: "find().count() ou countDocuments()." },
          { id: 13, question: "Pour modifier un champ sans écraser le document :", options: ["update({},{champ:val})", "update({}, {$set: {champ:val}})", "set(champ,val)", "modify()"], correct: 1, explanation: "Sans $set, update remplace tout le document !" },
          { id: 14, question: "Incrémenter un entier :", options: ["$add", "$inc", "$plus", "$incr"], correct: 1, explanation: "{ $inc: { age: 1 } }." },
          { id: 15, question: "Ajouter une valeur en fin de tableau :", options: ["$add", "$push", "$append", "$insert"], correct: 1, explanation: "$push (avec duplicats), $addToSet (sans)." },
          { id: 16, question: "Update qui modifie tous les documents matchés :", options: ["update(...) tout seul", "update(..., {multi:true}) ou updateMany", "updateAll()", "modifyAll()"], correct: 1, explanation: "Sans multi:true, un seul document est modifié." },
          { id: 17, question: "Supprimer 1 document :", options: ["db.col.delete()", "db.col.remove(query)", "db.col.drop(query)", "DELETE col WHERE …"], correct: 1, explanation: "remove() ou deleteOne/deleteMany." },
          { id: 18, question: "Supprimer la collection :", options: ["db.col.remove()", "db.col.drop()", "db.dropDatabase()", "DROP TABLE"], correct: 1, explanation: "drop() supprime la collection entière." },
          { id: 19, question: "Importer un fichier JSON depuis un terminal :", options: ["importjson", "loadjson", "mongoimport", "jsonimport"], correct: 2, explanation: "mongoimport --db --collection --file." },
          { id: 20, question: ".sort({age:-1}) signifie :", options: ["Tri croissant sur age", "Tri décroissant sur age", "Garder 1 élément", "Skip 1 élément"], correct: 1, explanation: "1 = croissant, -1 = décroissant." },
        ]}
      />
    </article>
  </PageLayout>
);

export default NoSQLCrud;
