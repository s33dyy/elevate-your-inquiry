export type Job = {
  slug: string;
  title: string;
  type: string;
  location: string;
  experience: string;
  employment: string;
  badge?: string;
  department: string;
  short: string;
  about: string;
  responsibilities: string[];
  requirements: string[];
  perks: string[];
  compensation: { label: string; sub?: string };
  process: string[];
};

export const jobs: Job[] = [
  {
    slug: "business-development-executive",
    title: "Business Development Executive",
    type: "Remote • Independent Contractor",
    location: "India",
    experience: "0–2 Years",
    employment: "Performance Based",
    badge: "Hiring Now",
    department: "Sales",
    short:
      "Help small and mid-sized businesses discover Techilla's process automation solutions. Consultative outreach — not cold pitching.",
    about:
      "Techilla is a process automation company. We identify inefficient, manual, or disconnected workflows inside businesses and implement technology — automation, AI, integrations, custom tools — to fix them. Your role is to find businesses running on manual processes and start conversations about what they could automate.",
    responsibilities: [
      "Identify businesses struggling with inefficient or manual processes",
      "Research potential automation opportunities within target businesses",
      "Conduct personalized B2B outreach via LinkedIn, email and calls",
      "Understand prospects' operational challenges in discovery conversations",
      "Qualify potential automation opportunities",
      "Explain Techilla's value proposition in plain business terms",
      "Schedule discovery calls with the Techilla team",
      "Maintain accurate lead and pipeline records",
      "Work with the team to convert qualified opportunities into clients",
    ],
    requirements: [
      "Excellent English communication",
      "Consultative mindset — comfortable asking questions, not pitching",
      "Laptop & stable internet",
      "Self-motivated and target-driven",
      "Freshers welcome",
      "B2B sales experience is a bonus",
    ],
    perks: [
      "Remote Work",
      "Flexible Hours",
      "Performance-Based Earnings",
      "Learning Resources",
      "Startup Environment",
      "Growth Opportunities",
    ],
    compensation: {
      label: "Earn up to ₹10,000 per closed deal.",
      sub: "Your earnings are directly linked to the business you help bring to Techilla. Full compensation terms and eligibility criteria are discussed during the hiring process.",
    },
    process: [
      "Application Submitted",
      "Application Review",
      "Interview",
      "Offer Letter",
      "Onboarding",
    ],
  },
];

export function getJob(slug: string) {
  return jobs.find((j) => j.slug === slug);
}
