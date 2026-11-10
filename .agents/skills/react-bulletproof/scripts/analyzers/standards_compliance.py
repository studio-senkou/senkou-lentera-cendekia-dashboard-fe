"""
Standards Compliance Analyzer

Analyzes project standards:
- ESLint configuration
- TypeScript strict mode
- Prettier setup
- Git hooks (Husky)
- Naming conventions
"""

from pathlib import Path
from typing import Dict, List
import json


def analyze(codebase_path: Path, metadata: Dict) -> List[Dict]:
    """Analyze standards compliance."""
    findings = []
    tech_stack = metadata.get('tech_stack', {})

    # Check linter (oxlint or eslint)
    oxlintrc = codebase_path / '.oxlintrc.json'
    lint_names = ['.oxlintrc.json', 'oxlint.json', '.eslintrc', '.eslintrc.js', '.eslintrc.cjs',
                  '.eslintrc.json', '.eslintrc.yml', '.eslintrc.yaml']
    lint_names += [f'eslint.config.{e}' for e in ('js', 'mjs', 'cjs', 'ts')]
    if not any((codebase_path / n).exists() for n in lint_names):
        findings.append({
            'severity': 'high',
            'category': 'standards',
            'title': 'No linter configuration',
            'current_state': 'No oxlint or eslint config found',
            'target_state': 'Use oxlint with plugins react/typescript/unicorn/import and categories.correctness: error',
            'migration_steps': [
                'Install oxlint',
                'Create .oxlintrc.json with plugins react, typescript, unicorn, import',
                'Set "categories": {"correctness": "error"}',
                'Add lint script to package.json',
                'Fix existing violations'
            ],
            'effort': 'low',
        })

    if oxlintrc.exists():
        try:
            correctness = json.loads(oxlintrc.read_text()).get('categories', {}).get('correctness')
        except Exception:
            correctness = None
        if correctness != 'error':
            findings.append({
                'severity': 'medium',
                'category': 'standards',
                'title': 'oxlint correctness category not set to error',
                'current_state': f'categories.correctness = {correctness!r}',
                'target_state': '"categories": {"correctness": "error"}',
                'migration_steps': ['Set categories.correctness to "error" in .oxlintrc.json',
                                    'Fix resulting violations'],
                'effort': 'low',
                'file': '.oxlintrc.json',
            })

    # Check Prettier config contents
    prettier_files = [p for n in ('prettier.config.js', '.prettierrc')
                      for p in [codebase_path / n] if p.exists()]
    prettier_files += list(codebase_path.glob('.prettierrc.*'))
    if prettier_files:
        text = prettier_files[0].read_text(errors='ignore')
        norm = text.replace('"', "'").replace(' ', '')
        wanted = ["semi:false", "singleQuote:true", "trailingComma:'all'", "printWidth:80"]
        missing = [w for w in wanted if w not in norm]
        if missing:
            findings.append({
                'severity': 'low',
                'category': 'standards',
                'title': 'Prettier config deviates from standard',
                'current_state': f'{prettier_files[0].name} missing: {", ".join(missing)}',
                'target_state': 'semi: false, singleQuote: true, trailingComma: \'all\', printWidth: 80',
                'migration_steps': ['Update prettier config with the standard options',
                                    'Run prettier --write on the codebase'],
                'effort': 'low',
                'file': prettier_files[0].name,
            })

    # Check TypeScript strict mode
    tsconfig = codebase_path / 'tsconfig.json'
    if tsconfig.exists():
        try:
            with open(tsconfig, 'r') as f:
                config = json.load(f)
                strict = config.get('compilerOptions', {}).get('strict', False)
                if not strict:
                    findings.append({
                        'severity': 'high',
                        'category': 'standards',
                        'title': 'TypeScript strict mode disabled',
                        'current_state': 'strict: false in tsconfig.json',
                        'target_state': 'Enable strict mode for better type safety',
                        'migration_steps': [
                            'Set "strict": true in compilerOptions',
                            'Fix type errors incrementally',
                            'Add explicit return types',
                            'Remove any types'
                        ],
                        'effort': 'high',
                    })
        except:
            pass

    # Check Prettier
    if not tech_stack.get('prettier'):
        findings.append({
            'severity': 'low',
            'category': 'standards',
            'title': 'No Prettier detected',
            'current_state': 'Prettier not in dependencies',
            'target_state': 'Use Prettier for consistent code formatting',
            'migration_steps': [
                'Install prettier',
                'Create .prettierrc configuration',
                'Enable "format on save" in IDE',
                'Run prettier on all files'
            ],
            'effort': 'low',
        })

    # Check Husky
    if not tech_stack.get('husky'):
        findings.append({
            'severity': 'low',
            'category': 'standards',
            'title': 'No git hooks (Husky) detected',
            'current_state': 'No pre-commit hooks',
            'target_state': 'Use Husky for pre-commit linting and testing',
            'migration_steps': [
                'Install husky and lint-staged',
                'Set up pre-commit hook',
                'Run lint and type-check before commits',
                'Prevent bad code from entering repo'
            ],
            'effort': 'low',
        })

    return findings
