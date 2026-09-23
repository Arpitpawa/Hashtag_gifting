import { redirect } from "next/navigation";

// The corporate landing page links to many themed sub-pages (/corporate/welcome-kits,
// /corporate/journals, ...) that don't have their own pages yet. Instead of a 404,
// send visitors to the corporate gifting catalogue.
export default function CorporateSubPage() {
  redirect("/category/corporate-gifts");
}
