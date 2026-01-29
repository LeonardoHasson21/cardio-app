package com.cardiologico.proyecto.cordio.auth;

import com.cardiologico.proyecto.cordio.model.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token; 
    private Role role;
}