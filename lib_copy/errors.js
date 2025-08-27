import { NextResponse } from "next/server";

// Custom error class
export class HttpError extends Error {
  constructor(status, message, options = {}) {
    super(message);
    this.status = status;
    this.code = options.code;
    this.details = options.details;
  }
}

// Map status codes to friendly messages
function getMessageForStatus(status) {
  switch (status) {
    case 400:
      return "Bad Request - Please check your input.";
    case 401:
      return "Unauthorized - You don’t have access.";
    case 403:
      return "Forbidden - Action not allowed.";
    case 404:
      return "Not Found - The requested resource doesn’t exist.";
    case 500:
      return "Server Error - Something went wrong on our side.";
    case 502:
      return "Bad Gateway - Upstream service failed.";
    case 503:
      return "Service Unavailable - Please try again later.";
    default:
      return "An unexpected error occurred.";
  }
}

// Ensure limit is always valid
export function parseLimitParam(raw, fallback = 9, min = 1, max = 100) {
  if (!raw) return fallback;
  const num = parseInt(raw, 10);
  if (isNaN(num)) return fallback;
  if (num < min) return min;
  if (num > max) return max;
  return num;
}

// Central error handler
export function errorResponse(err) {
  if (err instanceof HttpError) {
    const friendlyMessage = getMessageForStatus(err.status);
    return NextResponse.json(
      {
        ok: false,
        error: {
          message: friendlyMessage,
          code: err.code || `HTTP_${err.status}`,
          details: err.details || null,
        },
      },
      { status: err.status }
    );
  }

  return NextResponse.json(
    {
      ok: false,
      error: {
        message: "Something went wrong",
        details: process.env.NODE_ENV !== "production" ? String(err) : undefined,
      },
    },
    { status: 500 }
  );
}

// Base URL for Titan API
export const TITAN_API_BASE_URL =
  process.env.TITAN_API_BASE_URL || "https://titan-learn.onrender.com";
