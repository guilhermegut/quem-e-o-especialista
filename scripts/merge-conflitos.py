# Junta as fichas de data/curated/lotes/*.json em src/data/conflitos.json (por id, na ordem da lista aprovada).
import json, glob, sys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
dst = root / 'src/data/conflitos.json'
d = json.loads(dst.read_text(encoding='utf-8'))
by = {c['id']: c for c in d['conflitos']}
for f in sorted(glob.glob(str(root / 'data/curated/lotes/*.json'))):
    for c in json.loads(pathlib.Path(f).read_text(encoding='utf-8')):
        by[c['id']] = c
ordem = [c['id'] for c in json.loads((root / 'data/curated/ordem-100.json').read_text(encoding='utf-8'))]
lst = sorted(by.values(), key=lambda c: ordem.index(c['id']) if c['id'] in ordem else 999)
d['conflitos'] = lst
dst.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(len(lst), 'conflitos')
