import { Socials } from "./socials";

export function Intro() {
  return (
    <div className="flex items-center flex-wrap justify-between mt-4">
      <h1 className="font-semibold text-xl md:text-2xl tracking-tight">Hi <span className="wave">👋</span> I'm Sachi</h1>
      <Socials />
    </div>
  );
}
