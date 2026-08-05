window.WORKING_FILE_DATA = {
  updated: "August 5, 2026",
  statusLine: "Building useful systems in public. Shipping small, testing fast, and keeping the receipts.",
  projects: [
    {
      id: "witnext",
      title: "WiTNext",
      eyebrow: "Insurance operations",
      status: "active",
      summary: "An in-house CRM, communication, transcript-intake, and coaching system designed around the work agents actually do.",
      proof: ["CRM and policy workflows shipped", "Transcript intake running", "Gmail intake in staging"],
      next: "Tighten intake speed, review queues, and agent-facing workflows.",
      href: "https://github.com/Yothisislogan"
    },
    {
      id: "wease-case-study",
      title: "The $2.8M to $7.6M Case File",
      eyebrow: "Insurance agency growth",
      status: "shipped",
      summary: "A public operating case study on acquisitions, sales systems, training, close-rate improvement, and disciplined agency growth.",
      proof: ["Growth path documented", "15% to 27% close-rate story", "Reusable growth levers published"],
      next: "Add deeper examples, artifacts, and companion operator worksheets.",
      href: "../case-studies/wease-financial.html"
    },
    {
      id: "playbooks",
      title: "Steal My Playbook",
      eyebrow: "Free operator library",
      status: "shipped",
      summary: "Ungated, downloadable templates for call coaching, weekly KPI reviews, broken processes, and website conversion.",
      proof: ["Four complete templates", "Browser download and copy", "No email gate"],
      next: "Publish hiring, onboarding, carrier appetite, and customer-experience playbooks.",
      href: "../playbooks/"
    },
    {
      id: "office-hours",
      title: "Operator Office Hours",
      eyebrow: "Open problem intake",
      status: "experiment",
      summary: "A structured way to submit messy insurance, sales, operations, technology, and community problems.",
      proof: ["Builds a complete email brief", "No backend required", "Public teardown permission built in"],
      next: "Select the first broadly useful problem for a public before-and-after teardown.",
      href: "../office-hours/"
    },
    {
      id: "failure-files",
      title: "Files That Did Not Work",
      eyebrow: "Public postmortems",
      status: "shipped",
      summary: "An honest archive of failed assumptions, warning signs, actual costs, corrections, and reusable operating rules.",
      proof: ["Static-form failure documented", "Caching failure documented", "Experiment measurement rule published"],
      next: "Add project, hiring, sales, and product postmortems as the evidence becomes publishable.",
      href: "../failures/"
    },
    {
      id: "ric-rail",
      title: "RIC Rail Connector",
      eyebrow: "Transportation and community",
      status: "investigating",
      summary: "A public-private concept connecting Richmond International Airport to regional rail and practical first-mile transit.",
      proof: ["Intro packet built", "Stakeholder map researched", "Phased bus-first approach outlined"],
      next: "Turn the concept into a stakeholder-ready feasibility conversation.",
      href: "../ideas.html"
    },
    {
      id: "agency-simulator",
      title: "Agency Growth Simulator",
      eyebrow: "Free operator tool",
      status: "shipped",
      summary: "A transparent calculator showing how leads, close rate, premium, retention, and revenue interact.",
      proof: ["Runs entirely in the browser", "Compares current and improved scenarios", "Produces a copyable operating brief"],
      next: "Add benchmarks and downloadable scenario files.",
      href: "../tools/agency-growth-simulator.html"
    },
    {
      id: "myth-machine",
      title: "Insurance Myth Machine",
      eyebrow: "Plain-language education",
      status: "shipped",
      summary: "A fast, shareable myth checker that answers common insurance assumptions without jargon.",
      proof: ["Twelve starter myths", "Search and random modes", "Shareable URL state"],
      next: "Expand into line-specific collections and state-aware explanations.",
      href: "../tools/insurance-myth-machine.html"
    },
    {
      id: "ask-logan",
      title: "Ask the Working File",
      eyebrow: "Public knowledge layer",
      status: "experiment",
      summary: "A local answer engine built from public project notes, operating principles, and case-file summaries.",
      proof: ["No API or model cost", "Fast keyword matching", "Clear source links"],
      next: "Move from curated answers to a maintainable public knowledge index.",
      href: "#ask"
    },
    {
      id: "broken-process",
      title: "Bring Me a Broken Process",
      eyebrow: "Open problem intake",
      status: "experiment",
      summary: "A structured way for operators to send the process their team hates, with enough detail to diagnose it.",
      proof: ["No backend required", "Creates a structured email brief", "Designed for public teardown candidates"],
      next: "Publish the first before-and-after process redesign.",
      href: "../office-hours/"
    }
  ],
  answers: [
    {
      title: "How do you grow an insurance agency?",
      keywords: ["grow", "growth", "agency", "insurance", "sales", "leads", "close rate"],
      answer: "Start with the operating math: lead volume, speed-to-contact, quote rate, close rate, average premium, retention, and agent capacity. Improve the narrowest constraint first. More leads rarely fix a weak follow-up or quoting process.",
      links: [
        {label: "Run the agency simulator", href: "../tools/agency-growth-simulator.html"},
        {label: "Read the growth case study", href: "../case-studies/wease-financial.html"}
      ]
    },
    {
      title: "What does Logan build?",
      keywords: ["build", "projects", "software", "tools", "logan", "current"],
      answer: "Logan builds insurance businesses, internal operating systems, training tools, public-interest concepts, and small web products that make complicated work easier to understand and execute.",
      links: [
        {label: "See active case files", href: "#case-files"},
        {label: "Open the idea folder", href: "../ideas.html"}
      ]
    },
    {
      title: "What is the philosophy behind the work?",
      keywords: ["philosophy", "principles", "belief", "approach", "plain language", "customer"],
      answer: "Clarity is part of the product. The technical answer matters, but it should not arrive before the human answer. Good systems give people clear options, visible next steps, and fewer places to get lost.",
      links: [
        {label: "Read: Insurance is emotional", href: "../thoughts/insurance-is-emotional.html"},
        {label: "Open the playbook library", href: "../playbooks/"}
      ]
    },
    {
      title: "Can Logan review a broken workflow?",
      keywords: ["process", "workflow", "broken", "review", "operations", "help", "office hours"],
      answer: "Yes. The strongest submissions describe who uses the process, where it breaks, what workarounds exist, and what a good outcome would look like. Operator Office Hours turns that into a structured brief.",
      links: [
        {label: "Open office hours", href: "../office-hours/"},
        {label: "Download the process map", href: "../playbooks/"}
      ]
    },
    {
      title: "How did Wease Financial grow?",
      keywords: ["wease financial", "allstate", "2.8", "7.6", "agency story", "case study"],
      answer: "Wease Financial grew from $2.8M to $7.6M through three acquisitions, stronger sales and training systems, a close-rate increase from roughly 15% to 27%, and disciplined agency operations before a profitable sale in 2021.",
      links: [
        {label: "Read the full case study", href: "../case-studies/wease-financial.html"}
      ]
    },
    {
      title: "What has not worked?",
      keywords: ["failed", "failure", "mistake", "did not work", "postmortem", "lesson"],
      answer: "The public failure archive currently covers a static-form deployment assumption, an overly aggressive HTML caching policy, and the danger of experiments without explicit success thresholds.",
      links: [
        {label: "Open the failure files", href: "../failures/"}
      ]
    },
    {
      title: "What is WiTNext?",
      keywords: ["witnext", "crm", "transcript", "coaching", "gmail", "phone"],
      answer: "WiTNext is an in-house insurance CRM and communication platform intended to combine customer records, policies, quotes, tasks, transcript intake, and real-time coaching in one operator-focused workspace.",
      links: [
        {label: "See the project card", href: "#case-files"}
      ]
    }
  ],
  ideas: [
    {id: "public-build", title: "Public build challenge", note: "Choose one ambitious build and publish the decisions, costs, setbacks, and shipped result."},
    {id: "playbook", title: "Expand the playbook library", note: "Add practical hiring, onboarding, carrier appetite, customer experience, and project templates."},
    {id: "office-hours", title: "Publish the first office-hours teardown", note: "Turn one submitted business or insurance problem into a public before-and-after case file."},
    {id: "failure-files", title: "Open more failure files", note: "Document paused or failed projects with the original belief, cost, lesson, and possible return path."}
  ]
};