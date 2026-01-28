package com.cardiologico.proyecto.cordio.repository;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.cardiologico.proyecto.cordio.model.Paciente;
import java.util.Optional;

@Repository
public interface PacienteRepository extends JpaRepository<Paciente, Long> {
    Optional<Paciente> findByDni(String dni);

    boolean existsByDni(String dni);
}
