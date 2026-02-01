import { cn } from "@/lib/utils";

interface GitHubIssueProps {
  number: number;
  title: string;
  repo: string;
  state?: "open" | "closed";
}

interface GitHubPRProps {
  number: number;
  title: string;
  repo: string;
  state?: "open" | "merged" | "closed";
}

function IssueIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={cn("size-4", className)}
      fill="currentColor"
    >
      <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
      <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z" />
    </svg>
  );
}

function PRIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={cn("size-4", className)}
      fill="currentColor"
    >
      <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z" />
    </svg>
  );
}

function MergedIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={cn("size-4", className)}
      fill="currentColor"
    >
      <path d="M5.45 5.154A4.25 4.25 0 0 0 9.25 7.5h1.378a2.251 2.251 0 1 1 0 1.5H9.25A5.734 5.734 0 0 1 5 7.123v3.505a2.25 2.25 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.95-.218ZM4.25 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm8.5-4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM5 3.25a.75.75 0 1 0 0 .005V3.25Z" />
    </svg>
  );
}

export function GitHubIssue({
  number,
  title,
  repo,
  state = "open",
}: GitHubIssueProps) {
  const href = `https://github.com/${repo}/issues/${number}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "my-4 flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors hover:bg-muted/50 no-underline",
        state === "closed" && "border-purple-500/30 bg-purple-500/5"
      )}
    >
      <IssueIcon
        className={cn(
          state === "open" ? "text-green-600" : "text-purple-500"
        )}
      />
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="font-medium text-foreground truncate">{title}</span>
        <span className="text-xs text-muted-foreground">
          {repo}#{number}
        </span>
      </div>
    </a>
  );
}

export function GitHubPR({
  number,
  title,
  repo,
  state = "open",
}: GitHubPRProps) {
  const href = `https://github.com/${repo}/pull/${number}`;
  const isMerged = state === "merged";
  const isClosed = state === "closed";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "my-4 flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors hover:bg-muted/50 no-underline",
        isMerged && "border-purple-500/30 bg-purple-500/5",
        isClosed && !isMerged && "border-red-500/30 bg-red-500/5"
      )}
    >
      {isMerged ? (
        <MergedIcon className="text-purple-500" />
      ) : (
        <PRIcon
          className={cn(
            state === "open" ? "text-green-600" : "text-red-500"
          )}
        />
      )}
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="font-medium text-foreground truncate">{title}</span>
        <span className="text-xs text-muted-foreground">
          {repo}#{number} {isMerged && "· merged"}
        </span>
      </div>
    </a>
  );
}
