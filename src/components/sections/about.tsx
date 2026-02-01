export function About() {
  return (
    <div className="mt-4">
      <ul className="flex flex-col gap-1 text-sm list-disc list-inside">
        <li>
          I'm a software developer who loves to build functional web
          applications
        </li>
        <li>
          <span className="border-b border-dashed border-foreground/50 select-all">
            React
          </span>{" "}
          and{" "}
          <span className="border-b border-dashed border-foreground/50 select-all">
            Next.js
          </span>{" "}
          are my go-to frameworks
        </li>
        <li>
          I prefer{" "}
          <span className="border-b border-dashed border-foreground/50 select-all">
            TailwindCSS
          </span>{" "}
          and{" "}
          <span className="border-b border-dashed border-foreground/50 select-all">
            Shadcn/UI
          </span>{" "}
          for styling
        </li>
      </ul>
    </div>
  );
}
