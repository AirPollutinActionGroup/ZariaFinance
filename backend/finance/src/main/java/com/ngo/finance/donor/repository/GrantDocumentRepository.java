package com.ngo.finance.donor.repository;

import com.ngo.finance.donor.entity.GrantDocument;
import com.ngo.finance.donor.enums.DocumentType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface GrantDocumentRepository extends JpaRepository<GrantDocument, Long> {

    List<GrantDocument> findByGrantId(Long grantId);

    List<GrantDocument> findByGrantIdAndIsCurrent(Long grantId, Boolean isCurrent);

    List<GrantDocument> findByGrantIdAndDocumentType(Long grantId, DocumentType documentType);

    @Query("SELECT gd FROM GrantDocument gd WHERE gd.grant.id = :grantId AND gd.documentName = :documentName ORDER BY gd.version DESC")
    List<GrantDocument> findDocumentVersions(@Param("grantId") Long grantId, @Param("documentName") String documentName);

    @Query("SELECT gd FROM GrantDocument gd WHERE gd.grant.id = :grantId AND gd.isCurrent = true AND gd.documentType = :documentType")
    Optional<GrantDocument> findCurrentDocumentByType(@Param("grantId") Long grantId, @Param("documentType") DocumentType documentType);
}
