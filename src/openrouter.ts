// Adaptateur OpenRouter : expose la petite partie de l'API Gemini utilisée par l'atelier
// (`ai.models.generateContent`) au-dessus de l'API OpenRouter (format OpenAI chat/completions).
// Les étapes restent donc identiques quel que soit le fournisseur.
import type { Content, GenerateContentParameters, Part } from "@google/genai";

const URL = "https://openrouter.ai/api/v1/chat/completions";

type OrMessage = Record<string, unknown>;

/** Gemini utilise des types en MAJUSCULES (OBJECT, STRING), JSON Schema en minuscules. */
function lowerTypes(schema: unknown): unknown {
  if (Array.isArray(schema)) return schema.map(lowerTypes);
  if (schema && typeof schema === "object") {
    return Object.fromEntries(
      Object.entries(schema).map(([k, v]) => [k, k === "type" && typeof v === "string" ? v.toLowerCase() : lowerTypes(v)]),
    );
  }
  return schema;
}

function toContents(contents: GenerateContentParameters["contents"]): Content[] {
  if (typeof contents === "string") return [{ role: "user", parts: [{ text: contents }] }];
  const list = (Array.isArray(contents) ? contents : [contents]) as Array<Content | Part | string>;
  return list.map((c): Content =>
    typeof c === "string" ? { role: "user", parts: [{ text: c }] } : "parts" in c ? (c as Content) : { role: "user", parts: [c as Part] },
  );
}

function toMessages(contents: Content[], system?: string): OrMessage[] {
  const messages: OrMessage[] = [];
  if (system) messages.push({ role: "system", content: system });
  // Les functionCall de Gemini n'ont pas toujours d'id : on associe réponses et appels par nom, dans l'ordre.
  const pending: Record<string, string[]> = {};
  let n = 0;
  for (const c of contents) {
    const parts = c.parts ?? [];
    if (c.role === "model") {
      const text = parts.map((p) => p.text ?? "").join("");
      const tool_calls = parts
        .filter((p) => p.functionCall)
        .map((p) => {
          const id = p.functionCall!.id ?? `call_${++n}`;
          (pending[p.functionCall!.name!] ??= []).push(id);
          return { id, type: "function", function: { name: p.functionCall!.name, arguments: JSON.stringify(p.functionCall!.args ?? {}) } };
        });
      messages.push({ role: "assistant", content: text || null, ...(tool_calls.length ? { tool_calls } : {}) });
    } else {
      for (const p of parts.filter((p) => p.functionResponse)) {
        const fr = p.functionResponse!;
        messages.push({
          role: "tool",
          tool_call_id: fr.id ?? pending[fr.name!]?.shift() ?? `call_${++n}`,
          content: typeof fr.response?.result === "string" ? fr.response.result : JSON.stringify(fr.response),
        });
      }
      const text = parts.map((p) => p.text ?? "").join("");
      if (text) messages.push({ role: "user", content: text });
    }
  }
  return messages;
}

export function createOpenRouterClient(apiKey: string) {
  return {
    models: {
      async generateContent(params: GenerateContentParameters) {
        const cfg = params.config ?? {};
        const system = typeof cfg.systemInstruction === "string" ? cfg.systemInstruction : undefined;
        const tools = (cfg.tools ?? []).flatMap((t) =>
          "functionDeclarations" in t
            ? (t.functionDeclarations ?? []).map((d) => ({
                type: "function",
                function: { name: d.name, description: d.description, parameters: lowerTypes(d.parameters) },
              }))
            : [],
        );
        const res = await fetch(URL, {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: params.model,
            messages: toMessages(toContents(params.contents), system),
            ...(tools.length ? { tools } : {}),
          }),
        });
        const data = (await res.json()) as any;
        if (!res.ok || data.error) {
          throw new Error(`OpenRouter ${res.status} : ${data.error?.message ?? JSON.stringify(data)}`);
        }
        const msg = data.choices[0].message;
        const parts: Part[] = [];
        if (msg.content) parts.push({ text: msg.content });
        for (const tc of msg.tool_calls ?? []) {
          parts.push({ functionCall: { id: tc.id, name: tc.function.name, args: JSON.parse(tc.function.arguments || "{}") } });
        }
        const functionCalls = parts.filter((p) => p.functionCall).map((p) => p.functionCall!);
        return {
          text: msg.content ?? undefined,
          functionCalls: functionCalls.length ? functionCalls : undefined,
          candidates: [{ content: { role: "model", parts } as Content }],
          usageMetadata: { totalTokenCount: data.usage?.total_tokens as number | undefined },
        };
      },
    },
  };
}
