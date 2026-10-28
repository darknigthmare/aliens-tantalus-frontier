# Trajets de poste Rook et Tamsin — V166

Rook rejoint le CIC depuis son poste capteurs par la cabine arrière, parcourt le service CCTV avec le même corps puis rentre à son poste. Tamsin rejoint l'armurerie depuis le briefing par la cabine centrale, effectue le service du stand de tir puis revient au briefing. Les propriétaires locaux et inter-ponts se transmettent le corps existant ; aucune copie ne remplace un trajet.

Les deux services partagent les réservations de cabine avec David, Inez, Maksim et Jun. Les collègues qui dégagent un passage se déplacent depuis leur position réelle et conservent leur retour. Les sauvegardes restaurent le poste initial, les phases locales et les cabines sans créer de trajet antérieur. Un chargement directement au poste de travail reste explicitement une condition initiale locale. Les priorités de soin, mission et alerte continuent de s'appliquer.

Les portes verrouillées restent entrouvertes tant qu'un corps réel occupe leur collider sur le même pont et le même plan. Elles se ferment après son retrait. Les projections d'un autre pont, d'une annexe ou d'un conduit ne maintiennent pas une porte ouverte. Les commandes CCTV conservent leurs refus de verrouillage protégeant les itinéraires.

`npm run test:npc:station-relays:v166` couvre vingt scénarios de service, de restauration et de réservation, ainsi que cinq scénarios de portes verrouillées. Le pilote navigateur `scripts/qa-npc-station-relays-v166.py` est préparé ; ses parcours et captures restent à exécuter. La présence du code ou des tests unitaires ne clôture pas les sept trajets en recette visuelle et ne constitue pas une validation humaine ou canonique 1:1.

Ce lot conserve également les correctifs V165 postérieurs à la fusion de la PR 20 : portes occupées, panneau médical et interphone du stand dégagés de la tuyauterie et de la suspension des cibles. Le suivi cumulatif et son classeur restent en prépublication ; les preuves des commits précédents ne sont pas transférées au nouveau candidat. Forge reste différé.
