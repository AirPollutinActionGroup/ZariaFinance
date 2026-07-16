package com.ngo.finance.donor.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ngo.finance.donor.dto.request.CreateDonorRequest;
import com.ngo.finance.donor.enums.DonorType;
import com.ngo.finance.donor.enums.FundSourceDomicile;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class DonorControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    @WithMockUser
    public void testCreateDonor_Success() throws Exception {
        CreateDonorRequest request = new CreateDonorRequest();
        request.setDonorCode("DN-999");
        request.setDonorName("Integration Test Donor");
        request.setDonorType(DonorType.CORPORATE);
        request.setFundSourceDomicile(FundSourceDomicile.DOMESTIC);
        request.setEmail("test@example.com");
        request.setSpocNameOfThePerson("Test SPOC");
        request.setSpocEmail("spoc@example.com");

        mockMvc.perform(post("/api/v1/donors")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.donorCode").value("DN-999"))
                .andExpect(jsonPath("$.donorName").value("Integration Test Donor"))
                .andExpect(jsonPath("$.isActive").value(false));
    }

    @Test
    @WithMockUser
    public void testGetAllDonors_Success() throws Exception {
        mockMvc.perform(get("/api/v1/donors"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
