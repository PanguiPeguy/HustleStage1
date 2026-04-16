package com.saas.facturation.dto.facture;

import com.saas.facturation.entity.StatutFacture;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class FactureRequest {
    @NotNull private Long clientId;
    @NotNull private LocalDate date;
    @NotNull private LocalDate echeance;
    private StatutFacture statut = StatutFacture.BROUILLON;
    private String note;
    @Valid
    @NotNull private List<LigneFactureRequest> lignes;
}
