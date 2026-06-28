import "server-only";
import {
  getInfluencerServer,
  listApprovedInfluencersServer,
} from "@/lib/server/influencers-service";

export async function getApprovedInfluencerServer(id) {
  try {
    return await getInfluencerServer(id);
  } catch (error) {
    console.error("Error fetching influencer (server):", error);
    return null;
  }
}

export async function getAllApprovedIdsServer() {
  try {
    const influencers = await listApprovedInfluencersServer();
    return influencers.map((inf) => inf.id);
  } catch (error) {
    console.error("Error fetching approved IDs for sitemap:", error);
    return [];
  }
}
