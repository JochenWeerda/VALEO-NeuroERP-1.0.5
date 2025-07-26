package com.valeo.einvoicing.controller;

import com.valeo.einvoicing.dto.*;
import com.valeo.einvoicing.service.EInvoicingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/**
 * REST-Controller für E-Invoicing-Operationen
 * 
 * Bietet Endpunkte für die Generierung und Verarbeitung von e-Rechnungen
 * im ZUGFeRD/XRechnung-Format, konform mit deutschen Rechtsvorschriften.
 * 
 * @author VALEO NeuroERP Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/v1/e-invoicing")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "E-Invoicing", description = "E-Invoicing API für ZUGFeRD/XRechnung")
public class EInvoicingController {

    private final EInvoicingService eInvoicingService;

    /**
     * Generiert eine neue e-Rechnung im ZUGFeRD-Format
     */
    @PostMapping("/generate")
    @Operation(summary = "E-Rechnung generieren", 
               description = "Generiert eine e-Rechnung im ZUGFeRD/XRechnung-Format")
    @PreAuthorize("hasRole('INVOICE_CREATOR')")
    public ResponseEntity<InvoiceResponse> generateInvoice(
            @Valid @RequestBody InvoiceRequest request) {
        
        log.info("Generiere e-Rechnung für Kunde: {}", request.getCustomerId());
        
        try {
            InvoiceResponse response = eInvoicingService.generateInvoice(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Fehler beim Generieren der e-Rechnung", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(InvoiceResponse.builder()
                            .success(false)
                            .errorMessage(e.getMessage())
                            .build());
        }
    }

    /**
     * Lädt eine e-Rechnung als PDF/A-3 mit eingebettetem XML herunter
     */
    @GetMapping("/download/{invoiceId}")
    @Operation(summary = "E-Rechnung herunterladen", 
               description = "Lädt eine e-Rechnung als PDF/A-3 mit eingebettetem XML herunter")
    @PreAuthorize("hasRole('INVOICE_VIEWER')")
    public ResponseEntity<Resource> downloadInvoice(
            @Parameter(description = "ID der e-Rechnung") 
            @PathVariable UUID invoiceId) {
        
        log.info("Lade e-Rechnung herunter: {}", invoiceId);
        
        try {
            InvoiceDownloadResponse download = eInvoicingService.downloadInvoice(invoiceId);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + download.getFilename() + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(download.getResource());
        } catch (Exception e) {
            log.error("Fehler beim Herunterladen der e-Rechnung: {}", invoiceId, e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Verarbeitet eine eingehende e-Rechnung
     */
    @PostMapping("/process-incoming")
    @Operation(summary = "Eingehende e-Rechnung verarbeiten", 
               description = "Verarbeitet eine eingehende e-Rechnung im ZUGFeRD/XRechnung-Format")
    @PreAuthorize("hasRole('INVOICE_PROCESSOR')")
    public ResponseEntity<ProcessedInvoiceResponse> processIncomingInvoice(
            @Parameter(description = "E-Rechnung als PDF/A-3 mit eingebettetem XML") 
            @RequestParam("file") MultipartFile file) {
        
        log.info("Verarbeite eingehende e-Rechnung: {}", file.getOriginalFilename());
        
        try {
            ProcessedInvoiceResponse response = eInvoicingService.processIncomingInvoice(file);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Fehler beim Verarbeiten der eingehenden e-Rechnung", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ProcessedInvoiceResponse.builder()
                            .success(false)
                            .errorMessage(e.getMessage())
                            .build());
        }
    }

    /**
     * Validiert eine e-Rechnung gegen ZUGFeRD/XRechnung-Schemas
     */
    @PostMapping("/validate")
    @Operation(summary = "E-Rechnung validieren", 
               description = "Validiert eine e-Rechnung gegen ZUGFeRD/XRechnung-Schemas")
    @PreAuthorize("hasRole('INVOICE_VALIDATOR')")
    public ResponseEntity<ValidationResponse> validateInvoice(
            @Parameter(description = "E-Rechnung als PDF/A-3 mit eingebettetem XML") 
            @RequestParam("file") MultipartFile file) {
        
        log.info("Validiere e-Rechnung: {}", file.getOriginalFilename());
        
        try {
            ValidationResponse response = eInvoicingService.validateInvoice(file);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Fehler beim Validieren der e-Rechnung", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ValidationResponse.builder()
                            .valid(false)
                            .errorMessage(e.getMessage())
                            .build());
        }
    }

    /**
     * Konvertiert eine e-Rechnung in verschiedene Formate
     */
    @PostMapping("/convert")
    @Operation(summary = "E-Rechnung konvertieren", 
               description = "Konvertiert eine e-Rechnung in verschiedene Formate")
    @PreAuthorize("hasRole('INVOICE_CONVERTER')")
    public ResponseEntity<Resource> convertInvoice(
            @Parameter(description = "E-Rechnung als PDF/A-3 mit eingebettetem XML") 
            @RequestParam("file") MultipartFile file,
            @Parameter(description = "Zielformat") 
            @RequestParam("targetFormat") String targetFormat) {
        
        log.info("Konvertiere e-Rechnung in Format: {}", targetFormat);
        
        try {
            ConversionResponse conversion = eInvoicingService.convertInvoice(file, targetFormat);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + conversion.getFilename() + "\"")
                    .contentType(MediaType.parseMediaType(conversion.getContentType()))
                    .body(conversion.getResource());
        } catch (Exception e) {
            log.error("Fehler beim Konvertieren der e-Rechnung", e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Ruft alle e-Rechnungen mit Filterung ab
     */
    @GetMapping("/invoices")
    @Operation(summary = "E-Rechnungen abrufen", 
               description = "Ruft alle e-Rechnungen mit optionaler Filterung ab")
    @PreAuthorize("hasRole('INVOICE_VIEWER')")
    public ResponseEntity<List<InvoiceSummary>> getInvoices(
            @Parameter(description = "Filter für e-Rechnungen") 
            @ModelAttribute InvoiceFilter filter) {
        
        log.info("Rufe e-Rechnungen ab mit Filter: {}", filter);
        
        try {
            List<InvoiceSummary> invoices = eInvoicingService.getInvoices(filter);
            return ResponseEntity.ok(invoices);
        } catch (Exception e) {
            log.error("Fehler beim Abrufen der e-Rechnungen", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Ruft Statistiken für e-Rechnungen ab
     */
    @GetMapping("/statistics")
    @Operation(summary = "E-Rechnungs-Statistiken", 
               description = "Ruft Statistiken für e-Rechnungen ab")
    @PreAuthorize("hasRole('INVOICE_ANALYST')")
    public ResponseEntity<InvoiceStatistics> getStatistics(
            @Parameter(description = "Zeitraum für Statistiken") 
            @ModelAttribute StatisticsRequest request) {
        
        log.info("Rufe e-Rechnungs-Statistiken ab für Zeitraum: {}", request);
        
        try {
            InvoiceStatistics statistics = eInvoicingService.getStatistics(request);
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            log.error("Fehler beim Abrufen der e-Rechnungs-Statistiken", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Health Check für die E-Invoicing API
     */
    @GetMapping("/health")
    @Operation(summary = "Health Check", 
               description = "Überprüft den Status der E-Invoicing API")
    public ResponseEntity<HealthResponse> health() {
        log.debug("Health Check für E-Invoicing API");
        
        try {
            HealthResponse health = eInvoicingService.getHealth();
            return ResponseEntity.ok(health);
        } catch (Exception e) {
            log.error("Health Check fehlgeschlagen", e);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(HealthResponse.builder()
                            .status("DOWN")
                            .errorMessage(e.getMessage())
                            .build());
        }
    }
} 