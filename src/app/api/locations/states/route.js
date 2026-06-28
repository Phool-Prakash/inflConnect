import { jsonError, jsonOk, withCache } from "@/lib/server/api-response";
import { searchStates } from "@/lib/data/india-locations";

/** GET /api/locations/states?search=maha */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const states = searchStates(search);
    const res = jsonOk(states);
    return withCache(res, 86400);
  } catch (error) {
    console.error("GET /api/locations/states:", error);
    return jsonError("Failed to fetch states", 500);
  }
}
