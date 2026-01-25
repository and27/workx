import { application } from "@/src/domain/entities/application";
import { applicationLogEntry } from "@/src/domain/entities/application-log-entry";
import { job } from "@/src/domain/entities/job";
import { applicationLogEventType } from "@/src/domain/types/application-log-event-type";
import { applicationStatus } from "@/src/domain/types/application-status";
import { dateOnly } from "@/src/domain/types/date-only";
import { isoDateTime } from "@/src/domain/types/iso-date-time";
import { priority } from "@/src/domain/types/priority";

const pad = (value: number) => String(value).padStart(2, "0");

const toDateOnly = (date: Date): dateOnly =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const addDays = (date: Date, days: number) =>
  new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + days,
    date.getHours(),
    date.getMinutes(),
    0,
    0
  );

const addMinutes = (date: Date, minutes: number) =>
  new Date(date.getTime() + minutes * 60 * 1000);

const toIso = (date: Date): isoDateTime => date.toISOString();

const toHex = (value: number, length: number) =>
  value.toString(16).padStart(length, "0");

const makeId = (seed: number) =>
  `${toHex(seed, 8)}-${toHex(seed, 4)}-${toHex(seed, 4)}-${toHex(
    seed,
    4
  )}-${toHex(seed, 12)}`;

const seedNow = new Date();
const seedToday = new Date(
  seedNow.getFullYear(),
  seedNow.getMonth(),
  seedNow.getDate(),
  9,
  0,
  0,
  0
);

const seedApplicationsBase = (data: {
  id: number;
  company: string;
  role: string;
  status: applicationStatus;
  priority: priority;
  nextActionOffset: number | null;
  source: string;
  notes: string;
  jobId?: number;
  createdOffsetDays: number;
  updatedOffsetDays: number;
}): application => ({
  id: makeId(2000 + data.id),
  company: data.company,
  role: data.role,
  status: data.status,
  priority: data.priority,
  nextActionAt:
    data.nextActionOffset === null
      ? null
      : toDateOnly(addDays(seedToday, data.nextActionOffset)),
  source: data.source,
  notes: data.notes,
  createdAt: toIso(addDays(seedToday, data.createdOffsetDays)),
  updatedAt: toIso(addDays(seedToday, data.updatedOffsetDays)),
  jobId: data.jobId ? makeId(1000 + data.jobId) : null,
});

const seedJobsBase = (data: {
  id: number;
  company: string;
  role: string;
  source: string;
  sourceUrl?: string | null;
  externalId?: string | null;
  location: string;
  seniority: string;
  tags: string[];
  description?: string | null;
  publishedAt?: isoDateTime | null;
  createdOffsetDays: number;
  updatedOffsetDays: number;
}): job => ({
  id: makeId(1000 + data.id),
  company: data.company,
  role: data.role,
  source: data.source,
  sourceUrl: data.sourceUrl ?? null,
  externalId: data.externalId ?? null,
  location: data.location,
  seniority: data.seniority,
  tags: data.tags,
  description: data.description ?? null,
  publishedAt: data.publishedAt ?? null,
  createdAt: toIso(addDays(seedToday, data.createdOffsetDays)),
  updatedAt: toIso(addDays(seedToday, data.updatedOffsetDays)),
});

const seedLogBase = (data: {
  id: number;
  applicationId: number;
  type: applicationLogEventType;
  message: string;
  minutesOffset: number;
  daysOffset: number;
}): applicationLogEntry => ({
  id: makeId(3000 + data.id),
  applicationId: makeId(2000 + data.applicationId),
  type: data.type,
  message: data.message,
  createdAt: toIso(
    addMinutes(addDays(seedToday, data.daysOffset), data.minutesOffset)
  ),
});

