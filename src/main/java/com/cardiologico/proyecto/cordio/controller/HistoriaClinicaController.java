package com.cardiologico.proyecto.cordio.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cardiologico.proyecto.cordio.model.Consulta;
import com.cardiologico.proyecto.cordio.repository.ConsultaRepository;
import com.cardiologico.proyecto.cordio.repository.PacienteRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/consultas") // <--- ¡OJO! AHORA APUNTA A CONSULTAS
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HistoriaClinicaController {

    private final ConsultaRepository consultaRepository;
    private final PacienteRepository pacienteRepository;

    // 1. OBTENER HISTORIAL DE UN PACIENTE
    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<List<Consulta>> obtenerHistorial(@PathVariable Long pacienteId) {
        List<Consulta> historial = consultaRepository.findByPacienteId(pacienteId);
        return ResponseEntity.ok(historial);
    }

    // 2. GUARDAR NUEVA EVOLUCIÓN / CONSULTA
    @PostMapping("/{pacienteId}")
    public ResponseEntity<Consulta> guardarConsulta(@PathVariable Long pacienteId, @RequestBody Consulta consulta) {
        return pacienteRepository.findById(pacienteId).map(paciente -> {
            
            consulta.setPaciente(paciente); 
            consulta.setFecha(LocalDate.now()); 
            
            return ResponseEntity.ok(consultaRepository.save(consulta));
        }).orElse(ResponseEntity.notFound().build());
    }
}