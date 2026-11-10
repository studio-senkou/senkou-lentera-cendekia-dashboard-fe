"""
Conventions Analyzer: code-style rules (one class per file, naming, component
exports, type placement) and test conventions (titles, placement, coverage).
"""

import re
from pathlib import Path
from typing import Dict, List

TEST_RE = re.compile(r'\.(test|spec)\.tsx?$')
CLASS_RE = re.compile(r'^(?:export\s+(?:default\s+)?)?(?:abstract\s+)?class\s+([A-Za-z_]\w*)', re.M)
METHOD_RE = re.compile(r'^\s+(?:(?:public|private|protected|static|async|readonly)\s+)*([a-z][A-Za-z0-9]*)\s*[(<]')
SKIP_METHODS = {'constructor', 'if', 'for', 'while', 'switch', 'catch', 'return', 'function'}
COMP_RE = re.compile(
    r'^export\s+(?:default\s+)?function\s+([A-Z]\w*)'
    r'|^export\s+const\s+([A-Z]\w*)\s*(?::[^=]+)?=\s*(?:\(|memo\(|forwardRef\()', re.M)
TYPE_EXPORT_RE = re.compile(r'^export\s+(?:declare\s+)?(?:type|interface)\s+\w+', re.M)
RUNTIME_EXPORT_RE = re.compile(r'^export\s+(?:default\s+)?(?:async\s+)?(?:const|let|var|function|class|enum)\b', re.M)
TITLE_RE = re.compile(r'''\b(it|test)(?:\.\w+)?\s*\(\s*(['"`])(.*?)\2''')
DESC_RE = re.compile(r'''\bdescribe(?:\.\w+)?\s*\(\s*(['"`])(.*?)\1''')


def _rel(p: Path, root: Path) -> str:
    return p.relative_to(root).as_posix()


def _is_test(p: Path) -> bool:
    return bool(TEST_RE.search(p.name))


def _source_files(src: Path) -> List[Path]:
    out = []
    for p in list(src.rglob('*.ts')) + list(src.rglob('*.tsx')):
        parts = p.relative_to(src).parts
        if 'node_modules' in parts or parts[:2] == ('components', 'ui'):
            continue
        if p.name.endswith(('.gen.ts', '.d.ts')) or _is_test(p):
            continue
        out.append(p)
    return sorted(out)


def _read(p: Path) -> str:
    try:
        return p.read_text(errors='ignore')
    except OSError:
        return ''


def _finding(severity, category, title, current, target, steps, effort, files):
    more = f' (+{len(files) - 20} more)' if len(files) > 20 else ''
    return {
        'severity': severity, 'category': category, 'title': title,
        'current_state': f'{len(files)} file(s): ' + ', '.join(files[:20]) + more,
        'target_state': target, 'migration_steps': steps, 'effort': effort,
        'files': files[:20], 'total_count': len(files),
    }


def _kebab_tokens(s: str) -> List[str]:
    return [t.lower() for t in re.findall(r'[A-Z]+(?![a-z])|[A-Z]?[a-z0-9]+', s)]


def _class_bodies(text: str):
    """Yield (start, end) line ranges of class bodies by brace counting."""
    lines = text.split('\n')
    i = 0
    while i < len(lines):
        if CLASS_RE.match(lines[i]):
            depth, j, started = 0, i, False
            while j < len(lines):
                depth += lines[j].count('{') - lines[j].count('}')
                started = started or '{' in lines[j]
                if started and depth <= 0:
                    break
                j += 1
            yield lines[i:j + 1]
            i = j
        i += 1


