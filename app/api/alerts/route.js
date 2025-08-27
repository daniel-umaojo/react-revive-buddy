import { NextResponse } from "next/server";
import {
  parseLimitParam,
  errorResponse,
  HttpError,
  TITAN_API_BASE_URL,
} from "@/lib_copy/errors";

export async function GET(req) {
  try {
    // get ?limit= from request URL
    const { searchParams } = new URL(req.url);
    const limit = parseLimitParam(searchParams.get("limit"), 9, 1, 100);

    // build the upstream API URL
    const url = new URL("/api/alerts", TITAN_API_BASE_URL);
    url.searchParams.set("limit", String(limit));

    // fetch from Titan API
    const response = await fetch(url.toString(), {
      headers: { accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      let details = await response.text();
      throw new HttpError(response.status, "Upstream API Error", { details });
    }

    const data = await response.json();
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return errorResponse(err);
  }
}
