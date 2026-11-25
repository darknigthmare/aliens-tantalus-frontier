# Archives récupérées — Aliens: Tantalus Frontier

Cette branche `archive/local-recovery-20261125` conserve les fichiers complets qui étaient restés dans l'environnement de travail. Elle contient uniquement les archives et leurs outils de récupération.

**État de cet instantané : 2 archives enregistrées sur 16, 82 599 736 octets.** Le transfert des autres archives est encore en cours.

## Contenu

| Module | Version | Fichier d'origine | État |
| --- | --- | --- | --- |
| Alien : La Résurrection | 125 | `ALIENS_TANTALUS_DLC_ALIEN_RESURRECTION_V125.zip` | À transférer |
| AVP (2004) | 0.11.0 | `ALIENS_TANTALUS_DLC_AVP_2004_v0.11.0.zip` | Enregistrée |
| MIRE / Nostromo | 119 | `ALIENS_TANTALUS_MIRE_NOSTROMO_V119_CONTINUITE_NOSTROMO.zip` | À transférer |
| Alien: Covenant | 0.10.0 | `ALIEN_COVENANT_v0.10.0_DLC_COMPLET.zip` | À transférer |
| Alien: Earth | 11 | `ALIEN_EARTH_DLC_V11_MODULE_COMPLET.zip` | Enregistrée |
| Alien : Hors des Ombres | 0.10 | `ALIEN_HORS_DES_OMBRES_V0_10_LE_MARION_PIECE_PAR_PIECE.zip` | À transférer |
| Alien : Mer des Chagrins | 0.1.0 | `ALIEN_MER_DES_CHAGRINS_v0.1.0_DLC_AUTONOME.zip` | À transférer |
| Alien : Mer des Chagrins | 0.10.0 | `ALIEN_MER_DES_CHAGRINS_v0.10.0_DLC_AUTONOME.zip` | À transférer |
| Alien : Mer des Chagrins | 0.2.0 | `ALIEN_MER_DES_CHAGRINS_v0.2.0_DLC_AUTONOME.zip` | À transférer |
| Alien : Mer des Chagrins | 0.3.0 | `ALIEN_MER_DES_CHAGRINS_v0.3.0_DLC_AUTONOME.zip` | À transférer |
| Alien : Mer des Chagrins | 0.4.0 | `ALIEN_MER_DES_CHAGRINS_v0.4.0_DLC_AUTONOME.zip` | À transférer |
| Alien : Mer des Chagrins | 0.5.0 | `ALIEN_MER_DES_CHAGRINS_v0.5.0_DLC_AUTONOME.zip` | À transférer |
| Alien : Mer des Chagrins | 0.6.0 | `ALIEN_MER_DES_CHAGRINS_v0.6.0_DLC_AUTONOME.zip` | À transférer |
| Alien : Mer des Chagrins | 0.7.0 | `ALIEN_MER_DES_CHAGRINS_v0.7.0_DLC_AUTONOME.zip` | À transférer |
| Alien : Mer des Chagrins | 0.8.0 | `ALIEN_MER_DES_CHAGRINS_v0.8.0_DLC_AUTONOME.zip` | À transférer |
| Alien : Mer des Chagrins | 0.9.0 | `ALIEN_MER_DES_CHAGRINS_v0.9.0_DLC_AUTONOME.zip` | À transférer |

Le [manifeste](archives/local-recovery-20261125/MANIFEST.json) donne l'ordre des fragments, leurs tailles, leurs SHA-256 et leurs identifiants Git. Chaque fragment mesure au maximum 10 Mio. Le premier fragment AVP mesure 6 Mio ; l'ordre du manifeste reste la référence.

Les archives comprennent leurs sources, rapports, images et autres fichiers tels qu'ils ont été récupérés. Aucune déclaration de fidélité 1:1 ni de validation des autres DLC n'est ajoutée par leur sauvegarde.

## Récupérer les ZIP

Télécharger cette branche avec **Code → Download ZIP**, ou utiliser :

```sh
git clone --depth 1 --single-branch --branch archive/local-recovery-20261125 https://github.com/darknigthmare/aliens-tantalus-frontier.git tantalus-archives
cd tantalus-archives
python3 archives/local-recovery-20261125/reconstruct.py --verify
python3 archives/local-recovery-20261125/reconstruct.py --all --output-dir ../tantalus-zip-restaures
```

Python 3.10 ou supérieur suffit ; aucune dépendance à installer. Le programme vérifie chaque fragment et l'archive complète, refuse d'écraser un fichier existant et restaure les ZIP dans un dossier extérieur au dépôt. Il n'extrait pas leur contenu.

Pour restaurer uniquement AVP :

```sh
python3 archives/local-recovery-20261125/reconstruct.py --archive avp-2004-v0-11-0 --output-dir ../tantalus-zip-restaures
```

## Intégration jouable

Le jeu AVP v0.11, ses 30 modules, ses 145 SVG et le raccord au menu **Extensions** sont suivis dans la [PR #55](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/55). La v0.12 annoncée dans les échanges antérieurs n'a pas été retrouvée en fichiers.

Les archives des six autres modules sont sauvegardées ici ; leur raccord au moteur et aux menus est un chantier distinct, à vérifier sur les branches d'intégration correspondantes. Cette branche de conservation n'est pas la branche de déploiement du jeu.
