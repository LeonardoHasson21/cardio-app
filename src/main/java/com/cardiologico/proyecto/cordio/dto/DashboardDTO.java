package com.cardiologico.proyecto.cordio.dto;

import java.util.List;

import com.cardiologico.proyecto.cordio.model.Consulta;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DashboardDTO {
    private long totalPacientes;
    private long totalConsultas;
    private long consultasHoy;
    private long consultasMes;
    private List<Consulta> ultimasConsultas;
}