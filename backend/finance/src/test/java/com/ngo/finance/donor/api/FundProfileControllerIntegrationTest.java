package com.ngo.finance.donor.api;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ngo.finance.donation.enums.FundMode;
import com.ngo.finance.donor.dto.request.CreateFundProfileRequest;
import com.ngo.finance.donor.dto.request.CreateFundProfileRequest.DisbursementRuleItem;
import com.ngo.finance.donor.dto.request.CreateFundProfileRequest.GeographyItem;
import com.ngo.finance.donor.dto.request.CreateFundProfileRequest.ReleaseCriterionItem;
import com.ngo.finance.donor.dto.request.CreateFundProfileRequest.TrancheCriterionItem;
import com.ngo.finance.donor.dto.request.CreateFundProfileRequest.UtilisationRuleItem;
import com.ngo.finance.donor.entity.DonorMaster;
import com.ngo.finance.donor.enums.CriterionType;
import com.ngo.finance.donor.enums.DisbursementType;
import com.ngo.finance.donor.enums.DonorType;
import com.ngo.finance.donor.enums.FundClass;
import com.ngo.finance.donor.enums.RestrictionRuleType;
import com.ngo.finance.donor.enums.VerificationRole;
import com.ngo.finance.donor.repository.DonorRepository;
import com.ngo.finance.donor.repository.StateRepository;
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
 * The fund profile's geography / utilisation / disbursement subtree — the
 * disbursement rule's totalAmount now supplies the read-only Total Grant Amount
 * on the New Grant Agreement Form, and its trancheCriteria carry the release
 * schedule (amount, date, and gate) that used to live as a flat tranche plan.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class FundProfileControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private DonorRepository donorRepository;

    @Autowired
    private StateRepository stateRepository;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    private DonorMaster seedDonor(String suffix) {
        return donorRepository.save(DonorMaster.builder()
                .donorCode("DN-FP-" + suffix)
                .donorName("Fund Profile Donor " + suffix)
                .donorType(DonorType.CORPORATE)
                .email("fundprofile" + suffix + "@example.com")
                .spocNameOfThePerson("Test POC")
                .spocEmail("poc-fp-" + suffix + "@example.com")
                .isActive(true)
                .build());
    }

    private Long seededStateId() {
        return stateRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("No seeded state found"))
                .getId();
    }

    private CreateFundProfileRequest.CreateFundProfileRequestBuilder baseProfile() {
        return CreateFundProfileRequest.builder()
                .fundMode(FundMode.RESTRICTED)
                .fundClass(FundClass.CLASS_A_RESTRICTED)
                .purpose("Fund profile test");
    }

    private static TrancheCriterionItem onSigningCriterion(String amount, LocalDate date, boolean finalTranche) {
        return TrancheCriterionItem.builder()
                .amountCriteria(new BigDecimal(amount))
                .expectedReleaseDate(date)
                .isFinalTranche(finalTranche)
                .criteria(List.of(ReleaseCriterionItem.builder()
                        .releaseCriteria(CriterionType.ON_SIGNING)
                        .build()))
                .build();
    }

    @Test
    @WithMockUser
    void testCreateWithGeographyUtilisationAndDisbursementRule() throws Exception {
        DonorMaster donor = seedDonor("T1");
        Long stateId = seededStateId();

        CreateFundProfileRequest request = baseProfile()
                .geographies(List.of(GeographyItem.builder().stateId(stateId).build()))
                .utilisationRules(List.of(UtilisationRuleItem.builder()
                        .ruleType(RestrictionRuleType.ADMIN_OVERHEAD_COST)
                        .limitPercentage(new BigDecimal("5.00"))
                        .build()))
                .disbursementRules(List.of(DisbursementRuleItem.builder()
                        .totalAmount(new BigDecimal("250000.00"))
                        .disbursementType(DisbursementType.TRANCHES)
                        .trancheCriteria(List.of(
                                onSigningCriterion("150000.00", LocalDate.of(2026, 4, 1), false),
                                onSigningCriterion("100000.00", null, true)))
                        .build()))
                .build();

        mockMvc.perform(post("/api/v1/donors/{donorId}/fund-profiles", donor.getId())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.geographies.length()").value(1))
                .andExpect(jsonPath("$.geographies[0].stateId").value(stateId))
                .andExpect(jsonPath("$.utilisationRules[0].ruleType").value("ADMIN_OVERHEAD_COST"))
                .andExpect(jsonPath("$.disbursementRules.length()").value(1))
                .andExpect(jsonPath("$.disbursementRules[0].totalAmount").value(250000.00))
                .andExpect(jsonPath("$.disbursementRules[0].allocatedAmount").value(250000.00))
                .andExpect(jsonPath("$.disbursementRules[0].balanced").value(true))
                .andExpect(jsonPath("$.disbursementRules[0].trancheCriteria.length()").value(2))
                .andExpect(jsonPath("$.disbursementRules[0].trancheCriteria[0].expectedReleaseDate")
                        .value("2026-04-01"));
    }

    @Test
    @WithMockUser
    void testUpdateReplacesTheChildCollections() throws Exception {
        DonorMaster donor = seedDonor("T2");
        Long stateId = seededStateId();

        CreateFundProfileRequest initial = baseProfile()
                .disbursementRules(List.of(DisbursementRuleItem.builder()
                        .totalAmount(new BigDecimal("400000.00"))
                        .disbursementType(DisbursementType.LUMP_SUM)
                        .trancheCriteria(List.of(onSigningCriterion("400000.00", null, true)))
                        .build()))
                .build();

        String created = mockMvc.perform(post("/api/v1/donors/{donorId}/fund-profiles", donor.getId())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(initial)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long profileId = objectMapper.readTree(created).path("id").asLong();

        CreateFundProfileRequest updated = baseProfile()
                .geographies(List.of(GeographyItem.builder().stateId(stateId).build()))
                .disbursementRules(List.of(DisbursementRuleItem.builder()
                        .totalAmount(new BigDecimal("125000.00"))
                        .disbursementType(DisbursementType.TRANCHES)
                        .trancheCriteria(List.of(
                                onSigningCriterion("50000.00", null, false),
                                onSigningCriterion("75000.00", null, true)))
                        .build()))
                .build();

        mockMvc.perform(put("/api/v1/fund-profiles/{id}", profileId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.geographies.length()").value(1))
                .andExpect(jsonPath("$.disbursementRules.length()").value(1))
                .andExpect(jsonPath("$.disbursementRules[0].disbursementType").value("TRANCHES"))
                .andExpect(jsonPath("$.disbursementRules[0].totalAmount").value(125000.00))
                .andExpect(jsonPath("$.disbursementRules[0].trancheCriteria.length()").value(2));
    }

    @Test
    @WithMockUser
    void testProfileWithNoDisbursementRuleHasEmptyLists() throws Exception {
        DonorMaster donor = seedDonor("T3");

        mockMvc.perform(post("/api/v1/donors/{donorId}/fund-profiles", donor.getId())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(baseProfile().build())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.geographies.length()").value(0))
                .andExpect(jsonPath("$.disbursementRules.length()").value(0));
    }

    @Test
    @WithMockUser
    void testRejectsANonPositiveTrancheAmount() throws Exception {
        DonorMaster donor = seedDonor("T4");

        CreateFundProfileRequest request = baseProfile()
                .disbursementRules(List.of(DisbursementRuleItem.builder()
                        .totalAmount(BigDecimal.ZERO)
                        .disbursementType(DisbursementType.LUMP_SUM)
                        .trancheCriteria(List.of(onSigningCriterion("0.00", null, true)))
                        .build()))
                .build();

        mockMvc.perform(post("/api/v1/donors/{donorId}/fund-profiles", donor.getId())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void testOtherCustomRuleTypeRequiresOtherRuleType() throws Exception {
        DonorMaster donor = seedDonor("T5");

        CreateFundProfileRequest request = baseProfile()
                .utilisationRules(List.of(UtilisationRuleItem.builder()
                        .ruleType(RestrictionRuleType.OTHER_CUSTOM)
                        .limitPercentage(new BigDecimal("10.00"))
                        .build()))
                .build();

        mockMvc.perform(post("/api/v1/donors/{donorId}/fund-profiles", donor.getId())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors['utilisationRules.0.otherRuleType']").exists());
    }

    @Test
    @WithMockUser
    void testMilestoneBasedCriterionRequiresMilestoneFields() throws Exception {
        DonorMaster donor = seedDonor("T6");

        CreateFundProfileRequest request = baseProfile()
                .disbursementRules(List.of(DisbursementRuleItem.builder()
                        .totalAmount(new BigDecimal("100000.00"))
                        .disbursementType(DisbursementType.LUMP_SUM)
                        .trancheCriteria(List.of(TrancheCriterionItem.builder()
                                .amountCriteria(new BigDecimal("100000.00"))
                                .criteria(List.of(ReleaseCriterionItem.builder()
                                        .releaseCriteria(CriterionType.MILESTONE_BASED)
                                        .build()))
                                .build()))
                        .build()))
                .build();

        mockMvc.perform(post("/api/v1/donors/{donorId}/fund-profiles", donor.getId())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(
                        jsonPath("$.errors['disbursementRules.0.trancheCriteria.0.criteria.0.milestoneName']")
                                .exists())
                .andExpect(
                        jsonPath(
                                "$.errors['disbursementRules.0.trancheCriteria.0.criteria.0.verificationSignOffRole']")
                                .exists());
    }

    @Test
    @WithMockUser
    void testReminderOnNonHumanActionedCriterionRejected() throws Exception {
        DonorMaster donor = seedDonor("T7");

        CreateFundProfileRequest request = baseProfile()
                .disbursementRules(List.of(DisbursementRuleItem.builder()
                        .totalAmount(new BigDecimal("100000.00"))
                        .disbursementType(DisbursementType.LUMP_SUM)
                        .trancheCriteria(List.of(TrancheCriterionItem.builder()
                                .amountCriteria(new BigDecimal("100000.00"))
                                .criteria(List.of(ReleaseCriterionItem.builder()
                                        .releaseCriteria(CriterionType.ON_SIGNING)
                                        .remindSomeone(true)
                                        .responsibleRole(VerificationRole.CFO)
                                        .reminderLeadTime(7)
                                        .build()))
                                .build()))
                        .build()))
                .build();

        mockMvc.perform(post("/api/v1/donors/{donorId}/fund-profiles", donor.getId())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(
                        jsonPath("$.errors['disbursementRules.0.trancheCriteria.0.criteria.0.remindSomeone']")
                                .exists());
    }
}
