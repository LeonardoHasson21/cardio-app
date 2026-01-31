package com.cardiologico.proyecto.cordio.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cardiologico.proyecto.cordio.model.Consulta;

public interface ConsultaRepository extends JpaRepository<Consulta, Long> {
    List<Consulta> findByPacienteId(Long pacienteId);

    // NUEVO: Contar consultas totales de los pacientes de un médico
    long countByPacienteMedicoId(Long medicoId);

    // NUEVO: Contar consultas de HOY
    long countByPacienteMedicoIdAndFecha(Long medicoId, LocalDate fecha);

    // NUEVO: Contar consultas de ESTE MES (Usamos un rango de fechas)
    long countByPacienteMedicoIdAndFechaBetween(Long medicoId, LocalDate inicio, LocalDate fin);

    // NUEVO: Traer las 5 últimas consultas para la tabla
    List<Consulta> findTop5ByPacienteMedicoIdOrderByFechaDesc(Long medicoId);
}