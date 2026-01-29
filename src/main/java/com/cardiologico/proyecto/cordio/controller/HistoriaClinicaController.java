package com.cardiologico.proyecto.cordio.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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
import com.cardiologico.proyecto.cordio.model.Role;
import com.cardiologico.proyecto.cordio.model.Usuario;
import com.cardiologico.proyecto.cordio.repository.PacienteRepository;
import com.cardiologico.proyecto.cordio.repository.UsuarioRepository;

@RestController 
@RequestMapping("/api/pacientes") 
@CrossOrigin(origins = "*") 
public class HistoriaClinicaController {

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // --- HELPER: Obtener Usuario Actual ---
    private Usuario getUsuarioActual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return usuarioRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    // 1. GET: Listar (Inteligente: Admin ve todo, Médico solo lo suyo)
    @GetMapping
    public List<Paciente> listarPacientes() {
        Usuario usuario = getUsuarioActual();

        if (usuario.getRole() == Role.ADMIN) {
            return pacienteRepository.findAll(); // Admin ve todo
        } else {
            return pacienteRepository.findByMedicoId(usuario.getId()); // Médico ve solo lo suyo
        }
    }

    // 2. SEARCH: Buscar por Apellido
    @GetMapping("/buscar")
    public List<Paciente> buscarPacientes(@RequestParam String query) {
        Usuario usuario = getUsuarioActual();
        if (usuario.getRole() == Role.ADMIN) {
            return pacienteRepository.findByApellidoContainingIgnoreCase(query);
        } else {
            return pacienteRepository.findByMedicoIdAndApellidoContainingIgnoreCase(usuario.getId(), query);
        }
    }

    // 3. POST: Guardar (Asigna automáticamente al médico que lo crea)
    @PostMapping
    public Paciente guardarPaciente(@RequestBody Paciente paciente) {
        Usuario usuario = getUsuarioActual();
        paciente.setMedico(usuario); // ¡Aquí se firma la propiedad!
        return pacienteRepository.save(paciente);
    }
    
    // 4. PUT: Editar Paciente (Con seguridad de propiedad)
    @PutMapping("/{id}")
    public ResponseEntity<Paciente> editarPaciente(@PathVariable Long id, @RequestBody Paciente nuevosDatos) {
        Usuario usuario = getUsuarioActual();
        return pacienteRepository.findById(id).map(paciente -> {
            // Seguridad: Si no es Admin y el paciente no es tuyo, Error.
            if (usuario.getRole() != Role.ADMIN && !paciente.getMedico().getId().equals(usuario.getId())) {
                return new ResponseEntity<Paciente>(HttpStatus.FORBIDDEN);
            }
            // Actualizamos datos
            paciente.setNombre(nuevosDatos.getNombre());
            paciente.setApellido(nuevosDatos.getApellido());
            paciente.setDni(nuevosDatos.getDni());
            // (Agrega aquí si tienes más campos)
            return ResponseEntity.ok(pacienteRepository.save(paciente));
        }).orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // 5. DELETE: Eliminar Paciente
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> eliminarPaciente(@PathVariable Long id) {
        Usuario usuario = getUsuarioActual();
        return pacienteRepository.findById(id).map(paciente -> {
            // Seguridad: Solo el dueño o Admin pueden borrar
            if (usuario.getRole() != Role.ADMIN && !paciente.getMedico().getId().equals(usuario.getId())) {
                return new ResponseEntity<Object>(HttpStatus.FORBIDDEN);
            }
            pacienteRepository.delete(paciente);
            return ResponseEntity.noContent().build();
        }).orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    // 6. GET: Buscar por ID individual
    @GetMapping("/{id}")
    public ResponseEntity<Paciente> obtenerPorId(@PathVariable Long id) {
        Usuario usuario = getUsuarioActual();
        return pacienteRepository.findById(id).map(paciente -> {
             if (usuario.getRole() != Role.ADMIN && !paciente.getMedico().getId().equals(usuario.getId())) {
                return new ResponseEntity<Paciente>(HttpStatus.FORBIDDEN);
            }
            return ResponseEntity.ok(paciente);
        }).orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
}