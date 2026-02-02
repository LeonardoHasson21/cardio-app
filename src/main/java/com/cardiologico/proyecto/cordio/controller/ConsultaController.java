package com.cardiologico.proyecto.cordio.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cardiologico.proyecto.cordio.model.Consulta;
import com.cardiologico.proyecto.cordio.model.Paciente;
import com.cardiologico.proyecto.cordio.model.Usuario;
import com.cardiologico.proyecto.cordio.repository.ConsultaRepository;
import com.cardiologico.proyecto.cordio.repository.PacienteRepository;
import com.cardiologico.proyecto.cordio.repository.UsuarioRepository;

@RestController
@RequestMapping("/api/consultas")
@CrossOrigin(origins = "*")
public class ConsultaController {

    @Autowired
    private ConsultaRepository consultaRepository;

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private Usuario getUsuarioLogueado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return usuarioRepository.findByUsername(auth.getName()).orElseThrow();
    }

    // 1. Crear consulta
    @PostMapping("/{pacienteId}")
    public Consulta crearConsulta(@PathVariable Long pacienteId, @RequestBody Consulta consulta) {
        // 1. Buscamos al paciente (Si no existe, fallamos)
        Paciente paciente = pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado con ID: " + pacienteId));
        
        // 2. VINCULACIÓN EXPLÍCITA (Esto es lo que faltaba)
        consulta.setPaciente(paciente);
        
        // 3. Validar Fecha
        if (consulta.getFecha() == null) {
            consulta.setFecha(LocalDate.now());
        }

        // 4. Validar Campos Nuevos (Por si el frontend manda null)
        if (consulta.getTipo() == null) consulta.setTipo("Consulta General");
        if (consulta.getEstado() == null) consulta.setEstado("Completada");

        return consultaRepository.save(consulta);
    }

    // 2. Obtener historial de un paciente específico
    @GetMapping("/paciente/{pacienteId}")
    public List<Consulta> obtenerPorPaciente(@PathVariable Long pacienteId) {
        return consultaRepository.findByPacienteId(pacienteId);
    }

    // 3. Listar TODAS las consultas del médico logueado
    @GetMapping
    public List<Consulta> listarTodasMisConsultas() {
        Usuario medico = getUsuarioLogueado();
        return consultaRepository.findByPacienteMedicoIdOrderByFechaDescIdDesc(medico.getId());
    }

    // 4. Búsqueda avanzada
    @GetMapping("/buscar")
    public List<Consulta> buscarConsultas(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String desde,
            @RequestParam(required = false) String hasta) {
        
        Usuario medico = getUsuarioLogueado();
        Long medicoId = medico.getId();
        
        // Convertir fechas si vienen como string
        LocalDate fechaDesde = (desde != null && !desde.isEmpty()) ? LocalDate.parse(desde) : null;
        LocalDate fechaHasta = (hasta != null && !hasta.isEmpty()) ? LocalDate.parse(hasta) : null;
        
        // Si hay query de texto
        if (query != null && !query.isEmpty()) {
            if (fechaDesde != null && fechaHasta != null) {
                // Búsqueda con query y rango de fechas
                return consultaRepository.findByPacienteMedicoIdAndQueryAndFechaBetween(
                    medicoId, query, fechaDesde, fechaHasta);
            } else {
                // Solo búsqueda por query
                return consultaRepository.findByPacienteMedicoIdAndQuery(medicoId, query);
            }
        } else if (fechaDesde != null && fechaHasta != null) {
            // Solo búsqueda por rango de fechas
            return consultaRepository.findByPacienteMedicoIdAndFechaBetween(
                medicoId, fechaDesde, fechaHasta);
        }
        
        // Si no hay criterios, devolver todas
        return consultaRepository.findByPacienteMedicoIdOrderByFechaDescIdDesc(medicoId);
    }
}
