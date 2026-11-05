// ÉTAPE 2 : un outil read_file, appelé une seule fois (pas encore de boucle).
// Lancer :  npm run step2 -- "Que contient package.json ?"
import { Type, type Content, type FunctionDeclaration } from "@google/genai";
import { ai, MODEL, safePath } from "./config.ts";

// TODO 1 : déclare l'outil read_file (name, description claire, paramètre `path` de type STRING).
const readFileDecl: FunctionDeclaration = {
  name: "read_file",
  description: "TODO : décris l'outil pour le modèle",
  parameters: { type: Type.OBJECT, properties: {} },
};

// TODO 2 : implémente la fonction qui lit réellement le fichier.
// Utilise safePath(...) pour refuser les chemins hors du dossier de travail.
function readFile(_args: Record<string, unknown>): string {
  void safePath;
  throw new Error("TODO");
}

const question = process.argv[2] ?? "Que contient package.json ?";
const contents: Content[] = [{ role: "user", parts: [{ text: question }] }];

// TODO 3 : appelle generateContent avec config: { tools: [{ functionDeclarations: [readFileDecl] }] }.
// TODO 4 : si res.functionCalls contient une demande : exécute l'outil,
//          ajoute res.candidates![0].content! à `contents`,
//          puis ajoute { role: "user", parts: [{ functionResponse: { name, response: { result } } }] }.
// TODO 5 : refais un appel pour obtenir la réponse finale et affiche res.text.

void ai;
void MODEL;
void contents;
void readFile;
throw new Error("TODO : étape 2 à écrire");
