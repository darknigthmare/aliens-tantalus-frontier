# V66 — audit du verrou de référence 048 Cult Host

## Verdict

Le profil `enemy-048-cult-host` reste **PROJECT_ADAPTATION / DERIVED_FROM_EXTERNAL_MODEL**, `canonExact=false`. Les sources officielles Focus/Tindalos/20th Century établissent Aliens: Dark Descent, Lethe et une nouvelle menace humaine/narrative, mais ne valident pas une classe canonique universelle nommée Cult Host.

## Frontière Guardian

Guardian demeure un individu/rôle spécifique de Lethe. Le futur Cult Host doit être un humain original de Tantalus : visage humain visible, proportions humaines, vêtements coloniaux usés, posture fiévreuse volontaire et appareillage médical récupéré limité au thorax/abdomen. Il ne doit copier ni la silhouette, ni l'anatomie, ni la disposition exacte de l'Embryostatis du Guardian.

## Sources et prédécesseurs vérifiés

- Page produit officielle Focus : accessible; crédite Tindalos, Focus et 20th Century Studios.
- Story trailer officiel Focus/Tindalos/20th Century Games : accessible; situe la campagne sur Lethe et une menace nouvelle.
- Raw V56 : `5d115611ced831517a666f3000897e96bed3dd35d48edcb0b323f21e1a7081df`, 1254×1254 RGBA, 796 957 octets.
- Normalisé V56 : `ea3ba3c83c55ee1d6b57d2f525135dc0a447de1493b5f4fa4caaa39ea85f0e2c`, 1024×1024 RGBA, 507 216 octets.

## Contrat et incohérences

Les quatre clips `idle`, `move`, `attack`, `death` exigent chacun huit poses 4×2, ordre row-major et profil droit strict. Le placeholder générique d'attaque mentionne griffes ou mâchoire interne : cela contredit l'humanité verrouillée et doit être remplacé par une action humaine. Les quatre hashes déclarés des prompts ne correspondent pas au texte UTF-8 décodé; aucun placeholder n'est autorisé pour génération.

## État

Aucune image officielle téléchargée ou incorporée, aucune génération, acceptation, intégration runtime, fusion globale ou opération Git. Toute plaque future doit être originale et revue avant promotion.
