// ÉTAPE 1 : un appel simple au modèle.
// Objectif : afficher la réponse du modèle à une question passée en argument.
// Lancer :  npm run step1 -- "Ta question"
import { ai, MODEL } from "./config.ts";

const question = process.argv[2] ?? "Explique en deux phrases ce qu'est un agent.";

// TODO 1 : appelle ai.models.generateContent({ model, contents }) avec MODEL et la question.
// TODO 2 : affiche res.text.
// Bonus : affiche aussi res.usageMetadata?.totalTokenCount (combien a coûté cet appel ?)

void ai;
void MODEL;
void question;
throw new Error("TODO : étape 1 à écrire");
