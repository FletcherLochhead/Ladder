import type { CompanyResearch } from "@/lib/types";

type DemoResearch = {
  values: string[];
  signals: string[];
  culture_notes: string[];
  likely_questions: string[];
};

const DEMO_RESEARCH: Record<string, DemoResearch> = {
  canva: {
    values: ["craft", "performance", "accessibility", "user delight"],
    signals: [
      "Prep signal: connect your work to fast, polished creative tools that non-technical users can trust.",
      "Prep signal: be ready to discuss how you measure quality when UI, collaboration, and performance all matter.",
      "Prep signal: ask how interns balance ambitious product ideas with production reliability.",
    ],
    culture_notes: [
      "Strong answers should show product taste and engineering discipline together.",
      "Use examples where you improved the user experience by simplifying a technical system.",
      "Bring a concrete story about feedback, iteration, and shipping visible polish.",
    ],
    likely_questions: [
      "Tell me about a time you made a slow or clunky interface feel faster.",
      "How would you debug a canvas or editor feature that behaves differently across browsers?",
      "What trade-offs would you make between visual fidelity and performance?",
      "How do you decide whether a user-facing change is ready to ship?",
    ],
  },
  fundtap: {
    values: ["clarity", "trust", "risk awareness", "small business empathy"],
    signals: [
      "Prep signal: frame your work around reliable financial workflows and reducing uncertainty for customers.",
      "Prep signal: be ready to discuss validation, auditability, and defensive handling of edge cases.",
      "Prep signal: ask how engineering partners with product and operations on customer-critical decisions.",
    ],
    culture_notes: [
      "Strong answers should show care with data, money movement, and customer trust.",
      "Use examples where you caught a subtle bug or turned ambiguity into a safer process.",
      "Keep answers concise and commercially aware, not only technical.",
    ],
    likely_questions: [
      "Tell me about a time you handled sensitive or high-integrity data.",
      "How would you test a workflow where incorrect state could affect a customer?",
      "What signals would you monitor after shipping a change to a payments-style system?",
      "How do you communicate risk when you find a bug close to a deadline?",
    ],
  },
  lumin: {
    values: ["product sense", "iteration", "systems thinking", "user empathy"],
    signals: [
      "Prep signal: connect your projects to product engineering, not only implementation detail.",
      "Prep signal: be ready to explain how you turned vague requirements into a usable feature.",
      "Prep signal: ask how interns learn the product domain and validate work with real users.",
    ],
    culture_notes: [
      "Strong answers should show ownership across design, code, and customer outcomes.",
      "Use examples where you made a practical call under incomplete information.",
      "Show that you can keep momentum without losing quality.",
    ],
    likely_questions: [
      "Walk me through a product decision you made in a technical project.",
      "How do you decide what to build first when a feature has many possible paths?",
      "Tell me about a time you changed your approach after feedback.",
      "How would you measure whether a new feature is working?",
    ],
  },
  partly: {
    values: ["data quality", "infrastructure", "speed", "technical depth"],
    signals: [
      "Prep signal: connect your projects to messy real-world data, APIs, and reliable engineering systems.",
      "Prep signal: be ready to talk about schema design, validation, and debugging across services.",
      "Prep signal: ask how interns work with domain complexity and production data quality.",
    ],
    culture_notes: [
      "Strong answers should show comfort with ambiguity and a bias toward robust systems.",
      "Use examples where you turned imperfect data or requirements into a stable interface.",
      "Be specific about trade-offs, not just tools.",
    ],
    likely_questions: [
      "Tell me about a time you modeled messy data or cleaned up an unreliable integration.",
      "How would you design an API for a domain with many edge cases?",
      "What would you do if production data contradicted your assumptions?",
      "How do you balance fast iteration with long-term maintainability?",
    ],
  },
  "rocket lab": {
    values: ["precision", "ownership", "safety", "hardware-software rigor"],
    signals: [
      "Prep signal: connect your work to deterministic debugging, clear trade-offs, and careful engineering judgment.",
      "Prep signal: be ready to discuss C/C++, sensor data, testing strategy, and failure modes.",
      "Prep signal: ask how early-career engineers get feedback on high-reliability systems.",
    ],
    culture_notes: [
      "Strong answers should show respect for constraints, testing, and operational consequences.",
      "Use examples where you found a bug through measurement rather than guesswork.",
      "Explain assumptions clearly and show how you would validate them.",
    ],
    likely_questions: [
      "Tell me about a technical bug that took real investigation to solve.",
      "How would you test code that interacts with sensors or hardware constraints?",
      "What trade-offs matter when reliability is more important than speed of delivery?",
      "How do you document and communicate engineering assumptions?",
    ],
  },
  "soul machines": {
    values: ["human-centered AI", "ethics", "experimentation", "model quality"],
    signals: [
      "Prep signal: connect your ML experience to evaluation, human interaction, and responsible product behavior.",
      "Prep signal: be ready to explain model limitations, data quality, and user experience trade-offs.",
      "Prep signal: ask how interns validate AI experiences beyond offline metrics.",
    ],
    culture_notes: [
      "Strong answers should combine curiosity about AI with careful thinking about users.",
      "Use examples where you evaluated an ML result, not just trained a model.",
      "Be clear about uncertainty, bias, and how you would test improvements.",
    ],
    likely_questions: [
      "Tell me about a machine learning project and how you evaluated it.",
      "How would you debug an AI feature that feels wrong to users but passes basic metrics?",
      "What ethical risks would you watch for in a human-facing AI product?",
      "How do you explain model behavior to non-technical teammates?",
    ],
  },
  "trade me": {
    values: ["marketplace trust", "pragmatism", "customer focus", "teamwork"],
    signals: [
      "Prep signal: connect your work to reliable marketplace flows, user trust, and pragmatic shipping.",
      "Prep signal: be ready for TypeScript, backend collaboration, and product reasoning.",
      "Prep signal: ask how graduate engineers rotate, learn the stack, and contribute safely.",
    ],
    culture_notes: [
      "Strong answers should show friendliness, practical judgment, and clean collaboration.",
      "Use examples where you worked across frontend and backend boundaries.",
      "Be ready to narrate your pairing style and how you ask for help.",
    ],
    likely_questions: [
      "Tell me about a time you improved a product flow for users.",
      "How would you approach a pairing exercise in an unfamiliar stack?",
      "What would you monitor after changing a marketplace checkout or listing flow?",
      "How do you handle disagreement during a technical design discussion?",
    ],
  },
  xero: {
    values: ["customer trust", "beautiful accounting", "platform reliability", "learning"],
    signals: [
      "Prep signal: connect your work to reliable business workflows and clear communication.",
      "Prep signal: be ready to discuss correctness, observability, and maintaining software over time.",
      "Prep signal: ask how graduate engineers ramp into domain knowledge and production ownership.",
    ],
    culture_notes: [
      "Strong answers should show care with details and empathy for small business users.",
      "Use examples where you improved reliability, readability, or team handover.",
      "Keep technical examples grounded in customer impact.",
    ],
    likely_questions: [
      "Tell me about a time you made a system easier to maintain.",
      "How would you test a financial workflow where correctness matters?",
      "What does good observability look like for a user-facing product?",
      "How do you learn a domain that is new to you?",
    ],
  },
};

