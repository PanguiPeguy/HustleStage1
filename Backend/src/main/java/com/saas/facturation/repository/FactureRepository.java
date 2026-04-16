package com.saas.facturation.repository;

import com.saas.facturation.entity.Facture;
import com.saas.facturation.entity.StatutFacture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface FactureRepository extends JpaRepository<Facture, Long> {

    List<Facture> findByUtilisateurIdOrderByCreatedAtDesc(Long userId);

    Optional<Facture> findByIdAndUtilisateurId(Long id, Long userId);

    List<Facture> findByUtilisateurIdAndStatut(Long userId, StatutFacture statut);

    boolean existsByNumero(String numero);

    long countByUtilisateurIdAndStatut(Long userId, StatutFacture statut);

    @Query("SELECT COUNT(f) FROM Facture f WHERE f.utilisateur.id = :userId")
    long countByUtilisateurId(@Param("userId") Long userId);

    @Query("SELECT f FROM Facture f WHERE f.utilisateur.id = :userId AND f.client.id = :clientId ORDER BY f.createdAt DESC")
    List<Facture> findByUtilisateurIdAndClientId(@Param("userId") Long userId, @Param("clientId") Long clientId);

    @Query("SELECT f FROM Facture f WHERE f.utilisateur.id = :userId ORDER BY f.createdAt DESC")
    List<Facture> findAllByUserIdOrdered(@Param("userId") Long userId);
}
