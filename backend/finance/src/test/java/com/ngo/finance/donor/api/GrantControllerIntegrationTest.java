package com.ngo.finance.donor.api;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ngo.finance.donor.dto.request.CreateGrantRequest;
import com.ngo.finance.donor.entity.DonorMaster;
import com.ngo.finance.donor.entity.Programme;
import com.ngo.finance.donor.enums.FundClass;
import com.ngo.finance.donor.repository.DonorRepository;
import com.ngo.finance.donor.repository.ProgrammeRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

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

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    @WithMockUser
    void testCreateAndListGrants_Success() throws Exception {
        DonorMaster donor = donorRepository.save(DonorMaster.builder()
                .donorCode("DN-TEST-1")
                .donorName("Test Donor")
                .donorType("Corporate")
                .fundClass(FundClass.CORPORATE)
                .email("donor@example.com")
                .build());

        Programme programme = programmeRepository.save(Programme.builder()
                .programmeCode("PGM-TEST-1")
                .programmeName("Test Programme")
                .build());

        CreateGrantRequest request = CreateGrantRequest.builder()
                .grantCode("GR-TEST-1")
                .donorId(donor.getId())
                .programmeId(programme.getId())
                .agreementName("Test Grant Agreement")
                .agreementDate(LocalDate.of(2026, 1, 1))
                .startDate(LocalDate.of(2026, 1, 2))
                .endDate(LocalDate.of(2026, 12, 31))
                .totalGrantAmount(new BigDecimal("250000.00"))
                .fundClass(FundClass.CORPORATE)
                .description("Integration test grant")
                .build();

        mockMvc.perform(post("/api/v1/grants")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.grantCode").value("GR-TEST-1"))
                .andExpect(jsonPath("$.donorId").value(donor.getId()))
                .andExpect(jsonPath("$.programmeId").value(programme.getId()));

        mockMvc.perform(get("/api/v1/grants"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].grantCode").value("GR-TEST-1"));
    }
}
