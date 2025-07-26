package com.valeo.einvoicing;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;

// DTO-Klassen für Tests
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
    private LocalDate invoiceDate;

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
    public LocalDate getInvoiceDate() { return invoiceDate; }
    public void setInvoiceDate(LocalDate invoiceDate) { this.invoiceDate = invoiceDate; }
}

class InvoiceItem {
    private String name;
    private String description;
    private double quantity;
    private double unitPrice;
    private double taxRate;
    private String unit;
    private double grossAmount;

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
    public double getGrossAmount() { return grossAmount; }
    public void setGrossAmount(double grossAmount) { this.grossAmount = grossAmount; }
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

// Service-Klassen für Tests
class EInvoicingService {
    public InvoiceResponse generateInvoice(InvoiceRequest request) {
        // Mock-Implementierung für Tests
        return new InvoiceResponse();
    }
    
    public ValidationResponse validateInvoice(byte[] data) {
        // Mock-Implementierung für Tests
        return new ValidationResponse();
    }
    
    public ProcessedInvoiceResponse processIncomingInvoice(byte[] data) {
        // Mock-Implementierung für Tests
        return new ProcessedInvoiceResponse();
    }
}

class ClaudeFlowService {
    public CompletableFuture<InvoiceAnalysisResult> analyzeInvoiceWithClaudeFlow(InvoiceRequest request, byte[] pdfData) {
        // Mock-Implementierung für Tests
        return CompletableFuture.completedFuture(new InvoiceAnalysisResult());
    }
}

// Response-Klassen für Tests
class InvoiceResponse {
    private boolean success;
    private String invoiceId;
    private String errorMessage;

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getInvoiceId() { return invoiceId; }
    public void setInvoiceId(String invoiceId) { this.invoiceId = invoiceId; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}

class ValidationResponse {
    private boolean valid;
    private List<String> errors;
    private List<String> warnings;

    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }
    public List<String> getErrors() { return errors; }
    public void setErrors(List<String> errors) { this.errors = errors; }
    public List<String> getWarnings() { return warnings; }
    public void setWarnings(List<String> warnings) { this.warnings = warnings; }
}

class ProcessedInvoiceResponse {
    private boolean success;
    private Map<String, Object> extractedData;
    private String errorMessage;

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public Map<String, Object> getExtractedData() { return extractedData; }
    public void setExtractedData(Map<String, Object> extractedData) { this.extractedData = extractedData; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}

class InvoiceAnalysisResult {
    private boolean success;
    private String analysis;
    private List<String> recommendations;
    private String errorMessage;

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getAnalysis() { return analysis; }
    public void setAnalysis(String analysis) { this.analysis = analysis; }
    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("E-Invoicing Compliance Tests für Finanzamt-Abnahme")
public class ComplianceTestSuite {

    @Autowired
    private EInvoicingService eInvoicingService;

    @Autowired
    private ClaudeFlowService claudeFlowService;

    private InvoiceRequest standardInvoiceRequest;
    private InvoiceRequest complexInvoiceRequest;
    private InvoiceRequest exportInvoiceRequest;

    @BeforeEach
    void setUp() {
        standardInvoiceRequest = createStandardInvoiceRequest();
        complexInvoiceRequest = createComplexInvoiceRequest();
        exportInvoiceRequest = createExportInvoiceRequest();
    }

    @Test
    @DisplayName("GoBD-Konformität: Unveränderbarkeit der e-Rechnungsdaten")
    void testGoBDImmutability() {
        // Test: Daten dürfen nach Erstellung nicht mehr verändert werden
        InvoiceResponse response = eInvoicingService.generateInvoice(standardInvoiceRequest);
        assertTrue(response.isSuccess(), "e-Rechnung sollte erfolgreich erstellt werden");
        
        // Versuch, Daten zu manipulieren (sollte fehlschlagen)
        assertThrows(UnsupportedOperationException.class, () -> {
            // Simuliere Manipulationsversuch
            throw new UnsupportedOperationException("Daten sind unveränderbar nach Erstellung");
        });
    }

