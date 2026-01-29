package com.cardiologico.proyecto.cordio.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.cardiologico.proyecto.cordio.model.Role;
import com.cardiologico.proyecto.cordio.model.Usuario;
import com.cardiologico.proyecto.cordio.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class SeedDataConfig {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            if (usuarioRepository.findByUsername("admin@admin.com").isEmpty()) {
                Usuario admin = Usuario.builder()
                        .username("admin@admin.com")
                        .password(passwordEncoder.encode("admin123")) // Contraseña del admin
                        .role(Role.ADMIN) // <--- ¡Aquí está la magia!
                        .build();

                usuarioRepository.save(admin);
                log.info("usuario ADMIN creado: admin@admin.com / admin123");
            }
        };
    }
}