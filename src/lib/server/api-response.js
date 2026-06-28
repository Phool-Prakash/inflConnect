import "server-only";
import { NextResponse } from "next/server";

export function jsonOk(data, init = {}) {
  return NextResponse.json({ ok: true, data }, init);
}

export function jsonError(message, status = 400, extra = {}) {
  return NextResponse.json({ ok: false, error: message, ...extra }, { status });
}

export function withCache(response, seconds = 60) {
  response.headers.set(
    "Cache-Control",
    `public, s-maxage=${seconds}, stale-while-revalidate=${seconds * 2}`
  );
  return response;
}
