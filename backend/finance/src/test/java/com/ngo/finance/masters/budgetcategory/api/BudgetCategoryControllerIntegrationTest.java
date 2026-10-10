package com.ngo.finance.masters.budgetcategory.api;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ngo.finance.masters.budgetcategory.dto.request.CreateBudgetCategoryRequest;
import com.ngo.finance.masters.budgetcategory.dto.request.UpdateBudgetCategoryRequest;
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
public class BudgetCategoryControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private Long create(String name) throws Exception {
        String body = mockMvc.perform(post("/api/v1/budget-categories")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                CreateBudgetCategoryRequest.builder().name(name).build())))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        JsonNode json = objectMapper.readTree(body);
        return json.get("id").asLong();
    }

    @Test
    @WithMockUser
    public void testListIncludesSeededCategories() throws Exception {
        mockMvc.perform(get("/api/v1/budget-categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.name == 'Personnel')].status").value("ACTIVE"))
                .andExpect(jsonPath("$[?(@.name == 'Admin & overheads')].id").exists())
                .andExpect(jsonPath("$[0].code").doesNotExist());
    }

    @Test
    @WithMockUser
    public void testCreate_TidiesName() throws Exception {
        CreateBudgetCategoryRequest request = CreateBudgetCategoryRequest.builder()
                .name("  Training   & capacity building ")
                .description("Workshops and courses")
                .build();

        mockMvc.perform(post("/api/v1/budget-categories")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Training & capacity building"))
                .andExpect(jsonPath("$.description").value("Workshops and courses"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    @WithMockUser
    public void testCreate_DuplicateNameIgnoringCase_Fails() throws Exception {
        mockMvc.perform(post("/api/v1/budget-categories")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                CreateBudgetCategoryRequest.builder().name("travel").build())))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    public void testCreate_BlankName_Fails() throws Exception {
        mockMvc.perform(post("/api/v1/budget-categories")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                CreateBudgetCategoryRequest.builder().name("   ").build())))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    public void testUpdate_RenamesKeepingId() throws Exception {
        Long id = create("Field logistics");

        mockMvc.perform(put("/api/v1/budget-categories/" + id)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                UpdateBudgetCategoryRequest.builder().name("Field logistics & transport").build())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Field logistics & transport"))
                .andExpect(jsonPath("$.id").value(id));
    }

    @Test
    @WithMockUser
    public void testDeactivateThenActivate() throws Exception {
        Long id = create("Temporary head");

        mockMvc.perform(patch("/api/v1/budget-categories/" + id + "/deactivate").with(csrf()))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/v1/budget-categories/" + id))
                .andExpect(jsonPath("$.status").value("INACTIVE"));

        mockMvc.perform(patch("/api/v1/budget-categories/" + id + "/activate").with(csrf()))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/v1/budget-categories/" + id))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    @WithMockUser
    public void testGetUnknown_Returns404() throws Exception {
        mockMvc.perform(get("/api/v1/budget-categories/999999"))
                .andExpect(status().isNotFound());
    }
}
