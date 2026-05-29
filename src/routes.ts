export interface ScreenRoute {
  path: string;
  id: string;
  title: string;
  role: string;
}

export const SCREEN_ROUTES: ScreenRoute[] = [
  // ── Entry ──────────────────────────────────────────
  { path: "/signin",                    id: "signin",                               title: "Sign In",                   role: "Entry" },
  { path: "/signup",                    id: "signup",                               title: "Sign Up",                   role: "Entry" },

  // ── End User ───────────────────────────────────────
  { path: "/my-tickets",                id: "my_tickets_requests",                  title: "My Tickets",                role: "End User" },
  { path: "/ticket-details",            id: "ticket_details",                       title: "Ticket Details",            role: "End User" },

  // ── ICT Officer ────────────────────────────────────
  { path: "/ict-support",               id: "ict_support_dashboard",                title: "ICT Dashboard",             role: "Shared" },
  { path: "/ict-queue",                 id: "ict_officer_global_queue",             title: "Global Queue",              role: "ICT Officer" },
  { path: "/ict-analytics",             id: "ict_analytics_dashboard",              title: "ICT Analytics",             role: "Shared" },
  { path: "/emergency",                 id: "emergency_operations_dashboard",       title: "Emergency Ops",             role: "ICT Officer" },

  // ── Admin ──────────────────────────────────────────
  { path: "/admin/users",               id: "admin_user_management",                title: "User Management",           role: "Admin" },
  { path: "/admin/app-settings",        id: "admin_app_settings",                   title: "App Settings",              role: "Admin" },
  { path: "/admin/export-history",      id: "admin_user_management_export_history", title: "Export History",            role: "Admin" },
  { path: "/admin/provision/personal",  id: "provision_user_personal_details",      title: "Provision: Personal",       role: "Admin" },
  { path: "/admin/provision/role",      id: "provision_user_role_access_level",     title: "Provision: Access Level",   role: "Admin" },
  { path: "/admin/provision/security",  id: "provision_user_security_credentials",  title: "Provision: Security",       role: "Admin" },
  { path: "/settings",                  id: "system_settings",                      title: "System Settings",           role: "Shared" },
  { path: "/settings/roles",            id: "settings_role_permissions",            title: "Roles & Permissions",       role: "Admin" },
  { path: "/settings/roles/redesign",   id: "role_permissions_redesign",            title: "Roles (Redesign)",          role: "Admin" },
  { path: "/ucu-report",                id: "ucu_intelligence_report",              title: "UCU Intelligence",          role: "Admin" },

  // ── Shared ─────────────────────────────────────────
  { path: "/knowledge-base",            id: "knowledge_base",                       title: "Knowledge Base",            role: "Shared" },
  { path: "/clinical-hub",              id: "clinical_knowledge_hub",               title: "Clinical Hub",              role: "Shared" },
];
