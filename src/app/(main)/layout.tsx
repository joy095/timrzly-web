import { RootHeader } from "@/components/providers";

// app/(main)/layout.tsx
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <RootHeader />
      {children}
    </>
  );
}
