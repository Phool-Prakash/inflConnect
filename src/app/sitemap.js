import Link from "next/link";
import { getAllApprovedIdsServer } from "@/lib/influencers-server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap() {
  const influencerIds = await getAllApprovedIdsServer();

  const staticRoutes = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    {
      url: `${siteUrl}/onboard`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  const influencerRoutes = influencerIds.map((id) => ({
    url: `${siteUrl}/influencer/${id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...influencerRoutes];
}
