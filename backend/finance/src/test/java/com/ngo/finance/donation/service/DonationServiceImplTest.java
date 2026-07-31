package com.ngo.finance.donation.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.ngo.finance.common.exception.ValidationException;
import com.ngo.finance.donation.dto.request.CorpusDetailRequest;
import com.ngo.finance.donation.dto.request.CreateDonationRequest;
import com.ngo.finance.donation.dto.request.GikItemRequest;
import com.ngo.finance.donation.dto.request.PayrollBatchRequest;
import com.ngo.finance.donation.dto.request.PayrollEmployeeRequest;
import com.ngo.finance.donation.dto.response.DonationDetailResponse;
import com.ngo.finance.donation.entity.Donation;
import com.ngo.finance.donation.entity.TenantTaxConfig;
import com.ngo.finance.donation.enums.Citizenship;
import com.ngo.finance.donation.enums.DonationBankAccountType;
import com.ngo.finance.donation.enums.DonationChannel;
import com.ngo.finance.donation.enums.DonationType;
import com.ngo.finance.donation.enums.DonorIdentification;
import com.ngo.finance.donation.enums.EightyGStatus;
import com.ngo.finance.donation.enums.FundMode;
import com.ngo.finance.donation.enums.GikIntendedUse;
import com.ngo.finance.donation.enums.InvestmentMode;
import com.ngo.finance.donation.enums.UtilisationPeriodType;
import com.ngo.finance.donation.mapper.DonationMapper;
import com.ngo.finance.donation.repository.DonationGikItemRepository;
import com.ngo.finance.donation.repository.DonationRepository;
import com.ngo.finance.donation.repository.TenantTaxConfigRepository;
import com.ngo.finance.donation.service.impl.DonationServiceImpl;
import com.ngo.finance.donor.entity.DonorMaster;
import com.ngo.finance.donor.entity.StateMaster;
import com.ngo.finance.donor.enums.DonorType;
import com.ngo.finance.donor.enums.FundSourceDomicile;
import com.ngo.finance.donor.repository.DonorRepository;
import com.ngo.finance.donor.repository.ProgrammeRepository;
import com.ngo.finance.donor.repository.StateRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class DonationServiceImplTest {

    @Mock
    private DonationRepository donationRepository;

    @Mock
    private DonationGikItemRepository gikItemRepository;

    @Mock
    private DonorRepository donorRepository;

    @Mock
    private ProgrammeRepository programmeRepository;

    @Mock
    private StateRepository stateRepository;

    @Mock
    private TenantTaxConfigRepository tenantTaxConfigRepository;

    @Mock
    private DonationMapper donationMapper;

    @InjectMocks
    private DonationServiceImpl donationService;

    private CreateDonationRequest.CreateDonationRequestBuilder baseRequest() {
        return CreateDonationRequest.builder()
                .receiptDate(LocalDate.of(2026, 4, 12))
                .channel(DonationChannel.BANK_TRANSFER)
                .fundMode(FundMode.UNRESTRICTED)
                .stateIds(List.of(1L))
                .utilisationPeriodType(UtilisationPeriodType.SINGLE_FY)
                .currency("INR")
                .amount(new BigDecimal("25000"))
                .bankAccountType(DonationBankAccountType.DOMESTIC_CURRENT);
    }

    private void mockOneState() {
        StateMaster state = StateMaster.builder().stateCode("DL").stateName("Delhi").build();
        state.setId(1L);
        when(stateRepository.findAllById(any())).thenReturn(List.of(state));
    }

    private void mockValidTenantConfig() {
        when(tenantTaxConfigRepository.findAll()).thenReturn(List.of(TenantTaxConfig.builder()
                .org80gRegistrationNumber("REG1")
                .org80gValidFrom(LocalDate.of(2024, 4, 1))
                .org80gValidTo(LocalDate.of(2029, 3, 31))
                .receiptNumberSequence(0L)
                .build()));
    }

    private void mockSaveReturnsArgument() {
        when(donationRepository.save(any(Donation.class))).thenAnswer(inv -> inv.getArgument(0));
        when(donationMapper.toDetailResponse(any(Donation.class))).thenReturn(DonationDetailResponse.builder().build());
    }

    @Test
    void testCreateDonation_AnonymousRecurring_Blocked() {
        CreateDonationRequest request = baseRequest()
                .donationType(DonationType.RECURRING)
                .identification(DonorIdentification.ANONYMOUS)
                .anonymousCollectionSource("Donation box")
                .anonymousSourceReference("Box #4, HQ lobby")
                .build();

        ValidationException ex = assertThrows(ValidationException.class, () -> donationService.createDonation(request));
        assertTrue(ex.getErrors().containsKey("donationType"));
    }

    @Test
    void testCreateDonation_ForeignDonorWrongAccount_Blocked() {
        DonorMaster foreignDonor = DonorMaster.builder().donorName("Horizon Global Fund")
                .fundSourceDomicile(FundSourceDomicile.FOREIGN).build();
        foreignDonor.setId(5L);
        when(donorRepository.findById(5L)).thenReturn(java.util.Optional.of(foreignDonor));

        CreateDonationRequest request = baseRequest()
                .donationType(DonationType.MAJOR_GIFT)
                .identification(DonorIdentification.NAMED)
                .donorId(5L)
                .bankAccountType(DonationBankAccountType.DOMESTIC_CURRENT)
                .build();

        ValidationException ex = assertThrows(ValidationException.class, () -> donationService.createDonation(request));
        assertTrue(ex.getErrors().containsKey("bankAccountType"));
    }

    @Test
    void testCreateDonation_CorpusWithoutWrittenDirection_Blocked() {
        DonorMaster donor = DonorMaster.builder().donorName("Vikram Nair")
                .fundSourceDomicile(FundSourceDomicile.DOMESTIC).donorType(DonorType.INDIVIDUAL).build();
        donor.setId(1L);
        when(donorRepository.findById(1L)).thenReturn(java.util.Optional.of(donor));
        mockOneState();

        CreateDonationRequest request = baseRequest()
                .donationType(DonationType.CORPUS)
                .identification(DonorIdentification.NAMED)
                .donorId(1L)
                .corpusDetail(null)
                .build();

        ValidationException ex = assertThrows(ValidationException.class, () -> donationService.createDonation(request));
        assertTrue(ex.getErrors().containsKey("corpusDetail"));
    }

    @Test
    void testCreateDonation_CorpusFromCsrDonor_Blocked() {
        DonorMaster csrDonor = DonorMaster.builder().donorName("Acme CSR Foundation")
                .fundSourceDomicile(FundSourceDomicile.DOMESTIC).donorType(DonorType.CORPORATE).build();
        csrDonor.setId(2L);
        when(donorRepository.findById(2L)).thenReturn(java.util.Optional.of(csrDonor));
        mockOneState();

        CreateDonationRequest request = baseRequest()
                .donationType(DonationType.CORPUS)
                .identification(DonorIdentification.NAMED)
                .donorId(2L)
                .corpusDetail(CorpusDetailRequest.builder()
                        .writtenDirectionRef("Letter/2026/01")
                        .directionDate(LocalDate.of(2026, 4, 1))
                        .directionDocumentPath("/docs/letter.pdf")
                        .investmentMode(InvestmentMode.SCHEDULED_BANK_DEPOSIT)
                        .build())
                .build();

        ValidationException ex = assertThrows(ValidationException.class, () -> donationService.createDonation(request));
        assertTrue(ex.getErrors().containsKey("corpusDetail"));
    }

    @Test
    void testCreateDonation_GikWithoutLineItems_Blocked() {
        DonorMaster donor = DonorMaster.builder().donorName("Sunrise Textiles").fundSourceDomicile(FundSourceDomicile.DOMESTIC).build();
        donor.setId(3L);
        when(donorRepository.findById(3L)).thenReturn(java.util.Optional.of(donor));
        mockOneState();

        CreateDonationRequest request = baseRequest()
                .donationType(DonationType.GIK)
                .identification(DonorIdentification.NAMED)
                .donorId(3L)
                .gikItems(List.of())
                .build();

        ValidationException ex = assertThrows(ValidationException.class, () -> donationService.createDonation(request));
        assertTrue(ex.getErrors().containsKey("gikItems"));
    }

    @Test
    void testCreateDonation_Gik_AlwaysNotEightyGEligible() {
        DonorMaster donor = DonorMaster.builder().donorName("Sunrise Textiles").fundSourceDomicile(FundSourceDomicile.DOMESTIC)
                .documentNumber("ABCDE1234F").address("Indore, MP").build();
        donor.setId(3L);
        when(donorRepository.findById(3L)).thenReturn(java.util.Optional.of(donor));
        mockOneState();
        mockValidTenantConfig();
        when(donationRepository.countByReceiptDateBetween(any(), any())).thenReturn(0L);
        mockSaveReturnsArgument();

        CreateDonationRequest request = baseRequest()
                .donationType(DonationType.GIK)
                .identification(DonorIdentification.NAMED)
                .donorId(3L)
                .gikItems(List.of(GikItemRequest.builder()
                        .itemDescription("Medicine crates")
                        .fairValue(new BigDecimal("50000"))
                        .intendedUse(GikIntendedUse.SELL)
                        .build()))
                .build();

        donationService.createDonation(request);

        org.mockito.ArgumentCaptor<Donation> captor = org.mockito.ArgumentCaptor.forClass(Donation.class);
        org.mockito.Mockito.verify(donationRepository).save(captor.capture());
        assertEquals(EightyGStatus.NOT_ELIGIBLE_GIFT_IN_KIND, captor.getValue().getEightyGStatus());
        assertEquals(LocalDate.of(2028, 3, 31), captor.getValue().getGikItems().get(0).getLiquidationDueDate());
    }

    @Test
    void testCreateDonation_PayrollAmountMismatch_Blocked() {
        DonorMaster donor = DonorMaster.builder().donorName("Info Edge India Ltd")
                .fundSourceDomicile(FundSourceDomicile.DOMESTIC).build();
        donor.setId(4L);
        when(donorRepository.findById(4L)).thenReturn(java.util.Optional.of(donor));
        mockOneState();

        CreateDonationRequest request = baseRequest()
                .donationType(DonationType.PAYROLL_GIVING)
                .identification(DonorIdentification.NAMED)
                .donorId(4L)
                .amount(new BigDecimal("100000")) // does not match the 80,000 employee sum below
                .payrollBatch(PayrollBatchRequest.builder()
                        .employer("Info Edge India Ltd")
                        .employees(List.of(
                                PayrollEmployeeRequest.builder().name("A").amount(new BigDecimal("40000"))
                                        .citizenship(Citizenship.INDIAN).build(),
                                PayrollEmployeeRequest.builder().name("B").amount(new BigDecimal("40000"))
                                        .citizenship(Citizenship.FOREIGN).build()))
                        .build())
                .build();

        ValidationException ex = assertThrows(ValidationException.class, () -> donationService.createDonation(request));
        assertTrue(ex.getErrors().containsKey("payrollBatch"));
    }

    @Test
    void testEightyGChain_OrgNotRegistered_BlocksEvenNamedDonor() {
        DonorMaster donor = DonorMaster.builder().donorName("Rohan Kapadia").fundSourceDomicile(FundSourceDomicile.DOMESTIC)
                .documentNumber("ABCDE1234F").address("Delhi").build();
        donor.setId(1L);
        when(donorRepository.findById(1L)).thenReturn(java.util.Optional.of(donor));
        mockOneState();
        when(tenantTaxConfigRepository.findAll()).thenReturn(List.of());
        when(donationRepository.countByReceiptDateBetween(any(), any())).thenReturn(0L);
        mockSaveReturnsArgument();

        CreateDonationRequest request = baseRequest()
                .donationType(DonationType.MAJOR_GIFT)
                .identification(DonorIdentification.NAMED)
                .donorId(1L)
                .build();

        donationService.createDonation(request);

        org.mockito.ArgumentCaptor<Donation> captor = org.mockito.ArgumentCaptor.forClass(Donation.class);
        org.mockito.Mockito.verify(donationRepository).save(captor.capture());
        assertEquals(EightyGStatus.NOT_ELIGIBLE_ORG_NOT_REGISTERED, captor.getValue().getEightyGStatus());
        assertEquals(Boolean.FALSE, captor.getValue().getTenBdReportable());
    }

    @Test
    void testTenBd_MissingPan_NotReportable() {
        DonorMaster donor = DonorMaster.builder().donorName("Rohan Kapadia").fundSourceDomicile(FundSourceDomicile.DOMESTIC)
                .documentNumber(null).address("Delhi").build();
        donor.setId(1L);
        when(donorRepository.findById(1L)).thenReturn(java.util.Optional.of(donor));
        mockOneState();
        mockValidTenantConfig();
        when(donationRepository.countByReceiptDateBetween(any(), any())).thenReturn(0L);
        mockSaveReturnsArgument();

        CreateDonationRequest request = baseRequest()
                .donationType(DonationType.MAJOR_GIFT)
                .identification(DonorIdentification.NAMED)
                .donorId(1L)
                .build();

        donationService.createDonation(request);

        org.mockito.ArgumentCaptor<Donation> captor = org.mockito.ArgumentCaptor.forClass(Donation.class);
        org.mockito.Mockito.verify(donationRepository).save(captor.capture());
        assertEquals(Boolean.FALSE, captor.getValue().getTenBdReportable());
        assertTrue(captor.getValue().getTenBdFailureReason().toLowerCase().contains("id"));
    }

    @Test
    void test115bbc_AnonymousLimit_ComputedFromFyTotals() {
        mockOneState();
        mockValidTenantConfig();
        when(donationRepository.countByReceiptDateBetween(any(), any())).thenReturn(0L);
        when(donationRepository.sumReportingAmountInr(any(), any())).thenReturn(new BigDecimal("2000000"));
        when(donationRepository.sumAnonymousReportingAmountInr(any(), any())).thenReturn(new BigDecimal("250000"));
        mockSaveReturnsArgument();

        CreateDonationRequest request = baseRequest()
                .donationType(DonationType.ONE_TIME)
                .identification(DonorIdentification.ANONYMOUS)
                .anonymousCollectionSource("Donation box")
                .anonymousSourceReference("Box #1")
                .amount(new BigDecimal("250000"))
                .build();

        // anonymousFyLimit/RunningTotal are set on the response object the mapper returns,
        // so assert via the response the service returns rather than the entity.
        DonationDetailResponse response = donationService.createDonation(request);
        assertEquals(new BigDecimal("250000"), response.getAnonymousFyRunningTotal());
        assertEquals(new BigDecimal("100000"), response.getAnonymousFyLimit());
    }
}
