"use client";

import { Container } from "@/components/container";
import { useSession } from "@/lib/auth-client";

export default function Dashboard() {
  const { data: session, isPending } = useSession();

  // Show a loading state while fetching to prevent flashing the "Sign in" screen
  if (isPending) {
    return (
      <div className="p-10 text-center">
        <p className="text-gray-500">Loading your dashboard...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-10 text-center">
        <p>Please sign in first.</p>
      </div>
    );
  }

  const user = session.user;

  return (
    <Container>
      <h1 className="text-2xl font-bold mb-4">
        Welcome, {user.name || "User"}!
      </h1>

      <p className="text-gray-700 mb-4">
        Two-Factor Authentication Status:{" "}
        <span className="font-semibold">
          {user.twoFactorEnabled ? "Enabled" : "Not Enabled"}
        </span>
      </p>
    </Container>
  );
}
