package com.saas.facturation.controller;

import com.saas.facturation.entity.Utilisateur;
import com.saas.facturation.repository.UtilisateurRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UtilisateurRepository utilisateurRepository;

    private Utilisateur getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return utilisateurRepository.findByEmail(email).orElseThrow();
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile() {
        Utilisateur user = getCurrentUser();
        return ResponseEntity.ok(Map.of(
            "id", user.getId(),
            "email", user.getEmail(),
            "nomEntreprise", user.getNomEntreprise() != null ? user.getNomEntreprise() : "",
            "telephone", user.getTelephone() != null ? user.getTelephone() : "",
            "adresse", user.getAdresse() != null ? user.getAdresse() : "",
            "siret", user.getSiret() != null ? user.getSiret() : "",
            "rib", user.getRib() != null ? user.getRib() : ""
        ));
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(@RequestBody ProfileUpdateRequest request) {
        Utilisateur user = getCurrentUser();
        if (request.getNomEntreprise() != null) user.setNomEntreprise(request.getNomEntreprise());
        if (request.getTelephone() != null) user.setTelephone(request.getTelephone());
        if (request.getAdresse() != null) user.setAdresse(request.getAdresse());
        if (request.getSiret() != null) user.setSiret(request.getSiret());
        if (request.getRib() != null) user.setRib(request.getRib());
        utilisateurRepository.save(user);
        return getProfile();
    }

    @Data
    static class ProfileUpdateRequest {
        private String nomEntreprise;
        private String telephone;
        private String adresse;
        private String siret;
        private String rib;
    }
}
