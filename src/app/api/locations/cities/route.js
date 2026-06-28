import { jsonError, jsonOk, withCache } from "@/lib/server/api-response";
import { getCitiesForState, isValidState } from "@/lib/data/india-locations";

/** GET /api/locations/cities?state=Bihar&search=pat */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get("state");
    const search = searchParams.get("search") || "";

    if (!state) return jsonError("state query parameter is required", 400);
    if (!isValidState(state)) return jsonError("Invalid state", 400);

    const cities = getCitiesForState(state, search);
    const res = jsonOk(cities);
    return withCache(res, 86400);
  } catch (error) {
    console.error("GET /api/locations/cities:", error);
    return jsonError("Failed to fetch cities", 500);
  }
}
