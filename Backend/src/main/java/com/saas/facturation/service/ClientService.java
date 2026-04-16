package com.saas.facturation.service;

import com.saas.facturation.dto.client.ClientRequest;
import com.saas.facturation.dto.client.ClientResponse;
import com.saas.facturation.entity.Client;
import com.saas.facturation.entity.Utilisateur;
import com.saas.facturation.repository.ClientRepository;
import com.saas.facturation.repository.FactureRepository;
import com.saas.facturation.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;
    private final FactureRepository factureRepository;
    private final UtilisateurRepository utilisateurRepository;

    private Utilisateur getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    public List<ClientResponse> getAllClients(String search) {
        Utilisateur user = getCurrentUser();
        List<Client> clients;
        if (search != null && !search.isBlank()) {
            clients = clientRepository.searchByUtilisateurId(user.getId(), search);
        } else {
            clients = clientRepository.findByUtilisateurIdAndDeletedFalse(user.getId());
        }
        return clients.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ClientResponse getClientById(Long id) {
        Utilisateur user = getCurrentUser();
        Client client = clientRepository.findByIdAndUtilisateurIdAndDeletedFalse(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));
        return toResponse(client);
    }

    @Transactional
    public ClientResponse createClient(ClientRequest request) {
        Utilisateur user = getCurrentUser();
        Client client = Client.builder()
                .utilisateur(user)
                .nom(request.getNom())
                .email(request.getEmail())
                .telephone(request.getTelephone())
                .adresse(request.getAdresse())
                .siret(request.getSiret())
                .deleted(false)
                .build();
        return toResponse(clientRepository.save(client));
    }

    @Transactional
    public ClientResponse updateClient(Long id, ClientRequest request) {
        Utilisateur user = getCurrentUser();
        Client client = clientRepository.findByIdAndUtilisateurIdAndDeletedFalse(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        client.setNom(request.getNom());
        client.setEmail(request.getEmail());
        client.setTelephone(request.getTelephone());
        client.setAdresse(request.getAdresse());
        client.setSiret(request.getSiret());

        return toResponse(clientRepository.save(client));
    }

    @Transactional
    public void deleteClient(Long id) {
        Utilisateur user = getCurrentUser();
        Client client = clientRepository.findByIdAndUtilisateurIdAndDeletedFalse(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));
        client.setDeleted(true);
        clientRepository.save(client);
    }

    private ClientResponse toResponse(Client client) {
        long nbFactures = client.getFactures() != null ? client.getFactures().stream()
                .filter(f -> !f.getStatut().name().equals("DELETED")).count() : 0;
        return ClientResponse.builder()
                .id(client.getId())
                .nom(client.getNom())
                .email(client.getEmail())
                .telephone(client.getTelephone())
                .adresse(client.getAdresse())
                .siret(client.getSiret())
                .createdAt(client.getCreatedAt())
                .nombreFactures(nbFactures)
                .build();
    }
}
