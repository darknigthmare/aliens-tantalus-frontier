# Entretien FR/EN du catalogue V185

Ce lot prolonge le catalogue intégré par la PR #44, sur `main` `ec2378df98a2d9af4394536a39ed943199ddcb8a`. Il fournit un contrôle exécutable et une fusion reproductible des traductions relues. Il ne traduit pas automatiquement un nouveau contenu et ne certifie ni une traduction exhaustive, ni la fidélité artistique 1:1.

## Contrôler le catalogue courant

```sh
node scripts/i18n-catalog-maintenance-v186.mjs check
node --test scripts/verify-i18n-maintenance-v186.mjs
```

Le contrôle lit les exports versionnés de `src/i18n-en-catalog-v185.js` : 6 038 textes exacts et 437 modèles à l'état de départ. Les textes doivent être non vides et l'anglais ne peut introduire un paramètre absent du français. Une omission de paramètre déjà présente dans les modèles historiques est comptée séparément ; le contrôle ne la transforme pas en erreur ni en preuve de traduction complète.

Le lot ajoute quatre traductions exactes observées dans Système : `LIAISON FRONTIER · PROFILS` → `FRONTIER LINK · PROFILES` (`src/cloud-ui-v119.js:50`) et `PROFIL 1`, `PROFIL 2`, `PROFIL 3` → `PROFILE 1`, `PROFILE 2`, `PROFILE 3` (`src/app.js:2033`, `src/cloud-ui-v119.js:84`). Le catalogue arrive à **6 042 textes exacts et 437 modèles**. Le rapport des sept libellés relevés avant/après et la proposition sont produits par les commandes `report` et `merge` ; seule l'addition de ces quatre clés est intégrée, sans modifier les entrées existantes.

Les suffixes restent traduits séparément : `PROFIL 1 · ACTIF` devient `PROFILE 1 · ACTIVE` et `PROFIL 2 · LOCAL` devient `PROFILE 2 · LOCAL`. Le modèle générique `PROFIL {0}` n'est pas ajouté : il absorberait aussi le statut. L'omission historique signalée est le paramètre d'accord français `{2}` dans `{0} membre{1} affecté{2}{3}` ; l'anglais existant conserve le nombre et le suffixe de contexte.

## Examiner un relevé de textes observés

Créer un fichier JSON, par exemple `/tmp/textes-observes.json` :

```json
{
  "texts": [
    { "text": "A/D marcher · W/S ascenseur · E utiliser", "source": "hub : consigne observée" },
    { "text": "Rook", "source": "hub : nom du personnage" }
  ]
}
```

```sh
node scripts/i18n-catalog-maintenance-v186.mjs report /tmp/textes-observes.json
```

Le rapport passe ces seuls textes dans la couche automatique réellement utilisée par le jeu, regroupe les occurrences identiques et conserve leurs sources. `unchanged-review-needed` demande une lecture : il peut s'agir d'un nom propre, d'un terme commun aux deux langues ou d'une traduction inconnue. Ce statut n'est pas un décompte de défauts. Les traductions explicites par clés de `i18n-v185.js` et les textes peints dans les images ont un autre périmètre.

Ce relevé n'est pas un extracteur JavaScript ou HTML. Il ne prouve aucun parcours de jeu et ne découvre pas les textes qui ne lui ont pas été fournis. Pour une recette navigateur, conserver séparément le build, le parcours, la langue, les captures et les éventuelles fixtures.

## Fusionner des traductions relues

Créer un fichier JSON de revue ; les listes évitent les doublons masqués par des clés JSON répétées :

```json
{
  "format": "atf-i18n-review-v186",
  "exact": [
    { "fr": "Nouveau message à relire", "en": "New message for review", "source": "src/module.js : message concerné" }
  ],
  "patterns": [
    { "fr": "Relevé {0} · pont {1}", "en": "Deck {1} · report {0}", "source": "src/module.js : modèle concerné" }
  ]
}
```

