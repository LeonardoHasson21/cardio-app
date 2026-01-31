package com.cardiologico.proyecto.cordio.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cardiologico.proyecto.cordio.model.Role;
import com.cardiologico.proyecto.cordio.model.Usuario;
import com.cardiologico.proyecto.cordio.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    
    // 1. Listar Médicos
    @GetMapping("/medicos")
    public List<Usuario> listarMedicos() {
        return usuarioRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.MEDICO)
                .toList();
    }

    // 2. CREAR MÉDICO (Solo el Admin puede usar esto)
    @PostMapping("/medicos")
    public ResponseEntity<Usuario> crearMedico(@RequestBody Usuario request) {
        // Verificamos que no exista el email
        if (usuarioRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().build();
        }

        Usuario nuevoMedico = Usuario.builder()
            .username(request.getUsername())
            .password(passwordEncoder.encode(request.getPassword())) // ¡Encriptamos la clave!
            .role(Role.MEDICO)
            .enabled(true) // Nace activo
            .build();
        
        return ResponseEntity.ok(usuarioRepository.save(nuevoMedico));
    }

    // 3. BLOQUEAR / DESBLOQUEAR (El famoso "Soft Delete")
    @PutMapping("/medicos/{id}/toggle")
    public ResponseEntity<Usuario> toggleEstado(@PathVariable Long id) {
        return usuarioRepository.findById(id).map(usuario -> {
            usuario.setEnabled(!usuario.isEnabled()); // Si es true pasa a false, y viceversa
            return ResponseEntity.ok(usuarioRepository.save(usuario));
        }).orElse(ResponseEntity.notFound().build());
    }
}