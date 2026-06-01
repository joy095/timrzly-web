import { AUTH_URL } from "@/const";
import {
  emailOTPClient,
  multiSessionClient,
  organizationClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: AUTH_URL,

  fetchOptions: {
    credentials: "include",
    cache: "no-store",
  },

  plugins: [
    organizationClient(),
    emailOTPClient(),
    multiSessionClient(),
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = "/auth/two-factor";
      },
    }),
  ],
});

export const { useSession, signIn, signUp, signOut, organization } = authClient;
