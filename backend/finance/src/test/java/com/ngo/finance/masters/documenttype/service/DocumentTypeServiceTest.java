package com.ngo.finance.masters.documenttype.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.ngo.finance.common.enums.FundSourceDomicile;
import com.ngo.finance.common.exception.ValidationException;
import com.ngo.finance.masters.documenttype.dto.DocumentTypeRequest;
import com.ngo.finance.masters.documenttype.entity.DocumentTypeMaster;
import com.ngo.finance.masters.documenttype.repository.DocumentTypeMasterRepository;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DocumentTypeServiceTest {

    @Mock
    private DocumentTypeMasterRepository repository;

    @InjectMocks
    private DocumentTypeService service;

    private static DocumentTypeMaster type(String code, String name, boolean active) {
        return DocumentTypeMaster.builder().code(code).name(name).status(active).build();
    }

    @Test
    void toCode_makesAnUpperSnakeCaseCodeFromAName() {
        assertEquals("GST_NUMBER", DocumentTypeService.toCode("GST Number"));
        assertEquals("CIN_REG_NO", DocumentTypeService.toCode("  CIN / Reg. No. "));
    }

    @Test
    void create_derivesTheCodeFromTheNameWhenNoneIsGiven() {
        when(repository.existsByCode("GST_NUMBER")).thenReturn(false);
        when(repository.existsByNameIgnoreCase("GST Number")).thenReturn(false);
        when(repository.save(any(DocumentTypeMaster.class))).thenAnswer(inv -> inv.getArgument(0));

        var created = service.create(DocumentTypeRequest.builder().name("GST Number").build());

        assertEquals("GST_NUMBER", created.getCode());
        assertEquals("ACTIVE", created.getStatus());
    }

    @Test
    void create_rejectsADuplicateCode() {
        when(repository.existsByCode("PAN_CARD")).thenReturn(true);

        assertThrows(ValidationException.class,
                () -> service.create(DocumentTypeRequest.builder().name("PAN Card").build()));
    }

    @Test
    void requireUsableCode_allowsNoDocument() {
        assertNull(service.requireUsableCode(null, null, FundSourceDomicile.DOMESTIC));
        assertNull(service.requireUsableCode("  ", null, FundSourceDomicile.DOMESTIC));
    }

    @Test
    void requireUsableCode_rejectsAnUnknownCode() {
        when(repository.findByCode("NOPE")).thenReturn(Optional.empty());

        assertThrows(ValidationException.class, () -> service.requireUsableCode("NOPE", null, FundSourceDomicile.DOMESTIC));
    }

    @Test
    void requireUsableCode_rejectsAnInactiveTypeForANewChoice() {
        when(repository.findByCode("VOTER_ID")).thenReturn(Optional.of(type("VOTER_ID", "Voter ID", false)));

        assertThrows(ValidationException.class, () -> service.requireUsableCode("VOTER_ID", "PAN_CARD", FundSourceDomicile.DOMESTIC));
    }

    @Test
    void requireUsableCode_letsADonorKeepATypeDeactivatedLater() {
        when(repository.findByCode("VOTER_ID")).thenReturn(Optional.of(type("VOTER_ID", "Voter ID", false)));

        assertEquals("VOTER_ID", service.requireUsableCode("VOTER_ID", "VOTER_ID", FundSourceDomicile.DOMESTIC));
    }

    @Test
    void requireUsableCode_rejectsATypeMeantForTheOtherDomicile() {
        DocumentTypeMaster pan = type("PAN_CARD", "PAN Card", true);
        pan.getAllowedFundSourceDomiciles().add(FundSourceDomicile.DOMESTIC);
        when(repository.findByCode("PAN_CARD")).thenReturn(Optional.of(pan));

        assertEquals("PAN_CARD", service.requireUsableCode("PAN_CARD", null, FundSourceDomicile.DOMESTIC));
        assertThrows(ValidationException.class,
                () -> service.requireUsableCode("PAN_CARD", null, FundSourceDomicile.FOREIGN));
    }

    @Test
    void requireUsableCode_allowsATypeWithNoDomicileForBoth() {
        when(repository.findByCode("PASSPORT_ID")).thenReturn(Optional.of(type("PASSPORT_ID", "Passport ID", true)));

        assertEquals("PASSPORT_ID", service.requireUsableCode("PASSPORT_ID", null, FundSourceDomicile.FOREIGN));
    }

    @Test
    void create_savesTheChosenDomiciles() {
        when(repository.existsByCode("TIN")).thenReturn(false);
        when(repository.existsByNameIgnoreCase("TIN")).thenReturn(false);
        when(repository.save(any(DocumentTypeMaster.class))).thenAnswer(inv -> inv.getArgument(0));

        var created = service.create(DocumentTypeRequest.builder()
                .name("TIN")
                .allowedFundSourceDomiciles(Set.of(FundSourceDomicile.FOREIGN))
                .build());

        assertEquals(java.util.List.of("FOREIGN"), created.getAllowedFundSourceDomiciles());
    }
}
