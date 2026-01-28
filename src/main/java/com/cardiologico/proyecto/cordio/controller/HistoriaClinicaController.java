package com.cardiologico.proyecto.cordio.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cardiologico.proyecto.cordio.model.Paciente;
import com.cardiologico.proyecto.cordio.repository.PacienteRepository;

@RestController 
@RequestMapping("/api/pacientes") 
@CrossOrigin(origins = "*") 
public class HistoriaClinicaController {

    @Autowired
    private PacienteRepository pacienteRepository;

    // GET: Obtener todos los pacientes
    @GetMapping
    public List<Paciente> listarPacientes() {
        return pacienteRepository.findAll();
    }

    // POST: Guardar un nuevo paciente
    @PostMapping
    public Paciente guardarPaciente(@RequestBody Paciente paciente) {
        return pacienteRepository.save(paciente);
    }
    
    // GET: Buscar por ID
    @GetMapping("/{id}")
    public ResponseEntity<Paciente> obtenerPorId(@PathVariable Long id) {
        return pacienteRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}