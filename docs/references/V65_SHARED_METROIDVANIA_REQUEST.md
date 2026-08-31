# Demande partagee - Master file metroidvania parfait

Source lue le 31 aout 2026 : https://chatgpt.com/share/6a952c3d-5da4-83eb-8f69-a79ba92e0696

La page publique a pu etre recuperee et ses messages decodes en lecture seule.
Les liens `sandbox:/mnt/data/KIT_METROIDVANIA_CODEX.zip` et
`sandbox:/mnt/data/METROIDVANIA_MASTER.md` renvoient a des pieces jointes de
l'ancienne conversation. Leur contenu n'est pas inclus dans le partage lu.
Ce document est un releve des consignes visibles, pas une recreation du master.

Consignes retenues : preserver le jeu, le lore et les sauvegardes ; verifier
le vrai runtime et les connexions des salles avec les capacites et ressources
disponibles ; tenir compte des evenements du monde et pertes de personnages ;
tester une boucle exploration, obstacle, acquisition, utilisation, recompense,
retour et sauvegarde ; ne pas imposer de quotas arbitraires de salles ou boss.

Premier resultat concret : le sas arriere du vaisseau pouvait se verrouiller
apres une victoire contre le boss obtenue avant le declenchement de
l'embuscade. Le correctif verifie la condition du boss avant verrouillage et
reconcilie les anciennes sauvegardes. La route superieure demeurait accessible :
il ne s'agissait pas d'un blocage integral de la mission.

Les tests de regression reproduisent la victoire par de vrais tirs depuis
l'habitation et la reprise d'un ancien verrou obsolete. Les autres salles,
costumes, personnages et animations ne sont pas declares complets par ce lot.
