// app/settings/[path]/page.tsx
import { viewPaths } from "@better-auth-ui/core";
import { notFound, redirect } from "next/navigation";
import { Settings } from "@/components/auth/settings/settings";
import { getSession } from "better-auth/api";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;
  if (!Object.values(viewPaths.settings).includes(path)) {
    notFound();
  }
  const session = await getSession();
  if (!session) {
    redirect(
      `/auth/sign-in?redirectTo=${encodeURIComponent(`/settings/${path}`)}`,
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-6">
      <Settings path={path} />
    </div>
  );
}
