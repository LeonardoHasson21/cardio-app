package com.cardiologico.proyecto.cordio.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cardiologico.proyecto.cordio.model.Paciente;
import com.cardiologico.proyecto.cordio.model.Usuario;
import com.cardiologico.proyecto.cordio.repository.PacienteRepository;
import com.cardiologico.proyecto.cordio.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/pacientes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PacienteController {

    private final PacienteRepository pacienteRepository;
    private final UsuarioRepository usuarioRepository;

    // Helper para saber qué Médico está logueado
    private Usuario getUsuarioLogueado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return usuarioRepository.findByUsername(email).orElseThrow();
    }

    // 1. LISTAR (Solo mis pacientes)
    @GetMapping
    public List<Paciente> listarMisPacientes() {
        Usuario medico = getUsuarioLogueado();
        return pacienteRepository.findByMedicoId(medico.getId());
    }

    // 2. CREAR (Asignado a mí)
    @PostMapping
    public Paciente guardarPaciente(@RequestBody Paciente paciente) {
        Usuario medico = getUsuarioLogueado();
        paciente.setMedico(medico); // Vinculamos el paciente al médico actual
        return pacienteRepository.save(paciente);
    }

    // 3. ELIMINAR
    @DeleteMapping("/{id}")
    public void eliminarPaciente(@PathVariable Long id) {
        pacienteRepository.deleteById(id);
    }

    // 4. BUSCADOR (Por nombre, apellido o DNI y solo míos)
    @GetMapping("/buscar")
    public List<Paciente> buscarPacientes(@RequestParam String query) {
        Usuario medico = getUsuarioLogueado();
        return pacienteRepository.findByMedicoIdAndNombreContainingIgnoreCaseOrMedicoIdAndApellidoContainingIgnoreCaseOrMedicoIdAndDniContaining(
            medico.getId(), query, medico.getId(), query, medico.getId(), query);
    }

    // 5. EDITAR / ACTUALIZAR (¡NUEVO!)
    @PutMapping("/{id}")
    public ResponseEntity<Paciente> actualizarPaciente(@PathVariable Long id, @RequestBody Paciente datosNuevos) {
        return pacienteRepository.findById(id).map(paciente -> {
            paciente.setNombre(datosNuevos.getNombre());
            paciente.setApellido(datosNuevos.getApellido());
            paciente.setDni(datosNuevos.getDni());
            // Si tuvieras más campos (edad, telefono, etc), actualízalos aquí también
            
            return ResponseEntity.ok(pacienteRepository.save(paciente));
        }).orElse(ResponseEntity.notFound().build());
    }
}