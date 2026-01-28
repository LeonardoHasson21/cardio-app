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
    public Consulta guardarConsulta(@PathVariable Long pacienteId, @RequestBody Consulta consulta) {
        return pacienteRepository.findById(pacienteId).map(paciente -> {
            consulta.setPaciente(paciente);
            consulta.setFecha(LocalDate.now()); // Fecha automática de hoy
            return consultaRepository.save(consulta);
        }).orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
    }
    
    // 2. Obtener historial de un paciente específico
    @GetMapping("/paciente/{pacienteId}")
    public List<Consulta> obtenerPorPaciente(@PathVariable Long pacienteId) {
        return consultaRepository.findByPacienteId(pacienteId); 
    }
}