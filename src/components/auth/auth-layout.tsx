// components/auth/auth-layout.tsx
import Image from "next/image";
import { motion } from "framer-motion";

interface AuthLayoutProps {
  children: React.ReactNode;
  imageSrc: string;
  imageAlt: string;
  quote: string;
  subquote: string;
}

export function AuthLayout({
  children,
  imageSrc,
  imageAlt,
  quote,
  subquote,
}: AuthLayoutProps) {
  return (
    <div className="relative min-h-dvh w-full bg-background lg:grid lg:grid-cols-[1fr_1.1fr]">
      {/* Left: Editorial Image Panel */}
      <div className="relative hidden overflow-hidden lg:block">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          quality={95}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-shadow/60" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="absolute bottom-12 left-12 right-12"
        >
          <div className="space-y-5 text-text-inverse">
            <div className="h-px w-16 bg-text-inverse/30" />
            <h2 className="text-4xl font-light tracking-tight text-text-inverse/95">
              {quote}
            </h2>
            <p className="max-w-md text-[15px] font-light leading-relaxed text-text-inverse/60">
              {subquote}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right: Form Panel */}
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-16 lg:px-20">
        <div className="w-full max-w-[460px]">
          {/* Mobile Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-10 flex items-center gap-3 lg:hidden"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <svg
                className="h-5 w-5 text-primary-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-text">
              MediCare
            </span>
          </motion.div>

          {/* Premium Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="absolute -inset-2 rounded-[calc(var(--radius-2xl)+4px)] bg-primary/5 blur-2xl" />
            <div className="relative rounded-2xl border border-border bg-card p-10 shadow-[0_8px_40px_-12px_var(--color-shadow)/8%]">
              {children}
            </div>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-text-muted"
          >
            Protected by 256-bit SSL encryption
          </motion.p>
        </div>
      </div>
    </div>
  );
}
