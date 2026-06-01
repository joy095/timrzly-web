"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { authClient } from "@/lib/auth-client";
import { getQueryClient } from "@/lib/query-client";
import { AuthProvider } from "./auth/auth-provider";
import { Toaster } from "./ui/sonner";
import { Header } from "./layout/Header";

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider
        authClient={authClient}
        redirectTo="/profile"
        socialProviders={["google"]}
        navigate={({ to, replace }) =>
          replace ? router.replace(to) : router.push(to)
        }
        plugins={[]}
        Link={Link}
      >
        {children}
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export const RootHeader = () => {
  const { data: session } = authClient.useSession();

  const userWithRole = session?.user
    ? { ...session.user, role: (session.user as any).role ?? "user" }
    : undefined;

  return (
    <Header
      user={userWithRole}
      config={{
        navLinks: [],
        searchPlaceholder: "Doctors, clinics...",
      }}
    />
  );
};
