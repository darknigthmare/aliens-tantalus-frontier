# Abomination 039 — revue de production idle

- Source active : `assets/openai/sprites/frames/v66/batch-003/enemy-039-abomination/idle.png`, 1774 × 887, ratio 2:1 exact, RGBA opaque, SHA-256 `0cea773831438d31343e338f5341b0293b0908b65a190bd02dc94326ff3c423e`.
- Capture ImageGen retenue : `rejected/derived/idle-r3-imagegen-raw-selected.png`, 1 804 698 octets, SHA-256 `ebe65479d2411ed6f3799d61d191ae782166d38d1a5cc58bf7ff3fd9843196d3`.
- Réparation déterministe : 1 186 866 pixels du matte magenta haute-chroma ont été normalisés en `#FF00FF` opaque, puis les huit sujets ont été translatés losslessly sur le support local `y=428`; aucun pixel de premier plan n'a été recoloré, redessiné, mis à l'échelle ou supprimé.
- Grille : huit cellules 4 × 2, huit silhouettes non vides, aucun premier plan ne touche une limite de cellule. Les bornes locales restent entre 211–225 px de large et 305–307 px de haut.
- Orientation : profil droit nettement corrigé par rapport au premier candidat frontal; tête, thorax, bassin et pieds lisent vers la droite.
- Identité : petite tête enchâssée, masse très basse et large, deux jambes, deux bras hypertrophiés et deux excroissances-poings, aucune queue ni équipement.
- Réserve visuelle bloquante pour acceptation finale : le bras éloigné est fortement occulté par le bras proche dans plusieurs poses. La seconde excroissance reste visible, mais la continuité épaule-coude-poing éloignée n'est pas toujours prouvable sans ambiguïté.
- Rejets non persistés : les tentatives 1 et 2 ont été refusées ou perdues avant écriture à cause du pont local ImageGen; cette lacune de provenance est explicitement consignée dans `idle.production-event.json` et ne doit pas être transformée en faux fichier.
- Statut : candidat source local uniquement, `accepted=false`, `runtimeIntegrated=false`, `canonExact=false`.
- L'arrêt espace disque intermédiaire a été respecté; la production a repris uniquement après autorisation explicite du root et contrôle du seuil avant chaque nouvel appel.
