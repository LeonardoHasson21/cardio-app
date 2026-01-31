"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, Edit, Trash2, Search, Filter } from "lucide-react"

interface MedicalRecord {
  id: string
  patient: string
  age: number
  date: string
  diagnosis: string
  doctor: string
  status: "active" | "archived"
}

const mockRecords: MedicalRecord[] = [
  {
    id: "HC-2024-001",
    patient: "María García López",
    age: 45,
    date: "31 Ene 2026",
    diagnosis: "Hipertensión arterial controlada",
    doctor: "Dr. Rodríguez",
    status: "active",
  },
  {
    id: "HC-2024-002",
    patient: "Juan Carlos Pérez",
    age: 62,
    date: "31 Ene 2026",
    diagnosis: "Diabetes tipo 2",
    doctor: "Dr. Rodríguez",
    status: "active",
  },
  {
    id: "HC-2024-003",
    patient: "Ana Martínez Ruiz",
    age: 28,
    date: "30 Ene 2026",
    diagnosis: "Infección respiratoria aguda",
    doctor: "Dra. López",
    status: "active",
  },
  {
    id: "HC-2024-004",
    patient: "Roberto Sánchez",
    age: 55,
    date: "30 Ene 2026",
    diagnosis: "Artrosis de rodilla",
    doctor: "Dr. Rodríguez",
    status: "active",
  },
  {
    id: "HC-2024-005",
    patient: "Carmen López Díaz",
    age: 38,
    date: "29 Ene 2026",
    diagnosis: "Ansiedad generalizada",
    doctor: "Dra. Martínez",
    status: "archived",
  },
  {
    id: "HC-2024-006",
    patient: "Pedro Fernández Gil",
    age: 71,
    date: "28 Ene 2026",
    diagnosis: "Enfermedad cardíaca isquémica",
    doctor: "Dr. Rodríguez",
    status: "active",
  },
]

export function RecordsList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "active" | "archived">("all")

  const filteredRecords = mockRecords.filter((record) => {
    const matchesSearch =
      record.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter =
      filter === "all" ||
      (filter === "active" && record.status === "active") ||
      (filter === "archived" && record.status === "archived")

    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">
          Historias Clínicas
        </h2>
        <p className="text-muted-foreground mt-1">
          Gestione y consulte todas las historias clínicas registradas
        </p>
      </div>

      {/* Search and Filter */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por paciente, ID o diagnóstico..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input border-border"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                Todas
              </Button>
              <Button
                variant={filter === "active" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("active")}
              >
                Activas
              </Button>
              <Button
                variant={filter === "archived" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("archived")}
              >
                Archivadas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Records Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredRecords.map((record) => (
          <Card
            key={record.id}
            className="bg-card border-border hover:border-primary/50 transition-colors"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-card-foreground">
                    {record.patient}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {record.age} años
                  </p>
                </div>
                <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">
                  {record.id}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Diagnóstico
                </p>
                <p className="text-sm text-card-foreground mt-1">
                  {record.diagnosis}
                </p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {record.date} • {record.doctor}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    record.status === "active"
                      ? "bg-accent/20 text-accent"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {record.status === "active" ? "Activa" : "Archivada"}
                </span>
              </div>
              <div className="flex gap-2 pt-2 border-t border-border">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver
                </Button>
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive bg-transparent"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-12">
          <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground">
            No se encontraron resultados
          </p>
          <p className="text-muted-foreground mt-1">
            Intente con otros términos de búsqueda o filtros
          </p>
        </div>
      )}
    </div>
  )
}
