package com.saas.facturation.dto.dashboard;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardStats {
    private BigDecimal caTotal;
    private BigDecimal caEncaisse;
    private BigDecimal caAEncaisser;
    private long totalFactures;
    private long facturesBrouillon;
    private long facturesEnvoyees;
    private long facturesPayees;
    private long facturesEnRetard;
    private long totalClients;
    private List<TopClient> topClients;
    private List<MonthlyRevenue> evolutionMensuelle;

    @Data
    @Builder
    public static class TopClient {
        private Long id;
        private String nom;
        private BigDecimal montantTotal;
        private long nombreFactures;
    }

    @Data
    @Builder
    public static class MonthlyRevenue {
        private String mois;
        private BigDecimal montant;
    }
}
