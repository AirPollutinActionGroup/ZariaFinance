package com.ngo.finance.donor.api;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ngo.finance.donation.enums.FundMode;
import com.ngo.finance.donor.dto.request.ApproveGrantRequest;
import com.ngo.finance.donor.dto.request.CreateGrantRequest;
import com.ngo.finance.donor.dto.request.GrantRemarksRequest;
import com.ngo.finance.donor.entity.DonorDisbursementRule;
import com.ngo.finance.donor.entity.DonorFundProfile;
import com.ngo.finance.donor.entity.DonorMaster;
import com.ngo.finance.donor.entity.DonorReleaseCriteria;
import com.ngo.finance.donor.entity.DonorTrancheCriterion;
import com.ngo.finance.donor.entity.Programme;
import com.ngo.finance.donor.enums.CriterionType;
import com.ngo.finance.donor.enums.DisbursementType;
import com.ngo.finance.donor.enums.DonorType;
import com.ngo.finance.donor.enums.FundClass;
import com.ngo.finance.donor.enums.GrantStatus;
import com.ngo.finance.donor.repository.DonorFundProfileRepository;
import com.ngo.finance.donor.repository.DonorRepository;
import com.ngo.finance.donor.repository.ProgrammeRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration test for the grant lifecycle API: a grant inherits its donor,
 * programme, class and total from a fund profile ({@code fundProfileId}) — the
 * total being Σ of that profile's tranche plan — with a currency and a locked FX
 * rate.
 *
 * Two independent state fields, matching the two Status dropdowns on the New
 * Grant Agreement Form: {@code status} (ACTIVE / COMPLETED / CANCELLED, section
 * 1) with {@code isActive} as its boolean mirror, and the approval workflow
 * {@code isApproved} (1 = approved, 2 = pending, 3 = on hold, 4 = completed,
 * section 3). A grant can be ACTIVE while approval is still pending.
 *
 * Runs against the seeded DB, so assertions filter by the unique grant code
 * rather than assuming an empty table.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class GrantControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private DonorRepository donorRepository;

    @Autowired
    private ProgrammeRepository programmeRepository;

    @Autowired
    private DonorFundProfileRepository fundProfileRepository;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    /** Seeds a donor + programme + fund profile that grants can be created from. */
    private DonorFundProfile seedFundProfile(String suffix) {
        DonorMaster donor = donorRepository.save(DonorMaster.builder()
                .donorCode("DN-TEST-" + suffix)
                .donorName("Test Donor " + suffix)
                .donorType(DonorType.CORPORATE)
                .email("donor" + suffix + "@example.com")
                .spocNameOfThePerson("Test POC")
                .spocEmail("poc" + suffix + "@example.com")
                .isActive(true)
                .build());

        Programme programme = programmeRepository.save(Programme.builder()
                .programmeCode("PGM-TEST-" + suffix)
                .programmeName("Test Programme " + suffix)
                .build());

        DonorFundProfile profile = DonorFundProfile.builder()
                .donor(donor)
                .programme(programme)
                .fundMode(FundMode.RESTRICTED)
                .fundClass(FundClass.CLASS_A_RESTRICTED)
                .purpose("Test profile")
                .build();

        // A grant's total is its active disbursement rule's committed amount, so
        // every profile a grant is created from needs one. 250,000 here.
        DonorDisbursementRule rule = DonorDisbursementRule.builder()
                .fundProfile(profile)
                .totalAmount(new BigDecimal("250000.00"))
                .disbursementType(DisbursementType.TRANCHES)
                .build();

        DonorTrancheCriterion first = new DonorTrancheCriterion();
        first.setDonorDisbursementRule(rule);
        first.setAmountCriteria(new BigDecimal("150000.00"));
        DonorReleaseCriteria firstCriterion = new DonorReleaseCriteria();
        firstCriterion.setDonorTrancheCriterion(first);
        firstCriterion.setReleaseCriteria(CriterionType.ON_SIGNING);
        first.getDonorReleaseCriteria().add(firstCriterion);
        rule.getDonorTrancheCriteria().add(first);

        DonorTrancheCriterion second = new DonorTrancheCriterion();
        second.setDonorDisbursementRule(rule);
        second.setAmountCriteria(new BigDecimal("100000.00"));
        DonorReleaseCriteria secondCriterion = new DonorReleaseCriteria();
        secondCriterion.setDonorTrancheCriterion(second);
        secondCriterion.setReleaseCriteria(CriterionType.UTILISATION_CERTIFICATE);
        second.getDonorReleaseCriteria().add(secondCriterion);
        rule.getDonorTrancheCriteria().add(second);

        profile.getDisbursementRules().add(rule);

        return fundProfileRepository.save(profile);
    }

    private CreateGrantRequest.CreateGrantRequestBuilder grantRequestBuilder(String code, Long fundProfileId) {
        return CreateGrantRequest.builder()
                .grantCode(code)
                .fundProfileId(fundProfileId)
                .agreementName("Test Grant Agreement " + code)
                .agreementDate(LocalDate.of(2026, 1, 1))
                .startDate(LocalDate.of(2026, 1, 2))
                .endDate(LocalDate.of(2026, 12, 31))
                // No totalGrantAmount: it is inherited from the fund profile.
                .status(GrantStatus.ACTIVE)
                .grantCurrency("INR")
                .fxLockedRate(BigDecimal.ONE);
    }

    private long createGrant(String code, Long fundProfileId) throws Exception {
        String response = mockMvc.perform(post("/api/v1/grants")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(grantRequestBuilder(code, fundProfileId).build())))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).path("id").asLong();
    }

    @Test
    @WithMockUser
    void testCreateGrantFromFundProfile_Success() throws Exception {
        DonorFundProfile profile = seedFundProfile("C1");

        mockMvc.perform(post("/api/v1/grants")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                grantRequestBuilder("GR-TEST-C1", profile.getId())
                                        .description("Integration test grant")
                                        .build())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.grantCode").value("GR-TEST-C1"))
                .andExpect(jsonPath("$.donorId").value(profile.getDonor().getId()))
                .andExpect(jsonPath("$.fundProfileId").value(profile.getId()))
                .andExpect(jsonPath("$.fundClassCode").value("CLASS_A_RESTRICTED"))
                // Total is inherited: Σ of the profile's tranche plan (150k + 100k).
                .andExpect(jsonPath("$.totalGrantAmount").value(250000.00))
                .andExpect(jsonPath("$.reportingAmountInr").value(250000.00))
                // New grants start pending approval and active — no more DRAFT status.
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.isApproved").value(2))
                .andExpect(jsonPath("$.isActive").value(true));

        // A newly created grant is immediately visible in list/search — there is no
        // more DRAFT-hiding now that grantStatus is gone.
        mockMvc.perform(get("/api/v1/grants").param("search", "GR-TEST-C1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].grantCode").value("GR-TEST-C1"));
    }

    @Test
    @WithMockUser
    void testGetGrantById_Success() throws Exception {
        DonorFundProfile profile = seedFundProfile("C2");
        long id = createGrant("GR-TEST-C2", profile.getId());

        mockMvc.perform(get("/api/v1/grants/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.grantCode").value("GR-TEST-C2"));
    }

    @Test
    @WithMockUser
    void testGetGrantById_NotFound() throws Exception {
        mockMvc.perform(get("/api/v1/grants/{id}", 999_999L))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void testUpdateGrant_Success() throws Exception {
        DonorFundProfile profile = seedFundProfile("C3");
        long id = createGrant("GR-TEST-C3", profile.getId());

        CreateGrantRequest update = grantRequestBuilder("GR-TEST-C3-IGNORED", profile.getId())
                .agreementName("Updated Agreement Name")
                .build();

        mockMvc.perform(put("/api/v1/grants/{id}", id)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                // grantCode is immutable — the request's code is ignored on update.
                .andExpect(jsonPath("$.grantCode").value("GR-TEST-C3"))
                .andExpect(jsonPath("$.agreementName").value("Updated Agreement Name"))
                // Still inherited from the profile, not settable by the client.
                .andExpect(jsonPath("$.totalGrantAmount").value(250000.00));
    }

    @Test
    @WithMockUser
    void testCreateGrant_RejectsMissingStatus() throws Exception {
        DonorFundProfile profile = seedFundProfile("C11");

        CreateGrantRequest noStatus = grantRequestBuilder("GR-TEST-C11", profile.getId())
                .status(null)
                .build();

        mockMvc.perform(post("/api/v1/grants")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(noStatus)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.status").exists());
    }

    @Test
    @WithMockUser
    void testGrantStatus_EnteredOnFormAndMirroredByIsActive() throws Exception {
        DonorFundProfile profile = seedFundProfile("C12");
        long id = createGrant("GR-TEST-C12", profile.getId());

        // COMPLETED and CANCELLED are not live, so the boolean mirror flips.
        for (GrantStatus status : new GrantStatus[] { GrantStatus.COMPLETED, GrantStatus.CANCELLED }) {
            mockMvc.perform(put("/api/v1/grants/{id}", id)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    grantRequestBuilder("GR-TEST-C12", profile.getId()).status(status).build())))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value(status.name()))
                    .andExpect(jsonPath("$.isActive").value(false));
        }

        mockMvc.perform(put("/api/v1/grants/{id}", id)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                grantRequestBuilder("GR-TEST-C12", profile.getId())
                                        .status(GrantStatus.ACTIVE).build())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.isActive").value(true));
    }

    @Test
    @WithMockUser
    void testApprovalBlockOnCreateAndUpdate() throws Exception {
        DonorFundProfile profile = seedFundProfile("C13");

        // Section 3 of the form writes approval directly, independent of status.
        String response = mockMvc.perform(post("/api/v1/grants")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                grantRequestBuilder("GR-TEST-C13", profile.getId())
                                        .approvalStatus(1)
                                        .approvalDate(LocalDate.of(2026, 1, 20))
                                        .approvalRemarks("Signed off at board meeting")
                                        .build())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.isApproved").value(1))
                .andExpect(jsonPath("$.approvalDate").value("2026-01-20T00:00:00"))
                .andExpect(jsonPath("$.approvalRemarks").value("Signed off at board meeting"))
                // Approval is independent of the agreement status.
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andReturn().getResponse().getContentAsString();

        long id = objectMapper.readTree(response).path("id").asLong();

        // An update that omits the approval block leaves it intact.
        mockMvc.perform(put("/api/v1/grants/{id}", id)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                grantRequestBuilder("GR-TEST-C13", profile.getId()).build())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isApproved").value(1))
                .andExpect(jsonPath("$.approvalRemarks").value("Signed off at board meeting"));
    }

    @Test
    @WithMockUser
    void testCreateGrant_RejectsApprovalStatusOutsideWorkflow() throws Exception {
        DonorFundProfile profile = seedFundProfile("C14");

        mockMvc.perform(post("/api/v1/grants")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                grantRequestBuilder("GR-TEST-C14", profile.getId())
                                        .approvalStatus(9)
                                        .build())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.approvalStatus").exists());
    }

    @Test
    @WithMockUser
    void testListGrants_FiltersByDonorProgrammeAndSearch() throws Exception {
        DonorFundProfile profile = seedFundProfile("C4");
        createGrant("GR-TEST-C4", profile.getId());

        mockMvc.perform(get("/api/v1/grants").param("donorId", profile.getDonor().getId().toString()))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("GR-TEST-C4")));

        mockMvc.perform(get("/api/v1/grants").param("programmeId", profile.getProgramme().getId().toString()))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("GR-TEST-C4")));

        mockMvc.perform(get("/api/v1/grants").param("search", "GR-TEST-C4"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].grantCode").value("GR-TEST-C4"));

        mockMvc.perform(get("/api/v1/grants"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("GR-TEST-C4")));
    }

    @Test
    @WithMockUser
    void testApprovalWorkflow_ApproveHoldResumeComplete() throws Exception {
        DonorFundProfile profile = seedFundProfile("C5");
        long id = createGrant("GR-TEST-C5", profile.getId());

        // Pending by default.
        mockMvc.perform(get("/api/v1/grants/{id}", id))
                .andExpect(jsonPath("$.isApproved").value(2));

        // approve: pending -> approved, captures approver/remarks/date.
        ApproveGrantRequest approveRequest = ApproveGrantRequest.builder()
                .approvedBy(42L)
                .remarks("Looks good")
                .build();
        mockMvc.perform(patch("/api/v1/grants/{id}/approve", id)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(approveRequest)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/grants/{id}", id))
                .andExpect(jsonPath("$.isApproved").value(1))
                .andExpect(jsonPath("$.approvedBy").value(42))
                .andExpect(jsonPath("$.approvalRemarks").value("Looks good"))
                .andExpect(jsonPath("$.approvalDate").exists());

        // hold: approved -> on hold, remarks updated.
        GrantRemarksRequest holdRequest = GrantRemarksRequest.builder()
                .remarks("Paused pending donor clarification")
                .build();
        mockMvc.perform(patch("/api/v1/grants/{id}/hold", id)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(holdRequest)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/grants/{id}", id))
                .andExpect(jsonPath("$.isApproved").value(3))
                .andExpect(jsonPath("$.approvalRemarks").value("Paused pending donor clarification"));

        // resume: on hold -> approved.
        mockMvc.perform(patch("/api/v1/grants/{id}/resume", id).with(csrf()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/grants/{id}", id))
                .andExpect(jsonPath("$.isApproved").value(1));

        // complete: approved -> completed (terminal).
        mockMvc.perform(patch("/api/v1/grants/{id}/complete", id).with(csrf()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/grants/{id}", id))
                .andExpect(jsonPath("$.isApproved").value(4))
                // Completing the workflow also settles the agreement status.
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    @Test
    @WithMockUser
    void testCloseAndActivate_ToggleStatusAndIsActive() throws Exception {
        DonorFundProfile profile = seedFundProfile("C6");
        long id = createGrant("GR-TEST-C6", profile.getId());

        // New grants are active by default.
        mockMvc.perform(get("/api/v1/grants/{id}", id))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.isActive").value(true));

        // close: always succeeds, regardless of approval state.
        mockMvc.perform(patch("/api/v1/grants/{id}/close", id).with(csrf()))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/v1/grants/{id}", id))
                .andExpect(jsonPath("$.status").value("CANCELLED"))
                .andExpect(jsonPath("$.isActive").value(false));

        // activate: blocked while still pending (never approved) — guarded no-op.
        mockMvc.perform(patch("/api/v1/grants/{id}/activate", id).with(csrf()))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/v1/grants/{id}", id))
                .andExpect(jsonPath("$.status").value("CANCELLED"))
                .andExpect(jsonPath("$.isActive").value(false));

        // Once approved, activate succeeds.
        mockMvc.perform(patch("/api/v1/grants/{id}/approve", id).with(csrf()))
                .andExpect(status().isNoContent());
        mockMvc.perform(patch("/api/v1/grants/{id}/activate", id).with(csrf()))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/v1/grants/{id}", id))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.isActive").value(true));
    }

    @Test
    @WithMockUser
    void testApproveGrant_NoOpWhenAlreadyApproved() throws Exception {
        DonorFundProfile profile = seedFundProfile("C7");
        long id = createGrant("GR-TEST-C7", profile.getId());

        mockMvc.perform(patch("/api/v1/grants/{id}/approve", id).with(csrf()))
                .andExpect(status().isNoContent());
        // Approving again is a guarded no-op (isApproved stays 1, no error).
        mockMvc.perform(patch("/api/v1/grants/{id}/approve", id).with(csrf()))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/v1/grants/{id}", id))
                .andExpect(jsonPath("$.isApproved").value(1));
    }

    @Test
    @WithMockUser
    void testHoldGrant_NoOpWhenPending() throws Exception {
        DonorFundProfile profile = seedFundProfile("C8");
        long id = createGrant("GR-TEST-C8", profile.getId());

        // Never approved — hold is a guarded no-op.
        mockMvc.perform(patch("/api/v1/grants/{id}/hold", id).with(csrf()))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/v1/grants/{id}", id))
                .andExpect(jsonPath("$.isApproved").value(2));
    }

    @Test
    @WithMockUser
    void testResumeGrant_NoOpWhenNotOnHold() throws Exception {
        DonorFundProfile profile = seedFundProfile("C9");
        long id = createGrant("GR-TEST-C9", profile.getId());
        mockMvc.perform(patch("/api/v1/grants/{id}/approve", id).with(csrf()))
                .andExpect(status().isNoContent());

        // Approved, not on hold — resume is a guarded no-op.
        mockMvc.perform(patch("/api/v1/grants/{id}/resume", id).with(csrf()))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/v1/grants/{id}", id))
                .andExpect(jsonPath("$.isApproved").value(1));
    }

    @Test
    @WithMockUser
    void testCompleteGrant_NoOpWhenPending() throws Exception {
        DonorFundProfile profile = seedFundProfile("C10");
        long id = createGrant("GR-TEST-C10", profile.getId());

        // Never approved — complete is a guarded no-op.
        mockMvc.perform(patch("/api/v1/grants/{id}/complete", id).with(csrf()))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/v1/grants/{id}", id))
                .andExpect(jsonPath("$.isApproved").value(2));
    }
}
