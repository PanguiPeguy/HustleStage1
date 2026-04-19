package com.saas.facturation.service;

import com.saas.facturation.dto.facture.FactureRequest;
import com.saas.facturation.dto.facture.FactureResponse;
import com.saas.facturation.entity.*;
import com.saas.facturation.repository.ClientRepository;
import com.saas.facturation.repository.FactureRepository;
import com.saas.facturation.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FactureService {

    private final FactureRepository factureRepository;
    private final ClientRepository clientRepository;
    private final UtilisateurRepository utilisateurRepository;

    private Utilisateur getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    private String generateNumero(Long userId) {
        long count = factureRepository.countByUtilisateurId(userId) + 1;
        return String.format("FAC-%d-%04d", LocalDate.now().getYear(), count);
    }

    public List<FactureResponse> getAllFactures() {
        Utilisateur user = getCurrentUser();
        List<Facture> factures = factureRepository.findAllByUserIdOrdered(user.getId());
        
        LocalDate now = LocalDate.now();
        boolean changed = false;
        for (Facture f : factures) {
            if (f.getStatut() == StatutFacture.ENVOYEE && f.getEcheance().isBefore(now)) {
                f.setStatut(StatutFacture.EN_RETARD);
                factureRepository.save(f);
                changed = true;
            }
        }
        
        return factures.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public FactureResponse getFactureById(Long id) {
        Utilisateur user = getCurrentUser();
        Facture facture = factureRepository.findByIdAndUtilisateurId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Facture non trouvée"));
        
        if (facture.getStatut() == StatutFacture.ENVOYEE && facture.getEcheance().isBefore(LocalDate.now())) {
            facture.setStatut(StatutFacture.EN_RETARD);
            factureRepository.save(facture);
        }
        
        return toResponse(facture);
    }

    @Transactional
    public FactureResponse createFacture(FactureRequest request) {
        Utilisateur user = getCurrentUser();
        Client client = clientRepository.findByIdAndUtilisateurIdAndDeletedFalse(request.getClientId(), user.getId())
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        Facture facture = Facture.builder()
                .utilisateur(user)
                .client(client)
                .numero(generateNumero(user.getId()))
                .date(request.getDate())
                .echeance(request.getEcheance())
                .statut(request.getStatut() != null ? request.getStatut() : StatutFacture.BROUILLON)
                .note(request.getNote())
                .lignes(new ArrayList<>())
                .build();

        Facture savedFacture = factureRepository.save(facture);

        request.getLignes().forEach(ligneReq -> {
            LigneFacture ligne = LigneFacture.builder()
                    .facture(savedFacture)
                    .description(ligneReq.getDescription())
                    .quantite(ligneReq.getQuantite())
                    .prixHT(ligneReq.getPrixHT())
                    .tva(ligneReq.getTva())
                    .build();
            savedFacture.getLignes().add(ligne);
        });

        return toResponse(factureRepository.save(savedFacture));
    }

    @Transactional
    public FactureResponse updateFacture(Long id, FactureRequest request) {
        Utilisateur user = getCurrentUser();
        Facture facture = factureRepository.findByIdAndUtilisateurId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Facture non trouvée"));

        if (request.getClientId() != null) {
            Client client = clientRepository.findByIdAndUtilisateurIdAndDeletedFalse(request.getClientId(), user.getId())
                    .orElseThrow(() -> new RuntimeException("Client non trouvé"));
            facture.setClient(client);
        }

        if (request.getDate() != null) facture.setDate(request.getDate());
        if (request.getEcheance() != null) facture.setEcheance(request.getEcheance());
        if (request.getStatut() != null) facture.setStatut(request.getStatut());
        if (request.getNote() != null) facture.setNote(request.getNote());

        if (request.getLignes() != null) {
            facture.getLignes().clear();
            request.getLignes().forEach(ligneReq -> {
                LigneFacture ligne = LigneFacture.builder()
                        .facture(facture)
                        .description(ligneReq.getDescription())
                        .quantite(ligneReq.getQuantite())
                        .prixHT(ligneReq.getPrixHT())
                        .tva(ligneReq.getTva())
                        .build();
                facture.getLignes().add(ligne);
            });
        }

        return toResponse(factureRepository.save(facture));
    }

    @Transactional
    public FactureResponse marquerPayee(Long id) {
        Utilisateur user = getCurrentUser();
        Facture facture = factureRepository.findByIdAndUtilisateurId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Facture non trouvée"));
        
        if (facture.getStatut() == StatutFacture.BROUILLON) {
            throw new RuntimeException("Impossible de marquer comme payée une facture encore au statut Brouillon.");
        }
        
        facture.setStatut(StatutFacture.PAYEE);
        return toResponse(factureRepository.save(facture));
    }

    @Transactional
    public void marquerEnvoyee(Long id) {
        Utilisateur user = getCurrentUser();
        Facture facture = factureRepository.findByIdAndUtilisateurId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Facture non trouvée"));
        
        if (facture.getStatut() == StatutFacture.BROUILLON) {
            facture.setStatut(StatutFacture.ENVOYEE);
            factureRepository.save(facture);
        }
    }

    @Transactional
    public FactureResponse dupliquerFacture(Long id) {
        Utilisateur user = getCurrentUser();
        Facture original = factureRepository.findByIdAndUtilisateurId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Facture non trouvée"));

        Facture copie = Facture.builder()
                .utilisateur(user)
                .client(original.getClient())
                .numero(generateNumero(user.getId()))
                .date(LocalDate.now())
                .echeance(LocalDate.now().plusDays(30))
                .statut(StatutFacture.BROUILLON)
                .note(original.getNote())
                .lignes(new ArrayList<>())
                .build();

        Facture savedCopie = factureRepository.save(copie);

        original.getLignes().forEach(l -> {
            LigneFacture ligne = LigneFacture.builder()
                    .facture(savedCopie)
                    .description(l.getDescription())
                    .quantite(l.getQuantite())
                    .prixHT(l.getPrixHT())
                    .tva(l.getTva())
                    .build();
            savedCopie.getLignes().add(ligne);
        });

        return toResponse(factureRepository.save(savedCopie));
    }

    @Transactional
    public void deleteFacture(Long id) {
        Utilisateur user = getCurrentUser();
        Facture facture = factureRepository.findByIdAndUtilisateurId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Facture non trouvée"));
        
        if (facture.getStatut() != StatutFacture.BROUILLON) {
            throw new RuntimeException("Seules les factures en brouillon peuvent être supprimées.");
        }
        
        factureRepository.delete(facture);
    }

    public FactureResponse toResponse(Facture facture) {
        List<FactureResponse.LigneFactureResponse> lignesRes = facture.getLignes().stream()
                .map(l -> FactureResponse.LigneFactureResponse.builder()
                        .id(l.getId())
                        .description(l.getDescription())
                        .quantite(l.getQuantite())
                        .prixHT(l.getPrixHT())
                        .tva(l.getTva())
                        .sousTotal(l.getSousTotal())
                        .montantTVA(l.getMontantTVA())
                        .build())
                .collect(Collectors.toList());

        return FactureResponse.builder()
                .id(facture.getId())
                .numero(facture.getNumero())
                .date(facture.getDate())
                .echeance(facture.getEcheance())
                .statut(facture.getStatut())
                .note(facture.getNote())
                .createdAt(facture.getCreatedAt())
                .client(FactureResponse.ClientInfo.builder()
                        .id(facture.getClient().getId())
                        .nom(facture.getClient().getNom())
                        .email(facture.getClient().getEmail())
                        .build())
                .lignes(lignesRes)
                .totalHT(facture.getTotalHT())
                .totalTVA(facture.getTotalTVA())
                .totalTTC(facture.getTotalTTC())
                .build();
    }
}
