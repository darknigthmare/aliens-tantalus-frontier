# Provenance OpenAI — hub modulaire v49

Date de production : 20 août 2026. Mode : **OpenAI ImageGen intégré**, un appel distinct par bitmap de salle ou couche lointaine, puis traitement local déterministe uniquement pour l’atlas de props.

Cette vague remplace dans le runtime les quatre panoramas v48 par des éléments de niveau réellement indépendants. Les panoramas restent dans le dépôt comme masters historiques ; aucun fichier officiel de la franchise n’est redistribué.

## Contrat livré

| Famille | Quantité | Format source | Chemin runtime |
|---|---:|---|---|
| Salles autonomes | 16 | PNG RGB, 1672×941 | `assets/openai/hub/rooms/` |
| Couches lointaines | 4 | PNG RGB, 1672×941 | `assets/openai/hub/parallax/` |
| Master de props | 1 | PNG RGB, 1254×1254 | `assets/openai/hub/props/hub-modular-props-atlas.png` |
| Master nettoyé | 1 | PNG RGBA, 1024×1024 | `assets/openai/hub/props/hub-modular-props-atlas-clean.png` |
| Props indépendants | 16 | PNG RGBA, dimensions variables | `assets/openai/hub/props/*.png` |

Le runtime charge donc 36 fichiers modulaires : 16 salles, 4 parallaxes et 16 props. La preuve mécanique est fournie par `assets/openai/hub/props/hub-modular-props-report.json`, `tests/hub.test.mjs` et `scripts/hub-browser-qa.mjs`.

## Sources ImageGen conservées

### Commandement

| Fichier final | Fichier source conservé |
|---|---|
| `rooms/command-bridge.png` | `C:\Users\chuck\.codex\generated_images\01a020f5-3713-7d10-bdcf-b5445ea60bf4\exec-298742e3-db4a-482a-a6d0-779f6ea263ab.png` |
| `rooms/command-briefing.png` | `…\exec-8cefe41f-98cd-4c5f-8bf5-8744c3371b01.png` |
| `rooms/command-cic.png` | `…\exec-7efe2961-9495-4d13-9a56-ae71f231249a.png` |
| `rooms/command-cryo.png` | `…\exec-d2b9cdb4-8499-43c0-8110-91f7ff04be5d.png` |
| `parallax/command-far.png` | `…\exec-e519541c-940f-4a4b-9192-d78c8bb6464b.png` |

### Habitat

| Fichier final | Fichier source conservé |
|---|---|
| `rooms/habitat-quarters.png` | `C:\Users\chuck\.codex\generated_images\01a020f5-6003-7e01-bbcf-f5fdfc77e7c9\exec-4a7f347c-0f40-42a9-b72d-9e446f916800.png` |
| `rooms/habitat-mess.png` | `…\exec-93e04830-5c21-48f0-88f4-dbef44e76c5c.png` |
| `rooms/habitat-medical.png` | `…\exec-90311f17-675a-467f-8dcf-1408f367487d.png` |
| `rooms/habitat-lab.png` | `…\exec-defa2823-0d8f-4abf-829c-3353cac4b6ad.png` |
| `parallax/habitat-far.png` | `…\exec-d693e2c9-eefd-4ba2-8e9e-252fca518291.png` |

### Industriel

| Fichier final | Fichier source conservé |
|---|---|
| `rooms/industrial-quarantine.png` | `C:\Users\chuck\.codex\generated_images\01a020f5-8647-7d31-b1cf-4ea8cb0d3f35\exec-286023a0-f363-4fe1-8fbe-cfe3b080015b.png` |
| `rooms/industrial-armory.png` | `…\exec-dd4e74a3-c5f1-42e2-bb06-dddf16717c29.png` |
| `rooms/industrial-workshop.png` | `…\exec-f2c6e1c6-6d06-4548-9fdb-77e0483a6dde.png` |
| `rooms/industrial-vehicle-bay.png` | `…\exec-9a26a2c6-c4fc-4bf5-a0f6-842ad705cc96.png` |
| `parallax/industrial-far.png` | `…\exec-86941982-0f87-44b2-8907-d6ffdf22f017.png` |

### Ingénierie et props

| Fichier final | Fichier source conservé |
|---|---|
| `rooms/engineering-hangar.png` | `C:\Users\chuck\.codex\generated_images\01a01e52-9788-7491-b0fc-ec4c277f25d1\exec-cc3dcf7d-5aeb-4b8f-b7cb-dcfc19ad0e6e.png` |
| `rooms/engineering-reactor.png` | `…\exec-407a2187-1570-4fc2-a7f6-828cba39c0a4.png` |
| `rooms/engineering-life-support.png` | `…\exec-525fe488-f66e-428f-a4f9-bf65da95fea0.png` |
| `rooms/engineering-sensors.png` | `…\exec-ab8b6baf-8e68-43ea-b194-14f4b72443d3.png` |
| `parallax/engineering-far.png` | `…\exec-336bf7e2-d368-4c87-abab-a001272002d4.png` |
| `props/hub-modular-props-atlas.png` | `…\exec-e39ab1c7-412c-4792-8df5-7d372ef064b2.png` |

## Prompts exacts

Les prompts intégraux, sans paraphrase, sont archivés par lot :

- [Commandement](prompts/V49_COMMAND_PROMPTS.md)
- [Habitat](prompts/V49_HABITAT_PROMPTS.md)
- [Industriel](prompts/V49_INDUSTRIAL_PROMPTS.md)
- [Ingénierie et props](prompts/V49_ENGINEERING_PROPS_PROMPTS.md)

## Traitement du master de props

ImageGen a produit un damier clair incrusté dans le PNG RGB du master. Le fichier source a été conservé intact. `scripts/process-hub-props.py` :

1. détecte le fond clair connecté aux bords ;
2. le convertit en alpha réel ;
3. normalise le master en 1024×1024 ;
4. nettoie une bande de garde autour des cellules 4×4 ;
5. exporte et recadre les 16 cellules en PNG RGBA indépendants ;
6. écrit les dimensions et ratios de transparence dans le rapport JSON.

Ce traitement ne redessine rien et n’ajoute aucun contenu visuel. Il rend seulement les sorties ImageGen exploitables séparément par le moteur.

## Statut juridique et fidélité

Les images sont des créations originales générées pour ce projet sous licence déclarée par le titulaire du dépôt. Elles reprennent une ambiance de science-fiction industrielle rétrofuturiste et les besoins de gameplay du projet, sans copier ni inclure d’asset officiel. Les marques et éléments de franchise restent la propriété de leurs ayants droit.
