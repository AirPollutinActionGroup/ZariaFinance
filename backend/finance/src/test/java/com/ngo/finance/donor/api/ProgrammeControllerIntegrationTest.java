package com.ngo.finance.donor.api;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ngo.finance.donor.dto.request.CreateProgrammeRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class ProgrammeControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    @WithMockUser
    public void testCreateProgramme_Success() throws Exception {
        CreateProgrammeRequest request = CreateProgrammeRequest.builder()
                .programmeCode("PROG-TEST-1")
                .programmeName("Integration Test Programme")
                .description("Created by an integration test")
                .build();

        mockMvc.perform(post("/api/v1/programmes")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.programmeCode").value("PROG-TEST-1"))
                .andExpect(jsonPath("$.programmeName").value("Integration Test Programme"))
                .andExpect(jsonPath("$.isActive").value(true));
    }

    @Test
    @WithMockUser
    public void testCreateProgramme_WithoutCode_AutoGeneratesSequence() throws Exception {
        CreateProgrammeRequest request = CreateProgrammeRequest.builder()
                .programmeName("Auto-coded Programme")
                .build();

        mockMvc.perform(post("/api/v1/programmes")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.programmeCode").value(org.hamcrest.Matchers.matchesPattern("PROG-\\d{3,}")))
                .andExpect(jsonPath("$.programmeName").value("Auto-coded Programme"));
    }

    @Test
    @WithMockUser
    public void testCreateProgramme_DuplicateCode_Fails() throws Exception {
        CreateProgrammeRequest request = CreateProgrammeRequest.builder()
                .programmeCode("PROG-TEST-2")
                .programmeName("First")
                .build();
        mockMvc.perform(post("/api/v1/programmes")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        CreateProgrammeRequest duplicate = CreateProgrammeRequest.builder()
                .programmeCode("PROG-TEST-2")
                .programmeName("Second")
                .build();
        mockMvc.perform(post("/api/v1/programmes")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicate)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.programmeCode").exists());
    }

    @Test
    @WithMockUser
    public void testGetProgrammeById_Success() throws Exception {
        CreateProgrammeRequest request = CreateProgrammeRequest.builder()
                .programmeCode("PROG-TEST-3")
                .programmeName("Fetchable Programme")
                .build();
        String body = mockMvc.perform(post("/api/v1/programmes")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Long id = objectMapper.readTree(body).get("id").asLong();

        mockMvc.perform(get("/api/v1/programmes/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.programmeCode").value("PROG-TEST-3"));
    }

    @Test
    @WithMockUser
    public void testGetProgrammeById_NotFound() throws Exception {
        mockMvc.perform(get("/api/v1/programmes/999999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    public void testGetAllProgrammes_Success() throws Exception {
        mockMvc.perform(get("/api/v1/programmes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser
    public void testActivateDeactivateProgramme_Success() throws Exception {
        CreateProgrammeRequest request = CreateProgrammeRequest.builder()
                .programmeCode("PROG-TEST-4")
                .programmeName("Togglable Programme")
                .build();
        String body = mockMvc.perform(post("/api/v1/programmes")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Long id = objectMapper.readTree(body).get("id").asLong();

        mockMvc.perform(patch("/api/v1/programmes/" + id + "/deactivate").with(csrf()))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/v1/programmes/" + id))
                .andExpect(jsonPath("$.isActive").value(false));

        mockMvc.perform(patch("/api/v1/programmes/" + id + "/activate").with(csrf()))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/v1/programmes/" + id))
                .andExpect(jsonPath("$.isActive").value(true));
    }
}
