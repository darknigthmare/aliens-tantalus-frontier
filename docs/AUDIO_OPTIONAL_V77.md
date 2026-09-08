# Audio optionnel V77 — contrat du chat « Gérer sons et musique »

Source : conversation ChatGPT `6a9f2a3e-ea20-83eb-bbac-49af1626675a`, demande exacte conservée dans `docs/references/v76-conversation-audit/group-gameplay.md`.

## Statut réel

L’infrastructure de fichiers optionnels est implémentée. La banque finale reste **PARTIAL** : aucun enregistrement ni morceau de production n’a été fourni. Les huit `.todo` matérialisent cette absence ; ils ne sont jamais présentés comme des sons réalisés. Les effets synthétiques historiques restent disponibles et l’absence de musique produit du silence. Les micro-WAV des tests ne sont pas copiés dans les assets publiés.

## Contrat de contenu

Les cinq effets sont `assets/audio/sfx/{shot,tracker,hit,ui,alarm}`. Les trois musiques sont `assets/audio/music/{menu,hub,mission}`. Pour chaque emplacement, fournir un ou plusieurs fichiers portant exactement ce nom en `.mp3`, `.wav`, `.ogg`, `.m4a` ou `.webm` ; cette liste définit l’ordre de préférence après vérification de `canPlayType`. Un fichier présent l’emporte sur son témoin `.todo`. Un codec annoncé lisible mais réellement invalide est essayé une seule fois par minute, puis le lecteur passe au format suivant.

Le scanner `node scripts/audio-scan-v77.mjs` écrit `assets/audio/manifest.json` sans date ni champ aléatoire. `--check` échoue si ce manifeste diverge du dossier actuel. Les sources vides, supérieures à24MiB, inconnues ou symboliques ne sont pas acceptées. Le manifeste conserve les octets, MIME et SHA-256 ; le lecteur refuse les chemins hors des huit emplacements et valide le SHA lorsque WebCrypto est disponible.

## Lecteur et cycle de vie

`AudioDirector` conserve `unlock`, `tone`, `shot`, `tracker`, `hit`, `ui`, `alarm`, `vent`, `master` et `enabled`. `enabled` est un mute global. Les nouveaux appels sont :

```js
void audio.prepare();
audio.setVolumes({ master: 1, effects: settings.effects, music: settings.music });
void audio.setScene('menu'); // également 'hub', 'mission' ou null
void audio.unlock(); // dans le gestionnaire d’un vrai geste utilisateur
audio.dispose(); // fermeture définitive de l’application
```

Les effets se préparent après activation et se décodent en buffers. Tant que le fichier n’est pas prêt, la synthèse répond immédiatement ; la fin du chargement ne rejoue jamais l’ancien événement. Le pool est limité à24 voix. La banque compressée est limitée à32MiB et le cache d’effets décodés à32MiB (16MiB par effet). Les téléchargements simultanés du même fichier sont dédupliqués. Les échecs ont un délai de nouvelle tentative de60secondes et une limite de64 entrées.

La musique utilise un Blob compressé et un élément Audio, sans décoder tout le morceau en grand buffer PCM. Les scènes ont un compteur de génération ; une musique chargée après avoir quitté sa scène est abandonnée. Le départ applique un fondu de350ms, l’arrivée un fondu de600ms ; au maximum deux voix sont conservées. Les volumes effets et musique restent indépendants. Les URLs Blob et médias sont libérés au changement et à `dispose`. Les téléchargements sont bornés à8secondes ; les promesses de lecture rejetées sont absorbées. Un refus `NotAllowedError` reste distingué d’un fichier absent, et le geste suivant réessaie le même fichier déjà chargé.

## Raccordement de publication suivi par le lot principal

- Ajouter `audio:scan` et `audio:check` aux scripts npm ; lancer le scanner avant dev et build.
- Appeler `prepare`, `setVolumes`, `setScene` depuis les transitions réelles de l’application. Remplacer le réglage historique `enabled = effects > 0`, qui couperait aussi la musique.
- Importer/recopier `AUDIO_MIME_V77` dans le serveur local : `.mp3 audio/mpeg`, `.wav audio/wav`, `.ogg audio/ogg`, `.m4a audio/mp4`, `.webm audio/webm`.
- Faire entrer les deux modules et le manifeste dans le shell offline. Pour une URL audio, ne mettre en cache que HTTP200 non opaque avec un MIME audio reconnu ; jamais une réponse HTML,404 ou206. Le helper `isAudioResponseV77` expose la règle au runtime et aux tests ; le service worker classique peut reprendre ce petit prédicat.
- La fixture navigateur de ce sous-lot vérifie les API natives dans Chromium ; les API simulées des tests unitaires permettent aussi de forcer les rejets et races. Cela ne certifie pas le décodage dans tous les navigateurs ni la qualité artistique de banques absentes.

## Vérification

`node --test tests/audio-v77.test.mjs` :15 tests réussis couvrant scanner déterministe/.todo, formats, SHA/MIME/HTTP, timeout/cache, absence de son retardé, décodage invalide, autoplay, volumes, changements de scène et destruction pendant chargement. Les régressions supplémentaires contrôlent une promesse `play()` en attente pendant mute/unmute musique, master et global, aussi bien à sa résolution qu’à son ancien rejet autoplay. Une vraie fixture PCM WAV minimale est construite dans le test seulement.

`CDP_ENDPOINT=http://127.0.0.1:<port> APP_URL=http://127.0.0.1:4176/ node tests/browser-audio-v77.mjs` : vérification native exécutée avec succès le8septembre2026. Le test crée son propre contexte navigateur et un PCM WAV de844octets en mémoire ; il n’écrit aucun son de production. Résultats observés : clic `isTrusted`, aucun contexte audio avant ce clic, contexte `running`, vrai `AudioBuffer` mono50ms rééchantillonné à48000Hz, effet lancé, vrai `HTMLAudioElement` non pausé avec `readyState=4`. Les transitions menu→hub→mission terminent avec une seule musique et une URL Blob, effets muets tandis que musique à0.4. La fixture utilise un bus àgain0 et des éléments médias `muted` afin de ne pas émettre de son pendant la QA. Le fichier inexistant renvoie404 text/plain et le manifeste200 application/json. La destruction libère les URLs et toutes les voix ; aucune exception navigateur.

PowerShell : définir `$env:CDP_ENDPOINT` et `$env:APP_URL` avant la commande ci-dessus. Le navigateur doit avoir un endpoint CDP actif ; le script ferme uniquement son contexte isolé et garde le navigateur disponible pour les autres tests.

La QA native a également reproduit la course mute/unmute avec la résolution de `play()` retardée autour d’un vrai média. Après retrait de la première voix, démutage et résolution ancienne, la nouvelle voix reste présente et non pausée (`voices=1`, `status=playing`, scène hub, une URL Blob). Le mute invalide la génération en attente ; les anciennes résolutions et erreurs ne peuvent plus annoncer une lecture supprimée ou écraser le statut de sa remplaçante.

Référence technique : [MDN — bonnes pratiques Web Audio](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices), consultée pour l’activation par geste utilisateur, les buffers d’effets courts et les éléments média pour les musiques longues.
