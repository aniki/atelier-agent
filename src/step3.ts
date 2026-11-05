// ÉTAPE 3 : la boucle agentique.
// Objectif : le modèle enchaîne autant d'outils qu'il veut, jusqu'à ce qu'il réponde en texte.
// Lancer :  npm run step3 -- "Quels fichiers y a-t-il et que fait src/cart.ts ?"
import { Type, type Content, type FunctionDeclaration, type Part } from "@google/genai";
import { ai, MODEL, safePath } from "./config.ts";

const MAX_TURNS = 10; // garde-fou : la boucle ne tourne jamais indéfiniment

// TODO 1 : reprends read_file (étape 2) et ajoute list_files (liste un dossier).
const declarations: FunctionDeclaration[] = [
  { name: "read_file", description: "TODO", parameters: { type: Type.OBJECT, properties: {} } },
];

const implementations: Record<string, (args: Record<string, unknown>) => string> = {
  // read_file: (args) => ...,
  // list_files: (args) => ...,
};

// TODO 2 : run(name, args) exécute l'outil dans un try/catch.
// Une erreur doit revenir au modèle sous forme de texte ("ERREUR : ..."), pas planter le programme.
function run(_name: string, _args: Record<string, unknown>): string {
  void safePath;
  throw new Error("TODO");
}

async function agent(question: string): Promise<string> {
  const contents: Content[] = [{ role: "user", parts: [{ text: question }] }];
  const config = { tools: [{ functionDeclarations: declarations }] };

  // TODO 3 : boucle for (turn = 1..MAX_TURNS)
  //   a. appelle generateContent
  //   b. s'il n'y a pas de res.functionCalls : return res.text
  //   c. sinon : push res.candidates![0].content!, exécute CHAQUE appel avec run(),
  //      push { role: "user", parts } avec un functionResponse par appel
  // TODO 4 : après la boucle, retourne un message "plafond atteint".
  void contents;
  void config;
  void MODEL;
  void ai;
  void implementations;
  void ({} as Part);
  throw new Error("TODO : étape 3 à écrire");
}

const question = process.argv[2] ?? "Quels fichiers y a-t-il dans le projet et que fait src/cart.ts ?";
console.log(await agent(question));
