package com.ngo.finance.donation.service.impl;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.common.exception.ValidationException;
import com.ngo.finance.donation.dto.request.CreateDonationRequest;
import com.ngo.finance.donation.dto.request.GikItemRequest;
import com.ngo.finance.donation.dto.request.PayrollEmployeeRequest;
import com.ngo.finance.donation.dto.request.UpdateGikIntendedUseRequest;
import com.ngo.finance.donation.dto.response.DonationDetailResponse;
import com.ngo.finance.donation.dto.response.DonationListResponse;
import com.ngo.finance.donation.entity.Donation;
import com.ngo.finance.donation.entity.DonationCorpusDetail;
import com.ngo.finance.donation.entity.DonationGikItem;
import com.ngo.finance.donation.entity.DonationGikIntendedUseChange;
import com.ngo.finance.donation.entity.DonationLegacyDetail;
import com.ngo.finance.donation.entity.DonationLocation;
import com.ngo.finance.donation.entity.DonationPayrollBatch;
import com.ngo.finance.donation.entity.DonationPayrollEmployee;
import com.ngo.finance.donation.entity.DonationRecurringMandate;
import com.ngo.finance.donation.entity.TenantTaxConfig;
import com.ngo.finance.donation.enums.BequestStatus;
import com.ngo.finance.donation.enums.Book;
import com.ngo.finance.donation.enums.Citizenship;
import com.ngo.finance.donation.enums.DonationBankAccountType;
import com.ngo.finance.donation.enums.DonationType;
import com.ngo.finance.donation.enums.DonorIdentification;
import com.ngo.finance.donation.enums.EightyGStatus;
import com.ngo.finance.donation.enums.GikRealisationStatus;
import com.ngo.finance.donation.enums.RecognitionStatus;
import com.ngo.finance.donation.enums.TenBeStatus;
import com.ngo.finance.donation.mapper.DonationMapper;
import com.ngo.finance.donation.repository.DonationGikItemRepository;
import com.ngo.finance.donation.repository.DonationRepository;
import com.ngo.finance.donation.repository.TenantTaxConfigRepository;
import com.ngo.finance.donation.service.DonationService;
import com.ngo.finance.donation.util.FinancialYearUtil;
import com.ngo.finance.donor.entity.DonorMaster;
import com.ngo.finance.donor.entity.Programme;
import com.ngo.finance.donor.entity.StateMaster;
import com.ngo.finance.donor.enums.DonorType;
import com.ngo.finance.donor.enums.FundSourceDomicile;
import com.ngo.finance.donor.repository.DonorRepository;
import com.ngo.finance.donor.repository.ProgrammeRepository;
import com.ngo.finance.donor.repository.StateRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation for Donation operations — the type-routing and the
 * hard-gate business rule engine described in the design spec live here
 * rather than in bean validation, since they're cross-field business rules
 * (e.g. "anonymous + recurring is blocked") rather than simple per-field
 * constraints.
 */
@Slf4j
@Service
@Transactional
public class DonationServiceImpl implements DonationService {

    private static final List<DonationType> ANONYMOUS_ALLOWED_TYPES =
            List.of(DonationType.ONE_TIME, DonationType.MAJOR_GIFT, DonationType.GIK);

    @Autowired
    private DonationRepository donationRepository;

    @Autowired
    private DonationGikItemRepository gikItemRepository;

    @Autowired
    private DonorRepository donorRepository;

    @Autowired
    private ProgrammeRepository programmeRepository;

    @Autowired
    private StateRepository stateRepository;

    @Autowired
    private TenantTaxConfigRepository tenantTaxConfigRepository;

    @Autowired
    private DonationMapper donationMapper;

    @Override
    public DonationDetailResponse createDonation(CreateDonationRequest request) {
        log.info("Creating new donation of type: {}", request.getDonationType());

        Donation donation = new Donation();
        applyRequest(donation, request, true);

        Donation saved = donationRepository.save(donation);
        log.info("Donation created successfully with id: {} code: {}", saved.getId(), saved.getDonationCode());

        return toDetailResponseWithAnonymousInfo(saved);
    }

