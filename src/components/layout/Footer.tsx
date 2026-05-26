"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Heart,
  Mail,
  MapPin,
  Phone,
  Shield,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  className?: string;
  showMedicalBadges?: boolean;
}

// ─── Data ──────────────────────────────────────────────────────────

const footerSections: FooterSection[] = [
  {
    title: "Platform",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Appointments", href: "/appointments" },
      { label: "Patient Records", href: "/records" },
      { label: "Analytics", href: "/analytics" },
      { label: "Telemedicine", href: "/telemedicine" },
    ],
  },
  {
    title: "Specialties",
    links: [
      { label: "Cardiology", href: "/specialties/cardiology" },
      { label: "Neurology", href: "/specialties/neurology" },
      { label: "Pediatrics", href: "/specialties/pediatrics" },
      { label: "Orthopedics", href: "/specialties/orthopedics" },
      { label: "Dermatology", href: "/specialties/dermatology" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Documentation", href: "/docs" },
      { label: "API Reference", href: "/api" },
      { label: "Status", href: "/status" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "HIPAA Compliance", href: "/hipaa" },
      { label: "Security", href: "/security" },
    ],
  },
];

const medicalCertifications = [
  { icon: Shield, label: "HIPAA Compliant", color: "text-success" },
  { icon: Heart, label: "HL7 FHIR Ready", color: "text-info" },
  { icon: Stethoscope, label: "FDA Registered", color: "text-primary" },
];

// ─── Sub-Components ────────────────────────────────────────────────

const MedicalBadge = ({
  icon: Icon,
  label,
  color,
}: {
  icon: React.ElementType;
  label: string;
  color: string;
}) => (
  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-variant border border-border">
    <Icon className={cn("w-3.5 h-3.5", color)} />
    <span className="text-xs font-medium text-text-secondary">{label}</span>
  </div>
);

const FooterLinkItem = ({ link }: { link: FooterLink }) => (
  <li>
    <Link
      href={link.href}
      target={link.external ? "_blank" : undefined}
      rel={link.external ? "noopener noreferrer" : undefined}
      className="group flex items-center gap-1 text-sm text-text-secondary hover:text-foreground transition-colors"
    >
      {link.label}
      {link.external && (
        <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
      )}
    </Link>
  </li>
);

// ─── Main Footer Component ─────────────────────────────────────────

export function Footer({ className, showMedicalBadges = true }: FooterProps) {
  return (
    <footer
      className={cn(
        "relative bg-surface border-t border-border mt-auto",
        className,
      )}
    >
      {/* Premium Top Border Gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 group mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground tracking-tight">
                  Health<span className="text-primary">Card</span>
                </h2>
                <p className="text-[10px] text-text-muted font-medium tracking-wider uppercase">
                  Next-Gen Healthcare
                </p>
              </div>
            </Link>

            <p className="text-sm text-text-secondary leading-relaxed max-w-sm mb-6">
              Empowering healthcare professionals with intelligent patient
              management, seamless telemedicine, and real-time analytics for
              superior care delivery.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-text-secondary">
                <div className="w-8 h-8 rounded-lg bg-surface-variant flex items-center justify-center">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <span>support@healthcard.io</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-text-secondary">
                <div className="w-8 h-8 rounded-lg bg-surface-variant flex items-center justify-center">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <span>+1 (800) 555-0199</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-text-secondary">
                <div className="w-8 h-8 rounded-lg bg-surface-variant flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <span>San Francisco, CA 94105</span>
              </div>
            </div>
          </div>

          {/* Link Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <FooterLinkItem key={link.label} link={link} />
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Medical Certifications Bar */}
        {showMedicalBadges && (
          <div className="py-6 border-t border-divider">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {medicalCertifications.map((cert) => (
                <MedicalBadge key={cert.label} {...cert} />
              ))}
            </div>
          </div>
        )}

        {/* Bottom Bar */}
        <div className="py-6 border-t border-divider flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span>© 2026 HealthCard Inc.</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-xs text-text-muted hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-text-muted hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/cookies"
              className="text-xs text-text-muted hover:text-foreground transition-colors"
            >
              Cookies
            </Link>
            <Link
              href="/sitemap"
              className="text-xs text-text-muted hover:text-foreground transition-colors"
            >
              Sitemap
            </Link>
          </div>

          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
