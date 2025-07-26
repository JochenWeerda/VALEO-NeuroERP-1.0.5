package com.valeo.einvoicing;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Hauptanwendungsklasse für die VALEO E-Invoicing API
 * 
 * Diese Anwendung bietet eine REST-API für die Generierung und Verarbeitung
 * von e-Rechnungen im ZUGFeRD/XRechnung-Format, konform mit deutschen
 * Rechtsvorschriften (GoBD, AO, UStG).
 * 
 * @author VALEO NeuroERP Team
 * @version 1.0.0
 * @since 2024-01-01
 */
@SpringBootApplication
@EnableConfigurationProperties
@EnableAsync
@EnableScheduling
public class EInvoicingApplication {

    public static void main(String[] args) {
        SpringApplication.run(EInvoicingApplication.class, args);
    }
} 