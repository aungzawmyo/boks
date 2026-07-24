import type { Metadata } from "next";
import BookstoreDashboard from "@/components/bookstore/BookstoreDashboard";

export const metadata: Metadata = {
  title: "Bookstore Overview | boks Admin",
  description: "Bookstore admin dashboard",
};

export default function OverviewPage() {
  return <BookstoreDashboard />;
}
