import { NextResponse } from "next/server";
import {
  errorResponse,
  HttpError,
  TITAN_API_BASE_URL,
} from "@/lib_copy/errors";

export async function GET(req) {
  try {
    // get ?_id= from request URL
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("_id");

    if (!userId) {
      throw new HttpError(400, "Missing required parameter: _id");
    }

    // build the upstream API URL
    const url = new URL("/api/monitoring-users", TITAN_API_BASE_URL);
    url.searchParams.set("_id", userId);

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
