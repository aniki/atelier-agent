// ÉTAPE 2 (solution) : un outil read_file, appelé UNE fois
import { readFileSync } from "node:fs";
import { Type, type Content, type FunctionDeclaration } from "@google/genai";
import { ai, MODEL, safePath } from "../src/config.ts";

const readFileDecl: FunctionDeclaration = {
  name: "read_file",
  description: "Lit le contenu d'un fichier texte du projet. Le chemin est relatif à la racine du projet.",
  parameters: {
    type: Type.OBJECT,
    properties: { path: { type: Type.STRING, description: "Chemin relatif, ex. package.json" } },
    required: ["path"],
  },
};

function readFile(args: Record<string, unknown>): string {
  return readFileSync(safePath(String(args.path)), "utf8");
}

const question = process.argv[2] ?? "Que contient package.json ?";
const contents: Content[] = [{ role: "user", parts: [{ text: question }] }];
const config = { tools: [{ functionDeclarations: [readFileDecl] }] };

const res = await ai.models.generateContent({ model: MODEL!, contents, config });
const call = res.functionCalls?.[0];

if (!call) {
  console.log(res.text);
} else {
  console.log(`[outil demandé] ${call.name}(${JSON.stringify(call.args)})`);
  const result = readFile(call.args ?? {});
  // On renvoie au modèle sa propre demande (avec ses éventuelles thought signatures)...
  contents.push(res.candidates![0].content!);
  // ...puis le résultat de l'outil.
  contents.push({
    role: "user",
    parts: [{ functionResponse: { name: call.name!, response: { result } } }],
  });
  const final = await ai.models.generateContent({ model: MODEL!, contents, config });
  console.log(final.text);
}
