# Xeno Trials V211

La version part de V210 publiée et utilise le même moteur pour le mode intégré et l’édition autonome. Le suivi ci-dessous porte sur le gameplay de la bible V146.

| Fiche | Couverture en jeu |
| --- | --- |
| 05 Mouvement et défense | Runner et Prowler frappent en descente dans leur volume physique. Warrior, Runner, Prowler et Spitter peuvent chuter après une rupture de garde et raccourcir le redressement avec une nouvelle pression de garde. Le redressement garde son temps de récupération et sa vulnérabilité. Les deux mécaniques reprennent sur checkpoint. |
| 06 Signatures | Les 71 places H/O libres sont implémentées. Les 189 combattants historiques disposent de deux alternatives distinctes, soit 378 techniques H/O en plus de leurs coups L. Les projectiles ajoutés reprennent les familles de tir du moteur et leurs validations de sauvegarde. |
| 07 Supers | Les 189 combattants historiques ont un Super I et un Super II, soit 378 lignes jouables. Les 289 ajouts utilisent les contacts, la jauge et la parade natives. L’IA peut apprendre ces nouveaux supers en difficulté élevée. |
| 08 et 12 Finitions | 23 nouveaux appariements utilisent les appuis mesurés et des cibles au sol tirées des atlas existants. Une vérification visuelle de neutralisation permet de terminer les situations sans prise validée. Elle est disponible pour les 189 identités après un KO terminal admissible. Les balises d’isolement des 16 arènes de la bible peuvent fermer le secteur si les deux combattants sont à portée. Le verdict est déjà attribué lors du choix de finition. |
| 09 Présentations | Les rigs existants donnent des intros, réactions de rivalité, provocations, poses de résultat et transitions liées aux événements du moteur. Les recettes respectent les appuis et les gestes disponibles pour chaque identité. Le résultat s’affiche dès la première trame terminale et le mode peut passer la séquence. |
| 10 et 11 Arènes | Les six arènes initiales et les dix décors proposés ont chacun une salle jouable. Les 16 salles ont des réactions d’arrière-plan, des transitions et des ancrages de finition. Les dangers qui touchent les combattants dépendent des opérations qui les autorisent. |
| 14 Entraînement | 24 ateliers. Les cinq nouveaux couvrent l’interruption du super du Warden, le passage de la présentation finale, la relève entre deux vagues dont cinq ennemis à 15 PV, la frappe en descente du Runner et le redressement après une rupture. |

La portée de certains gestes dépend encore des membres et des poses effectivement établis. Les prises, les actions aériennes et les finitions de contact sont conditionnées par ces admissions. Les séquences animées à partir des rigs existants sont des adaptations du projet. Les planches dessinées, la comparaison par édition et la validation de fidélité ont leurs propres lignes dans la bible.

`npm run test:trials:v211` vérifie le moteur et les reçus V211. `npm run build:trials` produit les deux éditions, que `npm run check:built` et `npm run check:trials:built` contrôlent séparément.
