# Provenance graphique V65

Fournisseur : outil intégré OpenAI ImageGen. Quatre générations acceptées.
Les prompts complets et la référence anatomique NECA figurent dans
[V65_FACEHUGGER_IMAGEGEN.md](references/V65_FACEHUGGER_IMAGEGEN.md).

Sujet : Facehugger standard, vue de gameplay latérale, queue vers la gauche,
déplacement vers la droite. Adaptation pixel art contrôlée ; pas de preuve
de fidélité pixel pour pixel et pas de substitution d’identité pour les variantes.

Sources originales conservées sous `assets/openai/sprites/frames/v65/` :

- `facehugger-idle-reference-v65.png`
- `facehugger-scuttle-reference-v65.png`
- `facehugger-attack-reference-v65.png`
- `facehugger-death-reference-v65.png`

Atlas publié :
`assets/openai/sprites/normalized/enemy-profiles-v65/enemy-002-facehugger.webp`.

SHA-256 : `6c945329f8e03e3473bba35367a99773cc8fecb115df508bfc06ebe4a67eab27`.

Préparation mécanique : extraction des poses, suppression du fond magenta,
réattribution d’un doigt franchissant une limite de cellule à sa pose d’origine,
mise à l’échelle commune 0.507937 et placement au pivot (128,240) dans 32 cellules de 256×256.
Aucun dessin de substitution ni interpolation pour gonfler le nombre de frames.

La provenance détaillée (hash des quatre sources, 32 hashes de cellules,
placements, grille, transparence, clips et prélèvement des 170 pixels concernés)
est conservée dans
`assets/openai/sprites/metadata/v65/facehugger-motion/enemy-002-facehugger.json`.

Vérification reproductible : `npm run art:v65:check`.
Les candidats rejetés, les PNG de production et les GIF de contrôle ne sont pas
distribués comme assets runtime. Le manifeste historique V64 reste inchangé ;
l’enregistrement V65 est additif et contrôlé séparément.