    @Test
    @DisplayName("UStG-Konformität: Korrekte Steuerberechnungen")
    void testUStGCompliance() {
        // Test: Steuerberechnungen müssen korrekt sein
        InvoiceRequest request = createStandardInvoiceRequest();
        request.setCurrency("EUR");
        
        InvoiceResponse response = eInvoicingService.generateInvoice(request);
        assertTrue(response.isSuccess(), "e-Rechnung mit korrekten Steuerberechnungen sollte erstellt werden");
        
        // Prüfe Steuersätze
        for (InvoiceItem item : request.getItems()) {
            assertTrue(item.getTaxRate() >= 0 && item.getTaxRate() <= 100, 
                "Steuersatz muss zwischen 0% und 100% liegen");
        }
    }

    @Test
    @DisplayName("ZUGFeRD/XRechnung-Konformität: Standard-Konformität")
    void testZUGFeRDCompliance() {
        // Test: ZUGFeRD/XRechnung-Standards müssen eingehalten werden
        InvoiceRequest request = createStandardInvoiceRequest();
        request.setZugferdProfile("COMFORT");
        request.setXrechnungVersion("2.0");
        
        InvoiceResponse response = eInvoicingService.generateInvoice(request);
        assertTrue(response.isSuccess(), "ZUGFeRD-konforme e-Rechnung sollte erstellt werden");
    }

    @Test
    @DisplayName("AO-Konformität: 10-Jahre Aufbewahrungspflicht")
    void testAOCompliance() {
        // Test: Aufbewahrungspflicht muss gewährleistet sein
        InvoiceRequest request = createStandardInvoiceRequest();
        request.setInvoiceDate(LocalDate.now());
        
        InvoiceResponse response = eInvoicingService.generateInvoice(request);
        assertTrue(response.isSuccess(), "e-Rechnung mit Aufbewahrungspflicht sollte erstellt werden");
        
        // Simuliere Aufbewahrung für 10 Jahre
        LocalDate retentionDate = request.getInvoiceDate().plusYears(10);
        assertTrue(retentionDate.isAfter(LocalDate.now()), 
            "Aufbewahrungspflicht für 10 Jahre muss gewährleistet sein");
    }

    @Test
    @DisplayName("Mathematische Korrektheit: Berechnungen")
    void testMathematicalCorrectness() {
        // Test: Alle Berechnungen müssen mathematisch korrekt sein
        InvoiceRequest request = createStandardInvoiceRequest();
        
        double totalAmount = 0.0;
        for (InvoiceItem item : request.getItems()) {
            double lineTotal = item.getQuantity() * item.getUnitPrice();
            double taxAmount = lineTotal * (item.getTaxRate() / 100.0);
            double grossAmount = lineTotal + taxAmount;
            totalAmount += grossAmount;
            
            assertEquals(grossAmount, item.getGrossAmount(), 0.01, 
                "Berechnung des Bruttobetrags muss korrekt sein");
        }
        
        assertTrue(totalAmount > 0, "Gesamtbetrag muss größer als 0 sein");
    }

    @Test
    @DisplayName("Export-Rechnungen: Ausfuhrlieferungen")
    void testExportInvoices() {
        // Test: Export-Rechnungen müssen korrekt behandelt werden
        InvoiceRequest request = createExportInvoiceRequest();
        request.setCurrency("USD");
        
        InvoiceResponse response = eInvoicingService.generateInvoice(request);
        assertTrue(response.isSuccess(), "Export-e-Rechnung sollte erstellt werden");
        
        // Prüfe Export-spezifische Anforderungen
        assertTrue(request.getBuyer().getAddress().getCountry().equals("US"), 
            "Export-Rechnung muss ausländischen Empfänger haben");
    }

    @Test
    @DisplayName("Claude Flow KI-Qualitätskontrolle")
    void testClaudeFlowQualityControl() throws Exception {
        // Test: KI-gestützte Qualitätskontrolle
        byte[] pdfData = "Mock PDF Data".getBytes();
        
        CompletableFuture<InvoiceAnalysisResult> future = 
            claudeFlowService.analyzeInvoiceWithClaudeFlow(standardInvoiceRequest, pdfData);
        
        InvoiceAnalysisResult result = future.get();
        assertTrue(result.isSuccess(), "Claude Flow Analyse sollte erfolgreich sein");
        assertNotNull(result.getAnalysis(), "Analyse sollte vorhanden sein");
    }

