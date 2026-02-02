package com.cardiologico.proyecto.cordio.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cardiologico.proyecto.cordio.model.Consulta;
import com.cardiologico.proyecto.cordio.model.Paciente;
import com.cardiologico.proyecto.cordio.repository.ConsultaRepository;
import com.cardiologico.proyecto.cordio.repository.PacienteRepository;

@RestController
@RequestMapping("/api/consultas")
@CrossOrigin(origins = "*")
public class ConsultaController {

    @Autowired
    private ConsultaRepository consultaRepository;

    @Autowired
    private PacienteRepository pacienteRepository;

    @PostMapping("/{pacienteId}")
    public Consulta crearConsulta(@PathVariable Long pacienteId, @RequestBody Consulta consulta) {
        // 1. Buscamos al paciente (Si no existe, fallamos)
        Paciente paciente = pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado con ID: " + pacienteId));
        
        // 2. VINCULACIÓN EXPLÍCITA (Esto es lo que faltaba)
        consulta.setPaciente(paciente);
        
        // 3. Validar Fecha
        if (consulta.getFecha() == null) {
            consulta.setFecha(LocalDate.now());
        }

        // 4. Validar Campos Nuevos (Por si el frontend manda null)
        if (consulta.getTipo() == null) consulta.setTipo("Consulta General");
        if (consulta.getEstado() == null) consulta.setEstado("Completada");

        return consultaRepository.save(consulta);
    }

    // 2. Obtener historial de un paciente específico
    @GetMapping("/paciente/{pacienteId}")
    public List<Consulta> obtenerPorPaciente(@PathVariable Long pacienteId) {
        return consultaRepository.findByPacienteId(pacienteId);
    }
}
