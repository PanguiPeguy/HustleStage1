package com.saas.facturation.dto.client;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ClientResponse {
    private Long id;
    private String nom;
    private String email;
    private String telephone;
    private String adresse;
    private String siret;
    private LocalDateTime createdAt;
    private long nombreFactures;
}
