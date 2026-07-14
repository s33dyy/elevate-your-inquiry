import { Github, Instagram, Linkedin, HardDrive } from "lucide-react";

export const socialLinks = [
  { label: "GitHub", href: "https://github.com/s33dyy", Icon: Github },
  {
    label: "Instagram",
    href: "https://www.instagram.com/techilla.online/",
    Icon: Instagram,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/techilla-studio/",
    Icon: Linkedin,
  },
  { label: "X", href: "https://x.com/HelloTechilla", Icon: XIcon },
  {
    label: "Drive",
    href: "https://drive.google.com/drive/folders/1yLvgNlhCs_ctBPLtvNFaOhNxjSvr3sfq?usp=drive_link",
    Icon: HardDrive,
  },
];

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
      className={className}
    >
      <path d="M18.244 2H21.5l-7.5 8.57L23 22h-6.828l-5.343-6.98L4.7 22H1.44l8.02-9.163L1 2h6.914l4.83 6.39L18.244 2Zm-1.2 18h1.86L7.05 4H5.09l11.955 16Z" />
    </svg>
  );
}

export function SocialLinks({
  className = "",
  size = 18,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {socialLinks.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <Icon className={`h-[${size}px] w-[${size}px]`} style={{ width: size, height: size }} />
        </a>
      ))}
    </div>
  );
}
