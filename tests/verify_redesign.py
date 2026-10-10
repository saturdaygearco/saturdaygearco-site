#!/usr/bin/env python3
"""Dependency-free regression audit against the pre-redesign commit."""
from html.parser import HTMLParser
from pathlib import Path
import json, re, subprocess, sys
from urllib.parse import urlsplit, unquote
ROOT = Path(__file__).resolve().parents[1]
BASE = sys.argv[1] if len(sys.argv)>1 else '83e94dd'
class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True); self.tags=[]; self.ids=[]; self.h1=0
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        a=dict(attrs);self.tags.append((tag,a))
        if 'id' in a:self.ids.append(a['id'])
        if tag=='h1':self.h1+=1
    def values(self,tag,attr):return [a[attr] for t,a in self.tags if t==tag and attr in a]
def before(name):return subprocess.check_output(['git','show',f'{BASE}:{name}'],cwd=ROOT).decode()
def anonymous(s):return s.replace("Nicholas's","the editor's").replace('Nicholas’s','the editor’s').replace('Nicholas','Saturday Gear Co. Editor')
def main(s):return re.search(r'<main\b[^>]*>(.*?)</main>',s,re.S).group(1).replace(' tabindex="0" role="region" aria-label="Scrollable comparison table"','')
def scripts(s):return re.findall(r'<script\b([^>]*)>(.*?)</script>',s,re.S)
def seo(p):
    return [(tag,attrs) for tag,attrs in p.tags if (tag=='meta' and (attrs.get('name') in ['description','robots','impact-site-verification'] or attrs.get('property','').startswith('og:') or attrs.get('name','').startswith('twitter:'))) or (tag=='link' and attrs.get('rel')=='canonical')]
errors=[];stats={'pages':0,'articles':0,'affiliate_links':0,'internal_links':0}
def check(ok,msg):
    if not ok:errors.append(msg)
for file in sorted(ROOT.rglob('*.html')):
    name=str(file.relative_to(ROOT));old=before(name);new=file.read_text();oldp=Page(anonymous(old));p=Page(new);stats['pages']+=1
    check(p.h1==1,f'{name}: expected one H1');check(len(set(p.ids))==len(p.ids),f'{name}: duplicate IDs')
    check(seo(p)==seo(oldp),f'{name}: SEO metadata changed')
    oldschema=[json.loads(body) for attrs,body in scripts(anonymous(old)) if 'application/ld+json' in attrs]
    schema=[json.loads(body) for attrs,body in scripts(new) if 'application/ld+json' in attrs]
    check(schema==oldschema,f'{name}: structured data changed beyond editorial anonymization')
    title=lambda s:re.search(r'<title>(.*?)</title>',s,re.S).group(1)
    check(title(new)==title(anonymous(old)),f'{name}: title changed')
    oldga=[(a,b) for a,b in scripts(old) if 'googletagmanager.com' in a or "gtag(" in b]
    newga=[(a,b) for a,b in scripts(new) if 'googletagmanager.com' in a or "gtag(" in b]
    check(newga==oldga,f'{name}: GA4 code changed')
    affiliate=lambda q:[a for tag,a in q.tags if tag=='a' and re.search(r'https?://(?:[^/]+\.)?(?:amazon\.com|amzn\.to)(?:/|$)',a.get('href',''))]
    check(affiliate(p)==affiliate(oldp),f'{name}: affiliate destination, tag or attributes changed');stats['affiliate_links']+=len(affiliate(p))
    if name.startswith('guides/'):
        stats['articles']+=1;check(main(new)==main(anonymous(old)),f'{name}: article body changed beyond editorial anonymization')
    check('Nicholas' not in new,f'{name}: identifying display name remains')
    for tag,attrs in p.tags:
        for attr in ('href','src'):
            val=attrs.get(attr)
            if not val:continue
            u=urlsplit(val)
            if u.scheme or u.netloc:continue
            target=ROOT / unquote(u.path.lstrip('/')) if u.path.startswith('/') else file.parent / unquote(u.path)
            if not u.path:target=file
            if target.is_dir():target = target.with_suffix('.html') if target.with_suffix('.html').exists() else target / 'index.html'
            if not target.exists() and not target.suffix:target=target.with_suffix('.html')
            check(target.exists(),f'{name}: broken {attr}={val}')
            if tag=='a':stats['internal_links']+=1
            if u.fragment and target.exists() and target.suffix=='.html':
                check(unquote(u.fragment) in Page(target.read_text()).ids,f'{name}: missing anchor {val}')
for name in ['robots.txt','sitemap.xml','assets/affiliate-events.js','assets/affiliate-components.css','assets/beatbot-a200-pro-owner-photo.webp','assets/milwaukee-2656-20-owner.webp','assets/milwaukee-2656-20-owner-side.webp']:
    old=subprocess.check_output(['git','show',f'{BASE}:{name}'],cwd=ROOT);check((ROOT/name).read_bytes()==old,f'{name}: protected asset changed')
for css in ROOT.glob('assets/*.css'):
    for url in re.findall(r'url\(([^)]+)\)',css.read_text()):
        val=url.strip('"\'');check((css.parent/val).exists(),f'{css.name}: missing CSS asset {val}')
check((ROOT/'assets/garage/workshop-1800.webp').stat().st_size<200_000,'Hero exceeds 200 KB budget')
print(json.dumps({'base':BASE,'status':'FAIL' if errors else 'PASS',**stats,'errors':errors},indent=2))
sys.exit(bool(errors))