    @Override
    public DonationDetailResponse updateDonation(Long id, CreateDonationRequest request) {
        log.info("Updating donation with id: {}", id);

        Donation donation = donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donation", id));

        applyRequest(donation, request, false);

        Donation saved = donationRepository.save(donation);
        log.info("Donation updated successfully: {}", saved.getId());
        return toDetailResponseWithAnonymousInfo(saved);
    }

    /** Shared create/update pipeline: identification → book → fund/location → type block → tax chain. */
    private void applyRequest(Donation donation, CreateDonationRequest request, boolean isCreate) {
        Map<String, String> errors = new HashMap<>();

        DonorMaster donor = resolveDonorAndIdentification(donation, request, errors);
        applyAnonymousTypeGate(request, errors);
        Book book = resolveBook(donor, request.getIdentification());
        applyForeignAccountGate(donor, request, errors);

        if (!errors.isEmpty()) {
            throw new ValidationException("Donation validation failed", errors);
        }

        donation.setDonationType(request.getDonationType());
        donation.setReceiptDate(request.getReceiptDate());
        donation.setChannel(request.getChannel());
        donation.setBook(book);
        donation.setDonor(donor);
        donation.setIdentification(request.getIdentification());
        donation.setAnonymousCollectionSource(request.getAnonymousCollectionSource());
        donation.setAnonymousSourceReference(request.getAnonymousSourceReference());
        donation.setFundMode(request.getFundMode());
        donation.setFundClassCode(request.getFundClassCode());
        donation.setUtilisationPeriodType(request.getUtilisationPeriodType());
        donation.setUtilisationStartDate(request.getUtilisationStartDate());
        donation.setUtilisationEndDate(request.getUtilisationEndDate());
        donation.setIsConditionalGift(Boolean.TRUE.equals(request.getIsConditionalGift()));
        donation.setConditionDescription(request.getConditionDescription());
        donation.setTransactionRef(request.getTransactionRef());
        donation.setTallyVoucherRef(request.getTallyVoucherRef());
        donation.setBankAccountType(request.getBankAccountType());

        applyProgrammeAndLocations(donation, request);
        applyFinancials(donation, request);
        applyTypeSpecificBlock(donation, request);
        donation.setRecognitionStatus(resolveRecognitionStatus(donation));

        if (isCreate) {
            donation.setDonationCode(generateDonationCode(request.getReceiptDate()));
        }

        applyTaxChain(donation);
    }

