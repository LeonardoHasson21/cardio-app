package com.cardiologico.proyecto.cordio.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cardiologico.proyecto.cordio.model.Consulta;

public interface ConsultaRepository extends JpaRepository<Consulta, Long> {
    List<Consulta> findByPacienteId(Long pacienteId);
}