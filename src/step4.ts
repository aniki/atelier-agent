// ÉTAPE 4 : l'outil run_command, avec liste autorisée et confirmation humaine.
// Lancer :  npm run step4 -- "Lance les tests et dis-moi pourquoi l'un d'eux échoue."
import { execSync } from "node:child_process";
import * as readline from "node:readline/promises";
import { Type, type FunctionDeclaration } from "@google/genai";
import { WORKDIR } from "./config.ts";

// Reprends ton step3.ts (copie-le ici) puis ajoute :

// TODO 1 : déclare run_command (paramètre `command` de type STRING).
const runCommandDecl: FunctionDeclaration = {
  name: "run_command",
  description: "TODO",
  parameters: { type: Type.OBJECT, properties: {} },
};

// TODO 2 : liste autorisée. Correspondance EXACTE (pas de startsWith : "npm test; rm -rf ." passerait !).
const ALLOWED = new Set<string>([/* "npm test", "ls" */]);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

// TODO 3 : si la commande n'est pas dans ALLOWED, demande confirmation à l'humain avec rl.question(...).
//          Refus => retourne "REFUSÉ : ..." au modèle (il s'adaptera).
// TODO 4 : exécute avec execSync(command, { cwd: WORKDIR, encoding: "utf8", timeout: 30_000 }).
//          Si la commande échoue, renvoie stdout + stderr au modèle : un test rouge est une information.
async function runCommand(_command: string): Promise<string> {
  void execSync;
  void WORKDIR;
  void ALLOWED;
  void rl;
  throw new Error("TODO");
}

void runCommandDecl;
void runCommand;
throw new Error("TODO : étape 4 à écrire");
