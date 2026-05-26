"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Stethoscope,
  ChevronRight,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Timer,
  User,
  Phone,
  Mail,
  CalendarDays,
  LayoutGrid,
  List,
  ArrowUpRight,
  Bell,
  Plus,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Container } from "@/components/container";

// ─── Types ─────────────────────────────────────────────────────────

type AppointmentStatus =
  | "available"
  | "booked"
  | "unavailable"
  | "urgent"
  | "pending";
type Specialty =
  | "cardiology"
  | "dermatology"
  | "neurology"
  | "pediatrics"
  | "orthopedics"
  | "general"
  | "dentistry"
  | "ophthalmology"
  | "psychiatry"
  | "gynecology";
type ViewMode = "list" | "grid";

interface Doctor {
  id: string;
  name: string;
  specialty: Specialty;
  avatar: string;
  rating: number;
  experience: string;
}

interface Appointment {
  id: string;
  doctor: Doctor;
  patientName: string;
  date: string;
  time: string;
  duration: string;
  status: AppointmentStatus;
  type: string;
  location: string;
  notes?: string;
}

// ─── Mock Data ─────────────────────────────────────────────────────

const SPECIALTIES: { value: Specialty; label: string; icon: string }[] = [
  { value: "cardiology", label: "Cardiology", icon: "❤️" },
  { value: "dermatology", label: "Dermatology", icon: "🔬" },
  { value: "neurology", label: "Neurology", icon: "🧠" },
  { value: "pediatrics", label: "Pediatrics", icon: "👶" },
  { value: "orthopedics", label: "Orthopedics", icon: "🦴" },
  { value: "general", label: "General", icon: "🩺" },
  { value: "dentistry", label: "Dentistry", icon: "🦷" },
  { value: "ophthalmology", label: "Ophthalmology", icon: "👁️" },
  { value: "psychiatry", label: "Psychiatry", icon: "🧘" },
  { value: "gynecology", label: "Gynecology", icon: "⚕️" },
];

const STATUS_CONFIG: Record<
  AppointmentStatus,
  {
    label: string;
    icon: React.ReactNode;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  available: {
    label: "Available",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    variant: "default",
  },
  booked: {
    label: "Booked",
    icon: <Calendar className="w-3.5 h-3.5" />,
    variant: "secondary",
  },
  unavailable: {
    label: "Unavailable",
    icon: <XCircle className="w-3.5 h-3.5" />,
    variant: "outline",
  },
  urgent: {
    label: "Urgent",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    variant: "destructive",
  },
  pending: {
    label: "Pending",
    icon: <Timer className="w-3.5 h-3.5" />,
    variant: "default",
  },
};

const DOCTORS: Doctor[] = [
  {
    id: "1",
    name: "Dr. Sarah Chen",
    specialty: "cardiology",
    avatar: "SC",
    rating: 4.9,
    experience: "12 years",
  },
  {
    id: "2",
    name: "Dr. Michael Ross",
    specialty: "neurology",
    avatar: "MR",
    rating: 4.8,
    experience: "8 years",
  },
  {
    id: "3",
    name: "Dr. Emily Watson",
    specialty: "pediatrics",
    avatar: "EW",
    rating: 5.0,
    experience: "15 years",
  },
  {
    id: "4",
    name: "Dr. James Wilson",
    specialty: "orthopedics",
    avatar: "JW",
    rating: 4.7,
    experience: "10 years",
  },
  {
    id: "5",
    name: "Dr. Lisa Park",
    specialty: "dermatology",
    avatar: "LP",
    rating: 4.9,
    experience: "6 years",
  },
  {
    id: "6",
    name: "Dr. Robert Kim",
    specialty: "general",
    avatar: "RK",
    rating: 4.6,
    experience: "20 years",
  },
];

