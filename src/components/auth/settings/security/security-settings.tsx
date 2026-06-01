"use client";

import { useAuth } from "@better-auth-ui/react";
import { cn } from "@/lib/utils";
import { ActiveSessions } from "./active-sessions";
import { ChangePassword } from "./change-password";
import { LinkedAccounts } from "./linked-accounts";
import { ComponentType } from "react";
import TwoFactorStatusCard from "./two-factor-status-card";
import { useSession } from "@/lib/auth-client";

export type SecuritySettingsProps = {
  className?: string;
};

/**
 * Renders the security settings layout including password management, linked accounts, and active sessions.
 *
 * ChangePassword is rendered when password authentication is enabled; LinkedAccounts is rendered when social providers are present.
 * Each registered auth plugin may contribute `securityCards` (for example passkeys, delete-user).
 *
 * @param className - Optional additional CSS class names for the outer container.
 * @returns The security settings container as a JSX element.
 */
export function SecuritySettings({ className }: SecuritySettingsProps) {
  const { emailAndPassword, plugins, socialProviders } = useAuth();
  const { data: session, isPending } = useSession();

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
    <div className={cn("flex w-full flex-col gap-4 md:gap-6", className)}>
      {emailAndPassword?.enabled && <ChangePassword />}
      {!!socialProviders?.length && <LinkedAccounts />}

      {/* IF user has two-factor enabled */}
      <TwoFactorStatusCard initialEnabled={Boolean(user.twoFactorEnabled)} />

      <ActiveSessions />
      {plugins.flatMap((plugin) => {
        const cards = plugin.securityCards;
        if (!Array.isArray(cards)) return [];
        return cards.map((Card: ComponentType<any>, index: number) => (
          <Card key={`${plugin.id}-${index.toString()}`} />
        ));
      })}
    </div>
  );
}
