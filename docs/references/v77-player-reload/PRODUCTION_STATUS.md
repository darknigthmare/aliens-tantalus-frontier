# Echo-9 — état réel de production V77

Inspection navigateur des deux PNG historiques, sans modification des sources :

- Locomotion SHA-256 : `f5b25ca6189d0a2891d1a6f60635417238d7dc52bfece7ae20a2cd9dffa21ca3`.
- Combat SHA-256 : `a0880c628fe8b4892bcbab525d7e56583f21b8e92229d75370a608ab0d370e55`.

Le casque, le pack radio, le fusil et l’insigne d’épaule diffèrent. Des fragments alpha opaques subsistent dans la locomotion, ainsi que les échelles intégrées aux dernières poses. Les captures JPEG sont uniquement des vues d’inspection ; les PNG RGBA originaux restent les références de production. Le flag historique `identityVerified` n’est pas une preuve suffisante et aucune nouvelle validation de fidélité1:1 n’est donnée.

Le prompt R1 vise8poses distinctes de rechargement normal,4colonnes×2lignes, transparence réelle, identité verrouillée sur la locomotion. L’appel au générateur OpenAI intégré avec cette référence a échoué AVANT génération : `unable to read referenced image ... apply deny-read ACLs`. Aucun fichier produit, aucune promotion runtime, aucun débit API/CLI déclenché par nous. Le changement de voie API reste en attente d’accord explicite utilisateur.

À produire et vérifier ensuite : séquences début/normal/réussi/parfait/raté/interruption, contrat par famille d’arme, contacts mains/chargeur, silhouette latérale, ancrage aux pieds, absence de fragments/halos, cohérence complète du Marine et découpage sans dépassement. Le module gameplay V77 conserve `dedicatedBranchAnimations: false` tant que ces preuves manquent.
