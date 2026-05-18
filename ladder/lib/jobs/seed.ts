/**
 * Curated UC-relevant internship + grad-role listings used as the always-on
 * seed for AI ranking. We rank these against the user's CV regardless of
 * whether the live Adzuna fetch succeeds, so the demo is bulletproof.
 *
 * Companies are real NZ-based employers commonly recruited from UC.
 */

export type SeedJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  source_url: string;
  posted_at: string; // ISO
};

const today = "2026-05-09";

export const seedJobs: SeedJob[] = [
  {
    id: "seed-partly-eng-intern",
    title: "Engineering Intern (Summer 2026/27)",
    company: "Partly",
    location: "Christchurch · Hybrid",
    description:
      "Work on the parts platform powering automotive aftermarket commerce worldwide. Day-to-day: write production TypeScript across our API and frontend, ship a real feature each sprint, pair with senior engineers. We hire interns who can think clearly and write code we trust to merge.",
    source_url: "https://www.partly.com/careers",
    posted_at: today,
  },
  {
    id: "seed-lumin-product-intern",
    title: "Product Engineer Intern",
    company: "Lumin",
    location: "Christchurch · Hybrid",
    description:
      "Lumin builds cloud document signing and PDF tooling used by millions. Internships sit on a single product squad, owning a feature end-to-end. Stack: TypeScript, React, Go, AWS. We want students who can ship.",
    source_url: "https://www.luminpdf.com/careers",
    posted_at: today,
  },
  {
    id: "seed-fundtap-swe-intern",
    title: "Software Engineer Intern",
    company: "FundTap",
    location: "Auckland",
    description:
      "Help build the tax-credit financing platform that gets NZ businesses paid for R&D faster. Work across our Tax API team, writing Go services and frontend tooling. Solid Python/TypeScript and an interest in fintech.",
    source_url: "https://fundtap.co.nz/careers",
    posted_at: today,
  },
  {
    id: "seed-rocketlab-avionics-intern",
    title: "Avionics Software Intern",
    company: "Rocket Lab",
    location: "Auckland",
    description:
      "Embedded software internship on Electron and Neutron avionics. C/C++, RTOS, sensor fusion. UC engineering (mechatronics, electrical, CS) preferred. Two-year graduate pathway available.",
    source_url: "https://www.rocketlabusa.com/careers",
    posted_at: today,
  },
  {
    id: "seed-trademe-grad-eng",
    title: "Graduate Software Engineer",
    company: "Trade Me",
    location: "Wellington",
    description:
      "Two-year Trade Me graduate programme rotating through marketplace, motors, and property teams. Stack: React, TypeScript, .NET. Big focus on engineering craft, mentorship, and writing systems people actually rely on.",
    source_url: "https://www.trademe.co.nz/jobs",
    posted_at: today,
  },
  {
    id: "seed-xero-grad-eng",
    title: "Graduate Software Engineer (Wellington)",
    company: "Xero",
    location: "Wellington",
    description:
      "Join Xero's grad programme building accounting software trusted by 4M+ subscribers. TypeScript, .NET, AWS. Strong CS fundamentals, comfort writing tests, eagerness to learn distributed systems.",
    source_url: "https://www.xero.com/careers",
    posted_at: today,
  },
  {
    id: "seed-soul-machines-ml-intern",
    title: "Machine Learning Intern",
    company: "Soul Machines",
    location: "Auckland",
    description:
      "Work on Digital People, autonomous animated avatars driven by ML. Internship on the perception/behaviour team, writing PyTorch and Unity tooling. Strong Python and ML fundamentals required.",
    source_url: "https://www.soulmachines.com/careers",
    posted_at: today,
  },
  {
    id: "seed-mygov-data-intern",
    title: "Data & Analytics Summer Intern",
    company: "Stats NZ",
    location: "Wellington · Christchurch",
    description:
      "Summer 2026/27 data internships across Stats NZ teams. Python, SQL, R. Eight weeks paid. UC stats and data science students encouraged.",
    source_url: "https://stats.govt.nz/about-us/careers/",
    posted_at: today,
  },
  {
    id: "seed-allbirds-eng-intern",
    title: "Software Engineer Intern (E-commerce)",
    company: "Allbirds",
    location: "Auckland",
    description:
      "Build features for the global Allbirds storefront. Next.js, Shopify, TypeScript. We want eng interns who can ship a polished shopping flow end-to-end.",
    source_url: "https://www.allbirds.com/pages/careers",
    posted_at: today,
  },
  {
    id: "seed-mwh-civil-intern",
    title: "Civil Engineering Summer Intern",
    company: "Stantec NZ",
    location: "Christchurch",
    description:
      "Three-month summer engagement on civil infrastructure design, 3 Waters, transport, stormwater. UC civil and environmental engineering students preferred.",
    source_url: "https://www.stantec.com/en/careers",
    posted_at: today,
  },
  {
    id: "seed-beca-mech-intern",
    title: "Mechanical Engineering Intern",
    company: "Beca",
    location: "Christchurch · Wellington",
    description:
      "Beca runs a structured 12-week summer internship across mechanical, building services, and structural engineering. UC ME or BME students preferred. Strong CAD and analysis fundamentals.",
    source_url: "https://www.beca.com/careers",
    posted_at: today,
  },
  {
    id: "seed-fisher-paykel-eng-grad",
    title: "Graduate Mechatronics Engineer",
    company: "Fisher & Paykel Healthcare",
    location: "Auckland",
    description:
      "Grad role on respiratory products mechatronics team. Embedded firmware, sensor design, hardware prototyping. UC mechatronics or biomedical engineering students.",
    source_url: "https://www.fphcare.com/careers",
    posted_at: today,
  },
  {
    id: "seed-ihc-data-intern",
    title: "Data Science Intern",
    company: "Inland Revenue (IRD)",
    location: "Wellington",
    description:
      "Help IRD's data team build segmentation and risk models on tax data. Python, SQL, dbt. UC stats / data science / CS students.",
    source_url: "https://www.ird.govt.nz/about-us/careers",
    posted_at: today,
  },
  {
    id: "seed-canon-cs-intern",
    title: "Software Engineering Intern",
    company: "Canon Information Systems",
    location: "Christchurch",
    description:
      "Canon NZ's Christchurch software team builds enterprise document workflow products. .NET, Azure. UC CS / software students. 12-week summer internship.",
    source_url: "https://www.canon.co.nz/about/careers",
    posted_at: today,
  },
  {
    id: "seed-ibm-grad-cloud",
    title: "Graduate Cloud Engineer",
    company: "IBM NZ",
    location: "Wellington",
    description:
      "IBM Consulting cloud engineering grad, IaC, Kubernetes, Terraform, AWS/Azure. Two-year structured programme. UC engineering / CS students.",
    source_url: "https://www.ibm.com/employment",
    posted_at: today,
  },
  {
    id: "seed-anz-grad-tech",
    title: "Graduate Technology Programme",
    company: "ANZ Bank",
    location: "Wellington",
    description:
      "ANZ Tech grad rotates across software, cloud, and data over two years. Strong CS fundamentals, interest in fintech. UC commerce + CS double majors welcome.",
    source_url: "https://www.anz.co.nz/careers",
    posted_at: today,
  },
  {
    id: "seed-asb-grad-tech",
    title: "ASB Tech Graduate (Software Engineering)",
    company: "ASB Bank",
    location: "Auckland",
    description:
      "Join ASB's tech grad programme. Java/Kotlin, AWS, mobile + web. Eighteen-month programme with rotations.",
    source_url: "https://www.asb.co.nz/careers",
    posted_at: today,
  },
  {
    id: "seed-orion-network-intern",
    title: "Network Engineering Intern",
    company: "Orion NZ",
    location: "Christchurch",
    description:
      "Lines company internship across network operations and engineering. UC electrical or electronic engineering students. Twelve weeks summer.",
    source_url: "https://www.oriongroup.co.nz/careers",
    posted_at: today,
  },
  {
    id: "seed-microsoft-grad-eng",
    title: "Graduate Software Engineer",
    company: "Microsoft NZ",
    location: "Auckland",
    description:
      "Microsoft NZ grad engineering, Azure platform, Office, gaming. C#, TypeScript. Strong fundamentals, OSS contributions are a plus.",
    source_url: "https://careers.microsoft.com",
    posted_at: today,
  },
  {
    id: "seed-google-stride-intern",
    title: "STEP Intern (Software Engineering)",
    company: "Google",
    location: "Sydney (Remote NZ)",
    description:
      "Google's STEP internship for first/second-year CS students. Twelve weeks paid. Algorithm + system design depth.",
    source_url: "https://buildyourfuture.withgoogle.com",
    posted_at: today,
  },
  {
    id: "seed-aws-cloud-grad",
    title: "AWS Solutions Architect Graduate",
    company: "Amazon Web Services",
    location: "Auckland",
    description:
      "AWS NZ grad solutions architect programme. Customer-facing engineering, design cloud architectures, write reference implementations. CS / software grads.",
    source_url: "https://www.amazon.jobs/en/teams/aws",
    posted_at: today,
  },
  {
    id: "seed-pushpay-eng-intern",
    title: "Software Engineer Intern",
    company: "Pushpay",
    location: "Auckland · Remote",
    description:
      "Help build church engagement and giving software used worldwide. .NET, React, Azure. Twelve-week internship, real production work.",
    source_url: "https://pushpay.com/careers",
    posted_at: today,
  },
  {
    id: "seed-vista-eng-intern",
    title: "Software Engineer Intern",
    company: "Vista Group",
    location: "Auckland",
    description:
      "Vista's software powers 75% of the world's box-office cinemas. Internship on cinema platform. .NET, React, Azure. UC software students.",
    source_url: "https://www.vistagroup.co/careers/",
    posted_at: today,
  },
  {
    id: "seed-orion-health-eng-intern",
    title: "Software Engineer Intern",
    company: "Orion Health",
    location: "Auckland",
    description:
      "Healthtech platform used by health systems globally. Java + React. Health informatics interest welcome.",
    source_url: "https://orionhealth.com/careers/",
    posted_at: today,
  },
  {
    id: "seed-tower-data-intern",
    title: "Data Analyst Intern",
    company: "Tower Insurance",
    location: "Auckland",
    description:
      "Pricing & analytics intern. SQL, Python, dbt. UC stats / data science students preferred.",
    source_url: "https://www.tower.co.nz/careers",
    posted_at: today,
  },
  {
    id: "seed-westpac-grad-tech",
    title: "Westpac Graduate Technology Analyst",
    company: "Westpac NZ",
    location: "Auckland · Wellington",
    description:
      "Tech grad rotation across cloud, data, cyber, and platform engineering. Eighteen months.",
    source_url: "https://www.westpac.co.nz/careers",
    posted_at: today,
  },
  {
    id: "seed-mbie-policy-intern",
    title: "Policy Analyst Intern (Tech & Innovation)",
    company: "MBIE",
    location: "Wellington",
    description:
      "Summer policy internship at NZ's economic development ministry. Research and write briefings on tech & innovation policy. UC commerce / law / arts students.",
    source_url: "https://www.mbie.govt.nz/about/careers",
    posted_at: today,
  },
  {
    id: "seed-clearpoint-eng-intern",
    title: "Software Engineering Intern",
    company: "ClearPoint",
    location: "Auckland · Wellington · Christchurch",
    description:
      "Bespoke software consultancy. Internship rotates across client teams. TypeScript, .NET, Java.",
    source_url: "https://www.clearpoint.co.nz/careers",
    posted_at: today,
  },
  {
    id: "seed-z-energy-data-intern",
    title: "Data Analytics Intern",
    company: "Z Energy",
    location: "Wellington",
    description:
      "Twelve-week summer analytics internship, fuel pricing, customer segmentation, sustainability metrics. SQL and Python.",
    source_url: "https://z.co.nz/careers",
    posted_at: today,
  },
  {
    id: "seed-spark-grad-tech",
    title: "Spark Tech Graduate",
    company: "Spark NZ",
    location: "Auckland",
    description:
      "Spark grad rotates across product engineering, cloud, and data. Two years.",
    source_url: "https://www.spark.co.nz/about/careers",
    posted_at: today,
  },
  {
    id: "seed-kpmg-tech-cyber-grad",
    title: "Tech Risk & Cyber Grad",
    company: "KPMG NZ",
    location: "Auckland · Wellington",
    description:
      "Big-4 cybersecurity grad role, penetration testing, GRC, cloud security audit.",
    source_url: "https://kpmg.com/nz/careers",
    posted_at: today,
  },
  {
    id: "seed-deloitte-consulting-grad",
    title: "Consulting Graduate (Engineering Track)",
    company: "Deloitte NZ",
    location: "Auckland",
    description:
      "Deloitte engineering consulting, solution delivery, cloud, integration. UC commerce + CS double major fits well.",
    source_url: "https://www.deloitte.com/nz/en/careers.html",
    posted_at: today,
  },
  {
    id: "seed-stripe-intern-emea",
    title: "Software Engineer Intern (Remote APAC)",
    company: "Stripe",
    location: "Auckland · Remote",
    description:
      "Stripe is hiring CS interns across APAC. Production code from week 2. Strong fundamentals expected.",
    source_url: "https://stripe.com/jobs",
    posted_at: today,
  },
  {
    id: "seed-canva-eng-intern",
    title: "Software Engineering Intern",
    company: "Canva",
    location: "Auckland · Sydney",
    description:
      "Build features used by 200M+ Canva users. TypeScript, Java, real production scale.",
    source_url: "https://www.canva.com/careers/",
    posted_at: today,
  },
  {
    id: "seed-tracksuit-eng-intern",
    title: "Software Engineer Intern",
    company: "Tracksuit",
    location: "Auckland",
    description:
      "Brand tracking startup growing fast. TypeScript across the stack. Tight team, interns own real features.",
    source_url: "https://www.gotracksuit.com/careers",
    posted_at: today,
  },
  {
    id: "seed-mint-innovation-eng",
    title: "Process Engineering Intern",
    company: "Mint Innovation",
    location: "Auckland",
    description:
      "Biorefinery startup recovering precious metals from electronic waste. Chemical/process engineering internship. UC chem eng students.",
    source_url: "https://mint.bio/careers",
    posted_at: today,
  },
  {
    id: "seed-flox-data-intern",
    title: "Data Engineer Intern",
    company: "Flox",
    location: "Auckland · Remote",
    description:
      "AI-driven nature restoration startup. Data engineering, Python, GeoPandas, PostGIS. UC data science / GIS students welcome.",
    source_url: "https://www.flox.io/careers",
    posted_at: today,
  },
  {
    id: "seed-halter-eng-intern",
    title: "Hardware/Embedded Intern",
    company: "Halter",
    location: "Auckland",
    description:
      "GPS-collared smart cattle company building agritech hardware. Embedded firmware, hardware design. UC mechatronics / electronic engineering.",
    source_url: "https://halter.co.nz/careers",
    posted_at: today,
  },
  {
    id: "seed-volpara-grad-eng",
    title: "Graduate Software Engineer",
    company: "Volpara Health",
    location: "Wellington",
    description:
      "Volpara builds breast cancer detection software used worldwide. C++, Python, image analysis. Strong ML and image processing skills welcome.",
    source_url: "https://www.volparahealth.com/careers",
    posted_at: today,
  },
  {
    id: "seed-aspeq-intern",
    title: "Aviation Software Intern",
    company: "Aspeq",
    location: "Christchurch",
    description:
      "Build certification testing software for aviation regulators. .NET, Azure. Twelve-week summer engagement.",
    source_url: "https://www.aspeq.com/careers",
    posted_at: today,
  },
];
