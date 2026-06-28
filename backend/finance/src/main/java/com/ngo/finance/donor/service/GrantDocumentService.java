package com.ngo.finance.donor.service;

import com.ngo.finance.donor.dto.request.UploadDocumentRequest;
import com.ngo.finance.donor.dto.response.DocumentResponse;
import java.util.List;

/**
 * Service interface for Grant Document operations
 */
public interface GrantDocumentService {

    DocumentResponse uploadDocument(UploadDocumentRequest request);

    DocumentResponse getDocumentById(Long id);

    List<DocumentResponse> getDocumentsByGrantId(Long grantId);

    List<DocumentResponse> getDocumentVersions(Long grantId, String documentName);

    void deleteDocument(Long id);

    void deleteOldVersions(Long grantId, String documentName);
}
