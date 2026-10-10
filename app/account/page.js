import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AccountApp from "@/components/AccountApp";
import { getCustomer, safeNext } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "My account | Backlink Prospector", robots: { index: false, follow: false } };

export default async function AccountPage({ searchParams }) {
  const customer = await getCustomer();
  return (
    <>
      <SiteHeader />
      <AccountApp signedIn={!!customer} next={safeNext(searchParams?.next)} />
      <SiteFooter />
    </>
  );
}
