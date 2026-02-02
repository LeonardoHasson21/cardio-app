package com.cardiologico.proyecto.cordio.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cardiologico.proyecto.cordio.model.Paciente;


@Repository
public interface PacienteRepository extends JpaRepository<Paciente, Long> {
// Buscar pacientes de un médico específico
    List<Paciente> findByMedicoId(Long medicoId);

    // Buscar por nombre, apellido o DNI PERO solo dentro de mis pacientes (Buscador Seguro)
    List<Paciente> findByMedicoIdAndNombreContainingIgnoreCaseOrMedicoIdAndApellidoContainingIgnoreCaseOrMedicoIdAndDniContaining(Long medicoId1, String nombre, Long medicoId2, String apellido, Long medicoId3, String dni);
    
    // Buscar por nombre global (Para Admin)
    List<Paciente> findByApellidoContainingIgnoreCase(String apellido);

    long countByMedicoId(Long medicoId);
}
