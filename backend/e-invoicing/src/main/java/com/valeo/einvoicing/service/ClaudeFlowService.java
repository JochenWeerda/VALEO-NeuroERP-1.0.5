package com.valeo.einvoicing.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Base64;

// DTO-Klassen für Claude Flow Integration
class ClaudeFlowRequest {
    private String model;
    private List<ClaudeFlowMessage> messages;
    private int maxTokens;
    private double temperature;

    // Getter und Setter
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    public List<ClaudeFlowMessage> getMessages() { return messages; }
    public void setMessages(List<ClaudeFlowMessage> messages) { this.messages = messages; }
    public int getMaxTokens() { return maxTokens; }
    public void setMaxTokens(int maxTokens) { this.maxTokens = maxTokens; }
    public double getTemperature() { return temperature; }
    public void setTemperature(double temperature) { this.temperature = temperature; }
}

class ClaudeFlowMessage {
    private String role;
    private List<ClaudeFlowContent> content;

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public List<ClaudeFlowContent> getContent() { return content; }
    public void setContent(List<ClaudeFlowContent> content) { this.content = content; }
}

class ClaudeFlowContent {
    private String type;
    private String text;

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
}

class ClaudeFlowResponse {
    private List<ClaudeFlowChoice> choices;
    private ClaudeFlowUsage usage;

    public List<ClaudeFlowChoice> getChoices() { return choices; }
    public void setChoices(List<ClaudeFlowChoice> choices) { this.choices = choices; }
    public ClaudeFlowUsage getUsage() { return usage; }
    public void setUsage(ClaudeFlowUsage usage) { this.usage = usage; }
}

class ClaudeFlowChoice {
    private ClaudeFlowMessage message;

    public ClaudeFlowMessage getMessage() { return message; }
    public void setMessage(ClaudeFlowMessage message) { this.message = message; }
}

class ClaudeFlowUsage {
    private int inputTokens;
    private int outputTokens;

    public int getInputTokens() { return inputTokens; }
    public void setInputTokens(int inputTokens) { this.inputTokens = inputTokens; }
    public int getOutputTokens() { return outputTokens; }
    public void setOutputTokens(int outputTokens) { this.outputTokens = outputTokens; }
}

// DTO-Klassen für E-Invoicing
class InvoiceRequest {
    private String invoiceNumber;
    private String customerId;
    private List<InvoiceItem> items;
    private CompanyInfo seller;
    private CompanyInfo buyer;
    private String currency;
    private String language;
    private String zugferdProfile;
    private String xrechnungVersion;

    // Getter und Setter
    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }
    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }
    public List<InvoiceItem> getItems() { return items; }
    public void setItems(List<InvoiceItem> items) { this.items = items; }
    public CompanyInfo getSeller() { return seller; }
    public void setSeller(CompanyInfo seller) { this.seller = seller; }
    public CompanyInfo getBuyer() { return buyer; }
    public void setBuyer(CompanyInfo buyer) { this.buyer = buyer; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public String getZugferdProfile() { return zugferdProfile; }
    public void setZugferdProfile(String zugferdProfile) { this.zugferdProfile = zugferdProfile; }
    public String getXrechnungVersion() { return xrechnungVersion; }
    public void setXrechnungVersion(String xrechnungVersion) { this.xrechnungVersion = xrechnungVersion; }
}

class InvoiceItem {
    private String name;
    private String description;
    private double quantity;
    private double unitPrice;
    private double taxRate;
    private String unit;

    // Getter und Setter
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public double getQuantity() { return quantity; }
    public void setQuantity(double quantity) { this.quantity = quantity; }
    public double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(double unitPrice) { this.unitPrice = unitPrice; }
    public double getTaxRate() { return taxRate; }
    public void setTaxRate(double taxRate) { this.taxRate = taxRate; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
}

class CompanyInfo {
    private String name;
    private String vatId;
    private String taxNumber;
    private Address address;
    private String email;
    private String phone;

    // Getter und Setter
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getVatId() { return vatId; }
    public void setVatId(String vatId) { this.vatId = vatId; }
    public String getTaxNumber() { return taxNumber; }
    public void setTaxNumber(String taxNumber) { this.taxNumber = taxNumber; }
    public Address getAddress() { return address; }
    public void setAddress(Address address) { this.address = address; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}

class Address {
    private String street;
    private String city;
    private String postalCode;
    private String country;

