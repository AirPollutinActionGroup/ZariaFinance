package com.ngo.finance.employee.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.common.exception.ValidationException;
import com.ngo.finance.employee.entity.EmployeeDocument;
import com.ngo.finance.employee.entity.EmployeeUpdateLog;
import com.ngo.finance.employee.enums.EmployeeDocumentType;
import com.ngo.finance.employee.repository.EmployeeDocumentRepository;
import com.ngo.finance.employee.repository.EmployeeRepository;
import com.ngo.finance.employee.repository.EmployeeUpdateLogRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

@ExtendWith(MockitoExtension.class)
class EmployeeDocumentServiceTest {

    private static final byte[] PDF = "%PDF-1.4 test".getBytes();

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private EmployeeDocumentRepository documentRepository;

    @Mock
    private EmployeeUpdateLogRepository updateLogRepository;

    @InjectMocks
    private EmployeeDocumentService service;

    @Test
    void detectContentType_readsTheFileSignature() {
        assertEquals("application/pdf", EmployeeDocumentService.detectContentType(PDF));
        assertEquals("image/png", EmployeeDocumentService.detectContentType(
                new byte[] {(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D}));
        assertEquals("image/jpeg", EmployeeDocumentService.detectContentType(
                new byte[] {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0x00}));
        assertNull(EmployeeDocumentService.detectContentType("MZ not a document".getBytes()));
        assertNull(EmployeeDocumentService.detectContentType(new byte[0]));
    }

    @Test
    void cleanFileName_keepsOnlyASafeBaseName() {
        assertEquals("pan.pdf", EmployeeDocumentService.cleanFileName("C:\\Users\\me\\pan.pdf", "application/pdf"));
        assertEquals("passwd", EmployeeDocumentService.cleanFileName("../../etc/passwd", "application/pdf"));
        assertEquals("my_card_.png", EmployeeDocumentService.cleanFileName("my<card>.png", "image/png"));
        assertEquals("document.jpg", EmployeeDocumentService.cleanFileName(null, "image/jpeg"));
    }

    @Test
    void parseType_acceptsBothSpellings_andRejectsOthers() {
        assertEquals(EmployeeDocumentType.AADHAAR_CARD, EmployeeDocumentService.parseType("aadhaar-card"));
        assertEquals(EmployeeDocumentType.PAN_CARD, EmployeeDocumentService.parseType("PAN_CARD"));
        assertThrows(ValidationException.class, () -> EmployeeDocumentService.parseType("PASSPORT"));
    }

    @Test
    void upload_storesTheFile_andLogsIt() {
        when(employeeRepository.existsById(7L)).thenReturn(true);
        when(documentRepository.findByEmployeeIdAndDocumentType(7L, EmployeeDocumentType.PAN_CARD))
                .thenReturn(Optional.empty());
        when(documentRepository.save(any(EmployeeDocument.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = service.upload(7L, "PAN_CARD",
                new MockMultipartFile("file", "pan card.pdf", "application/pdf", PDF));

        assertEquals("PAN_CARD", response.getType());
        assertEquals("PAN Card", response.getLabel());
        assertEquals("pan card.pdf", response.getFileName());
        assertEquals("application/pdf", response.getContentType());
        assertEquals(PDF.length, response.getSizeBytes());

        ArgumentCaptor<EmployeeUpdateLog> logged = ArgumentCaptor.forClass(EmployeeUpdateLog.class);
        verify(updateLogRepository).save(logged.capture());
        assertEquals("PAN Card", logged.getValue().getFieldName());
        assertEquals("", logged.getValue().getOldValue());
        assertEquals("pan card.pdf", logged.getValue().getNewValue());
    }

    @Test
    void upload_replacesTheExistingFileOfThatType() {
        EmployeeDocument existing = EmployeeDocument.builder()
                .employeeId(7L).documentType(EmployeeDocumentType.AADHAAR_CARD)
                .fileName("old.pdf").contentType("application/pdf").sizeBytes(3L).content(PDF).build();
        when(employeeRepository.existsById(7L)).thenReturn(true);
        when(documentRepository.findByEmployeeIdAndDocumentType(7L, EmployeeDocumentType.AADHAAR_CARD))
                .thenReturn(Optional.of(existing));
        when(documentRepository.save(any(EmployeeDocument.class))).thenAnswer(inv -> inv.getArgument(0));

        service.upload(7L, "AADHAAR_CARD", new MockMultipartFile("file", "new.pdf", "application/pdf", PDF));

        ArgumentCaptor<EmployeeDocument> saved = ArgumentCaptor.forClass(EmployeeDocument.class);
        verify(documentRepository).save(saved.capture());
        assertSame(existing, saved.getValue());
        assertEquals("new.pdf", existing.getFileName());

        ArgumentCaptor<EmployeeUpdateLog> logged = ArgumentCaptor.forClass(EmployeeUpdateLog.class);
        verify(updateLogRepository).save(logged.capture());
        assertEquals("old.pdf", logged.getValue().getOldValue());
        assertEquals("new.pdf", logged.getValue().getNewValue());
    }

    @Test
    void upload_rejectsAFileThatIsNotPdfJpgOrPng_evenWithAPdfName() {
        when(employeeRepository.existsById(7L)).thenReturn(true);

        assertThrows(ValidationException.class, () -> service.upload(7L, "PAN_CARD",
                new MockMultipartFile("file", "pan.pdf", "application/pdf", "MZ executable".getBytes())));
        verify(documentRepository, never()).save(any());
    }

    @Test
    void upload_rejectsAFileOver5Mb() {
        when(employeeRepository.existsById(7L)).thenReturn(true);
        byte[] big = new byte[(int) EmployeeDocumentService.MAX_BYTES + 1];
        big[0] = 0x25;
        big[1] = 0x50;
        big[2] = 0x44;
        big[3] = 0x46;

        assertThrows(ValidationException.class, () -> service.upload(7L, "PAN_CARD",
                new MockMultipartFile("file", "pan.pdf", "application/pdf", big)));
        verify(documentRepository, never()).save(any());
    }

    @Test
    void upload_rejectsAnUnknownEmployee() {
        when(employeeRepository.existsById(99L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> service.upload(99L, "PAN_CARD",
                new MockMultipartFile("file", "pan.pdf", "application/pdf", PDF)));
    }

    @Test
    void delete_removesTheFile_andLogsIt() {
        EmployeeDocument existing = EmployeeDocument.builder()
                .employeeId(7L).documentType(EmployeeDocumentType.PAN_CARD).fileName("pan.pdf").build();
        when(documentRepository.findByEmployeeIdAndDocumentType(7L, EmployeeDocumentType.PAN_CARD))
                .thenReturn(Optional.of(existing));

        service.delete(7L, "PAN_CARD");

        verify(documentRepository).delete(existing);
        ArgumentCaptor<EmployeeUpdateLog> logged = ArgumentCaptor.forClass(EmployeeUpdateLog.class);
        verify(updateLogRepository).save(logged.capture());
        assertEquals("pan.pdf", logged.getValue().getOldValue());
        assertEquals("", logged.getValue().getNewValue());
    }
}
