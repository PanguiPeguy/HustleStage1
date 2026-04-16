package com.saas.facturation.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Entity
@Table(name = "ligne_facture")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LigneFacture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facture_id", nullable = false)
    @ToString.Exclude
    private Facture facture;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantite = 1;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal prixHT;

    @Column(precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal tva = new BigDecimal("20.00");

    public BigDecimal getSousTotal() {
        return prixHT.multiply(BigDecimal.valueOf(quantite)).setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal getMontantTVA() {
        return getSousTotal().multiply(tva).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }
}