export function getDemoCompanyResearch(
  company: string,
  role?: string | null,
): CompanyResearch | null {
  const seed = DEMO_RESEARCH[normalizeCompany(company)];
  if (!seed) return null;
  return withRoleContext(seed, company, role);
}

export function buildFallbackCompanyResearch(
  company: string,
  role?: string | null,
): CompanyResearch {
  return withRoleContext(
    {
      values: ["ownership", "learning", "product sense", "reliability"],
      signals: [
        "Prep signal: connect your best project to the company's product, users, and technical constraints.",
        "Prep signal: prepare one story about debugging, one about collaboration, and one about fast learning.",
        "Prep signal: ask how interns get feedback, ship safely, and learn the domain.",
      ],
      culture_notes: [
        "Strong answers should be specific, reflective, and grounded in user impact.",
        "Use examples with clear constraints, trade-offs, and measurable outcomes.",
        "Show how you learn quickly without pretending to know everything already.",
      ],
      likely_questions: [
        "Tell me about a project you are proud of and the trade-offs you made.",
        "Describe a bug that changed how you think about engineering quality.",
        "How do you learn a new codebase or domain quickly?",
        "Why does this role interest you?",
      ],
    },
    company,
    role,
  );
}

function withRoleContext(
  research: DemoResearch,
  company: string,
  role?: string | null,
): CompanyResearch {
  const roleLine = role
    ? `For the ${role} role, anchor answers in one concrete project and explain the decisions you owned.`
    : `For ${company}, anchor answers in one concrete project and explain the decisions you owned.`;

  return {
    values: research.values.slice(0, 7),
    recent_news: [roleLine, ...research.signals].slice(0, 7),
    culture_notes: research.culture_notes.slice(0, 7),
    likely_questions: research.likely_questions.slice(0, 7),
  };
}

function normalizeCompany(company: string) {
  return company
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
