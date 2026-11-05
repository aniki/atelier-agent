// ÉTAPE 4 (solution) : run_command avec liste autorisée (allowlist) et confirmation humaine
import { readFileSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";
import * as readline from "node:readline/promises";
import { Type, type Content, type FunctionDeclaration, type Part } from "@google/genai";
import { ai, MODEL, safePath, WORKDIR } from "./config.ts";

const MAX_TURNS = 10;

// Commandes lancées SANS demander (correspondance exacte, pas de préfixe, pas de motif).
const ALLOWED = new Set(["npm test", "ls", "git status"]);

const declarations: FunctionDeclaration[] = [
  {
    name: "read_file",
    description: "Lit le contenu d'un fichier texte du projet. Chemin relatif à la racine du projet.",
    parameters: {
      type: Type.OBJECT,
      properties: { path: { type: Type.STRING, description: "Chemin relatif" } },
      required: ["path"],
    },
  },
  {
    name: "list_files",
    description: "Liste les fichiers et dossiers d'un dossier du projet ('.' pour la racine).",
    parameters: {
      type: Type.OBJECT,
      properties: { path: { type: Type.STRING, description: "Dossier à lister" } },
      required: ["path"],
    },
  },
  {
    name: "run_command",
    description: "Exécute une commande shell dans la racine du projet et renvoie sa sortie. Par exemple : npm test.",
    parameters: {
      type: Type.OBJECT,
      properties: { command: { type: Type.STRING, description: "La commande à exécuter" } },
      required: ["command"],
    },
  },
];

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

async function confirm(command: string): Promise<boolean> {
  const answer = await rl.question(`\n⚠️  Le modèle veut exécuter : ${command}\n   Autoriser ? (o/N) `);
  return answer.trim().toLowerCase() === "o";
}

async function runCommand(command: string): Promise<string> {
  if (!ALLOWED.has(command) && !(await confirm(command))) {
    return "REFUSÉ : l'utilisateur n'a pas autorisé cette commande.";
  }
  try {
    return execSync(command, { cwd: WORKDIR, encoding: "utf8", timeout: 30_000, stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    // Un test qui échoue est une information utile : on renvoie stdout et stderr au modèle.
    const err = e as { stdout?: string; stderr?: string; message: string };
    return `ERREUR (commande en échec)\n${err.stdout ?? ""}\n${err.stderr ?? err.message}`;
  }
}

async function run(name: string, args: Record<string, unknown>): Promise<string> {
  try {
    switch (name) {
      case "read_file":
        return readFileSync(safePath(String(args.path)), "utf8");
      case "list_files":
        return readdirSync(safePath(String(args.path ?? ".")), { withFileTypes: true })
          .map((e) => (e.isDirectory() ? `${e.name}/` : e.name))
          .join("\n");
      case "run_command":
        return await runCommand(String(args.command));
      default:
        return `ERREUR : outil inconnu ${name}`;
    }
  } catch (e) {
    return `ERREUR : ${e instanceof Error ? e.message : String(e)}`;
  }
}

async function agent(question: string): Promise<string> {
  const contents: Content[] = [{ role: "user", parts: [{ text: question }] }];
  const config = {
    systemInstruction: "Tu es un assistant de développement. Utilise les outils pour consulter le projet et lancer les tests avant de conclure.",
    tools: [{ functionDeclarations: declarations }],
  };
  for (let turn = 1; turn <= MAX_TURNS; turn++) {
    const res = await ai.models.generateContent({ model: MODEL!, contents, config });
    const calls = res.functionCalls;
    if (!calls || calls.length === 0) return res.text ?? "(pas de réponse)";
    contents.push(res.candidates![0].content!);
    const parts: Part[] = [];
    for (const call of calls) {
      console.log(`[tour ${turn}] ${call.name}(${JSON.stringify(call.args)})`);
      const result = await run(call.name!, call.args ?? {});
      parts.push({ functionResponse: { name: call.name!, response: { result } } });
    }
    contents.push({ role: "user", parts });
  }
  return `Arrêt : plafond de ${MAX_TURNS} tours atteint.`;
}

const question = process.argv[2] ?? "Lance les tests et dis-moi pourquoi l'un d'eux échoue.";
try {
  console.log(await agent(question));
} finally {
  rl.close();
}
