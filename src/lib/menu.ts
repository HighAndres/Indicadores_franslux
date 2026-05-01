import {
  BarChart3,
  Download,
  Home,
  LineChart,
  Upload,
  Users,
  UserRound,
} from "lucide-react";

export const dashboardMenu = [
  {
    label: "Inicio",
    href: "/dashboard",
    icon: Home,
    roles: ["CLIENT_ADMIN", "CLIENT_USER"],
  },
  {
    label: "Forecast",
    href: "/dashboard/forecast",
    icon: LineChart,
    roles: ["CLIENT_ADMIN", "CLIENT_USER"],
  },
  {
    label: "Headcount",
    href: "/dashboard/hc",
    icon: UserRound,
    roles: ["CLIENT_ADMIN", "CLIENT_USER"],
  },
  {
    label: "Comercial",
    href: "/dashboard/comercial",
    icon: BarChart3,
    roles: ["CLIENT_ADMIN", "CLIENT_USER"],
  },
  {
    label: "Reportes",
    href: "/dashboard/reportes",
    icon: Download,
    roles: ["CLIENT_ADMIN", "CLIENT_USER"],
  },
  {
    label: "Usuarios",
    href: "/dashboard/usuarios",
    icon: Users,
    roles: ["CLIENT_ADMIN"],
  },
  {
    label: "Carga de datos",
    href: "/dashboard/carga-datos",
    icon: Upload,
    roles: ["CLIENT_ADMIN"],
  },
] as const;
