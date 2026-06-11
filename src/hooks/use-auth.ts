"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: session, isLoading } = useQuery({
    queryKey: ["auth", "session"],
    queryFn: async () => {
      const res = await authClient.getSession();
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const signOut = useMutation({
    mutationFn: async () => {
      await authClient.signOut();
    },
    onSuccess: () => {
      queryClient.clear();
      router.push("/login");
    },
  });

  return {
    user: session?.user,
    session,
    isLoading,
    isAuthenticated: !!session,
    signOut: signOut.mutate,
  };
}
