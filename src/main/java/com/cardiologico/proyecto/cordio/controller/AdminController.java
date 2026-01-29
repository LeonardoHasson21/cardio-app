package com.cardiologico.proyecto.cordio.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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

    @GetMapping("/medicos")
    public List<Usuario> listarMedicos() {
        return usuarioRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.MEDICO)
                .toList();
    }

    @DeleteMapping("/medicos/{id}")
    public ResponseEntity<?> eliminarMedico(@PathVariable Long id) {
        usuarioRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}