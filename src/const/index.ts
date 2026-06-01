export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8787";

export const AUTH_URL =
  process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:5000";

export const IMAGE_URL = process.env.NEXT_PUBLIC_BACKEND_URL + "/api/uploads";

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Timezly"