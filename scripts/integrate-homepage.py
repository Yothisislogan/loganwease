from pathlib import Path

changed = []

homepage = Path("index.html")
html = homepage.read_text(encoding="utf-8")

if 'href="working-file/"' not in html:
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
    homepage.write_text(html, encoding="utf-8")
    changed.append("index.html")
else:
    print("Homepage already integrated.")

data_path = Path("working-file/data.js")
data = data_path.read_text(encoding="utf-8")

if 'id: "process-rescue"' not in data:
    project_anchor = '''    {
      id: "ric-rail",'''
    project_block = '''    {
      id: "process-rescue",
      title: "The 30-Day Process Rescue",
      eyebrow: "Public build challenge",
      status: "active",
      summary: "One broken insurance or business process will be selected, mapped, redesigned, prototyped, and documented in public over a maximum of thirty days.",
      proof: ["Challenge framework published", "Selection rules visible", "Submissions routed through Office Hours"],
      next: "Collect qualified submissions and select public build challenge 001.",
      href: "../build-in-public/"
    },
'''
    if project_anchor not in data:
        raise SystemExit("Working File project insertion point not found.")
    data = data.replace(project_anchor, project_block + project_anchor, 1)

if 'title: "What is the 30-Day Process Rescue?"' not in data:
    answer_anchor = '''    {
      title: "What is WiTNext?",'''
    answer_block = '''    {
      title: "What is the 30-Day Process Rescue?",
      keywords: ["30 day", "process rescue", "public build", "challenge", "broken process", "prototype"],
      answer: "It is a public build challenge that selects one real workflow, maps the current failure points, redesigns the path, builds the smallest useful fix, and publishes the result—including unsuccessful tests.",
      links: [
        {label: "Open the public challenge", href: "../build-in-public/"},
        {label: "Submit a process", href: "../office-hours/"}
      ]
    },
'''
    if answer_anchor not in data:
        raise SystemExit("Working File answer insertion point not found.")
    data = data.replace(answer_anchor, answer_block + answer_anchor, 1)

old_idea = '{id: "public-build", title: "Public build challenge", note: "Choose one ambitious build and publish the decisions, costs, setbacks, and shipped result."},'
new_idea = '{id: "public-build", title: "Select Process Rescue 001", note: "The 30-Day Process Rescue is live. Help choose the first real workflow to map, redesign, prototype, and document."},'
if old_idea in data:
    data = data.replace(old_idea, new_idea, 1)

original_data = data_path.read_text(encoding="utf-8")
if data != original_data:
    data_path.write_text(data, encoding="utf-8")
    changed.append("working-file/data.js")
else:
    print("Working File data already integrated.")

print("Updated: " + (", ".join(changed) if changed else "nothing"))
