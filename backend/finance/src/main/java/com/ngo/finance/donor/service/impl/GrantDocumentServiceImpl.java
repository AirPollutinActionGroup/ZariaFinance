package com.ngo.finance.donor.service.impl;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.donor.dto.request.UploadDocumentRequest;
import com.ngo.finance.donor.dto.response.DocumentResponse;
import com.ngo.finance.donor.entity.GrantDocument;
import com.ngo.finance.donor.mapper.DocumentMapper;
import com.ngo.finance.donor.repository.GrantDocumentRepository;
import com.ngo.finance.donor.repository.GrantRepository;
import com.ngo.finance.donor.service.GrantDocumentService;
import java.time.LocalDateTime;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation for Grant Document operations
 */
@Slf4j
@Service
@Transactional
public class GrantDocumentServiceImpl implements GrantDocumentService {

    @Autowired
    private GrantDocumentRepository documentRepository;

    @Autowired
    private GrantRepository grantRepository;

    @Autowired
    private DocumentMapper documentMapper;

    @Override
    public DocumentResponse uploadDocument(UploadDocumentRequest request) {
        log.info("Uploading document for grant id: {}", request.getGrantId());

        var grant = grantRepository.findById(request.getGrantId())
                .orElseThrow(() -> new ResourceNotFoundException("Grant", request.getGrantId()));

        // Mark previous versions as non-current if same document name
        documentRepository.findByGrantIdAndIsCurrent(request.getGrantId(), true).stream()
                .filter(doc -> doc.getDocumentName().equals(request.getDocumentName()))
                .forEach(doc -> {
                    doc.setIsCurrent(false);
                    documentRepository.save(doc);
                });

        GrantDocument document = GrantDocument.builder()
                .grant(grant)
                .documentName(request.getDocumentName())
                .documentType(request.getDocumentType())
                .documentPath(request.getDocumentPath())
                .uploadDate(LocalDateTime.now())
                .version(1)
                .isCurrent(true)
                .build();

        GrantDocument saved = documentRepository.save(document);
        log.info("Document uploaded successfully with id: {}", saved.getId());

        return documentMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public DocumentResponse getDocumentById(Long id) {
        log.debug("Fetching document with id: {}", id);
        GrantDocument document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document", id));
        return documentMapper.toResponse(document);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentResponse> getDocumentsByGrantId(Long grantId) {
        log.debug("Fetching documents for grant id: {}", grantId);
        return documentRepository.findByGrantId(grantId).stream()
                .map(documentMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentResponse> getDocumentVersions(Long grantId, String documentName) {
        log.debug("Fetching document versions for grant id: {} and name: {}", grantId, documentName);
        return documentRepository.findDocumentVersions(grantId, documentName).stream()
                .map(documentMapper::toResponse)
                .toList();
    }

    @Override
    public void deleteDocument(Long id) {
        log.info("Deleting document with id: {}", id);
        GrantDocument document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document", id));
        documentRepository.delete(document);
        log.info("Document deleted successfully");
    }

    @Override
    public void deleteOldVersions(Long grantId, String documentName) {
        log.info("Deleting old versions of document: {} for grant id: {}", documentName, grantId);
        List<GrantDocument> allVersions = documentRepository.findDocumentVersions(grantId, documentName);

        // Keep only the latest version
        if (allVersions.size() > 1) {
            allVersions.stream()
                    .skip(1)
                    .forEach(doc -> {
                        documentRepository.delete(doc);
                        log.debug("Deleted old version: {} of document", doc.getVersion());
                    });
        }
    }
}
