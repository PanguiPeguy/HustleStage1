package com.saas.facturation.service;

import com.saas.facturation.dto.auth.AuthResponse;
import com.saas.facturation.dto.auth.LoginRequest;
import com.saas.facturation.dto.auth.RegisterRequest;
import com.saas.facturation.entity.Utilisateur;
import com.saas.facturation.repository.UtilisateurRepository;
import com.saas.facturation.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Un compte existe déjà avec cet email");
        }

        Utilisateur user = Utilisateur.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nomEntreprise(request.getNomEntreprise())
                .build();

        utilisateurRepository.save(user);
        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .nomEntreprise(user.getNomEntreprise())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        Utilisateur user = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .nomEntreprise(user.getNomEntreprise())
                .build();
    }
}
