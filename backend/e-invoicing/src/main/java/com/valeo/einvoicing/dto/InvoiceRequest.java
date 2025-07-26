package com.valeo.einvoicing.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * DTO für e-Rechnungsanfragen
 * 
 * Diese Klasse repräsentiert die Anfrage zur Generierung einer e-Rechnung
 * im ZUGFeRD/XRechnung-Format.
 * 
 * @author VALEO NeuroERP Team
 * @version 1.0.0
 */
public class InvoiceRequest {
    
    /**
     * Eindeutige Rechnungsnummer
     */
    private String invoiceNumber;
    
    /**
     * Kunden-ID
     */
    private String customerId;
    
    /**
     * Rechnungspositionen
     */
    private List<InvoiceItem> items;
    
    /**
     * Verkäufer-Informationen
     */
    private CompanyInfo seller;
    
    /**
     * Käufer-Informationen
     */
    private CompanyInfo buyer;
    
    /**
     * Währung (ISO 4217)
     */
    private String currency;
    
    /**
     * Sprache (ISO 639-1)
     */
    private String language;
    
    /**
     * ZUGFeRD-Profil (BASIC, COMFORT, EXTENDED)
     */
    private String zugferdProfile;
    
    /**
     * XRechnung-Version
     */
    private String xrechnungVersion;
    
    /**
     * Rechnungsdatum
     */
    private LocalDate invoiceDate;
    
    /**
     * Fälligkeitsdatum
     */
    private LocalDate dueDate;
    
    /**
     * Zahlungsbedingungen
     */
    private String paymentTerms;
    
    /**
     * Referenznummer
     */
    private String referenceNumber;
    
    /**
     * Auftragsnummer
     */
    private String orderNumber;
    
    /**
     * Lieferdatum
     */
    private LocalDate deliveryDate;
    
    /**
     * Lieferadresse
     */
    private Address deliveryAddress;
    
    /**
     * Bemerkungen
     */
    private String notes;
    
    /**
     * Zusätzliche Metadaten
     */
    private Map<String, Object> metadata;

    // Default Constructor
    public InvoiceRequest() {}

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
    
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    
    public String getPaymentTerms() { return paymentTerms; }
    public void setPaymentTerms(String paymentTerms) { this.paymentTerms = paymentTerms; }
    
    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }
    
    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }
    
    public LocalDate getDeliveryDate() { return deliveryDate; }
    public void setDeliveryDate(LocalDate deliveryDate) { this.deliveryDate = deliveryDate; }
    
    public Address getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(Address deliveryAddress) { this.deliveryAddress = deliveryAddress; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
} 