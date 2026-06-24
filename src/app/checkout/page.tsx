import { redirect } from "next/navigation";

// The checkout flow has been merged into the unified /book page.
// This route now redirects there, preserving any query params (subject, packageId, itemType, …)
// so existing "Pay now" links and bookmarks keep working. Default to the pay tab.
export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") qs.set(key, value);
  }
  if (!qs.has("intent")) qs.set("intent", "pay");
  redirect(`/book?${qs.toString()}`);
}
