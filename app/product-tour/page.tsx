import type { Metadata } from "next";
import { ProductTourPageContent } from "@/components/site/product-tour-page";

export const metadata: Metadata = {
  title: "Product Tour — Zivvy",
  description:
    "A short Business-tier tour of Zivvy — CRM, sales, stock, finance, HR, and manufacturing."
};

export default function ProductTourPage() {
  return <ProductTourPageContent />;
}