    // Getter und Setter
    public String getStreet() { return street; }
    public void setStreet(String street) { this.street = street; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
}

// Ergebnis-DTOs
class InvoiceAnalysisResult {
    private boolean success;
    private String analysis;
    private List<String> recommendations;
    private String errorMessage;
    private Map<String, Object> metadata;

    // Builder-Pattern
    public static InvoiceAnalysisResultBuilder builder() {
        return new InvoiceAnalysisResultBuilder();
    }

    public static class InvoiceAnalysisResultBuilder {
        private InvoiceAnalysisResult result = new InvoiceAnalysisResult();

        public InvoiceAnalysisResultBuilder success(boolean success) {
            result.success = success;
            return this;
        }

        public InvoiceAnalysisResultBuilder analysis(String analysis) {
            result.analysis = analysis;
            return this;
        }

        public InvoiceAnalysisResultBuilder recommendations(List<String> recommendations) {
            result.recommendations = recommendations;
            return this;
        }

        public InvoiceAnalysisResultBuilder errorMessage(String errorMessage) {
            result.errorMessage = errorMessage;
            return this;
        }

        public InvoiceAnalysisResultBuilder metadata(Map<String, Object> metadata) {
            result.metadata = metadata;
            return this;
        }

        public InvoiceAnalysisResult build() {
            return result;
        }
    }

    // Getter
    public boolean isSuccess() { return success; }
    public String getAnalysis() { return analysis; }
    public List<String> getRecommendations() { return recommendations; }
    public String getErrorMessage() { return errorMessage; }
    public Map<String, Object> getMetadata() { return metadata; }
}

class ValidationResult {
    private boolean valid;
    private List<String> errors;
    private List<String> warnings;
    private Map<String, Object> validationDetails;

    public static ValidationResultBuilder builder() {
        return new ValidationResultBuilder();
    }

    public static class ValidationResultBuilder {
        private ValidationResult result = new ValidationResult();

        public ValidationResultBuilder valid(boolean valid) {
            result.valid = valid;
            return this;
        }

        public ValidationResultBuilder errors(List<String> errors) {
            result.errors = errors;
            return this;
        }

        public ValidationResultBuilder warnings(List<String> warnings) {
            result.warnings = warnings;
            return this;
        }

        public ValidationResultBuilder validationDetails(Map<String, Object> validationDetails) {
            result.validationDetails = validationDetails;
            return this;
        }

        public ValidationResult build() {
            return result;
        }
    }

    // Getter
    public boolean isValid() { return valid; }
    public List<String> getErrors() { return errors; }
    public List<String> getWarnings() { return warnings; }
    public Map<String, Object> getValidationDetails() { return validationDetails; }
}

class DataMappingResult {
    private boolean success;
    private Map<String, Object> mappedData;
    private List<String> unmappedFields;
    private String errorMessage;

    public static DataMappingResultBuilder builder() {
        return new DataMappingResultBuilder();
    }

    public static class DataMappingResultBuilder {
        private DataMappingResult result = new DataMappingResult();

        public DataMappingResultBuilder success(boolean success) {
            result.success = success;
            return this;
        }

        public DataMappingResultBuilder mappedData(Map<String, Object> mappedData) {
            result.mappedData = mappedData;
            return this;
        }

        public DataMappingResultBuilder unmappedFields(List<String> unmappedFields) {
            result.unmappedFields = unmappedFields;
            return this;
        }

        public DataMappingResultBuilder errorMessage(String errorMessage) {
            result.errorMessage = errorMessage;
            return this;
        }

        public DataMappingResult build() {
            return result;
        }
    }

    // Getter
    public boolean isSuccess() { return success; }
    public Map<String, Object> getMappedData() { return mappedData; }
    public List<String> getUnmappedFields() { return unmappedFields; }
    public String getErrorMessage() { return errorMessage; }
}

@Service
@RequiredArgsConstructor
@Slf4j
public class ClaudeFlowService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${claude.flow.api.url:http://localhost:8000}")
    private String claudeFlowApiUrl;

    @Value("${claude.flow.api.key}")
    private String claudeFlowApiKey;

    @Value("${claude.flow.model:claude-3-sonnet-20240229}")
    private String claudeFlowModel;

    private final Map<String, String> sessionCache = new ConcurrentHashMap<>();

