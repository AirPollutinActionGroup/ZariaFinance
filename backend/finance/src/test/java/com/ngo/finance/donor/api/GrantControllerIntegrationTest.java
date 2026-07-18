package com.ngo.finance.donor.api;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ngo.finance.donor.dto.request.CreateGrantRequest;
import com.ngo.finance.donor.entity.DonorFundProfile;
import com.ngo.finance.donor.entity.DonorMaster;
import com.ngo.finance.donor.entity.Programme;
import com.ngo.finance.donor.enums.DonorStatus;
import com.ngo.finance.donor.enums.FundClass;
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
 * Integration test for the redesigned grant API: a grant inherits its donor,
 * programme and class from a fund profile ({@code fundProfileId}), with currency
 * and a locked FX rate. Runs against the seeded DB, so assertions filter by the
 * unique grant code rather than assuming an empty table.
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

    @Test
    @WithMockUser
    void testCreateGrantFromFundProfile_Success() throws Exception {
        DonorMaster donor = donorRepository.save(DonorMaster.builder()
                .donorCode("DN-TEST-1")
                .donorName("Test Donor")
                .donorType("Corporate")
                .fundClass(FundClass.CORPORATE)
                .email("donor@example.com")
                .status(DonorStatus.ACTIVE)
                .isActive(true)
                .build());

        Programme programme = programmeRepository.save(Programme.builder()
                .programmeCode("PGM-TEST-1")
                .programmeName("Test Programme")
                .build());

        DonorFundProfile profile = fundProfileRepository.save(DonorFundProfile.builder()
                .donor(donor)
                .programme(programme)
                .fundMode("Restricted")
                .fundClassCode("A")
                .purpose("Test profile")
                .build());

        CreateGrantRequest request = CreateGrantRequest.builder()
                .grantCode("GR-TEST-1")
                .fundProfileId(profile.getId())
                .agreementName("Test Grant Agreement")
                .agreementDate(LocalDate.of(2026, 1, 1))
                .startDate(LocalDate.of(2026, 1, 2))
                .endDate(LocalDate.of(2026, 12, 31))
                .totalGrantAmount(new BigDecimal("250000.00"))
                .grantCurrency("INR")
                .fxLockedRate(BigDecimal.ONE)
                .description("Integration test grant")
                .build();

        // A grant inherits its donor & programme from the fund profile.
        String createResponse = mockMvc.perform(post("/api/v1/grants")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.grantCode").value("GR-TEST-1"))
                .andExpect(jsonPath("$.donorId").value(donor.getId()))
                .andExpect(jsonPath("$.fundProfileId").value(profile.getId()))
                .andExpect(jsonPath("$.fundClassCode").value("A"))
                .andReturn().getResponse().getContentAsString();

        long grantId = objectMapper.readTree(createResponse).path("id").asLong();

        // A newly created grant is a DRAFT and must NOT surface on the dashboard /
        // search list (issue #21, item 15). Search filters by the unique code, so
        // an empty result confirms the draft is excluded rather than merely absent.
        mockMvc.perform(get("/api/v1/grants").param("search", "GR-TEST-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());

        // Once approved and activated it becomes a live agreement and is listed.
        mockMvc.perform(patch("/api/v1/grants/{id}/approve", grantId).with(csrf()))
                .andExpect(status().isNoContent());
        mockMvc.perform(patch("/api/v1/grants/{id}/activate", grantId).with(csrf()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/grants").param("search", "GR-TEST-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].grantCode").value("GR-TEST-1"));
    }
}
