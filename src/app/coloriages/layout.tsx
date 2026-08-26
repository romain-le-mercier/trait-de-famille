import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default function ColoriagesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 px-4 py-10 md:px-6 md:py-14">{children}</main>
      <SiteFooter />
    </div>
  );
}