```sh
node scripts/i18n-catalog-maintenance-v186.mjs merge /tmp/traductions-relues.json /tmp/catalogue-propose.js
```

La sortie est une proposition de module complète, triée indépendamment de la langue de la machine. La commande refuse tout fichier de sortie existant, y compris le catalogue source et les liens symboliques. Elle ne supprime aucune entrée et ne remplace jamais implicitement une traduction existante. Pour réviser une entrée, ajouter `"previous": "ancienne traduction anglaise exacte"` ; une valeur périmée est refusée. Les entrées sans changement restent admises.

Les paramètres numérotés peuvent changer d'ordre. Toute suppression doit être déclarée par `"omitSlots": [1]` dans l'entrée relue ; tout paramètre anglais inventé est refusé. Chaque entrée exige une référence `source` non vide, mais l'outil ne prétend pas vérifier cette provenance à la place du relecteur.

Comparer ensuite la proposition avec le catalogue versionné, relire les seuls changements voulus et rejouer les tests ainsi que les parcours concernés avant une intégration normale. Les entrées JSON sont traitées comme des données ; aucun fichier JavaScript fourni en entrée n'est exécuté. La fusion ne touche ni les identifiants de contenu ni les sauvegardes.

## Vérifications du lot

Les dix tests de maintenance couvrent la conservation des entrées, les conflits et revues périmées, les paramètres, les entrées mal formées, le tri déterministe et les échappements, les textes observés traduits/inchangés, ainsi que le refus d'écrasement par la CLI. Ces fixtures ne constituent pas une recette utilisateur complète du jeu en anglais.

La régression dynamique est reproduite avec le module de `ec2378d` dans Chromium : après traduction de `ACQUIS`, une nouvelle note inconnue est écrasée au retour FR. Le même scénario passe avec le correctif. Les six cas Node supplémentaires utilisent un DOM et un observateur simulés ; la recette Chromium utilise le véritable `MutationObserver`, puis le titre et le sélecteur de langue de Système avec un rechargement réel.

```sh
npm run test:i18n-v185
npm run i18n:check
# Servir le build produit par npm run build sur le port 4173, puis :
python3 -B scripts/qa-i18n-dynamic-v186.py --base http://127.0.0.1:4173 --output /tmp/cocyte-i18n-v186
```

Le rapport navigateur enregistre l'empreinte du module HTTP réellement servi, les empreintes des sources et les captures FR/EN. Les mutations de la fixture concernent seulement le DOM de test ; la recette de Système utilise ses contrôles visibles. Aucune partie n'est injectée. Les captures sont vérifiées à 1 440 pixels de large ; cela ne prouve pas la lisibilité sur mobile.

## Continuité des suivis Excel

Les suivis [V163](../forge/xeno-trials/progress-v163.json) et [V177](../arsenal/progress-v177.json) sont conservés : ce lot corrige le FR/EN et son entretien, sans modifier une cellule Excel ni accorder une clôture gameplay. Au point de départ `ec2378d`, recoupé avec les registres exécutables :

- `C165-COSTUMES` conserve 18 costumes non équipables ; `04_References_Ouvertes` conserve 129 propositions d'armes `NOT_ADMITTED`.
- `followupV179.remaining` conserve 45 rapprochements du snapshot PR9 en attente et 15 propositions du snapshot PR7 inactives. Ces états concernent les sources locales épinglées, pas l'état actuel des PR amont ; aucun alias ou accès gameplay n'est ajouté ici.
- Les sept services de `C165-ROUTES` (Rook, Tamsin, Cal, David, Inez, Maksim, Jun) gardent leurs limites d'origines, d'interruptions et de priorités. Ce nombre ne signifie pas sept routes absentes ou en échec.
- `10_Operations` conserve 21 accès jouables, dont 20 partiels et un effectif, conformément à `SPECIAL_OPERATION_COUNTS_V131`.

Les anciennes réserves et provenances sont maintenues. Les succès CI du commit de départ ne prouvent pas une homologation artistique 1:1 ni la fermeture de ces contenus.