    public CompletableFuture<InvoiceAnalysisResult> analyzeInvoiceWithClaudeFlow(
            InvoiceRequest invoiceRequest, 
            byte[] pdfData) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                log.info("Starte Claude Flow Analyse für e-Rechnung: {}", invoiceRequest.getInvoiceNumber());
                ClaudeFlowRequest request = createAnalysisRequest(invoiceRequest, pdfData);
                ClaudeFlowResponse response = callClaudeFlowAPI(request);
                return processAnalysisResponse(response, invoiceRequest);
            } catch (Exception e) {
                log.error("Fehler bei Claude Flow Analyse", e);
                return InvoiceAnalysisResult.builder()
                        .success(false)
                        .errorMessage("Claude Flow Analyse fehlgeschlagen: " + e.getMessage())
                        .build();
            }
        });
    }

    public CompletableFuture<ValidationResult> validateWithClaudeFlow(
            byte[] invoiceData, 
            String format) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                log.info("Starte Claude Flow Validierung für Format: {}", format);
                ClaudeFlowRequest request = createValidationRequest(invoiceData, format);
                ClaudeFlowResponse response = callClaudeFlowAPI(request);
                return processValidationResponse(response);
            } catch (Exception e) {
                log.error("Fehler bei Claude Flow Validierung", e);
                return ValidationResult.builder()
                        .valid(false)
                        .errors(Arrays.asList("Claude Flow Validierung fehlgeschlagen: " + e.getMessage()))
                        .build();
            }
        });
    }

    public CompletableFuture<DataMappingResult> mapIncomingInvoiceWithClaudeFlow(
            byte[] invoiceData, 
            String sourceFormat) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                log.info("Starte Claude Flow Mapping für Format: {}", sourceFormat);
                ClaudeFlowRequest request = createMappingRequest(invoiceData, sourceFormat);
                ClaudeFlowResponse response = callClaudeFlowAPI(request);
                return processMappingResponse(response);
            } catch (Exception e) {
                log.error("Fehler bei Claude Flow Mapping", e);
                return DataMappingResult.builder()
                        .success(false)
                        .errorMessage("Claude Flow Mapping fehlgeschlagen: " + e.getMessage())
                        .build();
            }
        });
    }

    private ClaudeFlowRequest createAnalysisRequest(InvoiceRequest invoiceRequest, byte[] pdfData) {
        String systemPrompt = buildAnalysisSystemPrompt();
        String userPrompt = buildAnalysisUserPrompt(invoiceRequest, pdfData);

        ClaudeFlowRequest request = new ClaudeFlowRequest();
        request.setModel(claudeFlowModel);
        request.setMaxTokens(4000);
        request.setTemperature(0.1);

        List<ClaudeFlowMessage> messages = new ArrayList<>();
        
        ClaudeFlowMessage systemMessage = new ClaudeFlowMessage();
        systemMessage.setRole("system");
        systemMessage.setContent(Arrays.asList(createContent("text", systemPrompt)));
        messages.add(systemMessage);

        ClaudeFlowMessage userMessage = new ClaudeFlowMessage();
        userMessage.setRole("user");
        userMessage.setContent(Arrays.asList(createContent("text", userPrompt)));
        messages.add(userMessage);

        request.setMessages(messages);
        return request;
    }

    private ClaudeFlowRequest createValidationRequest(byte[] invoiceData, String format) {
        String systemPrompt = buildValidationSystemPrompt();
        String userPrompt = buildValidationUserPrompt(invoiceData, format);

        ClaudeFlowRequest request = new ClaudeFlowRequest();
        request.setModel(claudeFlowModel);
        request.setMaxTokens(2000);
        request.setTemperature(0.0);

        List<ClaudeFlowMessage> messages = new ArrayList<>();
        
        ClaudeFlowMessage systemMessage = new ClaudeFlowMessage();
        systemMessage.setRole("system");
        systemMessage.setContent(Arrays.asList(createContent("text", systemPrompt)));
        messages.add(systemMessage);

        ClaudeFlowMessage userMessage = new ClaudeFlowMessage();
        userMessage.setRole("user");
        userMessage.setContent(Arrays.asList(createContent("text", userPrompt)));
        messages.add(userMessage);

        request.setMessages(messages);
        return request;
    }

    private ClaudeFlowRequest createMappingRequest(byte[] invoiceData, String sourceFormat) {
        String systemPrompt = buildMappingSystemPrompt();
        String userPrompt = buildMappingUserPrompt(invoiceData, sourceFormat);

        ClaudeFlowRequest request = new ClaudeFlowRequest();
        request.setModel(claudeFlowModel);
        request.setMaxTokens(3000);
        request.setTemperature(0.1);

        List<ClaudeFlowMessage> messages = new ArrayList<>();
        
        ClaudeFlowMessage systemMessage = new ClaudeFlowMessage();
        systemMessage.setRole("system");
        systemMessage.setContent(Arrays.asList(createContent("text", systemPrompt)));
        messages.add(systemMessage);

        ClaudeFlowMessage userMessage = new ClaudeFlowMessage();
        userMessage.setRole("user");
        userMessage.setContent(Arrays.asList(createContent("text", userPrompt)));
        messages.add(userMessage);

        request.setMessages(messages);
        return request;
    }

    private ClaudeFlowContent createContent(String type, String text) {
        ClaudeFlowContent content = new ClaudeFlowContent();
        content.setType(type);
        content.setText(text);
        return content;
    }

    private String buildAnalysisSystemPrompt() {
        return """
            Du bist ein Experte für e-Invoicing und deutsche ZUGFeRD/XRechnung-Standards.
            Analysiere die e-Rechnung auf:
            1. Vollständigkeit der Pflichtfelder
            2. Korrekte Steuerberechnungen (UStG)
            3. ZUGFeRD/XRechnung-Konformität
            4. GoBD-Konformität
            5. Potentielle Probleme oder Verbesserungen
            
            Antworte in strukturiertem JSON-Format.
            """;
    }

    private String buildValidationSystemPrompt() {
        return """
            Du bist ein Validator für e-Invoicing-Dateien.
            Prüfe die Datei auf:
            1. Format-Konformität (ZUGFeRD, XRechnung, PEPPOL)
            2. XML-Schema-Validität
            3. Pflichtfelder-Vollständigkeit
            4. Mathematische Korrektheit
            
            Antworte mit Validierungsergebnissen in JSON-Format.
            """;
    }

    private String buildMappingSystemPrompt() {
        return """
            Du bist ein Experte für Daten-Mapping zwischen verschiedenen e-Invoicing-Formaten.
            Mappe die eingehenden Daten auf das VALEO NeuroERP-Format:
            1. Extrahiere alle relevanten Felder
            2. Konvertiere in das Zielformat
            3. Behandle fehlende oder ungültige Daten
            4. Erstelle Mapping-Log
            
            Antworte mit gemappten Daten in JSON-Format.
            """;
    }

    private String buildAnalysisUserPrompt(InvoiceRequest invoiceRequest, byte[] pdfData) {
        return String.format("""
            Analysiere diese e-Rechnung:
            
            Rechnungsnummer: %s
            Kunde: %s
            Währung: %s
            ZUGFeRD-Profil: %s
            XRechnung-Version: %s
            
            PDF-Daten (Base64): %s
            
            Führe eine vollständige Analyse durch und gib Empfehlungen.
            """,
            invoiceRequest.getInvoiceNumber(),
            invoiceRequest.getCustomerId(),
            invoiceRequest.getCurrency(),
            invoiceRequest.getZugferdProfile(),
            invoiceRequest.getXrechnungVersion(),
            Base64.getEncoder().encodeToString(pdfData)
        );
    }

    private String buildValidationUserPrompt(byte[] invoiceData, String format) {
        return String.format("""
            Validiere diese e-Invoicing-Datei:
            
            Format: %s
            Daten (Base64): %s
            
            Führe eine vollständige Validierung durch.
            """,
            format,
            Base64.getEncoder().encodeToString(invoiceData)
        );
    }

    private String buildMappingUserPrompt(byte[] invoiceData, String sourceFormat) {
        return String.format("""
            Mappe diese e-Invoicing-Datei:
            
            Quellformat: %s
            Daten (Base64): %s
            
            Zielformat: VALEO NeuroERP Standard
            
            Führe das Mapping durch und extrahiere alle relevanten Daten.
            """,
            sourceFormat,
            Base64.getEncoder().encodeToString(invoiceData)
        );
    }

    private ClaudeFlowResponse callClaudeFlowAPI(ClaudeFlowRequest request) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-api-key", claudeFlowApiKey);
            headers.set("anthropic-version", "2023-06-01");

            HttpEntity<ClaudeFlowRequest> entity = new HttpEntity<>(request, headers);
            ResponseEntity<ClaudeFlowResponse> response = restTemplate.postForEntity(
                claudeFlowApiUrl + "/v1/messages",
                entity,
                ClaudeFlowResponse.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            } else {
                throw new RuntimeException("Claude Flow API-Antwort war nicht erfolgreich: " + response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("Fehler beim Aufruf der Claude Flow API", e);
            throw new RuntimeException("Claude Flow API-Aufruf fehlgeschlagen", e);
        }
    }

    private InvoiceAnalysisResult processAnalysisResponse(ClaudeFlowResponse response, InvoiceRequest invoiceRequest) {
        try {
            if (response.getChoices() != null && !response.getChoices().isEmpty()) {
                String analysisText = response.getChoices().get(0).getMessage().getContent().get(0).getText();
                
                // Parse JSON-Antwort
                Map<String, Object> analysisData = objectMapper.readValue(analysisText, Map.class);
                
                return InvoiceAnalysisResult.builder()
                        .success(true)
                        .analysis(analysisText)
                        .recommendations((List<String>) analysisData.getOrDefault("recommendations", new ArrayList<>()))
                        .metadata(analysisData)
                        .build();
            } else {
                return InvoiceAnalysisResult.builder()
                        .success(false)
                        .errorMessage("Keine Antwort von Claude Flow erhalten")
                        .build();
            }
        } catch (Exception e) {
            log.error("Fehler beim Verarbeiten der Claude Flow Analyse-Antwort", e);
            return InvoiceAnalysisResult.builder()
                    .success(false)
                    .errorMessage("Fehler beim Verarbeiten der Analyse: " + e.getMessage())
                    .build();
        }
    }

    private ValidationResult processValidationResponse(ClaudeFlowResponse response) {
        try {
            if (response.getChoices() != null && !response.getChoices().isEmpty()) {
                String validationText = response.getChoices().get(0).getMessage().getContent().get(0).getText();
                
                // Parse JSON-Antwort
                Map<String, Object> validationData = objectMapper.readValue(validationText, Map.class);
                
                return ValidationResult.builder()
                        .valid((Boolean) validationData.getOrDefault("valid", false))
                        .errors((List<String>) validationData.getOrDefault("errors", new ArrayList<>()))
                        .warnings((List<String>) validationData.getOrDefault("warnings", new ArrayList<>()))
                        .validationDetails(validationData)
                        .build();
            } else {
                return ValidationResult.builder()
                        .valid(false)
                        .errors(Arrays.asList("Keine Antwort von Claude Flow erhalten"))
                        .build();
            }
        } catch (Exception e) {
            log.error("Fehler beim Verarbeiten der Claude Flow Validierungs-Antwort", e);
            return ValidationResult.builder()
                    .valid(false)
                    .errors(Arrays.asList("Fehler beim Verarbeiten der Validierung: " + e.getMessage()))
                    .build();
        }
    }

    private DataMappingResult processMappingResponse(ClaudeFlowResponse response) {
        try {
            if (response.getChoices() != null && !response.getChoices().isEmpty()) {
                String mappingText = response.getChoices().get(0).getMessage().getContent().get(0).getText();
                
                // Parse JSON-Antwort
                Map<String, Object> mappingData = objectMapper.readValue(mappingText, Map.class);
                
                return DataMappingResult.builder()
                        .success((Boolean) mappingData.getOrDefault("success", false))
                        .mappedData((Map<String, Object>) mappingData.getOrDefault("mappedData", new HashMap<>()))
                        .unmappedFields((List<String>) mappingData.getOrDefault("unmappedFields", new ArrayList<>()))
                        .build();
            } else {
                return DataMappingResult.builder()
                        .success(false)
                        .errorMessage("Keine Antwort von Claude Flow erhalten")
                        .build();
            }
        } catch (Exception e) {
            log.error("Fehler beim Verarbeiten der Claude Flow Mapping-Antwort", e);
            return DataMappingResult.builder()
                    .success(false)
                    .errorMessage("Fehler beim Verarbeiten des Mappings: " + e.getMessage())
                    .build();
        }
    }
} 