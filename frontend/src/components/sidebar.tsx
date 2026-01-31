"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  FileText,
  Home,
  Users,
  FolderPlus,
  Search,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Activity,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "records", label: "Historias Clínicas", icon: FileText },
  { id: "patients", label: "Pacientes", icon: Users },
  { id: "new", label: "Nueva Historia", icon: FolderPlus },
  { id: "search", label: "Buscar", icon: Search },
]

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 relative",
        collapsed ? "w-20" : "w-72"
      )}
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-semibold text-sidebar-foreground truncate">
                MediRecord
              </h1>
              <p className="text-xs text-sidebar-foreground/60">
                Historias Clínicas
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      {!collapsed && (
        <div className="p-4 mx-4 mt-4 rounded-lg bg-sidebar-accent/50 border border-sidebar-border">
          <h3 className="text-sm font-medium text-sidebar-foreground mb-2">
            Sistema de Gestión
          </h3>
          <p className="text-xs text-sidebar-foreground/70 leading-relaxed">
            Administre, almacene y consulte historias clínicas de forma segura y
            eficiente. Acceda a los registros médicos de sus pacientes en
            cualquier momento.
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p
          className={cn(
            "text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-3",
            collapsed && "text-center"
          )}
        >
          {collapsed ? "—" : "Menú"}
        </p>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
              collapsed && "justify-center",
              activeSection === item.id
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Features Section */}
      {!collapsed && (
        <div className="px-4 pb-4">
          <div className="p-4 rounded-lg border border-sidebar-border bg-sidebar-accent/30">
            <h4 className="text-xs font-medium text-sidebar-foreground/80 uppercase tracking-wider mb-3">
              Funcionalidades
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-xs text-sidebar-foreground/60">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Crear y editar historias
              </li>
              <li className="flex items-center gap-2 text-xs text-sidebar-foreground/60">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Búsqueda avanzada
              </li>
              <li className="flex items-center gap-2 text-xs text-sidebar-foreground/60">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Exportar a PDF
              </li>
              <li className="flex items-center gap-2 text-xs text-sidebar-foreground/60">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Historial completo
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-sidebar-accent flex items-center justify-center shrink-0">
            <span className="text-sm font-medium text-sidebar-foreground">
              DR
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                Dr. Rodríguez
              </p>
              <p className="text-xs text-sidebar-foreground/60">
                Medicina General
              </p>
            </div>
          )}
          {!collapsed && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-sidebar-foreground/60 hover:text-destructive hover:bg-sidebar-accent"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}