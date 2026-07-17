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
  compensation: { tier: string; label: string; sub?: string }[];
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
      "Join Techilla's sales team and help businesses discover premium web development, AI automation and digital growth services.",
    about:
      "Techilla is a modern digital solutions agency helping startups and businesses build premium websites, AI automation systems and scalable digital products.",
    responsibilities: [
      "Generate qualified B2B leads",
      "Cold outreach via LinkedIn, email and calls",
      "Conduct discovery meetings",
      "Understand business requirements",
      "Close deals",
      "Update CRM",
      "Attend weekly meetings",
    ],
    requirements: [
      "Excellent English communication",
      "Laptop & stable internet",
      "Self motivated",
      "Target driven",
      "Freshers welcome",
      "Sales experience is a bonus",
    ],
    perks: [
      "Remote Work",
      "Flexible Hours",
      "Performance Bonuses",
      "Learning Resources",
      "Startup Environment",
      "Growth Opportunities",
    ],
    compensation: [
      { tier: "1–19 deals / month", label: "₹500", sub: "per closed deal" },
      { tier: "20 deals / month", label: "₹10,000", sub: "milestone payout" },
      { tier: "21+ deals / month", label: "₹10,000 + ₹700", sub: "for every additional deal" },
    ],
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
