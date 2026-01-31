"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Calendar, User, FileText } from "lucide-react"

export function SearchRecords() {
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [searched, setSearched] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearched(true)
  }

  const mockResults = [
    {
      id: "HC-2024-001",
      patient: "María García López",
      date: "31 Ene 2026",
      diagnosis: "Hipertensión arterial controlada",
      excerpt:
        "Paciente presenta niveles de presión arterial estables tras tratamiento con enalapril...",
    },
    {
      id: "HC-2024-003",
      patient: "Ana Martínez Ruiz",
      date: "30 Ene 2026",
      diagnosis: "Infección respiratoria aguda",
      excerpt:
        "Se observa mejoría significativa en los síntomas respiratorios. Continuar con tratamiento...",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">
          Búsqueda Avanzada
        </h2>
        <p className="text-muted-foreground mt-1">
          Encuentre historias clínicas utilizando múltiples criterios de
          búsqueda
        </p>
      </div>

      {/* Search Form */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-card-foreground flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Criterios de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="searchQuery" className="text-foreground">
                Buscar por nombre, diagnóstico o palabras clave
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="searchQuery"
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  placeholder="Ej: hipertensión, María García..."
                  className="pl-10 bg-input border-border"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateFrom" className="text-foreground">
                  Desde
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="dateFrom"
                    type="date"
                    value={dateFrom}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateFrom(e.target.value)}
                    className="pl-10 bg-input border-border"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateTo" className="text-foreground">
                  Hasta
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="dateTo"
                    type="date"
                    value={dateTo}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateTo(e.target.value)}
                    className="pl-10 bg-input border-border"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" className="gap-2">
                <Search className="h-4 w-4" />
                Buscar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {searched && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">
            Resultados encontrados ({mockResults.length})
          </h3>
          {mockResults.map((result) => (
            <Card
              key={result.id}
              className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer"
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {result.id}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {result.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-card-foreground">
                        {result.patient}
                      </span>
                    </div>
                    <p className="text-sm text-accent font-medium mb-2">
                      {result.diagnosis}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {result.excerpt}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1.5 bg-transparent">
                    <FileText className="h-3.5 w-3.5" />
                    Abrir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!searched && (
        <div className="text-center py-16">
          <Search className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground">
            Realice una búsqueda
          </p>
          <p className="text-muted-foreground mt-1">
            Utilice los campos anteriores para encontrar historias clínicas
          </p>
        </div>
      )}
    </div>
  )
}
