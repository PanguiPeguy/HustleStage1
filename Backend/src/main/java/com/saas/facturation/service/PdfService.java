package com.saas.facturation.service;

import com.saas.facturation.entity.Facture;
import com.saas.facturation.entity.Utilisateur;
import com.saas.facturation.repository.FactureRepository;
import com.saas.facturation.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class PdfService {

    private final FactureRepository factureRepository;
    private final UtilisateurRepository utilisateurRepository;

    private Utilisateur getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return utilisateurRepository.findByEmail(email).orElseThrow();
    }

    public byte[] generatePdf(Long factureId) {
        Utilisateur user = getCurrentUser();
        Facture facture = factureRepository.findByIdAndUtilisateurId(factureId, user.getId())
                .orElseThrow(() -> new RuntimeException("Facture non trouvée"));

        String html = buildHtml(facture, user);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(html);
            renderer.layout();
            renderer.createPDF(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération du PDF: " + e.getMessage(), e);
        }
    }

    private String buildHtml(Facture facture, Utilisateur user) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy", Locale.FRENCH);
        StringBuilder lignesHtml = new StringBuilder();

        facture.getLignes().forEach(ligne -> {
            lignesHtml.append(String.format("""
                    <tr>
                        <td>%s</td>
                        <td style="text-align:center">%d</td>
                        <td style="text-align:right">%s €</td>
                        <td style="text-align:center">%s%%</td>
                        <td style="text-align:right">%s €</td>
                    </tr>
                    """,
                    escapeHtml(ligne.getDescription()),
                    ligne.getQuantite(),
                    formatAmount(ligne.getPrixHT()),
                    ligne.getTva().stripTrailingZeros().toPlainString(),
                    formatAmount(ligne.getSousTotal())
            ));
        });

        String statutBadge = switch (facture.getStatut()) {
            case PAYEE -> "<span style='color:#059669;font-weight:bold'>✓ PAYÉE</span>";
            case ENVOYEE -> "<span style='color:#2563eb;font-weight:bold'>ENVOYÉE</span>";
            case EN_RETARD -> "<span style='color:#dc2626;font-weight:bold'>⚠ EN RETARD</span>";
            default -> "<span style='color:#6b7280;font-weight:bold'>BROUILLON</span>";
        };

        return """
                <?xml version="1.0" encoding="UTF-8"?>
                <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
                <html xmlns="http://www.w3.org/1999/xhtml">
                <head>
                    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #1f2937; font-size: 12px; }
                        .header { display: block; margin-bottom: 30px; }
                        .header-left { display: block; }
                        .company-name { font-size: 20px; font-weight: bold; color: #1e40af; }
                        .invoice-box { border: 2px solid #1e40af; padding: 15px; margin-bottom: 20px; border-radius: 4px; }
                        .invoice-title { font-size: 28px; font-weight: bold; color: #1e40af; }
                        .section { margin-bottom: 20px; }
                        .section-title { font-size: 11px; text-transform: uppercase; color: #6b7280; margin-bottom: 5px; }
                        table { width: 100%%; border-collapse: collapse; margin: 15px 0; }
                        th { background-color: #1e40af; color: white; padding: 8px; text-align: left; font-size: 11px; }
                        td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
                        tr:nth-child(even) td { background-color: #f9fafb; }
                        .totals { width: 40%%; float: right; }
                        .totals td { border: none; padding: 4px 8px; }
                        .total-ttc { font-size: 16px; font-weight: bold; color: #1e40af; border-top: 2px solid #1e40af !important; }
                        .footer { margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 15px; font-size: 10px; color: #6b7280; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="invoice-title">FACTURE</div>
                        <div style="margin-top: 5px;">%s</div>
                    </div>
                    
                    <table style="margin-bottom: 20px;">
                        <tr>
                            <td style="width:50%%; vertical-align:top; border:none; padding:0;">
                                <div class="section-title">Émetteur</div>
                                <div class="company-name">%s</div>
                                %s
                                %s
                                %s
                            </td>
                            <td style="width:50%%; vertical-align:top; border:none; padding:0; text-align:right;">
                                <div style="background:#f3f4f6; padding:15px; border-radius:4px;">
                                    <div><strong>Facture N°:</strong> %s</div>
                                    <div><strong>Date:</strong> %s</div>
                                    <div><strong>Échéance:</strong> %s</div>
                                    <div style="margin-top:5px;">Statut: %s</div>
                                </div>
                            </td>
                        </tr>
                    </table>
                    
                    <div class="section">
                        <div class="section-title">Client</div>
                        <strong>%s</strong><br/>
                        %s
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th style="width:40%%">Description</th>
                                <th style="width:10%%; text-align:center">Qté</th>
                                <th style="width:15%%; text-align:right">Prix HT</th>
                                <th style="width:10%%; text-align:center">TVA</th>
                                <th style="width:15%%; text-align:right">Total HT</th>
                            </tr>
                        </thead>
                        <tbody>
                            %s
                        </tbody>
                    </table>
                    
                    <table class="totals">
                        <tr><td>Total HT</td><td style="text-align:right"><strong>%s €</strong></td></tr>
                        <tr><td>TVA</td><td style="text-align:right">%s €</td></tr>
                        <tr class="total-ttc"><td><strong>Total TTC</strong></td><td style="text-align:right"><strong>%s €</strong></td></tr>
                    </table>
                    
                    %s
                    
                    <div class="footer">
                        %s
                        <br/>Document généré automatiquement — Facturation SaaS
                    </div>
                </body>
                </html>
                """.formatted(
                        statutBadge,
                        escapeHtml(user.getNomEntreprise() != null ? user.getNomEntreprise() : user.getEmail()),
                        user.getAdresse() != null ? escapeHtml(user.getAdresse()) + "<br/>" : "",
                        user.getSiret() != null ? "SIRET: " + escapeHtml(user.getSiret()) + "<br/>" : "",
                        user.getRib() != null ? "IBAN: " + escapeHtml(user.getRib()) : "",
                        escapeHtml(facture.getNumero()),
                        facture.getDate().format(fmt),
                        facture.getEcheance().format(fmt),
                        statutBadge,
                        escapeHtml(facture.getClient().getNom()),
                        facture.getClient().getEmail() != null ? escapeHtml(facture.getClient().getEmail()) : "",
                        lignesHtml,
                        formatAmount(facture.getTotalHT()),
                        formatAmount(facture.getTotalTVA()),
                        formatAmount(facture.getTotalTTC()),
                        facture.getNote() != null ? "<div class='section'><div class='section-title'>Notes</div>" + escapeHtml(facture.getNote()) + "</div>" : "",
                        user.getRib() != null ? "IBAN: " + escapeHtml(user.getRib()) : ""
        );
    }

    private String formatAmount(BigDecimal amount) {
        if (amount == null) return "0,00";
        return String.format(Locale.FRENCH, "%,.2f", amount);
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;");
    }
}