export const seedJobs: job[] = [
  seedJobsBase({
    id: 1,
    company: "FluxLabs",
    role: "Frontend Engineer",
    source: "LinkedIn",
    location: "Ciudad de Mexico",
    seniority: "Mid",
    tags: ["React", "TypeScript", "Design Systems"],
    createdOffsetDays: -21,
    updatedOffsetDays: -14,
  }),
  seedJobsBase({
    id: 2,
    company: "NovaHealth",
    role: "Fullstack Engineer",
    source: "Referral",
    location: "Remoto - LATAM",
    seniority: "Senior",
    tags: ["Node", "React", "Postgres"],
    createdOffsetDays: -18,
    updatedOffsetDays: -10,
  }),
  seedJobsBase({
    id: 3,
    company: "Redwood Finance",
    role: "Data Engineer",
    source: "Indeed",
    location: "Monterrey",
    seniority: "Mid",
    tags: ["Python", "ETL", "Snowflake"],
    createdOffsetDays: -16,
    updatedOffsetDays: -8,
  }),
  seedJobsBase({
    id: 4,
    company: "Atlas Robotics",
    role: "Backend Engineer",
    source: "AngelList",
    location: "Guadalajara",
    seniority: "Senior",
    tags: ["Go", "gRPC", "Kubernetes"],
    createdOffsetDays: -15,
    updatedOffsetDays: -9,
  }),
  seedJobsBase({
    id: 5,
    company: "Vista Retail",
    role: "Product Designer",
    source: "LinkedIn",
    location: "Remoto",
    seniority: "Mid",
    tags: ["Figma", "Design Systems"],
    createdOffsetDays: -12,
    updatedOffsetDays: -6,
  }),
  seedJobsBase({
    id: 6,
    company: "Lumen Energy",
    role: "DevOps Engineer",
    source: "Company Site",
    location: "Ciudad de Mexico",
    seniority: "Senior",
    tags: ["AWS", "Terraform", "CI/CD"],
    createdOffsetDays: -12,
    updatedOffsetDays: -5,
  }),
  seedJobsBase({
    id: 7,
    company: "Kite Travel",
    role: "Mobile Engineer",
    source: "LinkedIn",
    location: "Remoto",
    seniority: "Mid",
    tags: ["React Native", "TypeScript"],
    createdOffsetDays: -11,
    updatedOffsetDays: -4,
  }),
  seedJobsBase({
    id: 8,
    company: "Orbit Payments",
    role: "Platform Engineer",
    source: "Referral",
    location: "Ciudad de Mexico",
    seniority: "Senior",
    tags: ["Kubernetes", "Terraform", "Go"],
    createdOffsetDays: -10,
    updatedOffsetDays: -3,
  }),
  seedJobsBase({
    id: 9,
    company: "Clearpath Logistics",
    role: "Analytics Engineer",
    source: "Indeed",
    location: "Remoto - LATAM",
    seniority: "Mid",
    tags: ["dbt", "Snowflake", "Python"],
    createdOffsetDays: -9,
    updatedOffsetDays: -2,
  }),
  seedJobsBase({
    id: 10,
    company: "Mosaic Education",
    role: "Frontend Engineer",
    source: "LinkedIn",
    location: "Bogota",
    seniority: "Mid",
    tags: ["React", "TypeScript", "Accessibility"],
    createdOffsetDays: -8,
    updatedOffsetDays: -1,
  }),
  seedJobsBase({
    id: 11,
    company: "Harbor Media",
    role: "Growth Engineer",
    source: "Company Site",
    location: "Remoto",
    seniority: "Mid",
    tags: ["Next.js", "Experimentation"],
    createdOffsetDays: -7,
    updatedOffsetDays: -1,
  }),
  seedJobsBase({
    id: 12,
    company: "Pulse Fitness",
    role: "Backend Engineer",
    source: "LinkedIn",
    location: "Sao Paulo",
    seniority: "Senior",
    tags: ["Node", "GraphQL", "Postgres"],
    createdOffsetDays: -7,
    updatedOffsetDays: 0,
  }),
  seedJobsBase({
    id: 13,
    company: "Aurora Analytics",
    role: "Data Scientist",
    source: "Indeed",
    location: "Remoto",
    seniority: "Senior",
    tags: ["Python", "ML", "Product Analytics"],
    createdOffsetDays: -6,
    updatedOffsetDays: 0,
  }),
  seedJobsBase({
    id: 14,
    company: "Northwind",
    role: "Fullstack Engineer",
    source: "LinkedIn",
    location: "Ciudad de Mexico",
    seniority: "Mid",
    tags: ["React", "Node", "MongoDB"],
    createdOffsetDays: -6,
    updatedOffsetDays: 0,
  }),
  seedJobsBase({
    id: 15,
    company: "Skyline Realty",
    role: "Product Manager",
    source: "Company Site",
    location: "Remoto",
    seniority: "Senior",
    tags: ["B2B", "Roadmapping"],
    createdOffsetDays: -5,
    updatedOffsetDays: 0,
  }),
  seedJobsBase({
    id: 16,
    company: "Beacon Security",
    role: "Security Engineer",
    source: "LinkedIn",
    location: "Monterrey",
    seniority: "Senior",
    tags: ["AppSec", "Threat Modeling"],
    createdOffsetDays: -4,
    updatedOffsetDays: 1,
  }),
  seedJobsBase({
    id: 17,
    company: "Wave Commerce",
    role: "Frontend Engineer",
    source: "AngelList",
    location: "Remoto",
    seniority: "Mid",
    tags: ["React", "TypeScript", "Commerce"],
    createdOffsetDays: -4,
    updatedOffsetDays: 1,
  }),
  seedJobsBase({
    id: 18,
    company: "BrightFleet",
    role: "Ops Analyst",
    source: "Indeed",
    location: "Guadalajara",
    seniority: "Junior",
    tags: ["SQL", "Excel", "Ops"],
    createdOffsetDays: -3,
    updatedOffsetDays: 1,
  }),
  seedJobsBase({
    id: 19,
    company: "Evergreen Foods",
    role: "Supply Chain Manager",
    source: "LinkedIn",
    location: "Monterrey",
    seniority: "Senior",
    tags: ["Supply Chain", "Operations"],
    createdOffsetDays: -3,
    updatedOffsetDays: 1,
  }),
  seedJobsBase({
    id: 20,
    company: "Citrus Cloud",
    role: "Site Reliability Engineer",
    source: "Company Site",
    location: "Remoto",
    seniority: "Senior",
    tags: ["SRE", "AWS", "Observability"],
    createdOffsetDays: -2,
    updatedOffsetDays: 2,
  }),
  seedJobsBase({
    id: 21,
    company: "Sierra Telecom",
    role: "Network Engineer",
    source: "LinkedIn",
    location: "Ciudad de Mexico",
    seniority: "Mid",
    tags: ["Networking", "Security"],
    createdOffsetDays: -2,
    updatedOffsetDays: 2,
  }),
  seedJobsBase({
    id: 22,
    company: "Pioneer AI",
    role: "Machine Learning Engineer",
    source: "AngelList",
    location: "Remoto",
    seniority: "Senior",
    tags: ["Python", "ML", "MLOps"],
    createdOffsetDays: -1,
    updatedOffsetDays: 2,
  }),
  seedJobsBase({
    id: 23,
    company: "Summit HR",
    role: "Product Designer",
    source: "LinkedIn",
    location: "Remoto",
    seniority: "Mid",
    tags: ["UX Research", "Design Systems"],
    createdOffsetDays: -1,
    updatedOffsetDays: 2,
  }),
  seedJobsBase({
    id: 24,
    company: "Vertex Studios",
    role: "Technical Writer",
    source: "Company Site",
    location: "Remoto",
    seniority: "Mid",
    tags: ["Docs", "APIs"],
    createdOffsetDays: 0,
    updatedOffsetDays: 3,
  }),
  seedJobsBase({
    id: 25,
    company: "Copperline",
    role: "QA Engineer",
    source: "Indeed",
    location: "Tijuana",
    seniority: "Mid",
    tags: ["Testing", "Automation"],
    createdOffsetDays: 0,
    updatedOffsetDays: 3,
  }),
];