    private DonorMaster resolveDonorAndIdentification(Donation donation, CreateDonationRequest request,
            Map<String, String> errors) {
        if (request.getIdentification() == DonorIdentification.NAMED) {
            if (request.getDonorId() == null) {
                errors.put("donorId", "Donor is required for a named donation");
                return null;
            }
            return donorRepository.findById(request.getDonorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Donor", request.getDonorId()));
        }

        // Anonymous: no donor record is ever created or linked.
        if (request.getAnonymousCollectionSource() == null || request.getAnonymousCollectionSource().isBlank()) {
            errors.put("anonymousCollectionSource", "Collection source is required for an anonymous donation");
        }
        if (request.getAnonymousSourceReference() == null || request.getAnonymousSourceReference().isBlank()) {
            errors.put("anonymousSourceReference", "Source reference is required for an anonymous donation");
        }
        return null;
    }

    private void applyAnonymousTypeGate(CreateDonationRequest request, Map<String, String> errors) {
        if (request.getIdentification() == DonorIdentification.ANONYMOUS
                && !ANONYMOUS_ALLOWED_TYPES.contains(request.getDonationType())) {
            errors.put("donationType", "Anonymous donations may only be One-time, Major gift or Gift in kind");
        }
    }

    private Book resolveBook(DonorMaster donor, DonorIdentification identification) {
        if (identification == DonorIdentification.ANONYMOUS || donor == null) {
            return Book.LC;
        }
        return donor.getFundSourceDomicile() == FundSourceDomicile.FOREIGN ? Book.FC : Book.LC;
    }

    private void applyForeignAccountGate(DonorMaster donor, CreateDonationRequest request,
            Map<String, String> errors) {
        boolean foreignDonor = donor != null && donor.getFundSourceDomicile() == FundSourceDomicile.FOREIGN;
        if (foreignDonor && request.getBankAccountType() != DonationBankAccountType.FCRA_DESIGNATED) {
            errors.put("bankAccountType", "A foreign donor's gift can only be received into the FCRA designated account");
        }
    }

    private void applyProgrammeAndLocations(Donation donation, CreateDonationRequest request) {
        Programme programme = null;
        if (request.getProgrammeId() != null) {
            programme = programmeRepository.findById(request.getProgrammeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Programme", request.getProgrammeId()));
        }
        donation.setProgramme(programme);

        donation.getLocations().clear();
        List<StateMaster> states = stateRepository.findAllById(request.getStateIds());
        if (states.size() != request.getStateIds().size()) {
            throw new ValidationException("One or more selected states could not be found");
        }
        for (StateMaster state : states) {
            donation.getLocations().add(DonationLocation.builder().donation(donation).state(state).build());
        }
    }

    private void applyFinancials(Donation donation, CreateDonationRequest request) {
        String currency = (request.getCurrency() == null || request.getCurrency().isBlank())
                ? "INR" : request.getCurrency().trim().toUpperCase();
        BigDecimal fx = request.getFxRate() != null ? request.getFxRate() : BigDecimal.ONE;
        donation.setCurrency(currency);
        donation.setAmount(request.getAmount());
        donation.setFxRate(fx);
        donation.setReportingAmountInr(request.getAmount().multiply(fx));
    }

    private void applyTypeSpecificBlock(Donation donation, CreateDonationRequest request) {
        donation.getGikItems().clear();
        donation.setCorpusDetail(null);
        donation.setRecurringMandate(null);
        donation.setPayrollBatch(null);
        donation.setLegacyDetail(null);

        switch (request.getDonationType()) {
            case GIK -> applyGikItems(donation, request);
            case CORPUS -> applyCorpusDetail(donation, request);
            case RECURRING -> applyRecurringMandate(donation, request);
            case PAYROLL_GIVING -> applyPayrollBatch(donation, request);
            case LEGACY -> applyLegacyDetail(donation, request);
            default -> {
                // MAJOR_GIFT / ONE_TIME carry no additional block.
            }
        }
    }

    private void applyGikItems(Donation donation, CreateDonationRequest request) {
        if (request.getGikItems() == null || request.getGikItems().isEmpty()) {
            throw new ValidationException("Gift in kind requires at least one line item",
                    Map.of("gikItems", "At least one line item is required"));
        }
        for (GikItemRequest item : request.getGikItems()) {
            LocalDate liquidationDueDate = item.getIntendedUse() == com.ngo.finance.donation.enums.GikIntendedUse.SELL
                    ? FinancialYearUtil.secondFyEndAfter(request.getReceiptDate())
                    : null;
            donation.getGikItems().add(DonationGikItem.builder()
                    .donation(donation)
                    .itemDescription(item.getItemDescription())
                    .fairValue(item.getFairValue())
                    .intendedUse(item.getIntendedUse())
                    .expiryDate(item.getExpiryDate())
                    .liquidationDueDate(liquidationDueDate)
                    .realisationStatus(GikRealisationStatus.PENDING)
                    .build());
        }
    }

    private void applyCorpusDetail(Donation donation, CreateDonationRequest request) {
        if (request.getCorpusDetail() == null) {
            throw new ValidationException("Corpus requires a written donor direction",
                    Map.of("corpusDetail", "Written direction reference and document are required"));
        }
        DonorMaster donor = donation.getDonor();
        boolean csrDonor = donor != null && donor.getDonorType() == DonorType.CORPORATE;
        if (donation.getBook() == Book.LC && csrDonor) {
            throw new ValidationException("CSR funds cannot be given as corpus",
                    Map.of("corpusDetail", "Domestic corpus must come from individuals, not CSR"));
        }
        donation.setCorpusDetail(DonationCorpusDetail.builder()
                .donation(donation)
                .writtenDirectionRef(request.getCorpusDetail().getWrittenDirectionRef())
                .directionDate(request.getCorpusDetail().getDirectionDate())
                .directionDocumentPath(request.getCorpusDetail().getDirectionDocumentPath())
                .investmentMode(request.getCorpusDetail().getInvestmentMode())
                .build());
    }

    private void applyRecurringMandate(Donation donation, CreateDonationRequest request) {
        if (request.getRecurringMandate() == null) {
            throw new ValidationException("Recurring giving requires mandate details",
                    Map.of("recurringMandate", "Mandate details are required"));
        }
        donation.setRecurringMandate(DonationRecurringMandate.builder()
                .donation(donation)
                .mandateId(request.getRecurringMandate().getMandateId())
                .frequency(request.getRecurringMandate().getFrequency())
                .startDate(request.getRecurringMandate().getStartDate())
                .mandateStatus(request.getRecurringMandate().getMandateStatus() != null
                        ? request.getRecurringMandate().getMandateStatus()
                        : com.ngo.finance.donation.enums.MandateStatus.ACTIVE)
                .nextExpectedDebitDate(request.getRecurringMandate().getNextExpectedDebitDate())
                .sponsorshipTie(request.getRecurringMandate().getSponsorshipTie())
                .build());
    }

    private void applyPayrollBatch(Donation donation, CreateDonationRequest request) {
        if (request.getPayrollBatch() == null || request.getPayrollBatch().getEmployees() == null
                || request.getPayrollBatch().getEmployees().isEmpty()) {
            throw new ValidationException("Payroll giving requires an employee giving list",
                    Map.of("payrollBatch", "At least one employee is required"));
        }

        DonationPayrollBatch batch = DonationPayrollBatch.builder()
                .donation(donation)
                .employer(request.getPayrollBatch().getEmployer())
                .employerMatchRouting(request.getPayrollBatch().getEmployerMatchRouting() != null
                        ? request.getPayrollBatch().getEmployerMatchRouting()
                        : com.ngo.finance.donation.enums.EmployerMatchRouting.PAYROLL_GIVING_TAGGED)
                .build();

        BigDecimal sum = BigDecimal.ZERO;
        List<DonationPayrollEmployee> employees = new ArrayList<>();
        for (PayrollEmployeeRequest e : request.getPayrollBatch().getEmployees()) {
            sum = sum.add(e.getAmount());
            employees.add(DonationPayrollEmployee.builder()
                    .batch(batch)
                    .name(e.getName())
                    .idType(e.getIdType())
                    .idNumber(e.getIdNumber())
                    .amount(e.getAmount())
                    .citizenship(e.getCitizenship())
                    .build());
        }
        batch.setEmployees(employees);

        if (sum.setScale(2, RoundingMode.HALF_UP).compareTo(request.getAmount().setScale(2, RoundingMode.HALF_UP)) != 0) {
            throw new ValidationException("Employee amounts must sum to the remittance received",
                    Map.of("payrollBatch", "Sum of employee amounts (" + sum + ") does not match the total remittance ("
                            + request.getAmount() + ")"));
        }

        donation.setPayrollBatch(batch);
    }

    private void applyLegacyDetail(Donation donation, CreateDonationRequest request) {
        if (request.getLegacyDetail() == null) {
            throw new ValidationException("Legacy / bequest requires bequest details",
                    Map.of("legacyDetail", "Bequest status and estate domicile are required"));
        }
        donation.setLegacyDetail(DonationLegacyDetail.builder()
                .donation(donation)
                .bequestStatus(request.getLegacyDetail().getBequestStatus())
                .probateReference(request.getLegacyDetail().getProbateReference())
                .expectedValue(request.getLegacyDetail().getExpectedValue())
                .estateDomicile(request.getLegacyDetail().getEstateDomicile())
                .build());
    }

    private RecognitionStatus resolveRecognitionStatus(Donation donation) {
        if (donation.getDonationType() == DonationType.CORPUS) {
            return RecognitionStatus.CAPITAL_NOT_INCOME;
        }
        if (donation.getDonationType() == DonationType.LEGACY) {
            return donation.getLegacyDetail() != null && donation.getLegacyDetail().getBequestStatus() == BequestStatus.RECEIVED
                    ? RecognitionStatus.INCOME_RECOGNISED
                    : RecognitionStatus.IN_PROBATE;
        }
        if (Boolean.TRUE.equals(donation.getIsConditionalGift())) {
            return RecognitionStatus.DEFERRED_INCOME;
        }
        return RecognitionStatus.INCOME_RECOGNISED;
    }

    private String generateDonationCode(LocalDate receiptDate) {
        int fyStartYear = FinancialYearUtil.fyStartYear(receiptDate);
        LocalDate fyStart = FinancialYearUtil.fyStart(receiptDate);
        LocalDate fyEnd = FinancialYearUtil.fyEnd(receiptDate);
        long sequence = donationRepository.countByReceiptDateBetween(fyStart, fyEnd) + 1;
        return String.format("ZRY/DN/%d/%04d", fyStartYear, sequence);
    }

    /** 80G eligibility → Form 10BD reportability → Form 10BE lifecycle, in that order. */
    private void applyTaxChain(Donation donation) {
        TenantTaxConfig config = tenantTaxConfigRepository.findAll().stream().findFirst().orElse(null);
        LocalDate receiptDate = donation.getReceiptDate();

        boolean orgRegistered80g = config != null
                && !receiptDate.isBefore(config.getOrg80gValidFrom())
                && !receiptDate.isAfter(config.getOrg80gValidTo());

        if (!orgRegistered80g) {
            donation.setEightyGStatus(EightyGStatus.NOT_ELIGIBLE_ORG_NOT_REGISTERED);
        } else if (donation.getDonationType() == DonationType.GIK) {
            donation.setEightyGStatus(EightyGStatus.NOT_ELIGIBLE_GIFT_IN_KIND);
        } else if (donation.getIdentification() == DonorIdentification.ANONYMOUS) {
            donation.setEightyGStatus(EightyGStatus.NOT_ELIGIBLE_ANONYMOUS);
        } else {
            donation.setEightyGStatus(EightyGStatus.ELIGIBLE_PENDING_ISSUE);
        }

        boolean orgRegistered35 = config != null && config.getSection35RegistrationNumber() != null
                && config.getSection35ValidFrom() != null && config.getSection35ValidTo() != null
                && !receiptDate.isBefore(config.getSection35ValidFrom())
                && !receiptDate.isAfter(config.getSection35ValidTo());

        String failureReason = null;
        if (!orgRegistered80g && !orgRegistered35) {
            failureReason = "Organisation does not hold a valid 80G/Section 35 registration on the receipt date";
        } else if (donation.getIdentification() == DonorIdentification.ANONYMOUS) {
            failureReason = "Donor is anonymous — no named donor to report";
        } else if (donation.getDonor() == null || donation.getDonor().getPanCardNumber() == null
                || donation.getDonor().getPanCardNumber().isBlank()) {
            failureReason = "No valid ID number on file for the donor";
        } else if (donation.getDonor().getAddress() == null || donation.getDonor().getAddress().isBlank()) {
            failureReason = "Donor address is not on file";
        }

        donation.setTenBdReportable(failureReason == null);
        donation.setTenBdFailureReason(failureReason);
        donation.setTenBeStatus(donation.getTenBdReportable() ? TenBeStatus.DUE_AFTER_FY_CLOSE : TenBeStatus.NOT_APPLICABLE);
    }

    private DonationDetailResponse toDetailResponseWithAnonymousInfo(Donation donation) {
        DonationDetailResponse response = donationMapper.toDetailResponse(donation);
        if (donation.getIdentification() == DonorIdentification.ANONYMOUS) {
            LocalDate fyStart = FinancialYearUtil.fyStart(donation.getReceiptDate());
            LocalDate fyEnd = FinancialYearUtil.fyEnd(donation.getReceiptDate());
            BigDecimal totalFy = donationRepository.sumReportingAmountInr(fyStart, fyEnd);
            BigDecimal anonymousFy = donationRepository.sumAnonymousReportingAmountInr(fyStart, fyEnd);
            BigDecimal limit = new BigDecimal("100000").max(totalFy.multiply(new BigDecimal("0.05")));
            response.setAnonymousFyRunningTotal(anonymousFy);
            response.setAnonymousFyLimit(limit);
        }
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public DonationDetailResponse getDonationById(Long id) {
        Donation donation = donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donation", id));
        return toDetailResponseWithAnonymousInfo(donation);
    }

    @Override
    @Transactional(readOnly = true)
    public DonationDetailResponse getDonationByCode(String donationCode) {
        Donation donation = donationRepository.findByDonationCode(donationCode)
                .orElseThrow(() -> new ResourceNotFoundException("Donation", "code", donationCode));
        return toDetailResponseWithAnonymousInfo(donation);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DonationListResponse> getAllDonations() {
        return donationRepository.findAll().stream().map(donationMapper::toListResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DonationListResponse> getDonationsByDonorId(Long donorId) {
        return donationRepository.findByDonorId(donorId).stream().map(donationMapper::toListResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DonationListResponse> getDonationsByComplianceState(String complianceState) {
        List<Donation> donations = switch (complianceState) {
            case "80G_PENDING" -> donationRepository.findByEightyGStatus(EightyGStatus.ELIGIBLE_PENDING_ISSUE);
            case "10BD_INCOMPLETE" -> donationRepository.findByTenBdReportableFalse();
            case "ANONYMOUS" -> donationRepository.findByIdentification(DonorIdentification.ANONYMOUS);
            default -> throw new ValidationException("Unknown compliance state: " + complianceState);
        };
        return donations.stream().map(donationMapper::toListResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DonationListResponse> searchDonations(String searchTerm) {
        return donationRepository.searchByCodeDonorOrReference(searchTerm).stream()
                .map(donationMapper::toListResponse).toList();
    }

    @Override
    public DonationDetailResponse updateGikIntendedUse(Long donationId, Long gikItemId,
            UpdateGikIntendedUseRequest request) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation", donationId));

        DonationGikItem item = donation.getGikItems().stream()
                .filter(g -> g.getId().equals(gikItemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("GIK item", gikItemId));

        item.getIntendedUseChanges().add(DonationGikIntendedUseChange.builder()
                .gikItem(item)
                .fromIntendedUse(item.getIntendedUse())
                .toIntendedUse(request.getIntendedUse())
                .reason(request.getReason())
                .changedAt(LocalDateTime.now())
                .build());

        item.setIntendedUse(request.getIntendedUse());
        item.setLiquidationDueDate(request.getIntendedUse() == com.ngo.finance.donation.enums.GikIntendedUse.SELL
                ? FinancialYearUtil.secondFyEndAfter(donation.getReceiptDate())
                : null);
        gikItemRepository.save(item);

        return toDetailResponseWithAnonymousInfo(donationRepository.save(donation));
    }

    @Override
    public DonationDetailResponse issueEightyGReceipt(Long id) {
        Donation donation = donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donation", id));

        if (donation.getEightyGStatus() != EightyGStatus.ELIGIBLE_PENDING_ISSUE) {
            log.warn("Cannot issue 80G receipt for donation {} in status {}", id, donation.getEightyGStatus());
            return toDetailResponseWithAnonymousInfo(donation);
        }

        TenantTaxConfig config = tenantTaxConfigRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new ValidationException("No tenant tax configuration is set up"));
        long nextSequence = config.getReceiptNumberSequence() + 1;
        config.setReceiptNumberSequence(nextSequence);
        tenantTaxConfigRepository.save(config);

        int fyStartYear = FinancialYearUtil.fyStartYear(donation.getReceiptDate());
        String fyLabel = fyStartYear + "-" + String.format("%02d", (fyStartYear + 1) % 100);
        donation.setEightyGReceiptNumber(String.format("80G/%s/%04d", fyLabel, nextSequence));
        donation.setEightyGIssuedAt(LocalDateTime.now());
        donation.setEightyGStatus(EightyGStatus.ISSUED);

        return toDetailResponseWithAnonymousInfo(donationRepository.save(donation));
    }

    @Override
    public DonationDetailResponse markTenBdFiling(Long id) {
        Donation donation = donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donation", id));

        if (!Boolean.TRUE.equals(donation.getTenBdReportable())) {
            log.warn("Donation {} is not 10BD reportable — no 10BE state to advance", id);
            return toDetailResponseWithAnonymousInfo(donation);
        }

        donation.setTenBeStatus(switch (donation.getTenBeStatus()) {
            case DUE_AFTER_FY_CLOSE -> TenBeStatus.PENDING_10BD_FILING;
            case PENDING_10BD_FILING -> TenBeStatus.ISSUED;
            default -> donation.getTenBeStatus();
        });

        return toDetailResponseWithAnonymousInfo(donationRepository.save(donation));
    }
}
