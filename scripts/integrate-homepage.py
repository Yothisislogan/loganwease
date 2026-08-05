from pathlib import Path

path = Path("index.html")
html = path.read_text(encoding="utf-8")

if 'href="working-file/"' in html:
    print("Homepage already integrated.")
    raise SystemExit(0)

replacements = [
    (
        '''          <a href="#case-files">Case files</a>
          <a href="#map">Build map</a>
          <a href="thoughts/">Thoughts</a>''',
        '''          <a href="working-file/">Live Working File</a>
          <a href="#case-files">Case files</a>
          <a href="#map">Build map</a>
          <a href="thoughts/">Thoughts</a>'''
    ),
    (
        '''          <div class="hero-actions">
            <a class="btn btn-primary" href="#case-files">Open the case files</a>
            <a class="btn" href="#contact">Start a conversation</a>
            <a class="btn btn-orange" href="bio.html">Read the bio</a>
          </div>''',
        '''          <div class="hero-actions">
            <a class="btn btn-primary" href="working-file/">Open the live Working File</a>
            <a class="btn" href="#case-files">Browse the case files</a>
            <a class="btn" href="playbooks/">Steal the playbooks</a>
            <a class="btn btn-orange" href="office-hours/">Bring me a problem</a>
          </div>'''
    ),
    (
        '''<nav class="footer-links" aria-label="Footer"><a href="#case-files">Case files</a><a href="ideas.html">Ideas</a><a href="thoughts/">Thoughts</a><a href="bio.html">Bio</a><a href="#contact">Contact</a></nav>''',
        '''<nav class="footer-links" aria-label="Footer"><a href="working-file/">Working File</a><a href="playbooks/">Playbooks</a><a href="failures/">Failure Files</a><a href="office-hours/">Office Hours</a><a href="ideas.html">Ideas</a><a href="thoughts/">Thoughts</a><a href="bio.html">Bio</a><a href="#contact">Contact</a></nav>'''
    )
]

for old, new in replacements:
    if old not in html:
        raise SystemExit(f"Expected homepage block not found:\n{old}")
    html = html.replace(old, new, 1)

path.write_text(html, encoding="utf-8")
print("Homepage navigation, hero actions, and footer integrated.")
