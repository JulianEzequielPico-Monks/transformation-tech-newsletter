import { redirect } from "next/navigation";

import { getLatestNewsletter } from "@/lib/newsletters";

export default async function HomePage() {
  const latest = await getLatestNewsletter();

  if (latest) {
    redirect(`/newsletter/${latest.slug}`);
  }

  redirect("/history");
}