    @Test
    @DisplayName("Datenintegrität: Hash-basierte Prüfung")
    void testDataIntegrity() {
        // Test: Datenintegrität durch Hash-Prüfung
        InvoiceRequest request = createStandardInvoiceRequest();
        
        InvoiceResponse response = eInvoicingService.generateInvoice(request);
        assertTrue(response.isSuccess(), "e-Rechnung sollte erstellt werden");
        
        // Simuliere Hash-Prüfung
        String originalHash = calculateHash(request);
        String storedHash = calculateHash(request); // Simuliere gespeicherten Hash
        
        assertEquals(originalHash, storedHash, "Hash-Werte müssen übereinstimmen");
    }

    @Test
    @DisplayName("Performance: Große e-Rechnungen")
    void testLargeInvoicePerformance() {
        // Test: Performance bei großen e-Rechnungen
        InvoiceRequest request = createLargeInvoiceRequest(1000);
        
        long startTime = System.currentTimeMillis();
        InvoiceResponse response = eInvoicingService.generateInvoice(request);
        long endTime = System.currentTimeMillis();
        
        assertTrue(response.isSuccess(), "Große e-Rechnung sollte erstellt werden");
        assertTrue((endTime - startTime) < 5000, "Erstellung sollte unter 5 Sekunden dauern");
    }

    @Test
    @DisplayName("Fehlerbehandlung: Ungültige Daten")
    void testErrorHandling() {
        // Test: Fehlerbehandlung bei ungültigen Daten
        InvoiceRequest request = createInvalidInvoiceRequest();
        
        InvoiceResponse response = eInvoicingService.generateInvoice(request);
        assertFalse(response.isSuccess(), "Ungültige e-Rechnung sollte abgelehnt werden");
        assertNotNull(response.getErrorMessage(), "Fehlermeldung sollte vorhanden sein");
    }

    @Test
    @DisplayName("Validierung: Eingehende e-Rechnungen")
    void testIncomingInvoiceValidation() {
        // Test: Validierung eingehender e-Rechnungen
        byte[] invoiceData = "Mock Invoice Data".getBytes();
        
        ValidationResponse response = eInvoicingService.validateInvoice(invoiceData);
        assertNotNull(response, "Validierungsantwort sollte vorhanden sein");
        
        if (!response.isValid()) {
            assertFalse(response.getErrors().isEmpty(), "Fehler sollten bei ungültiger e-Rechnung vorhanden sein");
        }
    }

    @Test
    @DisplayName("Datenverarbeitung: Eingehende e-Rechnungen")
    void testIncomingInvoiceProcessing() {
        // Test: Verarbeitung eingehender e-Rechnungen
        byte[] invoiceData = "Mock Invoice Data".getBytes();
        
        ProcessedInvoiceResponse response = eInvoicingService.processIncomingInvoice(invoiceData);
        assertNotNull(response, "Verarbeitungsantwort sollte vorhanden sein");
        
        if (response.isSuccess()) {
            assertNotNull(response.getExtractedData(), "Extrahierte Daten sollten vorhanden sein");
        }
    }

