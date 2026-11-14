package com.ngo.finance.employee.service;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.common.exception.ValidationException;
import com.ngo.finance.employee.dto.response.EmployeeDocumentResponse;
import com.ngo.finance.employee.entity.EmployeeDocument;
import com.ngo.finance.employee.entity.EmployeeUpdateLog;
import com.ngo.finance.employee.enums.EmployeeDocumentType;
import com.ngo.finance.employee.repository.EmployeeDocumentInfo;
import com.ngo.finance.employee.repository.EmployeeDocumentRepository;
import com.ngo.finance.employee.repository.EmployeeRepository;
import com.ngo.finance.employee.repository.EmployeeUpdateLogRepository;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 * PAN Card / Aadhaar Card copies for an employee: one file of each type,
 * a new upload replaces the old one. Only PDF, JPG and PNG up to 5 MB are
 * accepted, and the file's first bytes must match one of those types.
 * Every upload and removal is written to the employee's update log.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class EmployeeDocumentService {

    public static final long MAX_BYTES = 5L * 1024 * 1024;

    private final EmployeeRepository employeeRepository;

    private final EmployeeDocumentRepository documentRepository;

    private final EmployeeUpdateLogRepository updateLogRepository;

    /** Saves (or replaces) the employee's document of this type. */
    public EmployeeDocumentResponse upload(Long employeeId, String type, MultipartFile file) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException("Employee", employeeId);
        }
        EmployeeDocumentType documentType = parseType(type);

        if (file == null || file.isEmpty()) {
            throw new ValidationException("Choose a file to upload");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new ValidationException("File is larger than 5 MB");
        }
        byte[] content;
        try {
            content = file.getBytes();
        } catch (IOException e) {
            throw new ValidationException("Could not read the uploaded file");
        }
        String contentType = detectContentType(content);
        if (contentType == null) {
            throw new ValidationException("Only PDF, JPG or PNG files can be uploaded");
        }

        EmployeeDocument document = documentRepository.findByEmployeeIdAndDocumentType(employeeId, documentType)
                .orElseGet(() -> EmployeeDocument.builder().employeeId(employeeId).documentType(documentType).build());
        String previousName = document.getFileName();

        document.setFileName(cleanFileName(file.getOriginalFilename(), contentType));
        document.setContentType(contentType);
        document.setSizeBytes((long) content.length);
        document.setContent(content);
        EmployeeDocument saved = documentRepository.save(document);

        logChange(employeeId, documentType, previousName, saved.getFileName());
        log.info("Stored {} for employee {} ({} bytes)", documentType, employeeId, content.length);
        return toResponse(saved.getDocumentType(), saved.getFileName(), saved.getContentType(), saved.getSizeBytes(),
                saved.getUpdatedAt() != null ? saved.getUpdatedAt() : LocalDateTime.now());
    }

    /** The stored file, bytes included — for download. */
    @Transactional(readOnly = true)
    public EmployeeDocument get(Long employeeId, String type) {
        EmployeeDocumentType documentType = parseType(type);
        return documentRepository.findByEmployeeIdAndDocumentType(employeeId, documentType)
                .orElseThrow(() -> new ResourceNotFoundException(
                        documentType.getLabel() + " has not been uploaded for employee " + employeeId));
    }

    public void delete(Long employeeId, String type) {
        EmployeeDocument document = get(employeeId, type);
        documentRepository.delete(document);
        logChange(employeeId, document.getDocumentType(), document.getFileName(), null);
    }

    /** Metadata of every document (no bytes), grouped by employee id. */
    @Transactional(readOnly = true)
    public Map<Long, List<EmployeeDocumentResponse>> listFor(List<Long> employeeIds) {
        if (employeeIds.isEmpty()) {
            return Map.of();
        }
        return documentRepository.findInfoByEmployeeIds(employeeIds).stream()
                .collect(Collectors.groupingBy(EmployeeDocumentInfo::getEmployeeId,
                        Collectors.mapping(info -> toResponse(info.getDocumentType(), info.getFileName(),
                                info.getContentType(), info.getSizeBytes(), info.getUpdatedAt()),
                                Collectors.toList())));
    }

    static EmployeeDocumentType parseType(String type) {
        String key = type == null ? "" : type.trim().toUpperCase(Locale.ROOT).replace('-', '_');
        return Arrays.stream(EmployeeDocumentType.values())
                .filter(t -> t.name().equals(key))
                .findFirst()
                .orElseThrow(() -> new ValidationException("Unknown document type '" + type
                        + "' (expected PAN_CARD or AADHAAR_CARD)"));
    }

    /** PDF / PNG / JPEG from the file's signature bytes; null for anything else. */
    static String detectContentType(byte[] bytes) {
        if (startsWith(bytes, 0x25, 0x50, 0x44, 0x46)) {
            return "application/pdf";
        }
        if (startsWith(bytes, 0x89, 0x50, 0x4E, 0x47)) {
            return "image/png";
        }
        if (startsWith(bytes, 0xFF, 0xD8, 0xFF)) {
            return "image/jpeg";
        }
        return null;
    }

    private static boolean startsWith(byte[] bytes, int... signature) {
        if (bytes == null || bytes.length < signature.length) {
            return false;
        }
        for (int i = 0; i < signature.length; i++) {
            if ((bytes[i] & 0xFF) != signature[i]) {
                return false;
            }
        }
        return true;
    }

    /** Keeps only the base name, replaces odd characters, and falls back to "document.<ext>". */
    static String cleanFileName(String original, String contentType) {
        String name = original == null ? "" : original.replace('\\', '/');
        name = name.substring(name.lastIndexOf('/') + 1).replaceAll("[^A-Za-z0-9._ ()-]", "_").trim();
        if (name.isEmpty() || name.equals(".") || name.equals("..")) {
            name = "document" + switch (contentType) {
                case "application/pdf" -> ".pdf";
                case "image/png" -> ".png";
                default -> ".jpg";
            };
        }
        return name.length() > 200 ? name.substring(name.length() - 200) : name;
    }

    private void logChange(Long employeeId, EmployeeDocumentType type, String oldName, String newName) {
        updateLogRepository.save(EmployeeUpdateLog.builder()
                .employeeId(employeeId)
                .fieldName(type.getLabel())
                .oldValue(oldName != null ? oldName : "")
                .newValue(newName != null ? newName : "")
                .build());
    }

    private static EmployeeDocumentResponse toResponse(EmployeeDocumentType type, String fileName, String contentType,
            Long sizeBytes, LocalDateTime uploadedAt) {
        return EmployeeDocumentResponse.builder()
                .type(type.name())
                .label(type.getLabel())
                .fileName(fileName)
                .contentType(contentType)
                .sizeBytes(sizeBytes)
                .uploadedAt(uploadedAt)
                .build();
    }
}
