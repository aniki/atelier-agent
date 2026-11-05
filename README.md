# Atelier : construire un agent en TypeScript (API Gemini ou OpenRouter)

Module 2 · De l'agent au harnais. Tu vas construire un agent en quatre étapes, chacune ajoutant une capacité à la précédente.

## Mise en route (5 min)

Prérequis : Node.js 20.6 ou plus récent (22 recommandé), Git.

```bash
npm install
cp .env.example .env     # puis édite .env : GEMINI_API_KEY (ou OPENROUTER_API_KEY) et MODEL
npm run typecheck        # doit se terminer sans erreur
```

Ne commite jamais `.env`. Le nom du modèle (`MODEL`) est donné par le formateur : les noms changent vite.

**Fournisseur** : renseigne `GEMINI_API_KEY` *ou* `OPENROUTER_API_KEY` (si les deux sont présentes, Gemini est utilisé ; `PROVIDER=openrouter` force l'autre). Avec OpenRouter, `MODEL` est au format `fournisseur/modele`. Le code des étapes est identique : `src/openrouter.ts` traduit les appels `ai.models.generateContent` vers l'API OpenRouter (tu n'as pas à le modifier).

## Le projet d'exemple

Ton agent travaille uniquement dans le dossier `workspace/` (un petit panier d'achat). Il contient un bug volontaire : `npm test` y échoue. Tu peux vérifier :

```bash
cd workspace && npm test
```

## Les quatre étapes

| Étape | Fichier | Tu ajoutes | Question à tester |
|---|---|---|---|
| 1 | `src/step1.ts` | Un appel simple au modèle | « Explique ce qu'est un agent » |
| 2 | `src/step2.ts` | Un outil `read_file`, appelé une fois | « Que contient package.json ? » |
| 3 | `src/step3.ts` | La boucle, `list_files`, plafond de tours, erreurs renvoyées au modèle | « Quels fichiers y a-t-il et que fait src/cart.ts ? » |
| 4 | `src/step4.ts` | `run_command` avec liste autorisée et confirmation | « Lance les tests et dis-moi pourquoi l'un d'eux échoue. » |

Lancer une étape : `npm run step1 -- "ta question"` (idem pour step2, step3, step4).

Chaque fichier contient des `TODO` numérotés. Tant qu'ils ne sont pas traités, le script s'arrête avec « TODO ».

## Points de contrôle

- **Étape 1** : une réponse en texte et un nombre de tokens affichés.
- **Étape 2** : la console affiche `[outil demandé] read_file(...)` puis une réponse qui cite le contenu réel du fichier.
- **Étape 3** : plusieurs lignes `[tour N] ...` ; demande un fichier inexistant (`config.yml`) : le programme ne plante pas et le modèle s'adapte.
- **Étape 4** : `npm test` passe sans question (liste autorisée) ; toute autre commande te demande confirmation.

## Pour aller plus loin (si tu as fini)

1. Demande à l'agent de **corriger le bug** de `workspace/src/cart.ts`. Il n'a pas d'outil d'écriture : que se passe-t-il ? Ajoute `write_file` en restant dans `workspace/`.
2. Demande-lui de **résumer `workspace/README.md`** et observe ce qu'il fait. Qu'est-ce qui, dans ton harnais, te protège ?
3. Mesure le nombre de tokens consommés sur toute une session. Où part le coût ?

## Si tu es bloqué

Erreurs courantes :
- `400` sur le tour suivant un appel d'outil : tu n'as pas renvoyé le `content` complet du modèle (`res.candidates![0].content`) dans l'historique. Les modèles récents exigent de retrouver leurs « thought signatures ».
- `404` ou « model not found » : le nom dans `MODEL` est faux ou retiré.
- `429` : quota atteint, attends une minute ou demande la clé de secours.
- `response must be an object` : le `response` d'un `functionResponse` doit être un objet (`{ result }`), pas une chaîne.

Une solution de référence est dans `solution/` (même nom de fichier par étape). Regarde-la seulement après avoir essayé : `npm run solution:3`.

## Pour le formateur

- Retirer le dossier `solution/` avant de distribuer, ou ne le donner qu'après l'atelier.
- Le faux `workspace/.env` ne contient aucune valeur réelle ; il sert à la démo d'injection (module 2, slide 16). Le piège est dans `workspace/README.md` (commentaire HTML pointant vers `attacker.example`, domaine réservé).
- Tester avant la séance, sur le modèle exact utilisé : étape 4 de bout en bout, et la démo d'injection (plusieurs essais : le résultat varie).