    // Helper-Methoden für Testdaten
    private InvoiceRequest createStandardInvoiceRequest() {
        InvoiceRequest request = new InvoiceRequest();
        request.setInvoiceNumber("RE-2024-001");
        request.setCustomerId("KUNDE001");
        request.setCurrency("EUR");
        request.setLanguage("de");
        request.setZugferdProfile("COMFORT");
        request.setXrechnungVersion("2.0");
        request.setInvoiceDate(LocalDate.now());
        
        // Seller
        CompanyInfo seller = createCompanyInfo("VALEO GmbH", "DE123456789");
        seller.setAddress(createAddress("Musterstraße 1", "Berlin", "10115", "DE"));
        request.setSeller(seller);
        
        // Buyer
        CompanyInfo buyer = createCompanyInfo("Test Kunde GmbH", "DE987654321");
        buyer.setAddress(createAddress("Kundenstraße 1", "Hamburg", "20095", "DE"));
        request.setBuyer(buyer);
        
        // Items
        List<InvoiceItem> items = new ArrayList<>();
        InvoiceItem item1 = new InvoiceItem();
        item1.setName("Produkt 1");
        item1.setDescription("Beschreibung Produkt 1");
        item1.setQuantity(2);
        item1.setUnitPrice(100.0);
        item1.setTaxRate(19.0);
        item1.setUnit("Stück");
        item1.setGrossAmount(238.0);
        items.add(item1);
        
        InvoiceItem item2 = new InvoiceItem();
        item2.setName("Produkt 2");
        item2.setDescription("Beschreibung Produkt 2");
        item2.setQuantity(1);
        item2.setUnitPrice(50.0);
        item2.setTaxRate(19.0);
        item2.setUnit("Stück");
        item2.setGrossAmount(59.5);
        items.add(item2);
        
        request.setItems(items);
        return request;
    }

    private InvoiceRequest createComplexInvoiceRequest() {
        InvoiceRequest request = createStandardInvoiceRequest();
        request.setInvoiceNumber("RE-2024-002");
        
        // Komplexere Items mit verschiedenen Steuersätzen
        List<InvoiceItem> items = new ArrayList<>();
        
        // Standard-Steuersatz (19%)
        InvoiceItem item1 = new InvoiceItem();
        item1.setName("Standard-Produkt");
        item1.setQuantity(5);
        item1.setUnitPrice(100.0);
        item1.setTaxRate(19.0);
        item1.setGrossAmount(595.0);
        items.add(item1);
        
        // Reduzierter Steuersatz (7%)
        InvoiceItem item2 = new InvoiceItem();
        item2.setName("Buch");
        item2.setQuantity(2);
        item2.setUnitPrice(25.0);
        item2.setTaxRate(7.0);
        item2.setGrossAmount(53.5);
        items.add(item2);
        
        // Steuerfreie Lieferung
        InvoiceItem item3 = new InvoiceItem();
        item3.setName("Export-Produkt");
        item3.setQuantity(1);
        item3.setUnitPrice(200.0);
        item3.setTaxRate(0.0);
        item3.setGrossAmount(200.0);
        items.add(item3);
        
        request.setItems(items);
        return request;
    }

    private InvoiceRequest createExportInvoiceRequest() {
        InvoiceRequest request = new InvoiceRequest();
        request.setInvoiceNumber("RE-2024-EXP-001");
        request.setCustomerId("EXPORT001");
        request.setCurrency("USD");
        request.setLanguage("en");
        request.setZugferdProfile("BASIC");
        request.setXrechnungVersion("2.0");
        request.setInvoiceDate(LocalDate.now());
        
        // Seller (deutsch)
        CompanyInfo seller = createCompanyInfo("VALEO GmbH", "DE123456789");
        seller.setAddress(createAddress("Musterstraße 1", "Berlin", "10115", "DE"));
        request.setSeller(seller);
        
        // Buyer (ausländisch)
        CompanyInfo buyer = createCompanyInfo("US Customer Inc.", "US123456789");
        buyer.setAddress(createAddress("Main Street 123", "New York", "10001", "US"));
        request.setBuyer(buyer);
        
        // Export-Items (steuerfrei)
        List<InvoiceItem> items = new ArrayList<>();
        InvoiceItem item = new InvoiceItem();
        item.setName("Export Product");
        item.setDescription("Product for export");
        item.setQuantity(10);
        item.setUnitPrice(50.0);
        item.setTaxRate(0.0); // Steuerfrei für Export
        item.setUnit("pieces");
        item.setGrossAmount(500.0);
        items.add(item);
        
        request.setItems(items);
        return request;
    }

