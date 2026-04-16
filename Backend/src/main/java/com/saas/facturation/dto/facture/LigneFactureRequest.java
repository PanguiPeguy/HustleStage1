package com.saas.facturation.dto.facture;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class LigneFactureRequest {
    @NotNull
    private String description;
    @NotNull @Positive
    private Integer quantite;
    @NotNull @Positive
    private BigDecimal prixHT;
    private BigDecimal tva = new BigDecimal("20.00");
}
