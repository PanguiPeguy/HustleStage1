package com.saas.facturation.controller;

import com.saas.facturation.dto.facture.FactureRequest;
import com.saas.facturation.dto.facture.FactureResponse;
import com.saas.facturation.service.EmailService;
import com.saas.facturation.service.FactureService;
import com.saas.facturation.service.PdfService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class FactureController {

    private final FactureService factureService;
    private final PdfService pdfService;
    private final EmailService emailService;

    @GetMapping
    public ResponseEntity<List<FactureResponse>> getAll() {
        return ResponseEntity.ok(factureService.getAllFactures());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FactureResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(factureService.getFactureById(id));
    }

    @PostMapping
    public ResponseEntity<FactureResponse> create(@Valid @RequestBody FactureRequest request) {
        return ResponseEntity.ok(factureService.createFacture(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FactureResponse> update(@PathVariable Long id, @RequestBody FactureRequest request) {
        return ResponseEntity.ok(factureService.updateFacture(id, request));
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<FactureResponse> marquerPayee(@PathVariable Long id) {
        return ResponseEntity.ok(factureService.marquerPayee(id));
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<FactureResponse> dupliquer(@PathVariable Long id) {
        return ResponseEntity.ok(factureService.dupliquerFacture(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        factureService.deleteFacture(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> generatePdf(@PathVariable Long id) {
        byte[] pdf = pdfService.generatePdf(id);
        FactureResponse facture = factureService.getFactureById(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "Facture-" + facture.getNumero() + ".pdf");

        return ResponseEntity.ok().headers(headers).body(pdf);
    }

    @PostMapping("/{id}/send")
    public ResponseEntity<Map<String, String>> sendByEmail(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String email = body != null ? body.get("email") : null;
        emailService.sendFactureByEmail(id, email);
        return ResponseEntity.ok(Map.of("message", "Facture envoyée avec succès"));
    }
}
