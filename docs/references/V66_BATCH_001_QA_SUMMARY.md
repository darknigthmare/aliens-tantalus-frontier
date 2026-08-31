# V66 — extrait de la sortie réelle de npm run qa

31 août 2026. Code de sortie final : 0. Extrait filtré aux commandes et résultats synthétiques ; ce n'est pas une vérification navigateur.

```text
> aliens-tantalus-frontier@66.0.0 qa
> npm run inventory:v56:check && npm run sprites:v64:check && npm run sprites:v66:check && npm run art:v64:check && npm run art:v64:png && npm run art:v65:check && npm run art:v66:check && npm run batch:v66:check && npm run lint && npm test && npm run build
> aliens-tantalus-frontier@66.0.0 inventory:v56:check
> node --test tests/v55-manifest-inventory-contract.test.mjs
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 180.441
> aliens-tantalus-frontier@66.0.0 sprites:v64:check
> node scripts/sync-sprite-manifest-v64.mjs --check
Sprite manifest V64 is synchronized: 195 atlases / 2772 cells.
> aliens-tantalus-frontier@66.0.0 sprites:v66:check
> node scripts/sync-sprite-manifest-v66.mjs --check
Supplemental V65/V66 manifest synchronized: 6 atlases / 192 authored poses.
> aliens-tantalus-frontier@66.0.0 art:v64:check
> py scripts/check-sprite-alpha-v64.py
Validated 195 RGBA atlases / 2772 guarded cells; 80 black-xenomorph cells have no trapped light islands; 32 chroma cells have no green spill.
Validated V64 hybrids: 48 substantial guarded cells, balanced rows, clear seams and zero magenta spill.
> aliens-tantalus-frontier@66.0.0 art:v64:png
> py scripts/audit-png-alpha-v64.py --check --fail-on error
Audited 405 runtime PNGs for V64: 0 error(s), 13 halo review candidate(s); 248 raw master(s) excluded by rule and report synchronized.
> aliens-tantalus-frontier@66.0.0 art:v65:check
> py scripts/process-v65-facehugger-motion.py --all --check
> aliens-tantalus-frontier@66.0.0 art:v66:check
> py scripts/process-v66-enemy-batch.py --batch batch-001 --check
> aliens-tantalus-frontier@66.0.0 batch:v66:check
> node scripts/enemy-batch-production.mjs check
> aliens-tantalus-frontier@66.0.0 lint
> node scripts/lint.mjs
Syntax and safety lint passed for 217 modules.
> aliens-tantalus-frontier@66.0.0 test
> node --test tests/*.test.mjs
ℹ tests 616
ℹ suites 0
ℹ pass 616
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4463.5377
> aliens-tantalus-frontier@66.0.0 build
> node scripts/build.mjs
Built ALIENS: TANTALUS FRONTIER 66.0.0 with 3446 catalog entries.
```
