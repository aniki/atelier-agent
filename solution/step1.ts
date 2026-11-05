// ÉTAPE 1 (solution) : un appel simple au modèle
import { ai, MODEL } from "../src/config.ts";

const question = process.argv[2] ?? "Explique en deux phrases ce qu'est un agent.";

const res = await ai.models.generateContent({
  model: MODEL!,
  contents: question,
});

console.log(res.text);
console.log("\n--- tokens :", res.usageMetadata?.totalTokenCount);
