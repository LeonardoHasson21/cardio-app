package com.cardiologico.proyecto.cordio.repository;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
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
}