const APPOINTMENTS: Appointment[] = [
  {
    id: "1",
    doctor: DOCTORS[0],
    patientName: "John Anderson",
    date: "2026-05-27",
    time: "09:00 AM",
    duration: "45 min",
    status: "booked",
    type: "Follow-up",
    location: "Room 302, Cardiology Wing",
  },
  {
    id: "2",
    doctor: DOCTORS[1],
    patientName: "Maria Garcia",
    date: "2026-05-27",
    time: "10:30 AM",
    duration: "30 min",
    status: "urgent",
    type: "Consultation",
    location: "Room 105, Neurology Dept",
    notes: "Patient experiencing severe migraines",
  },
  {
    id: "3",
    doctor: DOCTORS[2],
    patientName: "Available Slot",
    date: "2026-05-27",
    time: "11:00 AM",
    duration: "30 min",
    status: "available",
    type: "Check-up",
    location: "Room 201, Pediatrics",
  },
  {
    id: "4",
    doctor: DOCTORS[3],
    patientName: "David Thompson",
    date: "2026-05-27",
    time: "02:00 PM",
    duration: "60 min",
    status: "pending",
    type: "Surgery Prep",
    location: "Room 401, Orthopedics",
  },
  {
    id: "5",
    doctor: DOCTORS[4],
    patientName: "Available Slot",
    date: "2026-05-27",
    time: "03:30 PM",
    duration: "30 min",
    status: "available",
    type: "Consultation",
    location: "Room 502, Dermatology",
  },
  {
    id: "6",
    doctor: DOCTORS[0],
    patientName: "Sarah Miller",
    date: "2026-05-28",
    time: "09:30 AM",
    duration: "45 min",
    status: "booked",
    type: "ECG Review",
    location: "Room 302, Cardiology Wing",
  },
  {
    id: "7",
    doctor: DOCTORS[5],
    patientName: "Available Slot",
    date: "2026-05-28",
    time: "11:00 AM",
    duration: "30 min",
    status: "available",
    type: "General Check-up",
    location: "Room 101, General Practice",
  },
  {
    id: "8",
    doctor: DOCTORS[1],
    patientName: "James Cooper",
    date: "2026-05-28",
    time: "01:00 PM",
    duration: "30 min",
    status: "unavailable",
    type: "MRI Review",
    location: "Room 105, Neurology Dept",
  },
];

