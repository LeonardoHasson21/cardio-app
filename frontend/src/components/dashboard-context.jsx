"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Users, Calendar, TrendingUp } from "lucide-react"

const stats = [
  {
    title: "Total Historias",
    value: "2,847",
    change: "+12%",
    icon: FileText,
  },
  {
    title: "Pacientes Activos",
    value: "1,234",
    change: "+8%",
    icon: Users,
  },
  {
    title: "Citas Hoy",
    value: "24",
    change: "+3",
    icon: Calendar,
  },
  {
    title: "Consultas Mes",
    value: "342",
    change: "+18%",
    icon: TrendingUp,
  },
]

const recentRecords = [
  {
    id: "HC-2024-001",
    patient: "María García López",
    date: "31 Ene 2026",
    type: "Consulta General",
    status: "Completada",
  },
  {
    id: "HC-2024-002",
    patient: "Juan Carlos Pérez",
    date: "31 Ene 2026",
    type: "Control",
    status: "En proceso",
  },
  {
    id: "HC-2024-003",
    patient: "Ana Martínez Ruiz",
    date: "30 Ene 2026",
    type: "Urgencia",
    status: "Completada",
  },
  {
    id: "HC-2024-004",
    patient: "Roberto Sánchez",
    date: "30 Ene 2026",
    type: "Consulta General",
    status: "Completada",
  },
  {
    id: "HC-2024-005",
    patient: "Carmen López Díaz",
    date: "29 Ene 2026",
    type: "Seguimiento",
    status: "Pendiente",
  },
]

export function DashboardContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">
          Panel de Control
        </h2>
        <p className="text-muted-foreground mt-1">
          Resumen de actividad y estadísticas del sistema
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">
                {stat.value}
              </div>
              <p className="text-xs text-accent mt-1">{stat.change} este mes</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Records */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-card-foreground">
            Historias Clínicas Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    ID
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 text-sm font-mono text-primary">
                      {record.id}
                    </td>
                    <td className="py-3 px-4 text-sm text-card-foreground">
                      {record.patient}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {record.date}
                    </td>
                    <td className="py-3 px-4 text-sm text-card-foreground">
                      {record.type}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          record.status === "Completada"
                            ? "bg-accent/20 text-accent"
                            : record.status === "En proceso"
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
