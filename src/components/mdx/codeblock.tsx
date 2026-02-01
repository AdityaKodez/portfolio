import { CopyButton } from "./copy-button";
import { cn } from "@/lib/utils";

export const CodeBlock = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLPreElement>) => {
  return (
    <div className="relative rounded-xl font-mono text-sm group/codeblock">
      <div className="absolute top-3 right-3 z-10">
        <CopyButton className="opacity-0 group-hover/codeblock:opacity-100 transition-opacity duration-200">
          {children}
        </CopyButton>
      </div>
      <div className="w-full p-[2px]">
        <pre
          className={cn("overflow-x-auto py-2 rounded-md font-mono", className)}
          {...props}
        >
          {children}
        </pre>
      </div>
    </div>
  );
};
