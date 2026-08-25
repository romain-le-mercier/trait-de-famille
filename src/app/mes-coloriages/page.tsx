import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { GalleryFlow } from "./GalleryFlow";

export const metadata: Metadata = {
  title: "Mes coloriages",
  description: "Retrouve et retélécharge tous tes coloriages, et tes crédits restants.",
};

export default function GalleryPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 px-4 py-10 md:px-6">
        <GalleryFlow />
      </main>
      <SiteFooter />
    </div>
  );
}
