"use client";

import { ChangePasswordForm } from "@/components/auth/settings/security/change-password-form";
import { AuthLayout } from "@/components/auth/auth-layout";

export default function SignInDemo() {
  return (
    <AuthLayout
      imageSrc="/images/female-doctor.jpg"
      imageAlt="Healthcare professional"
      quote="Care, reimagined."
      subquote="A seamless connection between you and your health. Secure, intuitive, and designed around your needs."
    >
      <ChangePasswordForm />
      {/* <ChangePassword /> */}
    </AuthLayout>
  );
}
