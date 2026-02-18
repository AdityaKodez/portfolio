import { ArrowUpRight, Github } from "lucide-react";
import { ListItemCard } from "@/components/ui/list-item-card";
import Image from "next/image";

interface ProjectCardProps {
  name: string;
  url: string;
  date: string;
  description: string;
  github?: string;
}

export function ProjectCard({
  name,
  url,
  date,
  description,
  github,
}: ProjectCardProps) {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <ListItemCard className="px-3 py-2.5 -mx-3 gap-4">
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="font-medium text-sm">{name}</span>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-1">
          {description}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {github && (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded hover:bg-background transition-colors"
            >
              <Image src="/github.svg" alt="Github" width={24} height={24} />
            </a>
          )}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded hover:bg-background transition-colors"
          >
            <ArrowUpRight className="size-3.5 text-muted-foreground hover:text-foreground transition-colors" />
          </a>
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formattedDate}
        </span>
      </div>
    </ListItemCard>
  );
}
