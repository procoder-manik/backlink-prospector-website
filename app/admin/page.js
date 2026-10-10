import AdminApp from "@/components/AdminApp";
import { isAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Orders", robots: { index: false, follow: false } };

export default function AdminPage() {
  return (
    <main className="wrap admin-page">
      <AdminApp signedIn={isAdmin()} />
    </main>
  );
}
