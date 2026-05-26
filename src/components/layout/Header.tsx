"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Bell,
  Calendar,
  ChevronDown,
  FileText,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings,
  Shield,
  Stethoscope,
  User,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

// ─── Types ─────────────────────────────────────────────────────────

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "urgent" | "info" | "success" | "warning";
  time: string;
  read: boolean;
}

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  role: "patient" | "doctor" | "admin";
  specialty?: string;
}

export interface NavLink {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Set to false to hide this link from the header */
  visible?: boolean;
}

export interface HeaderConfig {
  /** Brand / logo text. Default: "HealthCard" */
  brandName?: string;
  /** Brand subtext/tagline. Default: "Premium Care" */
  brandTagline?: string;
  /** Placeholder text for the search input. Default: "Search patients, records..." */
  searchPlaceholder?: string;
  /** Show/hide the desktop search bar entirely */
  showSearch?: boolean;
  /** Show/hide the mobile search toggle */
  showMobileSearch?: boolean;
  /** Show/hide the notifications bell */
  showNotifications?: boolean;
  /** Show/hide the user dropdown / sign-in area */
  showUserMenu?: boolean;
  /** Navigation links rendered in the desktop nav bar */
  navLinks?: NavLink[];
  /** Show/hide the mobile hamburger menu toggle */
  showMenuToggle?: boolean;
}

interface HeaderProps {
  user?: UserProfile;
  notifications?: Notification[];
  onMenuToggle?: () => void;
  className?: string;
  /** Configuration object controlling visibility and content of header elements */
  config?: HeaderConfig;
}

// ─── Default Configuration ─────────────────────────────────────────

const defaultNavLinks: NavLink[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    visible: true,
  },
  {
    label: "Appointments",
    href: "/appointments",
    icon: Calendar,
    visible: true,
  },
  { label: "Patients", href: "/patients", icon: Users, visible: true },
  { label: "Records", href: "/records", icon: FileText, visible: true },
];

const defaultConfig: Required<HeaderConfig> = {
  brandName: "HealthCard",
  brandTagline: "Premium Care",
  searchPlaceholder: "Search patients, records...",
  showSearch: true,
  showMobileSearch: true,
  showNotifications: true,
  showUserMenu: true,
  navLinks: defaultNavLinks,
  showMenuToggle: true,
};

// ─── Sub-Components ────────────────────────────────────────────────

const SpecialtyBadge = ({ specialty }: { specialty?: string }) => {
  const specialtyColors: Record<string, string> = {
    cardiology: "bg-cardiology/10 text-cardiology border-cardiology/20",
    dermatology: "bg-dermatology/10 text-dermatology border-dermatology/20",
    neurology: "bg-neurology/10 text-neurology border-neurology/20",
    pediatrics: "bg-pediatrics/10 text-pediatrics border-pediatrics/20",
    orthopedics: "bg-orthopedics/10 text-orthopedics border-orthopedics/20",
    general: "bg-general/10 text-general border-general/20",
    dentistry: "bg-dentistry/10 text-dentistry border-dentistry/20",
    ophthalmology:
      "bg-ophthalmology/10 text-ophthalmology border-ophthalmology/20",
    psychiatry: "bg-psychiatry/10 text-psychiatry border-psychiatry/20",
    gynecology: "bg-gynecology/10 text-gynecology border-gynecology/20",
  };

  if (!specialty) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        specialtyColors[specialty.toLowerCase()] || specialtyColors.general,
      )}
    >
      <Stethoscope className="w-3 h-3" />
      {specialty.charAt(0).toUpperCase() + specialty.slice(1)}
    </span>
  );
};

