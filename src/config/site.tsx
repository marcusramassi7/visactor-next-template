import { Gauge, type LucideIcon, MessagesSquare, MapPin, Users, Briefcase, Package, Truck, ShoppingCart } from "lucide-react";

export type SiteConfig = typeof siteConfig;
export type Navigation = {
  icon: LucideIcon;
  name: string;
  href: string;
};

export const siteConfig = {
  title: "VisActor Next Template",
  description: "Template for VisActor and Next.js",
};

export const navigations: Navigation[] = [
  {
    icon: Gauge,
    name: "Dashboard",
    href: "/",
  },
  {
    icon: MessagesSquare,
    name: "Ticket",
    href: "/ticket",
  },
  {
    icon: MapPin,
    name: "Cidades",
    href: "/cidades",
  },
  {
    icon: Users,
    name: "Clientes",
    href: "/clientes",
  },
  {
    icon: Briefcase,
    name: "Setores",
    href: "/setores",
  },
  {
    icon: Package,
    name: "Produtos",
    href: "/produtos",
  },
  {
    icon: Truck,
    name: "Fornecedores",
    href: "/fornecedores",
  },
  {
    icon: ShoppingCart,
    name: "PDV",
    href: "/pdv",
  },
];
