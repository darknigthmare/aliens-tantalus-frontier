# Audit Excel ↔ runtime V61

Source locale auditée, volontairement non publiée : .tmp/Alien_Franchise_Encyclopedie_Exhaustive.xlsx

SHA-256 : 2A82ACA78FDAD882D913F93833CA9A1CC50E9195AAAD0478A4D8B6D0B1EA420B

Le dépôt public conserve uniquement ce hash, les comptes vérifiés et le pont d’identifiants. Le classeur brut n’est inclus ni dans le build ni dans le cache PWA.

## Portée vérifiée

- 19 feuilles ;
- 2 363 entités dans l’index global ;
- 2 929 lignes thématiques hors index global ;
- 355 armes, 363 équipements, 344 véhicules, 514 lieux et 434 humains détaillés ;
- 191 plaquettes runtime, 2 708 cellules, 191 sources et 191 normalisés présents, soit 382 chemins raw/normalisés.

Les compteurs de continuité mis en cache dans le Dashboard du classeur valent à tort zéro. Les formules existent, mais leurs caches ne peuvent pas servir de preuve. Les ratios de l’onglet d’audit mélangent aussi des périmètres différents et ne prouvent pas une exhaustivité de production.

## Quatorze gaps d’armes suivis, dont neuf fermés en V61

| Runtime | Excel | Statut V61 |
|---|---|---|
| M39 Submachine Gun | ARM-0027 | plaque 4 × 4 dédiée, runtime prêt |
| M42A Scope Rifle | ARM-0039 | plaque 4 × 4 dédiée, reconstruction de référence documentée, runtime prêt |
| M6B Rocket Launcher | ARM-0026 | plaque 4 × 4 dédiée, runtime prêt |
| M83 SADAR | ARM-0022 | plaque 4 × 4 dédiée, runtime prêt |
| M5 RPG | ARM-0025 | plaque 4 × 4 dédiée, runtime prêt |
| M94 Impact Grenade | ARM-0031 | plaque 4 × 4 dédiée, runtime prêt |
| F44AA Pulse Rifle | ARM-0072 / ARM-0073 | plaque 4 × 4 dédiée, runtime prêt |
| Type 88 Heavy Assault Rifle | ARM-0104 | plaque 4 × 4 dédiée, adaptation de référence documentée, runtime prêt |
| AK-4047 Pulse Rifle | ARM-0156 | alias de nom lié, plaque 4 × 4 dédiée, runtime prêt |
| Harpoon Gun | ARM-0053 | lié, art requis |
| Heavy Pulse Rifle | ARM-0006 / ARM-0273 / ARM-0292 | candidat ambigu, bloqué |
| Plasma Rifle | ARM-0130 / 0159 / 0160 / 0216 / 0246 | candidat ambigu, bloqué |
| ES-4 Electroshock Pistol | aucune ligne exacte | bloqué |
| Compound Bow | aucune ligne exacte | bloqué |

Le module src/excel-content-bridge-v61.js rend cette distinction exécutable. M39, M42A, M6B, M83 SADAR, M5 RPG, M94, F44AA, Type 88 et AK-4047 sont désormais équipables avec leurs propres visuels ; l’armurerie continue de désactiver la Harpoon Gun et les quatre familles ambiguës ou absentes au lieu de proposer un équipement invisible.

## Trois châssis bloqués

- M570 Series APC : absent du classeur sous ce nom.
- M292 Self-Propelled Artillery : VEH-0242, mais vues insuffisantes pour une animation exacte.
- AD-19D Bearcat : seul VEH-0206 AD-19/4 Bearcat existe ; la variante ne correspond pas.

Le gate V60 reste actif sur les 24 variantes générées de ces trois bases.

## Catalogues Excel sans registre de premier niveau

Races, rituels, perceptions, flore et personnages canon ne possèdent pas encore de registre gameplay dédié. Les 514 lieux doivent être modélisés comme une hiérarchie monde → site → niveau → salle, pas convertis en 514 mondes. Ce manque reste explicite ; les 800 seeds et 436 campagnes ne sont pas utilisés comme faux équivalent.
