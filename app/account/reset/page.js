import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ResetPassword from "@/components/ResetPassword";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reset password | Backlink Prospector", robots: { index: false, follow: false } };

export default function ResetPage({ searchParams }) {
  return (
    <>
      <SiteHeader />
      <ResetPassword token={String(searchParams?.token || "")} />
      <SiteFooter />
    </>
  );
}