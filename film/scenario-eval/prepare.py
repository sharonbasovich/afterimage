from pathlib import Path
import zipfile,hashlib,base64,json,shutil,sys
archive,work,source=map(Path,sys.argv[1:])
assert hashlib.sha256(archive.read_bytes()).hexdigest()=='2217ab5dbd452185a5c3c1509994da46b1ac20d2ebeaa888536244372ce73ebf'
with zipfile.ZipFile(archive) as z:
 for name in z.namelist():
  p=Path(name);assert not p.is_absolute() and '..' not in p.parts
 z.extractall(work)
engine=work/'scenario-kinetic-film'
film=work/'film';shutil.copytree(engine/'engine',film)
shutil.copyfile(source/'spec.js',film/'spec.js')
for name in ['verified-ui.js','mystery-scenes.js','render-config.json']:
 shutil.copyfile(source/name,film/name)
main=film/'main.js';s=main.read_text();needle='window.__ready = true;'
assert needle in s
s=s.replace(needle,"await Promise.all(spec.scenes.map(s => s[3]?.src).filter(Boolean).map(src => new Promise((resolve,reject) => { const i=new Image(); i.onload=resolve; i.onerror=reject; i.src=src; })));\n"+needle)
main.write_text(s)
# Fail closed on browser errors and encoder/renderer exit status.
r=engine/'scripts/render.mjs';s=r.read_text();assert 'process.exit(0);' in s;s=s.replace('process.exit(0);','process.exit(errs.length ? 1 : 0);');r.write_text(s)
p=engine/'scripts/post.py';s=p.read_text();old='sys.exit(0 if done == f1 - f0 else 1)';assert old in s;s=s.replace(old,'sys.exit(0 if done == f1 - f0 and ff.returncode == 0 and node.returncode == 0 else 1)');p.write_text(s)

index=film/'index.html';s=index.read_text();assert '</head>' in s;s=s.replace('</head>','<style>.note{color:var(--ink);font-size:28px;font-weight:600}</style></head>');index.write_text(s)

