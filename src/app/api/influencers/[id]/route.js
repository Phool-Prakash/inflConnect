import { jsonError, jsonOk, withCache } from "@/lib/server/api-response";
import { rateLimit, getClientIp } from "@/lib/server/rate-limit";
import { getInfluencerServer, toPublicInfluencer } from "@/lib/server/influencers-service";

/** GET /api/influencers/[id] — public approved profile */
export async function GET(request, { params }) {
  const ip = getClientIp(request);
  const rl = rateLimit(`public-get:${ip}`, { limit: 200, windowMs: 60_000 });
  if (!rl.allowed) return jsonError("Too many requests", 429);

  try {
    const { id } = await params;
    const influencer = await getInfluencerServer(id);
    if (!influencer) return jsonError("Not found", 404);
    const res = jsonOk(toPublicInfluencer(influencer));
    return withCache(res, 120);
  } catch (error) {
    console.error("GET /api/influencers/[id]:", error);
    return jsonError("Failed to fetch profile", 500);
  }
}