const NotificationPanel = ({
  notifications,
  onClose,
}: {
  notifications: Notification[];
  onClose: () => void;
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  const typeConfig = {
    urgent: {
      icon: Shield,
      color: "text-urgent bg-urgent/10 border-urgent/20",
    },
    info: { icon: MessageSquare, color: "text-info bg-info/10 border-info/20" },
    success: {
      icon: Activity,
      color: "text-success bg-success/10 border-success/20",
    },
    warning: {
      icon: Bell,
      color: "text-warning bg-warning/10 border-warning/20",
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute right-0 top-full mt-3 w-[380px] bg-surface rounded-2xl shadow-xl border border-border overflow-hidden z-50"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-divider bg-surface-variant/50">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-notification text-white text-[10px] font-bold rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-surface-variant rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-text-muted" />
        </button>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-text-muted">
            <Bell className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-divider">
            {notifications.map((notification) => {
              const config = typeConfig[notification.type];
              const Icon = config.icon;
              return (
                <div
                  key={notification.id}
                  className={cn(
                    "flex gap-3 p-4 hover:bg-surface-variant/60 transition-colors cursor-pointer",
                    !notification.read && "bg-primary/5",
                  )}
                >
                  <div
                    className={cn(
                      "flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border",
                      config.color,
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          "text-sm font-medium text-foreground line-clamp-1",
                          !notification.read && "font-semibold",
                        )}
                      >
                        {notification.title}
                      </p>
                      <span className="text-[11px] text-text-muted whitespace-nowrap">
                        {notification.time}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-5 py-3 border-t border-divider bg-surface-variant/30">
        <button className="w-full text-center text-xs font-medium text-primary hover:text-primary-dark transition-colors">
          View all notifications
        </button>
      </div>
    </motion.div>
  );
};

const UserDropdown = ({
  user,
  onClose,
}: {
  user: UserProfile;
  onClose: () => void;
}) => {
  const menuItems = [
    { icon: User, label: "Profile", href: "/profile" },
    { icon: Settings, label: "Settings", href: "/settings/account" },
    { icon: Shield, label: "Privacy & Security", href: "/security" },
    { icon: Heart, label: "My Health", href: "/health" },
    { icon: Calendar, label: "Appointments", href: "/appointments" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute right-0 top-full mt-3 w-72 bg-surface rounded-2xl shadow-xl border border-border overflow-hidden z-50"
    >
      <div className="p-5 border-b border-divider bg-surface-variant/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border-2 border-primary/20">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">
              {user.name}
            </p>
            <p className="text-xs text-text-secondary truncate">{user.email}</p>
            <div className="mt-1.5">
              <SpecialtyBadge specialty={user.specialty} />
            </div>
          </div>
        </div>
      </div>

      <div className="py-2">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={onClose}
            className="flex items-center gap-3 px-5 py-2.5 text-sm text-text-secondary hover:text-foreground hover:bg-surface-variant/60 transition-colors"
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}
      </div>

      <div className="border-t border-divider py-2">
        <button className="flex items-center gap-3 px-5 py-2.5 text-sm text-error hover:bg-error/5 w-full transition-colors">
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </motion.div>
  );
};

// ─── Main Header Component ─────────────────────────────────────────

export function Header({
  user,
  notifications = [],
  onMenuToggle,
  className,
  config: userConfig,
}: HeaderProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Merge user config with defaults
  const cfg: Required<HeaderConfig> = {
    ...defaultConfig,
    ...userConfig,
    navLinks: userConfig?.navLinks ?? defaultConfig.navLinks,
  };

  // Filter only visible nav links
  const visibleNavLinks = cfg.navLinks.filter((link) => link.visible !== false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setShowNotifications(false);
    setShowUserMenu(false);
  }, [pathname]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header
      className={cn(
        "top-0 left-0 right-0 z-40 transition-all duration-300",
        scrolled
          ? "bg-surface/80 backdrop-blur-xl shadow-lg border-b border-border/50"
          : "bg-surface border-b border-transparent",
        className,
      )}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[72px]">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {cfg.showMenuToggle && (
              <button
                onClick={onMenuToggle}
                className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-surface-variant transition-colors text-text-secondary hover:text-foreground"
                aria-label="Toggle menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-shadow">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-foreground tracking-tight leading-none">
                  {cfg.brandName.split(" ").slice(0, -1).join(" ")}
                  <span className="text-primary">
                    {cfg.brandName.split(" ").slice(-1)}
                  </span>
                </h1>
                <p className="text-[10px] text-text-muted font-medium tracking-wider uppercase">
                  {cfg.brandTagline}
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            {visibleNavLinks.length > 0 && (
              <nav className="hidden lg:flex items-center gap-1 ml-8">
                {visibleNavLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all",
                      pathname === item.href
                        ? "bg-primary/10 text-primary"
                        : "text-text-secondary hover:text-foreground hover:bg-surface-variant",
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Search */}
            {cfg.showSearch && (
              <div className="hidden md:flex items-center relative">
                <Search className="absolute left-3 w-4 h-4 text-text-muted pointer-events-none" />
                <input
                  type="text"
                  placeholder={cfg.searchPlaceholder}
                  className="w-64 pl-9 pr-4 py-2 bg-surface-variant border border-border rounded-xl text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <kbd className="absolute right-3 hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-text-muted bg-surface border border-border rounded">
                  ⌘K
                </kbd>
              </div>
            )}

            {/* Mobile Search Toggle */}
            {cfg.showMobileSearch && (
              <button
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="md:hidden p-2 rounded-xl hover:bg-surface-variant transition-colors text-text-secondary"
              >
                {showMobileSearch ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            )}

            {/* Notifications */}
            {cfg.showNotifications && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowUserMenu(false);
                  }}
                  className={cn(
                    "relative p-2.5 rounded-xl transition-all cursor-pointer",
                    showNotifications
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-surface-variant text-text-secondary hover:text-foreground",
                  )}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-notification text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-surface">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <NotificationPanel
                      notifications={notifications}
                      onClose={() => setShowNotifications(false)}
                    />
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* User Menu */}
            {cfg.showUserMenu && (
              <>
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowUserMenu(!showUserMenu);
                        setShowNotifications(false);
                      }}
                      className={cn(
                        "flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl transition-all border cursor-pointer",
                        showUserMenu
                          ? "bg-primary/5 border-primary/20 text-primary"
                          : "border-transparent hover:bg-surface-variant hover:border-border text-text-secondary hover:text-foreground",
                      )}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs border border-primary/20">
                        {user.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={user.name}
                            fill
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                        )}
                      </div>
                      <div className="hidden sm:block text-left">
                        <p className="text-sm font-medium leading-tight">
                          {user.name.split(" ")[0]}
                        </p>
                        <p className="text-[10px] text-text-muted capitalize">
                          {user.role}
                        </p>
                      </div>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 transition-transform",
                          showUserMenu && "rotate-180",
                        )}
                      />
                    </button>

                    <AnimatePresence>
                      {showUserMenu && (
                        <UserDropdown
                          user={user}
                          onClose={() => setShowUserMenu(false)}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    href="/auth/sign-in"
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
                  >
                    <User className="w-4 h-4" />
                    Sign In
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {showMobileSearch && cfg.showMobileSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="relative pb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder={cfg.searchPlaceholder}
                  autoFocus
                  className="w-full pl-9 pr-4 py-2.5 bg-surface-variant border border-border rounded-xl text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

// ─── Demo Data ─────────────────────────────────────────────────────

export const demoNotifications: Notification[] = [
  {
    id: "1",
    title: "Urgent: Patient vitals critical",
    message:
      "Patient #2847 showing abnormal heart rate. Immediate attention required.",
    type: "urgent",
    time: "2m ago",
    read: false,
  },
  {
    id: "2",
    title: "Appointment confirmed",
    message:
      "Dr. Sarah Chen confirmed your appointment for tomorrow at 10:00 AM.",
    type: "success",
    time: "1h ago",
    read: false,
  },
  {
    id: "3",
    title: "New lab results available",
    message: "Blood work results for patient #2901 are now ready for review.",
    type: "info",
    time: "3h ago",
    read: true,
  },
  {
    id: "4",
    title: "Prescription renewal pending",
    message: "Amoxicillin prescription expires in 2 days. Renewal requested.",
    type: "warning",
    time: "5h ago",
    read: true,
  },
];

export const demoUser: UserProfile = {
  name: "Dr. Sarah Mitchell",
  email: "s.mitchell@healthcard.com",
  role: "doctor",
  specialty: "cardiology",
};