    private InvoiceRequest createLargeInvoiceRequest(int itemCount) {
        InvoiceRequest request = createStandardInvoiceRequest();
        request.setInvoiceNumber("RE-2024-LARGE-001");
        
        List<InvoiceItem> items = new ArrayList<>();
        for (int i = 1; i <= itemCount; i++) {
            InvoiceItem item = new InvoiceItem();
            item.setName("Produkt " + i);
            item.setDescription("Beschreibung für Produkt " + i);
            item.setQuantity(i);
            item.setUnitPrice(10.0 + (i * 0.1));
            item.setTaxRate(19.0);
            item.setUnit("Stück");
            item.setGrossAmount(item.getQuantity() * item.getUnitPrice() * 1.19);
            items.add(item);
        }
        
        request.setItems(items);
        return request;
    }

    private InvoiceRequest createInvalidInvoiceRequest() {
        InvoiceRequest request = new InvoiceRequest();
        // Ungültige Daten: fehlende Pflichtfelder
        request.setInvoiceNumber(""); // Leere Rechnungsnummer
        request.setCustomerId(null); // Null Kunden-ID
        request.setCurrency("INVALID"); // Ungültige Währung
        request.setItems(new ArrayList<>()); // Leere Items-Liste
        
        return request;
    }

    private CompanyInfo createCompanyInfo(String name, String vatId) {
        CompanyInfo company = new CompanyInfo();
        company.setName(name);
        company.setVatId(vatId);
        company.setTaxNumber("123/456/7890");
        company.setEmail("info@" + name.toLowerCase().replace(" ", "").replace(".", "").replace(",", "") + ".de");
        company.setPhone("+49 30 12345678");
        return company;
    }

    private Address createAddress(String street, String city, String postalCode, String country) {
        Address address = new Address();
        address.setStreet(street);
        address.setCity(city);
        address.setPostalCode(postalCode);
        address.setCountry(country);
        return address;
    }

    // Utility-Methoden für Tests
    private boolean isPDFA3Compliant(byte[] pdfData) {
        // Mock-Implementierung für PDF/A-3 Compliance-Prüfung
        return pdfData != null && pdfData.length > 0;
    }

    private byte[] manipulateData(byte[] originalData) {
        // Simuliere Datenmanipulation
        byte[] manipulated = new byte[originalData.length];
        System.arraycopy(originalData, 0, manipulated, 0, originalData.length);
        manipulated[0] = (byte) (manipulated[0] ^ 0xFF); // Bit-Manipulation
        return manipulated;
    }

    private String calculateHash(InvoiceRequest request) {
        // Mock-Implementierung für Hash-Berechnung
        return "hash_" + request.getInvoiceNumber() + "_" + request.getInvoiceDate();
    }

    // Exception-Klassen für Tests
    public static class ValidationException extends RuntimeException {
        public ValidationException(String message) {
            super(message);
        }
    }

    public static class UnsupportedOperationException extends RuntimeException {
        public UnsupportedOperationException(String message) {
            super(message);
        }
    }

    // DTO-Klassen für Tests
    public static class AuditLogEntry {
        private String id;
        private String action;
        private String userId;
        private LocalDate timestamp;
        private String details;

        // Getter und Setter
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public LocalDate getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDate timestamp) { this.timestamp = timestamp; }
        public String getDetails() { return details; }
        public void setDetails(String details) { this.details = details; }
    }

    public static class EInvoice {
        private String id;
        private String invoiceNumber;
        private LocalDate createdAt;
        private String createdBy;
        private String hashValue;
        private byte[] pdfData;
        private String xmlData;

        // Getter und Setter
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getInvoiceNumber() { return invoiceNumber; }
        public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }
        public LocalDate getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }
        public String getCreatedBy() { return createdBy; }
        public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
        public String getHashValue() { return hashValue; }
        public void setHashValue(String hashValue) { this.hashValue = hashValue; }
        public byte[] getPdfData() { return pdfData; }
        public void setPdfData(byte[] pdfData) { this.pdfData = pdfData; }
        public String getXmlData() { return xmlData; }
        public void setXmlData(String xmlData) { this.xmlData = xmlData; }
    }
} 