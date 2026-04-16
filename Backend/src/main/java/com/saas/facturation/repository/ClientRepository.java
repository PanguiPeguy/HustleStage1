package com.saas.facturation.repository;

import com.saas.facturation.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ClientRepository extends JpaRepository<Client, Long> {

    List<Client> findByUtilisateurIdAndDeletedFalse(Long userId);

    Optional<Client> findByIdAndUtilisateurIdAndDeletedFalse(Long id, Long userId);

    @Query("SELECT c FROM Client c WHERE c.utilisateur.id = :userId AND c.deleted = false " +
           "AND (LOWER(c.nom) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(c.email) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Client> searchByUtilisateurId(@Param("userId") Long userId, @Param("query") String query);

    long countByUtilisateurIdAndDeletedFalse(Long userId);
}
