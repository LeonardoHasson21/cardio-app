package com.cardiologico.proyecto.cordio;

import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CordiologicoApplication {

    public static void main(String[] args) {

        TimeZone.setDefault(TimeZone.getTimeZone("America/Buenos_Aires"));
        
        SpringApplication.run(CordiologicoApplication.class, args);
    }
}