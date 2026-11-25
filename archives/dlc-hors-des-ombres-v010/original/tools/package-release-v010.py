"""Package V0.10 only after validating QA and document provenance.

Run from any directory with Python 3. The ZIP and its audit are placed beside
this project folder. The audit is deliberately outside the ZIP (no circular hash).
No publication, upload, installation or host-game modification is performed.
"""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = ROOT.parent / 'ALIEN_HORS_DES_OMBRES_V0_10_LE_MARION_PIECE_PAR_PIECE.zip'
AUDIT = ROOT.parent / 'ALIEN_HORS_DES_OMBRES_V0_10_AUDIT_ARCHIVE.json'


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding='utf-8'))


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def check_hash(relative: str, expected: str) -> None:
    path = ROOT / relative
    require(path.is_file() and not path.is_symlink(), f'Fichier absent ou lien: {relative}')
    require(path.resolve().is_relative_to(ROOT), f'Chemin hors dossier: {relative}')
    require(digest(path.read_bytes()) == expected, f'Empreinte différente: {relative}')


def main() -> None:
    manifest = read_json(ROOT / 'LIVRAISON.json')
    qa = read_json(ROOT / 'qa/RESULTATS_QA_V010.json')
    docs = read_json(ROOT / 'qa/document-audit-v010.json')
    require(manifest['version'] == qa['version'] == docs['version'] == '0.10.0', 'Version incohérente')
    require(qa['failed'] == docs['failed'] == 0, 'Contrôles en échec')
    require(qa['passed'] == qa['tests'] == qa['nodeTests'] + qa['browserTests'], 'Total de tests incohérent')
    require(docs['passed'] == docs['tests'], 'Audit documentaire incomplet')
    for relative, expected in docs['documentsSHA256'].items():
        check_hash(relative, expected)
    for relative, expected in qa['sourceHashes'].items():
        check_hash(relative, expected)
    for result in qa['results']:
        check_hash(result['path'], result['sha256'])
        require(result['failed'] == 0 and result['passed'] == result['tests'], result['path'])
    check_hash('JOUER_HORS_DES_OMBRES.html', manifest['standaloneSHA256'])
    require(len(qa['browserRunExitCodes']) == 9 and all(r['exit'] == 0 for r in qa['browserRunExitCodes']), 'Suites navigateur non exécutées')

    files = sorted(p for p in ROOT.rglob('*') if p.is_file() and '__pycache__' not in p.parts
                   and p.suffix != '.pyc' and p.name != 'SHA256SUMS.txt')
    require(not any(p.is_symlink() for p in files), 'Lien symbolique non autorisé')
    require(not any(p.suffix.lower() in {'.ttf', '.otf', '.woff', '.woff2'} for p in files), 'Police externe non distribuable')
    hashes = {p.relative_to(ROOT).as_posix(): digest(p.read_bytes()) for p in files}
    sums = ROOT / 'SHA256SUMS.txt'
    sums.write_text(''.join(f'{sha}  {rel}\n' for rel, sha in hashes.items()), encoding='utf-8')
    all_files = files + [sums]
    temporary = ARCHIVE.with_suffix('.zip.tmp')
    try:
        with zipfile.ZipFile(temporary, 'w', zipfile.ZIP_DEFLATED, compresslevel=7) as archive:
            for path in all_files:
                archive.write(path, ROOT.name + '/' + path.relative_to(ROOT).as_posix())
        with zipfile.ZipFile(temporary) as archive:
            require(archive.testzip() is None, 'CRC incorrect')
            names = archive.namelist()
            require(len(names) == len(set(names)) == len(all_files), 'Entrées ZIP incohérentes')
            require(all('..' not in Path(n).parts and n.startswith(ROOT.name + '/') for n in names), 'Chemin ZIP non sûr')
            for relative, expected in hashes.items():
                require(digest(archive.read(ROOT.name + '/' + relative)) == expected, f'Contenu ZIP différent: {relative}')
            require(archive.read(ROOT.name + '/SHA256SUMS.txt') == sums.read_bytes(), 'Index ZIP incorrect')
        os.replace(temporary, ARCHIVE)
    finally:
        if temporary.exists():
            temporary.unlink()

    result = {
        'version': '0.10.0', 'archive': ARCHIVE.name,
        'bytes': ARCHIVE.stat().st_size, 'sha256': digest(ARCHIVE.read_bytes()),
        'files': len(all_files), 'indexedSHA256Files': len(hashes),
        'zipCRCVerified': True, 'allIndexedHashesVerified': True,
        'sourceHashesMatchQA': True, 'documentHashesMatchAudit': True,
        'duplicatesOrTraversalPaths': False,
        'gameplayChecks': qa['tests'], 'nodeChecks': qa['nodeTests'],
        'chromiumChecks': qa['browserTests'], 'documentChecksSeparate': docs['passed'],
        'screenshots': manifest['counts']['screenshots'],
        'illustratedReportScreenshots': manifest['counts']['reviewScreenshots'],
        'legacySnapshots': qa['legacySnapshots'],
        'nativeBrowserNavigationCertified': False, 'nativeBrowserPersistenceCertified': False,
        'fidelityOneToOneCertified': False, 'fullNovelRead': False,
        'nativeHostMerged': False, 'githubPush': False, 'vercelDeploy': False,
        'auditOutsideArchive': True,
    }
    AUDIT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
