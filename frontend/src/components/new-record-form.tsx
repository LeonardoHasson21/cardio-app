"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save, FileText } from "lucide-react"

export function NewRecordForm() {
  const [formData, setFormData] = useState({
    patientName: "",
    patientAge: "",
    patientId: "",
    contactPhone: "",
    consultDate: "",
    symptoms: "",
    diagnosis: "",
    treatment: "",
    notes: "",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form data:", formData)
    alert("Historia clínica guardada correctamente")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">
          Nueva Historia Clínica
        </h2>
        <p className="text-muted-foreground mt-1">
          Complete los datos del paciente y la información de la consulta
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Info */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-card-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Datos del Paciente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientName" className="text-foreground">
                  Nombre Completo
                </Label>
                <Input
                  id="patientName"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  placeholder="Ej: María García López"
                  className="bg-input border-border"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientAge" className="text-foreground">
                  Edad
                </Label>
                <Input
                  id="patientAge"
                  name="patientAge"
                  type="number"
                  value={formData.patientAge}
                  onChange={handleChange}
                  placeholder="Ej: 45"
                  className="bg-input border-border"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientId" className="text-foreground">
                  Documento de Identidad
                </Label>
                <Input
                  id="patientId"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  placeholder="Ej: 12345678A"
                  className="bg-input border-border"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone" className="text-foreground">
                  Teléfono de Contacto
                </Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="Ej: +34 612 345 678"
                  className="bg-input border-border"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consultation Info */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-card-foreground">
              Información de la Consulta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="consultDate" className="text-foreground">
                Fecha de Consulta
              </Label>
              <Input
                id="consultDate"
                name="consultDate"
                type="date"
                value={formData.consultDate}
                onChange={handleChange}
                className="bg-input border-border"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="symptoms" className="text-foreground">
                Síntomas / Motivo de Consulta
              </Label>
              <Textarea
                id="symptoms"
                name="symptoms"
                value={formData.symptoms}
                onChange={handleChange}
                placeholder="Describa los síntomas o motivo de la consulta..."
                className="bg-input border-border min-h-24"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="diagnosis" className="text-foreground">
                Diagnóstico
              </Label>
              <Textarea
                id="diagnosis"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                placeholder="Ingrese el diagnóstico..."
                className="bg-input border-border min-h-24"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="treatment" className="text-foreground">
                Tratamiento Indicado
              </Label>
              <Textarea
                id="treatment"
                name="treatment"
                value={formData.treatment}
                onChange={handleChange}
                placeholder="Describa el tratamiento indicado..."
                className="bg-input border-border min-h-24"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-foreground">
                Observaciones Adicionales
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Notas adicionales..."
                className="bg-input border-border min-h-20"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">
            Cancelar
          </Button>
          <Button type="submit" className="gap-2">
            <Save className="h-4 w-4" />
            Guardar Historia Clínica
          </Button>
        </div>
      </form>
    </div>
  )
}
