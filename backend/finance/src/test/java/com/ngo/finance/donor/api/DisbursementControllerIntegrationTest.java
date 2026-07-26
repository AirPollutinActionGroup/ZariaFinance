package com.ngo.finance.donor.api;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ngo.finance.donor.dto.request.CreateGrantRequest;
import com.ngo.finance.donor.dto.request.DisbursementScheduleRequest;
import com.ngo.finance.donor.dto.request.DisbursementScheduleRequest.CriterionItem;
import com.ngo.finance.donor.dto.request.DisbursementScheduleRequest.ReminderItem;
import com.ngo.finance.donor.dto.request.DisbursementScheduleRequest.TrancheItem;
import com.ngo.finance.donor.dto.request.ReceiveTrancheRequest;
import com.ngo.finance.donor.entity.DonorFundProfile;
import com.ngo.finance.donor.entity.DonorMaster;
import com.ngo.finance.donor.entity.FundProfileTranche;
import com.ngo.finance.donor.entity.Programme;
import com.ngo.finance.donor.enums.CriterionType;
import com.ngo.finance.donor.enums.DisbursementType;
import com.ngo.finance.donor.enums.DonorType;
import com.ngo.finance.donor.enums.GrantStatus;
import com.ngo.finance.donor.enums.RepeatReminder;
import com.ngo.finance.donor.enums.ResponsibleRole;
import com.ngo.finance.donor.enums.ScheduleType;
import com.ngo.finance.donor.enums.TriggerBasis;
import com.ngo.finance.donor.enums.VerificationRole;
import com.ngo.finance.donor.repository.DonorFundProfileRepository;
import com.ngo.finance.donor.repository.DonorRepository;
import com.ngo.finance.donor.repository.ProgrammeRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Disbursement rules for a grant: schedule shape, tranche reconciliation, release
 * criteria, reminders and finalisation.
 *
 * The fund profile seeded here has a 250,000 tranche plan, so every grant created
 * from it inherits that as its committed total.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class DisbursementControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private DonorRepository donorRepository;

    @Autowired
    private ProgrammeRepository programmeRepository;

    @Autowired
    private DonorFundProfileRepository fundProfileRepository;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    private DonorFundProfile seedFundProfile(String suffix) {
        DonorMaster donor = donorRepository.save(DonorMaster.builder()
                .donorCode("DN-DSB-" + suffix)
                .donorName("Disbursement Donor " + suffix)
                .donorType(DonorType.CORPORATE)
                .email("dsb" + suffix + "@example.com")
                .spocNameOfThePerson("Test POC")
                .spocEmail("poc-dsb-" + suffix + "@example.com")
                .isActive(true)
                .build());

        Programme programme = programmeRepository.save(Programme.builder()
                .programmeCode("PGM-DSB-" + suffix)
                .programmeName("Disbursement Programme " + suffix)
                .build());

        DonorFundProfile profile = DonorFundProfile.builder()
                .donor(donor)
                .programme(programme)
                .fundMode("Restricted")
                .fundClassCode("A")
                .purpose("Disbursement test profile")
                .build();
        profile.getTranches().add(FundProfileTranche.builder()
                .fundProfile(profile)
                .trancheNumber(1)
                .trancheName("Plan 1")
                .trancheAmount(new BigDecimal("150000.00"))
                .plannedReleaseDate(LocalDate.of(2026, 4, 1))
                .build());
        profile.getTranches().add(FundProfileTranche.builder()
                .fundProfile(profile)
                .trancheNumber(2)
                .trancheName("Plan 2")
                .trancheAmount(new BigDecimal("100000.00"))
                .build());
        return fundProfileRepository.save(profile);
    }

    private long createGrant(String suffix, DonorFundProfile profile) throws Exception {
        CreateGrantRequest request = CreateGrantRequest.builder()
                .grantCode("GR-DSB-" + suffix)
                .fundProfileId(profile.getId())
                .agreementName("Disbursement Grant " + suffix)
                .agreementDate(LocalDate.of(2026, 1, 1))
                .startDate(LocalDate.of(2026, 1, 2))
                .endDate(LocalDate.of(2026, 12, 31))
                .status(GrantStatus.ACTIVE)
                .grantCurrency("INR")
                .fxLockedRate(BigDecimal.ONE)
                .build();

        String response = mockMvc.perform(post("/api/v1/grants")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).path("id").asLong();
    }

    private String save(long grantId, DisbursementScheduleRequest request) throws Exception {
        return mockMvc.perform(put("/api/v1/grants/{id}/disbursement", grantId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
    }

    private static TrancheItem tranche(String name, String amount, LocalDate expected,
            CriterionItem... criteria) {
        return TrancheItem.builder()
                .trancheName(name)
                .amount(new BigDecimal(amount))
                .expectedReleaseDate(expected)
                .criteria(List.of(criteria))
                .build();
    }

    private static CriterionItem onSigning() {
        return CriterionItem.builder().criterionType(CriterionType.ON_SIGNING).build();
    }

    @Test
    @WithMockUser
    void testUnconfiguredGrantReturnsTheCommittedTotalWithNoTranches() throws Exception {
        DonorFundProfile profile = seedFundProfile("D1");
        long grantId = createGrant("D1", profile);

        mockMvc.perform(get("/api/v1/grants/{id}/disbursement", grantId))
                .andExpect(status().isOk())
                // The form can open on a grant that has no schedule yet.
                .andExpect(jsonPath("$.disbursementType").doesNotExist())
                .andExpect(jsonPath("$.totalAmountCommitted").value(250000.00))
                .andExpect(jsonPath("$.allocatedAmount").value(0))
                .andExpect(jsonPath("$.unallocatedAmount").value(250000.00))
                .andExpect(jsonPath("$.balanced").value(false))
                .andExpect(jsonPath("$.tranches.length()").value(0));
    }

    @Test
    @WithMockUser
    void testTrancheScheduleWithMixedCriteriaAndReminders() throws Exception {
        DonorFundProfile profile = seedFundProfile("D2");
        long grantId = createGrant("D2", profile);

        CriterionItem milestone = CriterionItem.builder()
                .criterionType(CriterionType.MILESTONE_BASED)
                .milestoneName("Teacher Training Completed")
                .verificationRole(VerificationRole.PROGRAMME_MANAGER)
                .targetDate(LocalDate.of(2026, 6, 1))
                .reminder(ReminderItem.builder()
                        .responsibleRole(ResponsibleRole.PROGRAMME_MANAGER)
                        .reminderLeadDays(14)
                        .repeatReminder(RepeatReminder.WEEKLY)
                        .escalateToDeputy(true)
                        .build())
                .build();
        CriterionItem threshold = CriterionItem.builder()
                .criterionType(CriterionType.UTILISATION_THRESHOLD)
                .utilisationPercent(new BigDecimal("80.00"))
                .triggerBasis(TriggerBasis.PREVIOUS_TRANCHE)
                .build();

        DisbursementScheduleRequest request = DisbursementScheduleRequest.builder()
                .disbursementType(DisbursementType.TRANCHES)
                .scheduleType(ScheduleType.QUARTERLY)
                .tranches(List.of(
                        tranche("First", "150000.00", LocalDate.of(2026, 4, 1), onSigning()),
                        tranche("Second", "100000.00", LocalDate.of(2026, 7, 1), milestone, threshold)))
                .build();

        mockMvc.perform(put("/api/v1/grants/{id}/disbursement", grantId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.allocatedAmount").value(250000.00))
                .andExpect(jsonPath("$.balanced").value(true))
                .andExpect(jsonPath("$.frequencyLabel").value("Quarterly"))
                // Tranches are renumbered in list order; only the last is final.
                .andExpect(jsonPath("$.tranches[0].trancheNumber").value(1))
                .andExpect(jsonPath("$.tranches[0].finalTranche").value(false))
                .andExpect(jsonPath("$.tranches[1].finalTranche").value(true))
                .andExpect(jsonPath("$.tranches[0].frequencyLabel").value("Quarterly"))
                // Reminder due date = expected release date − lead days, computed.
                .andExpect(jsonPath("$.tranches[1].criteria[0].reminder.dueDate").value("2026-06-17"))
                .andExpect(jsonPath("$.tranches[1].criteria[0].humanActioned").value(true))
                // Auto-checked criteria carry no reminder.
                .andExpect(jsonPath("$.tranches[1].criteria[1].humanActioned").value(false))
                .andExpect(jsonPath("$.tranches[1].criteria[1].reminder").doesNotExist());
    }

    @Test
    @WithMockUser
    void testLumpSumIsStoredAsASingleTrancheForTheFullAmount() throws Exception {
        DonorFundProfile profile = seedFundProfile("D3");
        long grantId = createGrant("D3", profile);

        DisbursementScheduleRequest request = DisbursementScheduleRequest.builder()
                .disbursementType(DisbursementType.LUMP_SUM)
                .receivingDate(LocalDate.of(2026, 5, 20))
                .tranches(List.of())
                .build();

        mockMvc.perform(put("/api/v1/grants/{id}/disbursement", grantId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.disbursementType").value("LUMP_SUM"))
                .andExpect(jsonPath("$.scheduleType").doesNotExist())
                // Normalised to one tranche so receipts and reporting stay uniform.
                .andExpect(jsonPath("$.tranches.length()").value(1))
                .andExpect(jsonPath("$.tranches[0].amount").value(250000.00))
                .andExpect(jsonPath("$.tranches[0].expectedReleaseDate").value("2026-05-20"))
                .andExpect(jsonPath("$.tranches[0].criteria[0].criterionType").value("ON_SIGNING"))
                .andExpect(jsonPath("$.balanced").value(true));
    }

    @Test
    @WithMockUser
    void testShapeRulesForLumpSumAndTranches() throws Exception {
        DonorFundProfile profile = seedFundProfile("D4");
        long grantId = createGrant("D4", profile);

        // Lump sum with a cadence and no receiving date.
        mockMvc.perform(put("/api/v1/grants/{id}/disbursement", grantId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(DisbursementScheduleRequest.builder()
                                .disbursementType(DisbursementType.LUMP_SUM)
                                .scheduleType(ScheduleType.MONTHLY)
                                .tranches(List.of())
                                .build())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.receivingDate").exists())
                .andExpect(jsonPath("$.errors.scheduleType").exists());

        // Tranches with no cadence.
        mockMvc.perform(put("/api/v1/grants/{id}/disbursement", grantId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(DisbursementScheduleRequest.builder()
                                .disbursementType(DisbursementType.TRANCHES)
                                .tranches(List.of())
                                .build())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.scheduleType").exists());
    }

    @Test
    @WithMockUser
    void testATrancheScheduldeCanBeSavedEmptyButNotFinalised() throws Exception {
        DonorFundProfile profile = seedFundProfile("DD");
        long grantId = createGrant("DD", profile);

        // Picking the cadence and saving is the state you copy a plan into.
        mockMvc.perform(put("/api/v1/grants/{id}/disbursement", grantId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(DisbursementScheduleRequest.builder()
                                .disbursementType(DisbursementType.TRANCHES)
                                .scheduleType(ScheduleType.MONTHLY)
                                .tranches(List.of())
                                .build())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tranches.length()").value(0))
                .andExpect(jsonPath("$.balanced").value(false));

        mockMvc.perform(post("/api/v1/grants/{id}/disbursement/finalise", grantId).with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Add at least one tranche before finalising"));
    }

    @Test
    @WithMockUser
    void testMandatoryFieldsPerCriterionTypeAreReportedOnTheField() throws Exception {
        DonorFundProfile profile = seedFundProfile("D5");
        long grantId = createGrant("D5", profile);

        DisbursementScheduleRequest request = DisbursementScheduleRequest.builder()
                .disbursementType(DisbursementType.TRANCHES)
                .scheduleType(ScheduleType.MONTHLY)
                .tranches(List.of(tranche("Only", "250000.00", LocalDate.of(2026, 4, 1),
                        CriterionItem.builder().criterionType(CriterionType.MILESTONE_BASED).build(),
                        CriterionItem.builder().criterionType(CriterionType.FIXED_DATE).build(),
                        CriterionItem.builder().criterionType(CriterionType.UTILISATION_THRESHOLD).build(),
                        CriterionItem.builder().criterionType(CriterionType.OTHER).build())))
                .build();

        mockMvc.perform(put("/api/v1/grants/{id}/disbursement", grantId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                // Paths match the form's field names so errors land on the input.
                .andExpect(jsonPath("$.errors['tranches.0.criteria.0.milestoneName']").exists())
                .andExpect(jsonPath("$.errors['tranches.0.criteria.0.verificationRole']").exists())
                .andExpect(jsonPath("$.errors['tranches.0.criteria.1.releaseDate']").exists())
                .andExpect(jsonPath("$.errors['tranches.0.criteria.2.utilisationPercent']").exists())
                .andExpect(jsonPath("$.errors['tranches.0.criteria.2.triggerBasis']").exists())
                .andExpect(jsonPath("$.errors['tranches.0.criteria.3.description']").exists());
    }

    @Test
    @WithMockUser
    void testReminderIsRejectedOnCriteriaNobodyActions() throws Exception {
        DonorFundProfile profile = seedFundProfile("D6");
        long grantId = createGrant("D6", profile);

        CriterionItem thresholdWithReminder = CriterionItem.builder()
                .criterionType(CriterionType.UTILISATION_THRESHOLD)
                .utilisationPercent(new BigDecimal("50.00"))
                .triggerBasis(TriggerBasis.CUMULATIVE)
                .reminder(ReminderItem.builder()
                        .responsibleRole(ResponsibleRole.CFO)
                        .reminderLeadDays(5)
                        .build())
                .build();

        mockMvc.perform(put("/api/v1/grants/{id}/disbursement", grantId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(DisbursementScheduleRequest.builder()
                                .disbursementType(DisbursementType.TRANCHES)
                                .scheduleType(ScheduleType.MONTHLY)
                                .tranches(List.of(tranche("Only", "250000.00",
                                        LocalDate.of(2026, 4, 1), thresholdWithReminder)))
                                .build())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors['tranches.0.criteria.0.reminder']").exists());
    }

    @Test
    @WithMockUser
    void testATrancheNeedsAtLeastOneCriterion() throws Exception {
        DonorFundProfile profile = seedFundProfile("D7");
        long grantId = createGrant("D7", profile);

        mockMvc.perform(put("/api/v1/grants/{id}/disbursement", grantId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(DisbursementScheduleRequest.builder()
                                .disbursementType(DisbursementType.TRANCHES)
                                .scheduleType(ScheduleType.MONTHLY)
                                .tranches(List.of(TrancheItem.builder()
                                        .trancheName("No criteria")
                                        .amount(new BigDecimal("250000.00"))
                                        .criteria(List.of())
                                        .build()))
                                .build())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors['tranches.0.criteria']").exists());
    }

    @Test
    @WithMockUser
    void testFinaliseRequiresTranchesToEqualTheCommittedTotal() throws Exception {
        DonorFundProfile profile = seedFundProfile("D8");
        long grantId = createGrant("D8", profile);

        save(grantId, DisbursementScheduleRequest.builder()
                .disbursementType(DisbursementType.TRANCHES)
                .scheduleType(ScheduleType.QUARTERLY)
                .tranches(List.of(tranche("Part", "100000.00", LocalDate.of(2026, 4, 1), onSigning())))
                .build());

        mockMvc.perform(post("/api/v1/grants/{id}/disbursement/finalise", grantId).with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.tranches").value("Short by 150000.00"));

        // Balance it and finalisation succeeds.
        save(grantId, DisbursementScheduleRequest.builder()
                .disbursementType(DisbursementType.TRANCHES)
                .scheduleType(ScheduleType.QUARTERLY)
                .tranches(List.of(tranche("Whole", "250000.00", LocalDate.of(2026, 4, 1), onSigning())))
                .build());

        mockMvc.perform(post("/api/v1/grants/{id}/disbursement/finalise", grantId).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.finalised").value(true))
                .andExpect(jsonPath("$.finalisedAt").exists());
    }

    @Test
    @WithMockUser
    void testAnEditThatUnbalancesThePlanWithdrawsFinalisation() throws Exception {
        DonorFundProfile profile = seedFundProfile("D9");
        long grantId = createGrant("D9", profile);

        save(grantId, DisbursementScheduleRequest.builder()
                .disbursementType(DisbursementType.TRANCHES)
                .scheduleType(ScheduleType.YEARLY)
                .tranches(List.of(tranche("Whole", "250000.00", LocalDate.of(2026, 4, 1), onSigning())))
                .build());
        mockMvc.perform(post("/api/v1/grants/{id}/disbursement/finalise", grantId).with(csrf()))
                .andExpect(jsonPath("$.finalised").value(true));

        // A stale "finalised" badge on a plan that no longer adds up would be worse
        // than making the user finalise again.
        mockMvc.perform(put("/api/v1/grants/{id}/disbursement", grantId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(DisbursementScheduleRequest.builder()
                                .disbursementType(DisbursementType.TRANCHES)
                                .scheduleType(ScheduleType.YEARLY)
                                .tranches(List.of(tranche("Less", "100000.00",
                                        LocalDate.of(2026, 4, 1), onSigning())))
                                .build())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.finalised").value(false))
                .andExpect(jsonPath("$.balanced").value(false));
    }

    @Test
    @WithMockUser
    void testReceivedTrancheCannotBeRepricedOrRemoved() throws Exception {
        DonorFundProfile profile = seedFundProfile("DA");
        long grantId = createGrant("DA", profile);

        String saved = save(grantId, DisbursementScheduleRequest.builder()
                .disbursementType(DisbursementType.TRANCHES)
                .scheduleType(ScheduleType.QUARTERLY)
                .tranches(List.of(
                        tranche("First", "150000.00", LocalDate.of(2026, 4, 1), onSigning()),
                        tranche("Second", "100000.00", LocalDate.of(2026, 7, 1), onSigning())))
                .build());
        long firstId = objectMapper.readTree(saved).path("tranches").get(0).path("id").asLong();
        long secondId = objectMapper.readTree(saved).path("tranches").get(1).path("id").asLong();

        mockMvc.perform(patch("/api/v1/tranches/{id}/receive", firstId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(ReceiveTrancheRequest.builder()
                                .actualAmount(new BigDecimal("150000.00"))
                                .actualDate(LocalDate.of(2026, 4, 3))
                                .build())))
                .andExpect(status().isOk());

        // Re-pricing received money would leave the plan and the receipt disagreeing.
        mockMvc.perform(put("/api/v1/grants/{id}/disbursement", grantId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(DisbursementScheduleRequest.builder()
                                .disbursementType(DisbursementType.TRANCHES)
                                .scheduleType(ScheduleType.QUARTERLY)
                                .tranches(List.of(
                                        TrancheItem.builder().id(firstId).amount(new BigDecimal("1.00"))
                                                .criteria(List.of(onSigning())).build(),
                                        TrancheItem.builder().id(secondId)
                                                .amount(new BigDecimal("100000.00"))
                                                .criteria(List.of(onSigning())).build()))
                                .build())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.tranches").value("Cannot change the amount of a received tranche"));

        // Dropping it from the payload must not delete the receipt either.
        mockMvc.perform(put("/api/v1/grants/{id}/disbursement", grantId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(DisbursementScheduleRequest.builder()
                                .disbursementType(DisbursementType.TRANCHES)
                                .scheduleType(ScheduleType.QUARTERLY)
                                .tranches(List.of(TrancheItem.builder().id(secondId)
                                        .amount(new BigDecimal("250000.00"))
                                        .criteria(List.of(onSigning())).build()))
                                .build())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.tranches").value("Cannot remove a tranche whose receipt is recorded"));
    }

    @Test
    @WithMockUser
    void testEditingKeepsTrancheIdsAndCriteriaMetState() throws Exception {
        DonorFundProfile profile = seedFundProfile("DB");
        long grantId = createGrant("DB", profile);

        String saved = save(grantId, DisbursementScheduleRequest.builder()
                .disbursementType(DisbursementType.TRANCHES)
                .scheduleType(ScheduleType.QUARTERLY)
                .tranches(List.of(tranche("First", "250000.00", LocalDate.of(2026, 4, 1),
                        CriterionItem.builder().criterionType(CriterionType.DONOR_APPROVAL).build())))
                .build());
        long trancheId = objectMapper.readTree(saved).path("tranches").get(0).path("id").asLong();
        long criterionId = objectMapper.readTree(saved).path("tranches").get(0)
                .path("criteria").get(0).path("id").asLong();

        mockMvc.perform(patch("/api/v1/disbursement/criteria/{id}/met", criterionId)
                        .with(csrf()).param("userId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tranches[0].criteriaSatisfied").value(true))
                .andExpect(jsonPath("$.tranches[0].criteriaMetCount").value(1));

        // Re-saving with the same ids must not reset what has been signed off.
        mockMvc.perform(put("/api/v1/grants/{id}/disbursement", grantId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(DisbursementScheduleRequest.builder()
                                .disbursementType(DisbursementType.TRANCHES)
                                .scheduleType(ScheduleType.QUARTERLY)
                                .tranches(List.of(TrancheItem.builder()
                                        .id(trancheId)
                                        .trancheName("First renamed")
                                        .amount(new BigDecimal("250000.00"))
                                        .expectedReleaseDate(LocalDate.of(2026, 4, 1))
                                        .criteria(List.of(CriterionItem.builder()
                                                .id(criterionId)
                                                .criterionType(CriterionType.DONOR_APPROVAL)
                                                .build()))
                                        .build()))
                                .build())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tranches[0].id").value(trancheId))
                .andExpect(jsonPath("$.tranches[0].trancheName").value("First renamed"))
                .andExpect(jsonPath("$.tranches[0].criteria[0].met").value(true));
    }

    @Test
    @WithMockUser
    void testPrefillCopiesTheFundProfileTranchePlan() throws Exception {
        DonorFundProfile profile = seedFundProfile("DC");
        long grantId = createGrant("DC", profile);

        // A cadence is the user's choice, so prefill refuses to guess one.
        mockMvc.perform(post("/api/v1/grants/{id}/disbursement/prefill", grantId).with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.scheduleType").exists());

        save(grantId, DisbursementScheduleRequest.builder()
                .disbursementType(DisbursementType.TRANCHES)
                .scheduleType(ScheduleType.HALF_YEARLY)
                .tranches(List.of())
                .build());

        // The profile's two planned tranches are copied with their amounts and dates,
        // each starting on the neutral On Signing gate for the user to refine.
        mockMvc.perform(post("/api/v1/grants/{id}/disbursement/prefill", grantId).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tranches.length()").value(2))
                .andExpect(jsonPath("$.tranches[0].trancheName").value("Plan 1"))
                .andExpect(jsonPath("$.tranches[0].amount").value(150000.00))
                .andExpect(jsonPath("$.tranches[0].expectedReleaseDate").value("2026-04-01"))
                .andExpect(jsonPath("$.tranches[0].criteria[0].criterionType").value("ON_SIGNING"))
                .andExpect(jsonPath("$.tranches[1].amount").value(100000.00))
                .andExpect(jsonPath("$.allocatedAmount").value(250000.00))
                .andExpect(jsonPath("$.balanced").value(true));

        // Running it again would duplicate the plan, so it refuses.
        mockMvc.perform(post("/api/v1/grants/{id}/disbursement/prefill", grantId).with(csrf()))
                .andExpect(status().isBadRequest());
    }
}
