package com.saas.facturation.dto.facture;

import com.saas.facturation.entity.StatutFacture;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class FactureResponse {
    private Long id;
    private String numero;
    private LocalDate date;
    private LocalDate echeance;
    private StatutFacture statut;
    private String note;
    private LocalDateTime createdAt;
    private ClientInfo client;
    private List<LigneFactureResponse> lignes;
    private BigDecimal totalHT;
    private BigDecimal totalTVA;
    private BigDecimal totalTTC;

    @Data
    @Builder
    public static class ClientInfo {
        private Long id;
        private String nom;
        private String email;
    }

    @Data
    @Builder
    public static class LigneFactureResponse {
        private Long id;
        private String description;
        private Integer quantite;
        private BigDecimal prixHT;
        private BigDecimal tva;
        private BigDecimal sousTotal;
        private BigDecimal montantTVA;
    }
}
