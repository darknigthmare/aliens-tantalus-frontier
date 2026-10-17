# Xeno Trials V148 — cinq supers pilotes

Base de cette continuation : `a0fa13ba426d53cc2794ddab666bfec9bc7882e8`.
PR nº 9, branche `fix/audit-hardening-v143`. Aucune fusion sur main.
Version applicative 143.0.0, sauvegardes 52, dépendances inchangées.

## Réalisé

Les cinq signatures V147 sont conservées. Cinq supers distincts sont raccordés
au moteur, à ses contrôles, au HUD HTML/canvas et à l'IA. Leur sélection exige
l'identifiant ET le profil du combattant ; aucune transmission à une variante
albino, blindée, à un homonyme ou à la famille entière.

| Combattant | Super original | Fonctionnement et réponse possible |
|---|---|---|
| Pathogen Brute | Percussions en chaîne | Trois paires d'ondes rasantes, trois groupes indépendants. Sauter chaque front ou interrompre la préparation. |
| Pathogen Queen | Saturation corrosive | Deux grappes de trois projectiles. Visée relevée au départ ; aucun suivi ultérieur. |
| Warden AFE2 | Barrage de contrôle | Deux tirs sur la ligne préparée ; anticipation interruptible. |
| Exploder AFE2 | Rupture totale | Ruée puis explosion élargie. Sacrifice effectif même sur un échec ; double KO possible. |
| Harbinger AFE2 | Bond d'assaut | Un bond physique engagé, direction verrouillée, un seul contact accepté. |

Les 184 autres identités gardent leurs contrats light/heavy/special et n'ont pas
un super arbitraire. Les commandes sont J/K/L pour les attaques existantes,
I pour le super, ou son bouton tactile/clavier. Le bouton et la jauge sont masqués
pour une identité non prise en charge. Les compteurs restent dans le HUD existant.

## Transaction de jauge

- Maximum 100, départ à 0. Aucun gain par temps, animation, raté ou overkill.
- Contact ordinaire : dégâts réellement perdus × 0,6 pour l'attaquant ; × 0,2
  si la garde réussit. Réception : dégâts effectifs × 0,4 pour la victime compatible.
- Le super ne recharge pas son auteur avec ses propres impacts. La victime peut gagner de la jauge.
- Acceptation : 100 de jauge et 48 d'endurance, une seule fois au départ.
  Rejet : aucune dépense. Interruption : pas de remboursement.
- Cooldown de 3 secondes partagé avec le spécial normal. Les règles sans spécial
  et le verrouillage initial s'appliquent aussi aux supers.
- La jauge reste entre manches du même match, mais pas dans les profils et pas
  dans un nouveau match. Les projectiles sont purgés aux transitions.
- Pause, sol, endurance, garde, stun, préparation et résultat sont des barrières
  communes à l'IA, au clavier et aux boutons. Une touche maintenue n'est pas une
  nouvelle pression quand un verrou expire ou que la jauge devient disponible.

## Références et limite de fidélité

Les gestes de base suivants sont documentés par Cold Iron Studios :

- Pathogen Brute, impacts au sol et ondes ; Pathogen Queen, projectiles acides groupés :
  https://www.aliensfireteamelite.com/en/community/pathogen-deep-dive-an-exhilarating-new-story/
- Warden, acide à distance et renversement ; Exploder, détonation de proximité ;
  Harbinger, bond renversant (orthographié HARBRINGER dans le dossier) :
  https://steamcommunity.com/app/3448650/allnews/

Pages consultées le 17 octobre 2026. **Les cinq supers, leurs noms, nombres de salves,
timings, dégâts et trajectoires 2D sont des créations de la simulation**. Ces pages
ne prouvent ni un super canonique, ni des durées relevées frame par frame.
Aucun nouveau clip de personnage, aucune fatalité, intro/outro ou pose de manche
articulée n'est livré ici. Les visuels actuels restent des poses fixes dédiées.
Les effets physiques ne sont pas présentés comme des animations 1:1. Zéro kit certifié.

## Correctifs et recette

Le banc V147 appelait `BrowserContext.emulate_media`, méthode inexistante :
correction vers `page.emulate_media`, sans supprimer le contrôle de mouvement réduit.
Référence : https://playwright.dev/python/docs/emulation

Les contacts sur une cible déjà à zéro PV ne fabriquent plus de hits supplémentaires.
La fonction pure de passage de manche refuse désormais une transition en pause.
Les fenêtres actives, les groupes de projectiles et le coût partagé sont testés.

`npm run test:trials:supers` exécute 58 cas moteur/UI plus un contrôle documentaire.
Les cas de limites utilisent des fixtures explicites d'état : ce ne sont pas des
parties parcourues manuellement. Un autre cas fait combattre chaque IA avec sa jauge
initiale nulle, sans modifier santé, ressources ou temps, jusqu'à son super.

Le parcours Chromium existant des cinq signatures est étendu : le Warden doit gagner
sa jauge contre un joueur immobile, émettre un super réel et afficher sa dépense.
Aucune jauge, santé, horloge, position ni résultat n'y est injecté. Les résultats
complets sont rapportés par commit dans la PR, pas garantis par ce document.

## Suivi Excel

`XENO_TRIALS_SUIVI_V148.xlsx` accompagne ce lot. Sept feuilles : tableau de bord,
supers, les 189 IDs, règles, sources, 35 lots artistiques pilotes ouverts et recette.
Les six compteurs du tableau sont calculés. Le JSON `progress-v148.json` épingle
l'empreinte du fichier et les profils, sans déclarer les lots complets terminés.
Les fichiers V146 et V147 sont des snapshots inchangés. Ces documents sont admis
par noms exacts dans les sources et exclus du paquet distribué au navigateur.

Suite : captures de référence et rigs articulés, attaques ordinaires complètes,
intros/outros et poses R1 réversibles, puis finitions terminales compatibles avec
l'anatomie et sans second paiement. Ce lot ne clôt pas ces travaux.
