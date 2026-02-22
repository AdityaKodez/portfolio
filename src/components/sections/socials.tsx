import { siteConfig } from "@/config/site.config";
import { FileText, Linkedin } from "lucide-react";
import { Icons } from "@/components/icons";
import Link from "next/link";

export function Socials() {
  return (
    <div className="flex items-center">
      <a
        href={siteConfig.socials.github}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
        className="flex items-center justify-center size-7.5 hover:text-primary transition-colors p-1.5 hover:bg-secondary rounded-md duration-150"
      >
        <Icons.Github className="h-4 w-4" />
      </a>
      <a
        href={siteConfig.socials.x}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="X (Twitter)"
        className="flex items-center justify-center size-7.5 hover:text-primary transition-colors p-1.5 hover:bg-secondary rounded-md duration-150"
      >
        <Icons.X className="h-3 w-3" />
      </a>
      <a
        href={siteConfig.socials.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn"
        className="flex items-center justify-center size-7.5 hover:text-primary transition-colors p-1.5 hover:bg-secondary rounded-md duration-150"
      >
        <Linkedin className="h-4 w-4" strokeWidth={1} />
      </a>
      <Link
        href="/resume"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Resume"
        className="flex items-center justify-center size-7.5 hover:text-primary transition-colors p-1.5 hover:bg-secondary rounded-md duration-150"
      >
        <FileText className="h-4 w-4" strokeWidth={1} />
      </Link>
    </div>
  );
}
