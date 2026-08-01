package com.ngo.finance.donation.mapper;

import com.ngo.finance.donation.dto.response.CorpusDetailResponse;
import com.ngo.finance.donation.dto.response.DonationDetailResponse;
import com.ngo.finance.donation.dto.response.DonationListResponse;
import com.ngo.finance.donation.dto.response.GikItemResponse;
import com.ngo.finance.donation.dto.response.LegacyDetailResponse;
import com.ngo.finance.donation.dto.response.PayrollBatchResponse;
import com.ngo.finance.donation.dto.response.PayrollEmployeeResponse;
import com.ngo.finance.donation.dto.response.RecurringMandateResponse;
import com.ngo.finance.donation.entity.Donation;
import com.ngo.finance.donation.entity.DonationCorpusDetail;
import com.ngo.finance.donation.entity.DonationGikItem;
import com.ngo.finance.donation.entity.DonationLegacyDetail;
import com.ngo.finance.donation.entity.DonationLocation;
import com.ngo.finance.donation.entity.DonationPayrollBatch;
import com.ngo.finance.donation.entity.DonationPayrollEmployee;
import com.ngo.finance.donation.entity.DonationRecurringMandate;
import com.ngo.finance.donation.enums.Citizenship;
import com.ngo.finance.donation.enums.GikRealisationStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * MapStruct mapper for Donation entity to/from DTOs. Nested type-specific
 * blocks are mostly field-for-field, so MapStruct auto-generates those;
 * default methods handle the null-safety (only the block matching
 * donationType is ever populated) and the list/derived fields MapStruct
 * can't express declaratively.
 */
@Mapper(componentModel = "spring")
public interface DonationMapper {

    @Mapping(target = "donorId", expression = "java(entity.getDonor() != null ? entity.getDonor().getId() : null)")
    @Mapping(target = "donorName",
            expression = "java(entity.getDonor() != null ? entity.getDonor().getDonorName() : \"Anonymous\")")
    @Mapping(target = "stateNames", expression = "java(toStateNames(entity.getLocations()))")
    DonationListResponse toListResponse(Donation entity);

    @Mapping(target = "donorId", expression = "java(entity.getDonor() != null ? entity.getDonor().getId() : null)")
    @Mapping(target = "donorName",
            expression = "java(entity.getDonor() != null ? entity.getDonor().getDonorName() : \"Anonymous\")")
    @Mapping(target = "donorPanCardNumber",
            expression = "java(entity.getDonor() != null ? entity.getDonor().getDocumentNumber() : null)")
    @Mapping(target = "donorAddress",
            expression = "java(entity.getDonor() != null ? entity.getDonor().getAddress() : null)")
    @Mapping(source = "programme.id", target = "programmeId")
    @Mapping(source = "programme.programmeName", target = "programmeName")
    @Mapping(target = "stateNames", expression = "java(toStateNames(entity.getLocations()))")
    @Mapping(target = "gikItems", expression = "java(toGikItemResponses(entity.getGikItems()))")
    @Mapping(target = "corpusDetail", expression = "java(toCorpusDetailResponse(entity.getCorpusDetail()))")
    @Mapping(target = "recurringMandate",
            expression = "java(toRecurringMandateResponse(entity.getRecurringMandate()))")
    @Mapping(target = "payrollBatch", expression = "java(toPayrollBatchResponse(entity.getPayrollBatch()))")
    @Mapping(target = "legacyDetail", expression = "java(toLegacyDetailResponse(entity.getLegacyDetail()))")
    @Mapping(target = "anonymousFyRunningTotal", ignore = true)
    @Mapping(target = "anonymousFyLimit", ignore = true)
    DonationDetailResponse toDetailResponse(Donation entity);

    default List<String> toStateNames(List<DonationLocation> locations) {
        if (locations == null) {
            return List.of();
        }
        return locations.stream().map(l -> l.getState().getStateName()).toList();
    }

    default List<GikItemResponse> toGikItemResponses(List<DonationGikItem> items) {
        if (items == null) {
            return List.of();
        }
        return items.stream().map(this::toGikItemResponse).toList();
    }

