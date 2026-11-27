# Preuves V3

summary-v3.json est le bilan actuel. Les trois suites socle V1/V2 et lanceur sont réellement réexécutées ; les données de référence historiques sont gelées dans tests/fixtures. Les anciens fichiers fixture_*.json et v2_*.json sont des entrées de migration ou des checkpoints des tests, pas des livraisons concurrentes.

v3_*.json : checkpoints du parcours automatique Récit à ennemis actifs. campaign-v3-story-results.json et campaign-v3-normal-results.json décrivent séparément les deux modes. Leurs conditions n’incluent aucune invulnérabilité, injection de ressource, déplacement direct de Ripley ni drapeau de quête ajouté. Le pilote connaît la géométrie, les positions et la solution.

v3atlas : 42 rendus de pièces. v3screens : captures d’interface et de situations préparées. contactsheet-v3.jpg est un montage des 42 rendus, pas une capture supplémentaire. Les images avancées sont des états préparés, pas un parcours manuel.

browser-v3-*-results.json : sept phases isolées de Chromium ; browser-v3-results.json fusionne les assertions répétées sans les compter plusieurs fois. Stockage simulé explicitement, refus natif testé séparément ; aucune restriction de navigation désactivée.
