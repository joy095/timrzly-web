"use client";

import { Container } from "@/components/container";
import { authClient } from "@/lib/auth-client";

export default function ProfilePage() {
  const { data } = authClient.useSession();
  if (!data) return null;

  const sessionCreated = new Date(data.session.createdAt).toLocaleDateString();
  const sessionExpires = new Date(data.session.expiresAt).toLocaleString();
  const accountCreated = new Date(data.user.createdAt).toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  );

  return (
    <Container>
      <div className="p-4 border rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-2">Welcome, {data.user.name}</h2>
        <p>
          <strong>Email:</strong> {data.user.email}
        </p>

        <hr className="my-3" />

        <h3 className="font-semibold text-gray-700">
          Security & Meta Details:
        </h3>
        <ul className="list-disc pl-5 mt-1 space-y-1 text-sm text-gray-600">
          <li>
            <strong>Account Created:</strong> {accountCreated}
          </li>
          <li>
            <strong>Current Session Started:</strong> {sessionCreated}
          </li>
          <li>
            <strong>Session Expires:</strong> {sessionExpires}
          </li>
          <li>
            <strong>Your Role:</strong> {(data.user as any).role || "bannana"}
          </li>
        </ul>
      </div>
    </Container>
  );
}