// ─── Components ────────────────────────────────────────────────────

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  delay,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <Card className="border-border/50 bg-surface hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-text-muted">{title}</p>
            <h3 className="text-3xl font-bold text-text">{value}</h3>
            <p className="text-xs text-text-secondary">{subtitle}</p>
          </div>
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const SpecialtyFilter = ({
  selected,
  onSelect,
}: {
  selected: Specialty | "all";
  onSelect: (s: Specialty | "all") => void;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
    className="space-y-3"
  >
    <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider px-2">
      Specialties
    </h3>
    <div className="space-y-1">
      <Button
        variant={selected === "all" ? "secondary" : "ghost"}
        className={`w-full justify-start gap-3 h-11 ${selected === "all" ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-text-secondary hover:text-text hover:bg-surface-variant"}`}
        onClick={() => onSelect("all")}
      >
        <Stethoscope className="w-4 h-4" />
        All Specialties
      </Button>
      {SPECIALTIES.map((spec) => (
        <Button
          key={spec.value}
          variant={selected === spec.value ? "secondary" : "ghost"}
          className={`w-full justify-start gap-3 h-11 ${selected === spec.value ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-text-secondary hover:text-text hover:bg-surface-variant"}`}
          onClick={() => onSelect(spec.value)}
        >
          <span className="w-4 h-4 flex items-center justify-center text-xs">
            {spec.icon}
          </span>
          {spec.label}
        </Button>
      ))}
    </div>
  </motion.div>
);

const AppointmentCard = ({
  appointment,
  index,
  viewMode,
}: {
  appointment: Appointment;
  index: number;
  viewMode: ViewMode;
}) => {
  const status = STATUS_CONFIG[appointment.status];
  const isGrid = viewMode === "grid";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Card
        className={`group border-border/50 bg-surface hover:border-primary/30 transition-all duration-300 hover:shadow-md overflow-hidden ${isGrid ? "" : ""}`}
      >
        <CardContent className={`p-0 ${isGrid ? "" : ""}`}>
          <div
            className={`${isGrid ? "p-5 space-y-4" : "flex items-center p-4 gap-4"}`}
          >
            {/* Time Column */}
            <div
              className={`${isGrid ? "flex items-center justify-between" : "flex flex-col items-center justify-center min-w-[80px] border-r border-border/50 pr-4"}`}
            >
              <div className="text-center">
                <p className="text-lg font-bold text-text">
                  {appointment.time.split(" ")[0]}
                </p>
                <p className="text-xs font-medium text-text-muted">
                  {appointment.time.split(" ")[1]}
                </p>
              </div>
              {isGrid && (
                <Badge variant={status.variant} className="gap-1.5">
                  {status.icon}
                  {status.label}
                </Badge>
              )}
            </div>

            {/* Main Content */}
            <div
              className={`flex-1 min-w-0 ${isGrid ? "space-y-3" : "space-y-1"}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-10 w-10 border-2 border-border/50">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {appointment.doctor.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold text-text truncate">
                      {appointment.doctor.name}
                    </p>
                    <p className="text-xs text-text-muted capitalize">
                      {appointment.doctor.specialty}
                    </p>
                  </div>
                </div>
                {!isGrid && (
                  <Badge variant={status.variant} className="gap-1.5 shrink-0">
                    {status.icon}
                    {status.label}
                  </Badge>
                )}
              </div>

              <div
                className={`${isGrid ? "space-y-2 pt-2 border-t border-border/50" : "flex items-center gap-4 flex-wrap"}`}
              >
                <div className="flex items-center gap-1.5 text-text-secondary">
                  <User className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-sm truncate">
                    {appointment.patientName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-text-secondary">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-sm">{appointment.duration}</span>
                </div>
                <div className="flex items-center gap-1.5 text-text-secondary">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-sm truncate">
                    {appointment.location}
                  </span>
                </div>
              </div>

              {appointment.notes && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-2 p-2.5 rounded-lg bg-warning/10 border border-warning/20"
                >
                  <p className="text-xs text-warning flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {appointment.notes}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Actions */}
            <div
              className={`${isGrid ? "flex gap-2 pt-2" : "flex items-center gap-1 shrink-0"}`}
            >
              {appointment.status === "available" ? (
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary-dark text-primary-foreground shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Book
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border hover:bg-surface-variant"
                >
                  Details
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-text-muted hover:text-text"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-surface border-border"
                >
                  <DropdownMenuItem className="text-text hover:bg-surface-variant focus:bg-surface-variant">
                    Reschedule
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-text hover:bg-surface-variant focus:bg-surface-variant">
                    Cancel
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-text hover:bg-surface-variant focus:bg-surface-variant">
                    View History
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const DateHeader = ({ date, count }: { date: string; count: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center gap-3 py-4 sticky top-0 bg-background/95 backdrop-blur-sm z-10"
  >
    <div className="flex items-center gap-2">
      <CalendarDays className="w-5 h-5 text-primary" />
      <h3 className="text-lg font-semibold text-text">
        {new Date(date).toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      </h3>
    </div>
    <Separator className="flex-1 bg-border/50" />
    <Badge variant="outline" className="border-border text-text-muted">
      {count} {count === 1 ? "appointment" : "appointments"}
    </Badge>
  </motion.div>
);

// ─── Main Page ─────────────────────────────────────────────────────

export default function AppointmentsPage() {
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | "all">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">(
    "all",
  );
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const filteredAppointments = useMemo(() => {
    return APPOINTMENTS.filter((apt) => {
      const matchesSpecialty =
        selectedSpecialty === "all" ||
        apt.doctor.specialty === selectedSpecialty;
      const matchesStatus =
        statusFilter === "all" || apt.status === statusFilter;
      const matchesSearch =
        searchQuery === "" ||
        apt.doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.type.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSpecialty && matchesStatus && matchesSearch;
    });
  }, [selectedSpecialty, statusFilter, searchQuery]);

  const groupedAppointments = useMemo(() => {
    const groups: Record<string, Appointment[]> = {};
    filteredAppointments.forEach((apt) => {
      if (!groups[apt.date]) groups[apt.date] = [];
      groups[apt.date].push(apt);
    });
    return groups;
  }, [filteredAppointments]);

  const stats = {
    total: APPOINTMENTS.length,
    booked: APPOINTMENTS.filter((a) => a.status === "booked").length,
    available: APPOINTMENTS.filter((a) => a.status === "available").length,
    urgent: APPOINTMENTS.filter((a) => a.status === "urgent").length,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Container>
        <main>
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Today"
              value={stats.total.toString()}
              subtitle="8 scheduled appointments"
              icon={<Calendar className="w-5 h-5" />}
              delay={0}
            />
            <StatCard
              title="Booked"
              value={stats.booked.toString()}
              subtitle="Confirmed with patients"
              icon={<CheckCircle2 className="w-5 h-5" />}
              delay={0.1}
            />
            <StatCard
              title="Available"
              value={stats.available.toString()}
              subtitle="Open time slots"
              icon={<Clock className="w-5 h-5" />}
              delay={0.2}
            />
            <StatCard
              title="Urgent"
              value={stats.urgent.toString()}
              subtitle="Requires immediate attention"
              icon={<AlertCircle className="w-5 h-5" />}
              delay={0.3}
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-64 shrink-0 space-y-6">
              <SpecialtyFilter
                selected={selectedSpecialty}
                onSelect={setSelectedSpecialty}
              />

              <Separator className="bg-border/50" />

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-3"
              >
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider px-2">
                  Quick Filters
                </h3>
                <div className="space-y-1">
                  {(
                    [
                      "all",
                      "available",
                      "booked",
                      "urgent",
                      "pending",
                      "unavailable",
                    ] as const
                  ).map((status) => (
                    <Button
                      key={status}
                      variant={statusFilter === status ? "secondary" : "ghost"}
                      className={`w-full justify-start gap-3 h-10 capitalize ${statusFilter === status ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-text-secondary hover:text-text hover:bg-surface-variant"}`}
                      onClick={() => setStatusFilter(status)}
                    >
                      {status === "all" ? (
                        <Filter className="w-4 h-4" />
                      ) : (
                        STATUS_CONFIG[status].icon
                      )}
                      {status === "all"
                        ? "All Statuses"
                        : STATUS_CONFIG[status].label}
                    </Button>
                  ))}
                </div>
              </motion.div>

              <Separator className="bg-border/50" />

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10"
              >
                <h4 className="font-semibold text-primary mb-1">Pro Tip</h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Click on any available slot to instantly book a new
                  appointment. Urgent cases are highlighted in red.
                </p>
              </motion.div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
              >
                <div className="relative w-full sm:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <Input
                    placeholder="Search doctors, patients, or types..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-surface border-border/50 text-text placeholder:text-text-muted focus-visible:ring-primary/30"
                  />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Tabs
                    value={viewMode}
                    onValueChange={(v) => setViewMode(v as ViewMode)}
                    className="w-full sm:w-auto"
                  >
                    <TabsList className="bg-surface border border-border/50 p-1">
                      <TabsTrigger
                        value="list"
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
                      >
                        <List className="w-4 h-4" />
                        List
                      </TabsTrigger>
                      <TabsTrigger
                        value="grid"
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
                      >
                        <LayoutGrid className="w-4 h-4" />
                        Grid
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <Button className="bg-primary hover:bg-primary-dark text-primary-foreground shadow-sm shrink-0">
                    <Plus className="w-4 h-4 mr-2" />
                    New
                  </Button>
                </div>
              </motion.div>

              {/* Appointments List */}
              <ScrollArea className="h-[calc(100vh-250px)]">
                <AnimatePresence mode="popLayout">
                  {Object.keys(groupedAppointments).length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-20 text-text-muted"
                    >
                      <Calendar className="w-16 h-16 mb-4 opacity-20" />
                      <p className="text-lg font-medium">
                        No appointments found
                      </p>
                      <p className="text-sm">
                        Try adjusting your filters or search query
                      </p>
                    </motion.div>
                  ) : (
                    <div
                      className={
                        viewMode === "grid"
                          ? "grid grid-cols-1 xl:grid-cols-2 gap-4"
                          : "space-y-2"
                      }
                    >
                      {Object.entries(groupedAppointments).map(
                        ([date, appointments]) => (
                          <React.Fragment key={date}>
                            {viewMode === "list" && (
                              <DateHeader
                                date={date}
                                count={appointments.length}
                              />
                            )}
                            {appointments.map((appointment, idx) => (
                              <AppointmentCard
                                key={appointment.id}
                                appointment={appointment}
                                index={idx}
                                viewMode={viewMode}
                              />
                            ))}
                          </React.Fragment>
                        ),
                      )}
                    </div>
                  )}
                </AnimatePresence>
              </ScrollArea>
            </div>
          </div>
        </main>
      </Container>
    </div>
  );
}