    default GikItemResponse toGikItemResponse(DonationGikItem item) {
        if (item == null) {
            return null;
        }
        boolean overdue = item.getRealisationStatus() == GikRealisationStatus.PENDING
                && item.getLiquidationDueDate() != null
                && LocalDate.now().isAfter(item.getLiquidationDueDate());
        return GikItemResponse.builder()
                .id(item.getId())
                .itemDescription(item.getItemDescription())
                .quantity(item.getQuantity())
                .fairValue(item.getFairValue())
                .valuationBasis(item.getValuationBasis())
                .valuationSource(item.getValuationSource())
                .intendedUse(item.getIntendedUse())
                .treatment(item.getTreatment())
                .programmeId(item.getProgramme() != null ? item.getProgramme().getId() : null)
                .programmeName(item.getProgramme() != null ? item.getProgramme().getProgrammeName() : null)
                .otherProgramme(item.getOtherProgramme())
                .expiryDate(item.getExpiryDate())
                .liquidationDueDate(item.getLiquidationDueDate())
                .realisationStatus(item.getRealisationStatus())
                .liquidationOverdue(overdue)
                .actualSaleDate(item.getActualSaleDate())
                .actualProceeds(item.getActualProceeds())
                .matchingLeg(item.getMatchingLeg())
                .build();
    }

    default CorpusDetailResponse toCorpusDetailResponse(DonationCorpusDetail detail) {
        if (detail == null) {
            return null;
        }
        return CorpusDetailResponse.builder()
                .writtenDirectionRef(detail.getWrittenDirectionRef())
                .directionDate(detail.getDirectionDate())
                .directionDocumentPath(detail.getDirectionDocumentPath())
                .investmentMode(detail.getInvestmentMode())
                .build();
    }

    default RecurringMandateResponse toRecurringMandateResponse(DonationRecurringMandate mandate) {
        if (mandate == null) {
            return null;
        }
        return RecurringMandateResponse.builder()
                .mandateId(mandate.getMandateId())
                .frequency(mandate.getFrequency())
                .startDate(mandate.getStartDate())
                .mandateStatus(mandate.getMandateStatus())
                .nextExpectedDebitDate(mandate.getNextExpectedDebitDate())
                .sponsorshipTie(mandate.getSponsorshipTie())
                .build();
    }

    default LegacyDetailResponse toLegacyDetailResponse(DonationLegacyDetail detail) {
        if (detail == null) {
            return null;
        }
        return LegacyDetailResponse.builder()
                .bequestStatus(detail.getBequestStatus())
                .probateReference(detail.getProbateReference())
                .expectedValue(detail.getExpectedValue())
                .estateDomicile(detail.getEstateDomicile())
                .build();
    }

    default PayrollEmployeeResponse toPayrollEmployeeResponse(DonationPayrollEmployee employee) {
        if (employee == null) {
            return null;
        }
        return PayrollEmployeeResponse.builder()
                .id(employee.getId())
                .name(employee.getName())
                .idType(employee.getIdType())
                .idNumber(employee.getIdNumber())
                .amount(employee.getAmount())
                .citizenship(employee.getCitizenship())
                .build();
    }

    default PayrollBatchResponse toPayrollBatchResponse(DonationPayrollBatch batch) {
        if (batch == null) {
            return null;
        }
        List<DonationPayrollEmployee> employees = batch.getEmployees();
        BigDecimal indianTotal = employees.stream()
                .filter(e -> e.getCitizenship() == Citizenship.INDIAN)
                .map(DonationPayrollEmployee::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal foreignTotal = employees.stream()
                .filter(e -> e.getCitizenship() == Citizenship.FOREIGN)
                .map(DonationPayrollEmployee::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return PayrollBatchResponse.builder()
                .employer(batch.getEmployer())
                .employerMatchRouting(batch.getEmployerMatchRouting())
                .matchAmount(batch.getMatchAmount())
                .csrFinancialYear(batch.getCsrFinancialYear())
                .csrProjectRef(batch.getCsrProjectRef())
                .employees(employees.stream().map(this::toPayrollEmployeeResponse).toList())
                .indianTotal(indianTotal)
                .foreignTotal(foreignTotal)
                .build();
    }
}
