import { PageHeader } from "@/components/sections/page-header";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-col items-center pt-12 md:pt-24 pb-10 px-3 md:px-0">
      <div className="max-w-2xl w-full flex flex-col">
        <PageHeader />
        {children}
      </div>
    </main>
  );
}
