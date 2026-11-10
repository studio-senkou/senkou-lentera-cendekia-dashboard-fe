import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from analyzers import conventions


def titles(root):
    return {f['title']: f for f in conventions.analyze(root, {})}


class TestConventions(unittest.TestCase):
    def setUp(self):
        self._t = tempfile.TemporaryDirectory()
        self.root = Path(self._t.name)

    def tearDown(self):
        self._t.cleanup()

    def write(self, rel, text):
        p = self.root / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(text)

    def test_must_flag_two_classes_when_file_has_two_classes(self):
        self.write('src/lib/foo.ts', 'export class Foo {}\nclass Bar {}\n')
        self.assertIn('More than one class per file', titles(self.root))

    def test_must_not_flag_classes_when_one_class_per_file(self):
        self.write('src/lib/foo.ts', 'export class Foo {}\n')
        self.assertNotIn('More than one class per file', titles(self.root))

    def test_must_flag_two_exported_components_when_tsx_exports_two(self):
        self.write('src/a.tsx', 'export function A() {}\nexport const B = () => null\nfunction h() {}\n')
        self.assertIn('Multiple exported components per file', titles(self.root))

    def test_must_flag_test_title_when_it_does_not_start_with_must(self):
        self.write('test/a.test.ts', "it('works', () => {})\n")
        self.assertIn("Test titles do not start with 'Must '", titles(self.root))

    def test_must_flag_test_placement_when_test_is_under_src_outside_feature_test(self):
        self.write('src/utils/a.test.ts', "it('Must work', () => {})\n")
        t = titles(self.root)
        self.assertIn('Test files outside test/ folders', t)
        self.assertNotIn("Test titles do not start with 'Must '", t)


if __name__ == '__main__':
    unittest.main()
