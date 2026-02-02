import { userProfile } from "@/src/domain/entities/user-profile";

export const defaultUserProfile: userProfile = {
  profileVersion: 1,
  // Si falta alguno de estos, normalmente no vale la pena leer a fondo el JD.
  mustHaveKeywords: ["react", "typescript", "javascript", "frontend", "web"],

  // Si aparece fuerte (core requirement), descartar.
  hardNoKeywords: [
    "angular",
    "adobe experience manager",
    "aem",
    "adobe campaign",
    "adobe analytics",
    "photoshop",
    "illustrator",
    "ruby",
    "rails",
    "ror",
    "tech lead",
  ],

  // Senales "muy buen fit" (priorizar).
  preferredKeywords: [
    "next.js",
    "nextjs",
    "vite",
    "tailwind",
    "react query",
    "tanstack query",
    "zustand",
    "redux",
    "ag-grid",
    "ag grid",
    "graphql",
    "rest",
    "accessibility",
    "wcag",
    "performance",
    "profiling",
    "web vitals",
    "observability",
    "storybook",
    "design system",
    "tokens",
    "ci/cd",
    "github actions",
    "testing",
    "vitest",
    "jest",
    "playwright",
    "cypress",
    "supabase",
    "postgres",
    "saas",
    "rbac",
    "html",
    "css",
  ],

  // Cosas que no son "hard no", pero si dominan el rol, pierde prioridad.
  excludedKeywords: [
    "wordpress",
    "php",
    "drupal",
    "joomla",
    "shopify liquid",
    "magento",
    "ios",
    "swift",
    "kotlin",
    "flutter",
    "qa only",
    "manual testing",
    "data entry",
    "backend",
  ],

  notes:
    "Perfil: Frontend (React/TS) ~5+ años, foco en UI moderna, performance, accesibilidad y diseño (design systems/tokens). Experiencia con equipos remotos/asincronos.",
};
