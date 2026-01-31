"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Phone, Mail, FileText } from "lucide-react"

interface Patient {
  id: string
  name: string
  age: number
  phone: string
  email: string
  lastVisit: string
  recordsCount: number
}

const mockPatients: Patient[] = [
  {
    id: "P-001",
    name: "María García López",
    age: 45,
    phone: "+34 612 345 678",
    email: "maria.garcia@email.com",
    lastVisit: "31 Ene 2026",
    recordsCount: 8,
  },
  {
    id: "P-002",
    name: "Juan Carlos Pérez",
    age: 62,
    phone: "+34 623 456 789",
    email: "juan.perez@email.com",
    lastVisit: "31 Ene 2026",
    recordsCount: 15,
  },
  {
    id: "P-003",
    name: "Ana Martínez Ruiz",
    age: 28,
    phone: "+34 634 567 890",
    email: "ana.martinez@email.com",
    lastVisit: "30 Ene 2026",
    recordsCount: 3,
  },
  {
    id: "P-004",
    name: "Roberto Sánchez",
    age: 55,
    phone: "+34 645 678 901",
    email: "roberto.sanchez@email.com",
    lastVisit: "30 Ene 2026",
    recordsCount: 12,
  },
  {
    id: "P-005",
    name: "Carmen López Díaz",
    age: 38,
    phone: "+34 656 789 012",
    email: "carmen.lopez@email.com",
    lastVisit: "29 Ene 2026",
    recordsCount: 5,
  },
  {
    id: "P-006",
    name: "Pedro Fernández Gil",
    age: 71,
    phone: "+34 667 890 123",
    email: "pedro.fernandez@email.com",
    lastVisit: "28 Ene 2026",
    recordsCount: 22,
  },
]

export function PatientsList() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredPatients = mockPatients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Pacientes</h2>
        <p className="text-muted-foreground mt-1">
          Directorio de pacientes registrados en el sistema
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar paciente por nombre, ID o email..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredPatients.map((patient) => (
          <Card
            key={patient.id}
            className="bg-card border-border hover:border-primary/50 transition-colors"
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12 bg-primary/10">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {getInitials(patient.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-card-foreground truncate">
                        {patient.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {patient.age} años • {patient.id}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      <span className="truncate">{patient.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate">{patient.email}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      <span className="text-card-foreground font-medium">
                        {patient.recordsCount}
                      </span>{" "}
                      historias •{" "}
                      <span className="text-card-foreground">
                        {patient.lastVisit}
                      </span>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5 bg-transparent">
                      <FileText className="h-3.5 w-3.5" />
                      Ver
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground">
            No se encontraron pacientes
          </p>
          <p className="text-muted-foreground mt-1">
            Intente con otros términos de búsqueda
          </p>
        </div>
      )}
    </div>
  )
}
