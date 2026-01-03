export type SkillGroup = {
  group: string;
  items: Array<{ name: string; level: number }>;
};

export type ProjectPreview = {
  title: string;
  category: string;
  desc: string;
  tags: string[];
};

export type BlogPostPreview = {
  rep: string;
  sev: "Low" | "Medium" | "High";
  title: string;
  tags: string[];
  time: string;
  slug: string;
  content: string;
};

export type CertificationPreview = {
  name: string;
  org: string;
  year: string;
};

export type ServicePreview = {
  title: string;
  points: string[];
};

export const SKILL_GROUPS: SkillGroup[] = [
  {
    group: "Security Tools",
    items: [
      { name: "Wireshark", level: 90 },
      { name: "Nmap", level: 88 },
      { name: "Burp Suite (Lab)", level: 82 },
    ],
  },
  {
    group: "Networking & Infrastructure",
    items: [
      { name: "VLANs & Inter-VLAN Routing", level: 88 },
      { name: "OSPF / EIGRP (Academic)", level: 84 },
      { name: "ACLs & NAT", level: 86 },
    ],
  },
  {
    group: "Web & App Security",
    items: [
      { name: "OWASP Top 10", level: 86 },
      { name: "AuthN/AuthZ", level: 84 },
      { name: "JWT Security (Analysis)", level: 80 },
    ],
  },
  {
    group: "Digital Forensics",
    items: [
      { name: "Timeline Reconstruction", level: 82 },
      { name: "Artifact & Log Analysis", level: 84 },
      { name: "Phishing Attack Analysis", level: 80 },
    ],
  },
];

export const PROJECTS: ProjectPreview[] = [
  {
    title: "Secure Enterprise Network Design",
    category: "Network Security",
    desc: "HQ + branch topology with VLANs, routing, redundancy, ACLs, monitoring.",
    tags: ["VLAN", "OSPF", "ACL", "HSRP"],
  },
  {
    title: "Web Application Penetration Testing Report",
    category: "Web Security",
    desc: "Auth & business-logic findings with OWASP-aligned methodology and documentation.",
    tags: ["OWASP", "JWT", "Burp", "Reporting"],
  },
  {
    title: "Digital Forensics Investigation",
    category: "Forensics",
    desc: "Phishing-driven malware chain reconstruction with timeline and evidence handling.",
    tags: ["Artifacts", "Timeline", "Chain of Custody"],
  },
  {
    title: "CTF & Security Labs",
    category: "Offensive Security (Learning)",
    desc: "Enumeration and exploitation practice with writeups and lessons learned.",
    tags: ["CTF", "Enumeration", "Exploitation"],
  },
  {
    title: "Packet Tracer Security Simulations",
    category: "Networking (Academic)",
    desc: "Segmentation, NAT/DHCP/DNS, logging, and hardening scenarios.",
    tags: ["Packet Tracer", "NAT", "Syslog"],
  },
  {
    title: "Secure API Concepts Study",
    category: "Web Security",
    desc: "Analysis of session security, input validation, and token-based protections.",
    tags: ["AuthZ", "Sessions", "Validation"],
  },
];

export const BLOG_POSTS: BlogPostPreview[] = [
  {
    rep: "REP-001",
    sev: "Medium",
    title: "JWT pitfalls: where analysis often misses",
    tags: ["JWT", "Auth"],
    time: "6 min",
    slug: "rep-001-jwt-pitfalls",
    content:
      "Notes on common JWT pitfalls: algorithm confusion, weak signing keys, missing audience/issuer validation, token storage issues, and authorization checks that rely only on token claims.",
  },
  {
    rep: "REP-002",
    sev: "High",
    title: "OWASP Top 10 in practice: lab notes",
    tags: ["OWASP", "Web"],
    time: "8 min",
    slug: "rep-002-owasp-lab-notes",
    content:
      "Lab-oriented notes mapping typical findings to OWASP Top 10 categories, with a focus on how to prove impact and how to recommend mitigations clearly.",
  },
  {
    rep: "REP-003",
    sev: "Low",
    title: "Packet Tracer hardening checklist",
    tags: ["Network", "Labs"],
    time: "5 min",
    slug: "rep-003-packet-tracer-hardening",
    content:
      "A practical checklist for baseline hardening in simulations: segmentation, ACLs, management plane controls, logging, and least-privilege routing.",
  },
  {
    rep: "REP-004",
    sev: "Medium",
    title: "Forensics timeline reconstruction basics",
    tags: ["Forensics"],
    time: "7 min",
    slug: "rep-004-forensics-timeline-basics",
    content:
      "A beginner-friendly approach to timelines: which artifacts matter, ordering events reliably, and how to avoid over-interpreting sparse evidence.",
  },
  {
    rep: "REP-005",
    sev: "High",
    title: "Authentication logic flaws: patterns to watch",
    tags: ["Auth", "Logic"],
    time: "9 min",
    slug: "rep-005-auth-logic-flaws",
    content:
      "Common auth logic issues: inconsistent state transitions, missing verification steps, flawed password reset flows, and authorization bypass patterns.",
  },
  {
    rep: "REP-006",
    sev: "Medium",
    title: "Recon workflows: from Nmap to hypotheses",
    tags: ["Nmap", "Recon"],
    time: "6 min",
    slug: "rep-006-recon-workflows",
    content:
      "A structured recon workflow: scan, validate, enumerate, form hypotheses, then test carefully—keeping notes for repeatability and reporting.",
  },
];

export const CERTIFICATIONS: CertificationPreview[] = [
  { name: "Academic Coursework in Cybersecurity", org: "University", year: "2024" },
  { name: "Digital Forensics Practical Assessment", org: "Academic", year: "2024" },
  { name: "Web Security & Pentesting Labs", org: "Academic", year: "2023–2025" },
  { name: "IEEE × Logpoint CTF", org: "Participant", year: "2024" },
  { name: "University Security Competitions", org: "Participant", year: "2023–2025" },
];

export const SERVICES: ServicePreview[] = [
  {
    title: "Network Security Design (Academic & Lab)",
    points: ["Segmentation (VLANs)", "Routing & redundancy", "ACLs and policy controls", "Monitoring concepts"],
  },
  {
    title: "Web Application Security Testing (Learning)",
    points: ["OWASP-aligned workflow", "Auth/session analysis", "Logic flaw modeling", "Clear reporting"],
  },
  {
    title: "Security Research & Documentation",
    points: ["Writeups & incident notes", "Threat modeling basics", "Evidence-driven reasoning", "Readable diagrams"],
  },
  {
    title: "Cybersecurity Labs & Simulations",
    points: ["Packet Tracer scenarios", "CTF practice", "Forensics exercises", "Post-lab reflections"],
  },
];
