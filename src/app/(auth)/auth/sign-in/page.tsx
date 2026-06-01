// app/auth/sign-in/page.tsx
"use client";

import { AuthLayout } from "@/components/auth/auth-layout";
import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInPage() {
  return (
    <AuthLayout
      imageSrc="/images/female-doctor.jpg"
      imageAlt="Healthcare professional"
      quote="Care, reimagined."
      subquote="A seamless connection between you and your health. Secure, intuitive, and designed around your needs."
    >
      <SignInForm />
    </AuthLayout>
  );
}
