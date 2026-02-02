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

export function Sidebar({ activeSection, onSectionChange, role, cerrarSesion }) {
  const [collapsed, setCollapsed] = useState(false)

  // Definimos menú según rol
  const menuItems = role === 'ADMIN' 
    ? [ { id: "admin_usuarios", label: "Gestión Médicos", icon: Users } ]
    : [ 
        { id: "dashboard", label: "Dashboard", icon: Home },
        { id: "historias_clinicas", label: "Historias Clínicas", icon: FileText },
        { id: "pacientes", label: "Pacientes", icon: Users },
        { id: "nuevo_paciente", label: "Nueva Historia", icon: FolderPlus },
        { id: "search", label: "Buscar", icon: Search },
      ];

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 relative border-r border-sidebar-border shadow-xl",
        collapsed ? "w-20" : "w-72"
      )}
    >
      {/* Botón Colapsar */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 shadow-md border border-white/10"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      {/* Header Logo */}
      <div className="p-6 border-b border-sidebar-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <Activity className="h-6 w-6 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-bold tracking-tight text-white">
                MediRecord
              </h1>
              <p className="text-xs text-sidebar-foreground/60">
                Historias Clínicas
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tarjeta de Información (Solo visible expandido) */}
      {!collapsed && (
        <div className="px-4 pt-6">
          <div className="p-4 rounded-xl bg-sidebar-accent/50 border border-white/5 shadow-inner">
            <h3 className="text-xs font-semibold text-white mb-1 uppercase tracking-wider">
              Sistema de Gestión
            </h3>
            <p className="text-[11px] text-sidebar-foreground/60 leading-relaxed">
              Administre, almacene y consulte historias clínicas de forma segura y eficiente. Acceda a los registros médicos de sus pacientes en cualquier momento.
            </p>
          </div>
        </div>
      )}

      {/* Menú de Navegación */}
      <nav className="flex-1 p-4 space-y-1 mt-2">
        {!collapsed && (
          <p className="px-2 text-xs font-medium text-sidebar-foreground/40 uppercase tracking-wider mb-2">
            Menú Principal
          </p>
        )}
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden",
              collapsed && "justify-center px-0",
              activeSection === item.id
                ? "bg-sidebar-primary text-white shadow-md shadow-primary/20"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white"
            )}
          >
            <item.icon className={cn("h-5 w-5 shrink-0 transition-colors", activeSection === item.id ? "text-white" : "text-sidebar-foreground/60 group-hover:text-white")} />
            {!collapsed && <span>{item.label}</span>}
            
            {/* Indicador activo lateral */}
            {activeSection === item.id && !collapsed && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white/20 rounded-r-full" />
            )}
          </button>
        ))}
      </nav>

      {/* Footer Usuario */}
      <div className="p-4 border-t border-sidebar-border/50 bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sidebar-primary to-purple-500 flex items-center justify-center shrink-0 border-2 border-sidebar-border">
            <span className="text-xs font-bold text-white">
              {role === 'ADMIN' ? 'AD' : 'DR'}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">
                Usuario Activo
              </p>
              <p className="text-xs text-sidebar-foreground/50">
                {role}
              </p>
            </div>
          )}
          {!collapsed && (
             <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-sidebar-foreground/60 hover:text-red-400 hover:bg-red-500/10"
                onClick={cerrarSesion}
              >
                <LogOut className="h-4 w-4" />
              </Button>
          )}
        </div>
      </div>
    </aside>
  )
}