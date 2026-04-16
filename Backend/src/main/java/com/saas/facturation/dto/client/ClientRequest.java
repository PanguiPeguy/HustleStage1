package com.saas.facturation.dto.client;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ClientRequest {
    @NotBlank(message = "Le nom est obligatoire")
    private String nom;
    @Email(message = "Format email invalide")
    private String email;
    private String telephone;
    private String adresse;
    private String siret;
}
