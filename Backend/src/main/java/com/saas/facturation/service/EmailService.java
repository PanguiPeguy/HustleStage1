package com.saas.facturation.service;

import com.saas.facturation.entity.Facture;
import com.saas.facturation.entity.Utilisateur;
import com.saas.facturation.repository.FactureRepository;
import com.saas.facturation.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.util.ByteArrayDataSource;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final FactureRepository factureRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final PdfService pdfService;
    private final FactureService factureService;

    private Utilisateur getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return utilisateurRepository.findByEmail(email).orElseThrow();
    }

    public void sendFactureByEmail(Long factureId, String recipientEmail) {
        Utilisateur user = getCurrentUser();
        Facture facture = factureRepository.findByIdAndUtilisateurId(factureId, user.getId())
                .orElseThrow(() -> new RuntimeException("Facture non trouvée"));

        byte[] pdfBytes = pdfService.generatePdf(factureId);
        String email = recipientEmail != null ? recipientEmail : facture.getClient().getEmail();

        if (email == null || email.isBlank()) {
            throw new RuntimeException("Aucun email destinataire disponible");
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(email);
            helper.setSubject("Facture " + facture.getNumero() + " — " +
                    (user.getNomEntreprise() != null ? user.getNomEntreprise() : user.getEmail()));
            helper.setText(buildEmailBody(facture, user), true);

            ByteArrayDataSource pdfSource = new ByteArrayDataSource(pdfBytes, "application/pdf");
            helper.addAttachment("Facture-" + facture.getNumero() + ".pdf", pdfSource);

            mailSender.send(message);
            
            // Mark as sent
            factureService.marquerEnvoyee(factureId);
        } catch (MessagingException e) {
            throw new RuntimeException("Erreur lors de l'envoi de l'email: " + e.getMessage(), e);
        }
    }

    private String buildEmailBody(Facture facture, Utilisateur user) {
        return """
                <html><body style="font-family: Arial, sans-serif; color: #1f2937;">
                    <h2 style="color: #1e40af;">Votre facture est arrivée !</h2>
                    <p>Bonjour %s,</p>
                    <p>Veuillez trouver ci-joint la facture <strong>%s</strong> d'un montant de <strong>%s €</strong> TTC.</p>
                    <p><strong>Date d'échéance :</strong> %s</p>
                    <hr style="border-color: #e5e7eb;"/>
                    <p style="color: #6b7280; font-size: 12px;">
                        Ce message a été envoyé par %s via Facturation SaaS.
                    </p>
                </body></html>
                """.formatted(
                facture.getClient().getNom(),
                facture.getNumero(),
                facture.getTotalTTC().toString(),
                facture.getEcheance().toString(),
                user.getNomEntreprise() != null ? user.getNomEntreprise() : user.getEmail()
        );
    }
}
