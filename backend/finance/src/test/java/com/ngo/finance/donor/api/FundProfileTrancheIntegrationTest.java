package com.ngo.finance.donor.api;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ngo.finance.donor.dto.request.CreateFundProfileRequest;
import com.ngo.finance.donor.entity.DonorMaster;
import com.ngo.finance.donor.enums.DonorType;
import com.ngo.finance.donor.repository.DonorRepository;
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
 * The fund profile's tranche plan, which supplies the read-only Total Grant
 * Amount on the New Grant Agreement Form.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class FundProfileTrancheIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private DonorRepository donorRepository;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    private DonorMaster seedDonor(String suffix) {
        return donorRepository.save(DonorMaster.builder()
                .donorCode("DN-TR-" + suffix)
                .donorName("Tranche Donor " + suffix)
                .donorType(DonorType.CORPORATE)
                .email("tranche" + suffix + "@example.com")
                .spocNameOfThePerson("Test POC")
                .spocEmail("poc-tr-" + suffix + "@example.com")
                .isActive(true)
                .build());
    }

    private CreateFundProfileRequest profileWith(List<CreateFundProfileRequest.TrancheItem> tranches) {
        return CreateFundProfileRequest.builder()
                .fundMode("Restricted")
                .fundClassCode("A")
                .purpose("Tranche plan test")
                .tranches(tranches)
                .build();
    }

    private static CreateFundProfileRequest.TrancheItem tranche(String name, String amount, LocalDate date) {
        return CreateFundProfileRequest.TrancheItem.builder()
                .trancheName(name)
                .trancheAmount(new BigDecimal(amount))
                .plannedReleaseDate(date)
                .build();
    }

    @Test
    @WithMockUser
    void testPlannedTotalIsTheSumOfTheTranchePlan() throws Exception {
        DonorMaster donor = seedDonor("T1");

        mockMvc.perform(post("/api/v1/donors/{donorId}/fund-profiles", donor.getId())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(profileWith(List.of(
                                tranche("On signing", "150000.00", LocalDate.of(2026, 4, 1)),
                                tranche("On UC", "100000.00", null))))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.plannedTotalAmount").value(250000.00))
                .andExpect(jsonPath("$.tranches.length()").value(2))
                // Numbers are positional, assigned in list order.
                .andExpect(jsonPath("$.tranches[0].trancheNumber").value(1))
                .andExpect(jsonPath("$.tranches[0].plannedReleaseDate").value("2026-04-01"))
                .andExpect(jsonPath("$.tranches[1].trancheNumber").value(2));
    }

    @Test
    @WithMockUser
    void testUpdateReplacesThePlanAndRenumbersIt() throws Exception {
        DonorMaster donor = seedDonor("T2");

        String created = mockMvc.perform(post("/api/v1/donors/{donorId}/fund-profiles", donor.getId())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(profileWith(List.of(
                                tranche("Only tranche", "400000.00", null))))))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long profileId = objectMapper.readTree(created).path("id").asLong();

        // Replacing the plan reuses tranche number 1 while the old row is still
        // pending deletion — the (profile, number) uniqueness must be deferred,
        // otherwise Hibernate's insert-before-orphan-delete ordering fails here.
        mockMvc.perform(put("/api/v1/fund-profiles/{id}", profileId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(profileWith(List.of(
                                tranche("New first", "50000.00", null),
                                tranche("New second", "75000.00", null))))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.plannedTotalAmount").value(125000.00))
                .andExpect(jsonPath("$.tranches.length()").value(2))
                .andExpect(jsonPath("$.tranches[0].trancheName").value("New first"))
                .andExpect(jsonPath("$.tranches[0].trancheNumber").value(1))
                .andExpect(jsonPath("$.tranches[1].trancheNumber").value(2));
    }

    @Test
    @WithMockUser
    void testProfileWithNoTranchePlanTotalsZero() throws Exception {
        DonorMaster donor = seedDonor("T3");

        mockMvc.perform(post("/api/v1/donors/{donorId}/fund-profiles", donor.getId())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(profileWith(List.of()))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.plannedTotalAmount").value(0))
                .andExpect(jsonPath("$.tranches.length()").value(0));
    }

    @Test
    @WithMockUser
    void testRejectsANonPositiveTrancheAmount() throws Exception {
        DonorMaster donor = seedDonor("T4");

        mockMvc.perform(post("/api/v1/donors/{donorId}/fund-profiles", donor.getId())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(profileWith(List.of(
                                tranche("Zero", "0.00", null))))))
                .andExpect(status().isBadRequest());
    }
}
