package com.ngo.finance.fundsuggestion.api;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ngo.finance.fundsuggestion.dto.request.UpdateFundSuggestionWeightsRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@WithMockUser
public class FundSuggestionWeightsIntegrationTest {

    private static final String URL = "/api/v1/debit-notes/fund-suggestions/weights";

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    private ResultActions putWeights(UpdateFundSuggestionWeightsRequest body) throws Exception {
        return mockMvc.perform(put(URL).with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)));
    }

    private static UpdateFundSuggestionWeightsRequest.UpdateFundSuggestionWeightsRequestBuilder weights() {
        return UpdateFundSuggestionWeightsRequest.builder()
                .programmeMatch(30).coversAmount(30).restrictedForProgramme(10).expiryMax(20).hasGrant(0)
                .unrestricted(-5).expiryWindowDays(120).reason("Tune for year-end").actor("Tester");
    }

    @Test
    public void testWeights_ReadChangeAndReset() throws Exception {
        mockMvc.perform(get(URL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.defaults.programmeMatch").value(40))
                .andExpect(jsonPath("$.defaults.expiryWindowDays").value(90));

        putWeights(weights().build())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.weights.programmeMatch").value(30))
                .andExpect(jsonPath("$.weights.expiryWindowDays").value(120))
                .andExpect(jsonPath("$.changeReason").value("Tune for year-end"))
                .andExpect(jsonPath("$.updatedBy").value("Tester"));
        mockMvc.perform(get(URL)).andExpect(jsonPath("$.weights.coversAmount").value(30));

        mockMvc.perform(post(URL + "/reset").with(csrf()).param("actor", "Tester"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.weights.programmeMatch").value(40))
                .andExpect(jsonPath("$.changeReason").value("Reset to defaults"));
    }

    @Test
    public void testWeights_RejectedOutsideTheRules() throws Exception {
        putWeights(weights().programmeMatch(101).build()).andExpect(status().isBadRequest());
        putWeights(weights().unrestricted(5).build()).andExpect(status().isBadRequest());
        putWeights(weights().expiryWindowDays(0).build()).andExpect(status().isBadRequest());
        putWeights(weights().reason(" ").build()).andExpect(status().isBadRequest());
        putWeights(weights().programmeMatch(0).coversAmount(0).restrictedForProgramme(0).expiryMax(0).hasGrant(0).build())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("above zero")));
    }
}
