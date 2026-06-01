"use client";

import { AuthLayout } from "@/components/auth/auth-layout";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function SignInDemo() {
  return (
    <AuthLayout
      imageSrc="/images/female-doctor.jpg"
      imageAlt="Healthcare professional"
      quote="Care, reimagined."
      subquote="A seamless connection between you and your health. Secure, intuitive, and designed around your needs."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