def _check_source(root: Path, src: Path) -> List[Dict]:
    multi, naming, longm, multicomp, types = [], [], [], [], []
    for p in _source_files(src):
        text, rel = _read(p), _rel(p, root)
        classes = CLASS_RE.findall(text)
        if len(classes) > 1:
            multi.append(rel)
        if classes:
            stem_tokens = {t for w in re.split(r'[-.]', re.sub(r'\.tsx?$', '', p.name)) for t in _kebab_tokens(w) or [w.lower()]}
            cls_lower = classes[0].lower()
            if not any(t in cls_lower for t in stem_tokens if t):
                naming.append(rel)
            for body in _class_bodies(text):
                hit = False
                for line in body[1:]:
                    m = METHOD_RE.match(line)
                    if m and m.group(1) not in SKIP_METHODS and len(_kebab_tokens(m.group(1))) > 3:
                        hit = True
                        break
                if hit:
                    longm.append(rel)
                    break
        if p.suffix == '.tsx':
            comps = {a or b for a, b in COMP_RE.findall(text)}
            if len(comps) > 1:
                multicomp.append(rel)
        if len(TYPE_EXPORT_RE.findall(text)) >= 5 and RUNTIME_EXPORT_RE.search(text):
            types.append(rel)

    out = []
    if multi:
        out.append(_finding('medium', 'conventions', 'More than one class per file', '',
                            'One class per file', ['Move each class into its own file'], 'low', multi))
    if naming:
        out.append(_finding('low', 'conventions', 'Class file name does not match class name', '',
                            'File name is kebab-case of the class name (or a prefix of it)',
                            ['Rename file to kebab-case of the class name'], 'low', naming))
    if longm:
        out.append(_finding('low', 'conventions', 'Long method names in classes', '',
                            'Method names are short verbs describing object behavior, e.g. connect, download, build (max 3 words)',
                            ['Rename methods with more than 3 camelCase words'], 'low', longm))
    if multicomp:
        out.append(_finding('medium', 'conventions', 'Multiple exported components per file', '',
                            'One exported component per .tsx (small non-exported helpers allowed)',
                            ['Split exported components into separate files'], 'low', multicomp))
    if types:
        out.append(_finding('low', 'conventions', 'Types mixed with runtime code', '',
                            'Move types to types/index.d.ts or <lib>.d.ts',
                            ['Extract exported types/interfaces into a .d.ts file'], 'low', types))
    return out


def _test_files(root: Path) -> List[Path]:
    seen = set()
    for pat in ('test/**/*.test.ts', 'test/**/*.test.tsx', 'src/**/*.test.ts', 'src/**/*.test.tsx'):
        seen.update(p for p in root.glob(pat) if 'node_modules' not in p.parts)
    return sorted(seen)


def _check_tests(root: Path) -> List[Dict]:
    bad_it, bad_desc, misplaced = [], [], []
    for p in _test_files(root):
        rel = _rel(p, root)
        text = _read(p)
        if rel.startswith('src/') and not re.match(r'src/features/[^/]+/test/', rel):
            misplaced.append(rel)
        if any(not m.group(3).startswith('Must ') for m in TITLE_RE.finditer(text)):
            bad_it.append(rel)
        for m in DESC_RE.finditer(text):
            t = m.group(2)
            if ' ' not in t and re.match(r'^[A-Za-z_]\w*$', t) or '(' in t:
                bad_desc.append(rel)
                break
    out = []
    if bad_it:
        out.append(_finding('medium', 'testing', "Test titles do not start with 'Must '", '',
                            "it()/test() titles start with 'Must ', e.g. it('Must flag X when Y')",
                            ["Rename titles to start with 'Must '"], 'low', bad_it))
    if bad_desc:
        out.append(_finding('low', 'testing', 'describe() titles look like code identifiers', '',
                            'describe() titles are plain-language phrases',
                            ['Rewrite describe titles as readable sentences'], 'low', bad_desc))
    if misplaced:
        out.append(_finding('low', 'testing', 'Test files outside test/ folders', '',
                            'Tests live in test/ or src/features/<feature>/test/',
                            ['Move test files into the proper test folder'], 'low', misplaced))

    tested = {TEST_RE.sub('', p.name) for p in _test_files(root)}
    cands = set()
    for pat in ('src/utils/*.ts', 'src/lib/**/*.ts', 'src/hooks/*.ts', 'src/stores/*.ts',
                'src/services/*.ts', 'src/features/*/utils/*.ts', 'src/features/*/schema/*.ts',
                'src/features/*/schemas/*.ts'):
        cands.update(root.glob(pat))
    untested = []
    for p in sorted(cands):
        n = p.name
        if n == 'index.ts' or n.endswith(('.d.ts', '.types.ts', '.gen.ts')) or _is_test(p):
            continue
        if p.stem not in tested and re.sub(r'\.ts$', '', n) not in tested:
            untested.append(_rel(p, root))
    if untested:
        out.append(_finding('low', 'testing', 'Logic files without a test', '',
                            'Each utils/lib/hooks/stores/services/schema file has a <stem>.test.ts(x)',
                            ['Add a test file for each listed module'], 'medium', untested))
    return out


def analyze(codebase_path: Path, metadata: Dict) -> List[Dict]:
    findings = []
    src = codebase_path / 'src'
    if src.exists():
        findings.extend(_check_source(codebase_path, src))
    findings.extend(_check_tests(codebase_path))
    return findings
