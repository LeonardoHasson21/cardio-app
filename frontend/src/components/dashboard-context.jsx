"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Users, Calendar, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

export function DashboardContent({ dashboardData, onConsultaClick }) {
  if (!dashboardData) {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200/50 rounded-xl animate-pulse"></div>)}
        </div>
      </div>
    )
  }

  const stats = [
    {
      title: "Total Historias",
      value: dashboardData.totalConsultas?.toString() || "0",
      change: "+12%",
      icon: FileText,
    },
    {
      title: "Pacientes Activos",
      value: dashboardData.totalPacientes?.toString() || "0",
      change: "+8%",
      icon: Users,
    },
    {
      title: "Citas Hoy",
      value: dashboardData.consultasHoy?.toString() || "0",
      change: "+3",
      icon: Calendar,
    },
    {
      title: "Consultas Mes",
      value: dashboardData.consultasMes?.toString() || "0",
      change: "+18%",
      icon: TrendingUp,
    },
  ]

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
          <Card key={stat.title} className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-gray-500">
                {stat.title}
              </CardTitle>
              <div className="p-2 rounded-lg bg-cyan-50">
                <stat.icon className="h-5 w-5 text-cyan-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-3xl font-bold text-gray-800">
                {stat.value}
              </div>
              <p className="text-xs text-cyan-600 mt-2 font-medium">{stat.change} este mes</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Records */}
      <Card className="bg-white border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-white border-b border-gray-100 px-6 py-5">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Historias Clínicas Recientes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">PACIENTE</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">FECHA</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">TIPO</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">ESTADO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {dashboardData.ultimasConsultas?.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-blue-50/50 transition-colors cursor-pointer"
                    onClick={() => onConsultaClick && onConsultaClick(record)}
                  >
                    <td className="px-6 py-4 font-mono text-xs text-cyan-600 font-semibold">
                      #{record.id.toString().padStart(6, '0')}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {record.paciente ? `${record.paciente.nombre} ${record.paciente.apellido}` : "Sin datos"}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {record.fecha}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {record.tipo}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                          record.estado === "Completada"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : record.estado === "En proceso"
                              ? "bg-blue-50 text-blue-700 border-blue-100"
                              : "bg-amber-50 text-amber-700 border-amber-100"
                        )}
                      >
                        {record.estado}
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
