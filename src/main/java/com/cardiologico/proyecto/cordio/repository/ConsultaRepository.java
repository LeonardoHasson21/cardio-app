package com.cardiologico.proyecto.cordio.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.cardiologico.proyecto.cordio.model.Consulta;

public interface ConsultaRepository extends JpaRepository<Consulta, Long> {
    
    // Contadores para el Dashboard
    long countByPacienteMedicoId(Long medicoId);
    long countByPacienteMedicoIdAndFecha(Long medicoId, LocalDate fecha);
    long countByPacienteMedicoIdAndFechaBetween(Long medicoId, LocalDate inicio, LocalDate fin);

    // --- CORRECCIÓN ORDENAMIENTO ---
    // Ordenamos por Fecha DESC y luego por ID DESC (para desempatar las del mismo día)
    List<Consulta> findTop5ByPacienteMedicoIdOrderByFechaDescIdDesc(Long medicoId);

    // Obtener historial de un paciente específico
    List<Consulta> findByPacienteId(Long pacienteId);

    // Listar TODAS las consultas de un médico (para pestaña historias clínicas)
    List<Consulta> findByPacienteMedicoIdOrderByFechaDescIdDesc(Long medicoId);

    // Búsqueda por rango de fechas
    List<Consulta> findByPacienteMedicoIdAndFechaBetween(Long medicoId, LocalDate desde, LocalDate hasta);

    // Búsqueda por query (nombre paciente, diagnóstico, motivo)
    @Query("SELECT c FROM Consulta c WHERE c.paciente.medico.id = :medicoId " +
           "AND (LOWER(c.paciente.nombre) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(c.paciente.apellido) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(c.diagnostico) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(c.motivo) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY c.fecha DESC, c.id DESC")
    List<Consulta> findByPacienteMedicoIdAndQuery(@Param("medicoId") Long medicoId, @Param("query") String query);

    // Búsqueda combinada (query + fechas)
    @Query("SELECT c FROM Consulta c WHERE c.paciente.medico.id = :medicoId " +
           "AND (LOWER(c.paciente.nombre) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(c.paciente.apellido) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(c.diagnostico) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(c.motivo) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND c.fecha BETWEEN :desde AND :hasta " +
           "ORDER BY c.fecha DESC, c.id DESC")
    List<Consulta> findByPacienteMedicoIdAndQueryAndFechaBetween(
        @Param("medicoId") Long medicoId, 
        @Param("query") String query, 
        @Param("desde") LocalDate desde, 
        @Param("hasta") LocalDate hasta);
}