# Removes saved "background" values from the Purelane sections on the home page
# and footer group, so they show the shared page backdrop.
import json, re, sys
for path in ['templates/index.json', 'sections/footer-group.json']:
    try:
        raw = open(path).read()
    except FileNotFoundError:
        continue
    body = re.sub(r'^\s*/\*.*?\*/', '', raw, count=1, flags=re.S)
    data = json.loads(body)
    n = 0
    for sec in data.get('sections', {}).values():
        if sec.get('type', '').startswith('purelane-') and 'background' in sec.get('settings', {}):
            del sec['settings']['background']; n += 1
    open(path, 'w').write(json.dumps(data, indent=2) + '\n')
    print(f'{path}: cleared {n}')
