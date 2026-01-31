package com.cardiologico.proyecto.cordio.controller;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cardiologico.proyecto.cordio.dto.DashboardDTO;
import com.cardiologico.proyecto.cordio.model.Consulta;
import com.cardiologico.proyecto.cordio.model.Usuario;
import com.cardiologico.proyecto.cordio.repository.ConsultaRepository;
import com.cardiologico.proyecto.cordio.repository.PacienteRepository;
import com.cardiologico.proyecto.cordio.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final PacienteRepository pacienteRepository;
    private final ConsultaRepository consultaRepository;
    private final UsuarioRepository usuarioRepository;

    private Usuario getUsuarioLogueado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return usuarioRepository.findByUsername(auth.getName()).orElseThrow();
    }

    @GetMapping
    public DashboardDTO obtenerResumen() {
        Usuario medico = getUsuarioLogueado();
        Long medicoId = medico.getId();
        LocalDate hoy = LocalDate.now();

        // 1. Total Pacientes
        long totalPacientes = pacienteRepository.countByMedicoId(medicoId);

        // 2. Total Historias/Consultas
        long totalConsultas = consultaRepository.countByPacienteMedicoId(medicoId);

        // 3. Citas de Hoy
        long citasHoy = consultaRepository.countByPacienteMedicoIdAndFecha(medicoId, hoy);

        // 4. Consultas del Mes Actual
        YearMonth mesActual = YearMonth.now();
        long consultasMes = consultaRepository.countByPacienteMedicoIdAndFechaBetween(
                medicoId, 
                mesActual.atDay(1), 
                mesActual.atEndOfMonth()
        );

        // 5. Tabla Reciente
        List<Consulta> recientes = consultaRepository.findTop5ByPacienteMedicoIdOrderByFechaDesc(medicoId);

        return new DashboardDTO(totalPacientes, totalConsultas, citasHoy, consultasMes, recientes);
    }
}