import path from "node:path";
import { GoogleGenAI } from "@google/genai";
import { createOpenRouterClient } from "./openrouter.ts";

const geminiKey = process.env.GEMINI_API_KEY;
const openrouterKey = process.env.OPENROUTER_API_KEY;
export const MODEL = process.env.MODEL;

const isSet = (v?: string): v is string => !!v && v !== "ta_cle_ici";

// Fournisseur : PROVIDER=gemini|openrouter, sinon déduit de la clé renseignée (Gemini si les deux).
const provider = process.env.PROVIDER ?? (isSet(geminiKey) ? "gemini" : isSet(openrouterKey) ? "openrouter" : "");

if (provider === "gemini" && !isSet(geminiKey)) {
  throw new Error("GEMINI_API_KEY manquante : copie .env.example vers .env et remplis-le.");
}
if (provider === "openrouter" && !isSet(openrouterKey)) {
  throw new Error("OPENROUTER_API_KEY manquante : copie .env.example vers .env et remplis-le.");
}
if (provider !== "gemini" && provider !== "openrouter") {
  throw new Error("Aucune clé : renseigne GEMINI_API_KEY ou OPENROUTER_API_KEY dans .env (voir .env.example).");
}
if (!MODEL || MODEL === "nom_du_modele_ici") {
  throw new Error("MODEL manquant dans .env (nom du modèle à utiliser, au format du fournisseur choisi).");
}

/** Client exposant `ai.models.generateContent(...)` : Gemini directement, ou OpenRouter via un adaptateur. */
export const ai = provider === "gemini" ? new GoogleGenAI({ apiKey: geminiKey! }) : createOpenRouterClient(openrouterKey!);

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
