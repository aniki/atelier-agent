// ÉTAPE 3 (solution) : la boucle agentique, deux outils, plafond de tours, erreurs renvoyées au modèle
import { readFileSync, readdirSync } from "node:fs";
import { Type, type Content, type FunctionDeclaration, type Part } from "@google/genai";
import { ai, MODEL, safePath } from "./config.ts";

const MAX_TURNS = 10;

const declarations: FunctionDeclaration[] = [
  {
    name: "read_file",
    description: "Lit le contenu d'un fichier texte du projet. Chemin relatif à la racine du projet.",
    parameters: {
      type: Type.OBJECT,
      properties: { path: { type: Type.STRING, description: "Chemin relatif, ex. src/cart.ts" } },
      required: ["path"],
    },
  },
  {
    name: "list_files",
    description: "Liste les fichiers et dossiers d'un dossier du projet. Chemin relatif ('.' pour la racine).",
    parameters: {
      type: Type.OBJECT,
      properties: { path: { type: Type.STRING, description: "Dossier à lister, ex. ." } },
      required: ["path"],
    },
  },
];

const implementations: Record<string, (args: Record<string, unknown>) => string> = {
  read_file: (args) => readFileSync(safePath(String(args.path)), "utf8"),
  list_files: (args) =>
    readdirSync(safePath(String(args.path ?? ".")), { withFileTypes: true })
      .map((e) => (e.isDirectory() ? `${e.name}/` : e.name))
      .join("\n"),
};

/** Exécute un outil. Une erreur n'est PAS une exception du programme : c'est une info pour le modèle. */
function run(name: string, args: Record<string, unknown>): string {
  try {
    const impl = implementations[name];
    if (!impl) return `ERREUR : outil inconnu ${name}`;
    return impl(args);
  } catch (e) {
    return `ERREUR : ${e instanceof Error ? e.message : String(e)}`;
  }
}

async function agent(question: string): Promise<string> {
  const contents: Content[] = [{ role: "user", parts: [{ text: question }] }];
  const config = {
    systemInstruction: "Tu es un assistant de développement. Utilise les outils pour consulter le projet avant de répondre.",
    tools: [{ functionDeclarations: declarations }],
  };

  for (let turn = 1; turn <= MAX_TURNS; turn++) {
    const res = await ai.models.generateContent({ model: MODEL!, contents, config });
    const calls = res.functionCalls;
    if (!calls || calls.length === 0) {
      return res.text ?? "(pas de réponse)";
    }
    contents.push(res.candidates![0].content!);
    const parts: Part[] = [];
    for (const call of calls) {
      console.log(`[tour ${turn}] ${call.name}(${JSON.stringify(call.args)})`);
      const result = run(call.name!, call.args ?? {});
      parts.push({ functionResponse: { name: call.name!, response: { result } } });
    }
    contents.push({ role: "user", parts });
  }
  return `Arrêt : plafond de ${MAX_TURNS} tours atteint.`;
}

const question = process.argv[2] ?? "Quels fichiers y a-t-il dans le projet et que fait src/cart.ts ?";
console.log(await agent(question));