export const seedApplications: application[] = [
  seedApplicationsBase({
    id: 1,
    company: "FluxLabs",
    role: "Frontend Engineer",
    status: "screen",
    priority: "high",
    nextActionOffset: -2,
    source: "LinkedIn",
    notes: "Entrevista inicial completada. Esperando feedback.",
    jobId: 1,
    createdOffsetDays: -20,
    updatedOffsetDays: -1,
  }),
  seedApplicationsBase({
    id: 2,
    company: "NovaHealth",
    role: "Fullstack Engineer",
    status: "applied",
    priority: "medium",
    nextActionOffset: 0,
    source: "Referral",
    notes: "Enviar seguimiento con el reclutador.",
    jobId: 2,
    createdOffsetDays: -17,
    updatedOffsetDays: 0,
  }),
  seedApplicationsBase({
    id: 3,
    company: "Orbit Payments",
    role: "Platform Engineer",
    status: "tech",
    priority: "high",
    nextActionOffset: 1,
    source: "Referral",
    notes: "Preparar caso de estudio técnico.",
    jobId: 8,
    createdOffsetDays: -9,
    updatedOffsetDays: 0,
  }),
  seedApplicationsBase({
    id: 4,
    company: "Mosaic Education",
    role: "Frontend Engineer",
    status: "saved",
    priority: "medium",
    nextActionOffset: 3,
    source: "LinkedIn",
    notes: "Revisar posicionamiento salarial.",
    jobId: 10,
    createdOffsetDays: -6,
    updatedOffsetDays: -2,
  }),
  seedApplicationsBase({
    id: 5,
    company: "Pulse Fitness",
    role: "Backend Engineer",
    status: "applied",
    priority: "medium",
    nextActionOffset: 5,
    source: "LinkedIn",
    notes: "Confirmar stack exacto con el hiring manager.",
    jobId: 12,
    createdOffsetDays: -7,
    updatedOffsetDays: -1,
  }),
  seedApplicationsBase({
    id: 6,
    company: "Aurora Analytics",
    role: "Data Scientist",
    status: "rejected",
    priority: "low",
    nextActionOffset: null,
    source: "Indeed",
    notes: "No encajo con el enfoque del rol.",
    jobId: 13,
    createdOffsetDays: -6,
    updatedOffsetDays: -3,
  }),
  seedApplicationsBase({
    id: 7,
    company: "Wave Commerce",
    role: "Frontend Engineer",
    status: "screen",
    priority: "high",
    nextActionOffset: -1,
    source: "AngelList",
    notes: "Agendar entrevista técnica.",
    jobId: 17,
    createdOffsetDays: -4,
    updatedOffsetDays: -1,
  }),
  seedApplicationsBase({
    id: 8,
    company: "Citrus Cloud",
    role: "Site Reliability Engineer",
    status: "ghosted",
    priority: "low",
    nextActionOffset: -4,
    source: "Company Site",
    notes: "Sin respuesta desde el envío.",
    jobId: 20,
    createdOffsetDays: -10,
    updatedOffsetDays: -6,
  }),
  seedApplicationsBase({
    id: 9,
    company: "Pioneer AI",
    role: "Machine Learning Engineer",
    status: "applied",
    priority: "medium",
    nextActionOffset: 7,
    source: "AngelList",
    notes: "Pendiente de revisión.",
    jobId: 22,
    createdOffsetDays: -2,
    updatedOffsetDays: 0,
  }),
  seedApplicationsBase({
    id: 10,
    company: "Copperline",
    role: "QA Engineer",
    status: "saved",
    priority: "medium",
    nextActionOffset: 10,
    source: "Indeed",
    notes: "Actualizar CV con experiencia en automatizacion.",
    jobId: 25,
    createdOffsetDays: -1,
    updatedOffsetDays: 0,
  }),
];

