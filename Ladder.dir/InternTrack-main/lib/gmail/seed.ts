import type { ParsedEmail } from "@/lib/gmail/parser";

/**
 * Demo seed emails. Seed mode uses deterministic parsed outputs below so the
 * live demo does not depend on model availability. Real Gmail messages still
 * run through the same parser used in production.
 *
 * Pick a mix that lets the demo show interesting AI parsing:
 *  - "Thanks for applying" auto-reply  → applied
 *  - Recruiter screen invite            → screening
 *  - On-site interview booking          → interview
 *  - Take-home assignment               → screening
 *  - Offer letter                       → offer
 *  - Polite rejection                   → rejected
 *  - Fresh interview confirmation       → interview
 *  - Withdrawal acknowledgement         → withdrawn
 */
export type SeedEmail = {
  gmail_message_id: string;
  from: string;
  subject: string;
  body: string;
  received_at: string;
};

export const seedEmails: SeedEmail[] = [
  {
    gmail_message_id: "seed-msg-partly-screen",
    from: "talent@partly.com",
    subject: "Partly · phone screen with engineering",
    body: `Hi Alex,

Thanks for applying to the Engineering Intern role at Partly. We'd love to set up a 30-minute phone screen with one of our senior engineers. Are you free Tuesday 13 May at 2pm NZT?

The screen is conversational, we'll cover your projects (we read your InternTrack writeup, nice work) and ask a couple of light coding questions in the language of your choice.

Cheers,
Jordan
Talent at Partly`,
    received_at: "2026-05-08T03:18:00Z",
  },
  {
    gmail_message_id: "seed-msg-lumin-applied",
    from: "no-reply@greenhouse.io",
    subject: "Application received: Product Engineer Intern at Lumin",
    body: `Hi,

Thanks for applying to the Product Engineer Intern position at Lumin. Our team will review your application and reach out within 7 business days if we'd like to take next steps.

If you have questions in the meantime, please reply to this thread.

, Lumin Talent`,
    received_at: "2026-05-06T22:01:00Z",
  },
  {
    gmail_message_id: "seed-msg-fundtap-rejected",
    from: "careers@fundtap.co.nz",
    subject: "FundTap · update on your Software Engineer Intern application",
    body: `Hi Alex,

Thanks again for taking the time to apply to FundTap. After reviewing your application alongside others, we've decided not to move forward at this time. We had a strong pool this round and the call was tight.

We'd love to stay in touch, feel free to apply again next intake.

Best,
Sam
FundTap`,
    received_at: "2026-05-05T10:45:00Z",
  },
  {
    gmail_message_id: "seed-msg-rocketlab-takehome",
    from: "early-careers@rocketlabusa.com",
    subject: "Rocket Lab · take-home challenge for Avionics Intern",
    body: `Hi Alex,

Great to chat last week. Next step is a small take-home, you'll find the details in the attached PDF. We allocate up to four hours; please return your write-up by Friday 16 May.

The exercise is a sensor-fusion problem in C/C++. We're looking for clean code and a clear explanation of trade-offs.

Cheers,
Priya
Early Careers Engineering Team
Rocket Lab`,
    received_at: "2026-05-07T08:22:00Z",
  },
  {
    gmail_message_id: "seed-msg-trademe-interview",
    from: "people@trademe.co.nz",
    subject: "On-site interview booked · Trade Me Graduate SE",
    body: `Kia ora Alex,

Confirming your on-site interview for the Trade Me Graduate Software Engineer programme. Details:

  Date: Thursday 22 May 2026
  Time: 10:00 to 14:00 NZT
  Location: 2 Market Lane, Wellington (level 4 reception)

Itinerary: 30-minute pairing exercise (TypeScript + .NET), 45-minute system design, lunch with the team, behavioural interview. We'll have a Trade Me lanyard waiting at reception.

Reply with any dietary requirements.

Ngā mihi,
Aroha
People @ Trade Me`,
    received_at: "2026-05-08T19:30:00Z",
  },
  {
    gmail_message_id: "seed-msg-canva-offer",
    from: "offers@canva.com",
    subject: "Canva · Engineering Internship offer",
    body: `Hi Alex,

We're delighted to offer you a Software Engineering Internship at Canva for our Summer 2026/27 cohort. The team you'd join is the Editor Performance squad, working on the canvas-rendering pipeline.

The full offer pack (including comp, dates, and visa support) is attached. Please reply with your decision by Friday 16 May.

We'd love to have you on board.

Cheers,
Lin
Engineering at Canva`,
    received_at: "2026-05-08T22:15:00Z",
  },
  {
    gmail_message_id: "seed-msg-soulmachines-applied",
    from: "noreply@workable.com",
    subject: "Application received, Machine Learning Intern @ Soul Machines",
    body: `Tēnā koe,

Thanks for applying to the Machine Learning Intern role at Soul Machines. We'll be in touch within 10 business days. Track your application status in the Workable portal.

, Soul Machines People Team`,
    received_at: "2026-05-04T04:10:00Z",
  },
  {
    gmail_message_id: "seed-msg-xero-withdrawn",
    from: "grad-team@xero.com",
    subject: "Re: withdrawing my Xero Grad SE application",
    body: `Hi Alex,

Confirming we've withdrawn your application for the Graduate Software Engineer programme at Xero per your request. Wishing you the very best with your other intake, please do consider us in future cycles.

, Xero Grad Team`,
    received_at: "2026-05-03T11:00:00Z",
  },
];

export const seedParsedEmails: Record<string, ParsedEmail> = {
  "seed-msg-partly-screen": {
    is_application_related: true,
    company: "Partly",
    role: "Engineering Intern",
    stage: "screening",
    applied_date: null,
    summary: "Partly invited Alex to a 30-minute engineering phone screen.",
  },
  "seed-msg-lumin-applied": {
    is_application_related: true,
    company: "Lumin",
    role: "Product Engineer Intern",
    stage: "applied",
    applied_date: "2026-05-06",
    summary: "Lumin confirmed the Product Engineer Intern application.",
  },
  "seed-msg-fundtap-rejected": {
    is_application_related: true,
    company: "FundTap",
    role: "Software Engineer Intern",
    stage: "rejected",
    applied_date: null,
    summary: "FundTap decided not to move forward this round.",
  },
  "seed-msg-rocketlab-takehome": {
    is_application_related: true,
    company: "Rocket Lab",
    role: "Avionics Intern",
    stage: "screening",
    applied_date: null,
    summary: "Rocket Lab sent a C/C++ take-home challenge due Friday 16 May.",
  },
  "seed-msg-trademe-interview": {
    is_application_related: true,
    company: "Trade Me",
    role: "Graduate Software Engineer",
    stage: "interview",
    applied_date: null,
    summary: "Trade Me confirmed an on-site interview for Thursday 22 May.",
  },
  "seed-msg-canva-offer": {
    is_application_related: true,
    company: "Canva",
    role: "Software Engineering Internship",
    stage: "offer",
    applied_date: null,
    summary: "Canva sent an internship offer for the Summer 2026/27 cohort.",
  },
  "seed-msg-soulmachines-applied": {
    is_application_related: true,
    company: "Soul Machines",
    role: "Machine Learning Intern",
    stage: "applied",
    applied_date: "2026-05-04",
    summary: "Soul Machines confirmed the Machine Learning Intern application.",
  },
  "seed-msg-xero-withdrawn": {
    is_application_related: true,
    company: "Xero",
    role: "Graduate Software Engineer",
    stage: "withdrawn",
    applied_date: null,
    summary: "Xero acknowledged that the application was withdrawn.",
  },
};
