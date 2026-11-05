import path from "node:path";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
export const MODEL = process.env.MODEL;

if (!apiKey || apiKey === "ta_cle_ici") {
  throw new Error("GEMINI_API_KEY manquante : copie .env.example vers .env et remplis-le.");
}
if (!MODEL || MODEL === "nom_du_modele_ici") {
  throw new Error("MODEL manquant dans .env (nom du modèle Gemini à utiliser).");
}

export const ai = new GoogleGenAI({ apiKey });

/** Le seul dossier auquel l'agent a accès (moindre privilège). */
export const WORKDIR = path.resolve("workspace");

/** Transforme un chemin demandé par le modèle en chemin absolu, en refusant de sortir de WORKDIR. */
export function safePath(requested: string): string {
  const full = path.resolve(WORKDIR, requested);
  if (full !== WORKDIR && !full.startsWith(WORKDIR + path.sep)) {
    throw new Error(`Chemin refusé (hors du dossier de travail) : ${requested}`);
  }
  return full;
}
