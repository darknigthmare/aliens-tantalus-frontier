# Xeno Trials V220

Cette version avance les chantiers jouables de la [Bible V146](xeno-trials-plan-v146.json) depuis la V219. Le jeu de base et l’édition autonome partagent ces mécaniques.

| Fiches | Ajouts en jeu |
| --- | --- |
| 05 et 12 · Prises | 42 appariements au sol pour le Garde synthétique, le Combat Synth, l’Enforcer et les Combat Synth acide, cryo et albinos. Les contacts, la garde, la libération et la reprise conservent les paramètres propres à chaque appariement. |
| 06 et 14 · Contre-jeu | En difficile, Spitter peut payer 14 d’endurance pour sortir de portée d’une lourde observée. Synth Guard maintient sa garde en reculant et s’arrête hors de portée. Il bloque sur place si la distance ou le temps manque. |
| 09 · Sortie après victoire | Warrior, Runner et Spitter rejoignent le bord du cadre après la présentation du verdict. Les huit images de marche de leur atlas sont cadencées par la distance parcourue. Le mouvement et l’orientation restent visuels. Les commandes de pause, de passage et de mouvements réduits restent disponibles. |
| 09 · Chutes après KO | Chrysalis, Smasher, Xeno-Brute, Synth Trooper et Synth Guard utilisent leurs dessins de chute et de pose au sol après un KO aérien. Le Warden d’AFE2 les utilise en cas de double KO aérien. Defender et Crusher ACM replient leur silhouette sur place après un KO au sol. |
| 10 et 11 · Sas d’extraction | **Dernière relève** enchaîne quatre vagues et 19 ennemis de 15 à 21 PV. **Couloir de relève** ouvre trois postes pendant les pauses d’une seconde entre les vagues. Une vague entrante coupe la charge partielle. Après la quatrième vague, les postes manqués restent récupérables. La reprise conserve la fenêtre et la charge. |
| 13 · Sprite d’action | L’Arachnoid gris affiche la pose dessinée de son bond horizontal pendant les ticks actifs du spécial au sol. L’admission est liée à l’identité grise, au PNG d’origine V206 et à la fenêtre de contact du moteur. |
| 14 · Entraînement | 41 ateliers. Les trois nouveaux couvrent le blocage d’une saisie frontale, le changement de garde contre le Runner en difficile et la reprise d’un relais contesté. |
| Édition autonome | Le cache hors connexion contient les ressources de la sélection initiale, dont Defender. Quand un visuel requis manque, le menu Pause se ferme et le duel sauvegardé reste accessible par le bouton de reprise. |

## Relevé de l’Automated Power Loader · fiche 17

La version de référence interne est Xeno Trials V220, profil `pose-v116-automated-powerloader`, combattant `synth-automated-powerloader`. Le châssis industriel s’inspire du P-5000. Le torse fermé à capteurs remplace le poste de conduite et l’autonomie appartient à cette conversion de Tantalus Frontier. La planche source de 1 226 × 1 283 px présente le profil gauche. Le rendu reflète cette planche pour jouer dans l’autre direction. Les bornes alpha à seuil 8 sont `[12, 15, 1217, 1243]` et le pivot de sol est `(840, 1243)` en pixels. [Registre du modèle](../../../src/enemy-automaton-adaptations-v116.js) · [Planche du projet](../../../assets/openai/sprites/static-automaton-v116/automated-powerloader.png)

| Action observée | Entrée | Contact | Retour des commandes |
| --- | ---: | ---: | ---: |
| Spécial principal, charge `ram` | 74 | 108 | 189 |
| Balayage industriel | 74 | 112 | 201 |
| Poussée de châssis | 74 | 107 | 196 |

Les relevés viennent de trois duels locaux à 120 Hz contre Warrior immobile, graine 220, avec une approche de 73 ticks jusqu’à une distance de corps à corps inférieure ou égale à 42 unités. Le chargeur parcourt 14 unités en douze ticks de marche. La commande de saut suivante déclenche un franchissement au sol. La fermeture de pince propre à la première signature, les vues de face et de dos et le dessin de chute restent à produire. [Signatures](../../../src/xeno-trials-signature-kit-v208.js) · [Franchissement](../../../src/xeno-trials-movement-v210.js)

Les autres appariements de finition, les planches de mouvement par identité et les comparaisons externes par incarnation et édition restent ouverts. `npm run test:trials:v220` vérifie les nouveaux parcours moteur. Les recettes de distribution sont `npm run build:trials`, `npm run check:built` et `npm run check:trials:built`.