export const seedApplicationLogs: applicationLogEntry[] = [
  seedLogBase({
    id: 1,
    applicationId: 1,
    type: "created_from_job",
    message: "Postulacion creada desde trabajo guardado.",
    minutesOffset: 10,
    daysOffset: -20,
  }),
  seedLogBase({
    id: 2,
    applicationId: 1,
    type: "status_changed",
    message: "Estado actualizado a screen.",
    minutesOffset: 20,
    daysOffset: -5,
  }),
  seedLogBase({
    id: 3,
    applicationId: 2,
    type: "created_from_job",
    message: "Postulacion creada desde referido.",
    minutesOffset: 15,
    daysOffset: -17,
  }),
  seedLogBase({
    id: 4,
    applicationId: 2,
    type: "next_action_set",
    message: "Se agendo seguimiento para hoy.",
    minutesOffset: 30,
    daysOffset: 0,
  }),
  seedLogBase({
    id: 5,
    applicationId: 3,
    type: "created_from_job",
    message: "Postulacion creada desde referido.",
    minutesOffset: 40,
    daysOffset: -9,
  }),
  seedLogBase({
    id: 6,
    applicationId: 3,
    type: "notes_updated",
    message: "Notas actualizadas con preparacion tecnica.",
    minutesOffset: 50,
    daysOffset: -2,
  }),
  seedLogBase({
    id: 7,
    applicationId: 4,
    type: "created",
    message: "Postulacion creada manualmente.",
    minutesOffset: 20,
    daysOffset: -6,
  }),
  seedLogBase({
    id: 8,
    applicationId: 5,
    type: "created_from_job",
    message: "Postulacion creada desde LinkedIn.",
    minutesOffset: 10,
    daysOffset: -7,
  }),
  seedLogBase({
    id: 9,
    applicationId: 5,
    type: "next_action_set",
    message: "Seguimiento programado.",
    minutesOffset: 25,
    daysOffset: -1,
  }),
  seedLogBase({
    id: 10,
    applicationId: 6,
    type: "created_from_job",
    message: "Postulacion creada desde Indeed.",
    minutesOffset: 5,
    daysOffset: -6,
  }),
  seedLogBase({
    id: 11,
    applicationId: 6,
    type: "status_changed",
    message: "Estado actualizado a rejected.",
    minutesOffset: 15,
    daysOffset: -3,
  }),
  seedLogBase({
    id: 12,
    applicationId: 7,
    type: "created_from_job",
    message: "Postulacion creada desde AngelList.",
    minutesOffset: 10,
    daysOffset: -4,
  }),
  seedLogBase({
    id: 13,
    applicationId: 7,
    type: "next_action_set",
    message: "Entrevista tecnica pendiente.",
    minutesOffset: 20,
    daysOffset: -1,
  }),
  seedLogBase({
    id: 14,
    applicationId: 8,
    type: "created_from_job",
    message: "Postulacion creada desde sitio de la empresa.",
    minutesOffset: 10,
    daysOffset: -10,
  }),
  seedLogBase({
    id: 15,
    applicationId: 8,
    type: "next_action_cleared",
    message: "Seguimiento cancelado por falta de respuesta.",
    minutesOffset: 30,
    daysOffset: -6,
  }),
  seedLogBase({
    id: 16,
    applicationId: 9,
    type: "created_from_job",
    message: "Postulacion creada desde AngelList.",
    minutesOffset: 12,
    daysOffset: -2,
  }),
  seedLogBase({
    id: 17,
    applicationId: 10,
    type: "created_from_job",
    message: "Postulacion creada desde Indeed.",
    minutesOffset: 14,
    daysOffset: -1,
  }),
];
