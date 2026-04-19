package com.saas.facturation.service;

import com.saas.facturation.dto.dashboard.DashboardStats;
import com.saas.facturation.entity.Facture;
import com.saas.facturation.entity.StatutFacture;
import com.saas.facturation.entity.Utilisateur;
import com.saas.facturation.repository.ClientRepository;
import com.saas.facturation.repository.FactureRepository;
import com.saas.facturation.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final FactureRepository factureRepository;
    private final ClientRepository clientRepository;
    private final UtilisateurRepository utilisateurRepository;

    private Utilisateur getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return utilisateurRepository.findByEmail(email).orElseThrow();
    }

    public DashboardStats getStats() {
        Utilisateur user = getCurrentUser();
        List<Facture> allFactures = factureRepository.findAllByUserIdOrdered(user.getId());

        LocalDate now = LocalDate.now();
        allFactures.forEach(f -> {
            if (f.getStatut() == StatutFacture.ENVOYEE && f.getEcheance().isBefore(now)) {
                f.setStatut(StatutFacture.EN_RETARD);
                factureRepository.save(f);
            }
        });

        BigDecimal caTotal = allFactures.stream()
                .map(Facture::getTotalTTC)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal caEncaisse = allFactures.stream()
                .filter(f -> f.getStatut() == StatutFacture.PAYEE)
                .map(Facture::getTotalTTC)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal caAEncaisser = allFactures.stream()
                .filter(f -> f.getStatut() == StatutFacture.ENVOYEE || f.getStatut() == StatutFacture.EN_RETARD)
                .map(Facture::getTotalTTC)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Top 5 clients
        Map<Long, BigDecimal> clientTotals = new HashMap<>();
        Map<Long, String> clientNames = new HashMap<>();
        Map<Long, Long> clientCounts = new HashMap<>();

        allFactures.forEach(f -> {
            Long cId = f.getClient().getId();
            clientTotals.merge(cId, f.getTotalTTC(), BigDecimal::add);
            clientNames.put(cId, f.getClient().getNom());
            clientCounts.merge(cId, 1L, Long::sum);
        });

        List<DashboardStats.TopClient> topClients = clientTotals.entrySet().stream()
                .sorted(Map.Entry.<Long, BigDecimal>comparingByValue().reversed())
                .limit(5)
                .map(e -> DashboardStats.TopClient.builder()
                        .id(e.getKey())
                        .nom(clientNames.get(e.getKey()))
                        .montantTotal(e.getValue())
                        .nombreFactures(clientCounts.getOrDefault(e.getKey(), 0L))
                        .build())
                .collect(Collectors.toList());

        // Evolution mensuelle (12 derniers mois)
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy", Locale.FRENCH);
        Map<String, BigDecimal> monthly = new LinkedHashMap<>();
        allFactures.stream()
                .filter(f -> f.getStatut() == StatutFacture.PAYEE)
                .forEach(f -> {
                    String mois = f.getDate().format(formatter);
                    monthly.merge(mois, f.getTotalTTC(), BigDecimal::add);
                });

        List<DashboardStats.MonthlyRevenue> evolution = monthly.entrySet().stream()
                .map(e -> DashboardStats.MonthlyRevenue.builder()
                        .mois(e.getKey())
                        .montant(e.getValue())
                        .build())
                .collect(Collectors.toList());

        return DashboardStats.builder()
                .caTotal(caTotal)
                .caEncaisse(caEncaisse)
                .caAEncaisser(caAEncaisser)
                .totalFactures(allFactures.size())
                .facturesBrouillon(allFactures.stream().filter(f -> f.getStatut() == StatutFacture.BROUILLON).count())
                .facturesEnvoyees(allFactures.stream().filter(f -> f.getStatut() == StatutFacture.ENVOYEE).count())
                .facturesPayees(allFactures.stream().filter(f -> f.getStatut() == StatutFacture.PAYEE).count())
                .facturesEnRetard(allFactures.stream().filter(f -> f.getStatut() == StatutFacture.EN_RETARD).count())
                .totalClients(clientRepository.countByUtilisateurIdAndDeletedFalse(user.getId()))
                .topClients(topClients)
                .evolutionMensuelle(evolution)
                .build();
    }
}
