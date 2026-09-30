package com.ngo.finance.budget.api;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.matchesPattern;
import static org.hamcrest.Matchers.not;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ngo.finance.budget.dto.request.BudgetLineRequest;
import com.ngo.finance.budget.dto.request.BudgetTransitionRequest;
import com.ngo.finance.budget.dto.request.SaveBudgetRequest;
import com.ngo.finance.budget.enums.BudgetType;
import com.ngo.finance.common.enums.ContributionType;
import com.ngo.finance.financialYear.entity.FinancialYear;
import com.ngo.finance.financialYear.repository.FinancialYearRepository;
import com.ngo.finance.programme.entity.Programme;
import com.ngo.finance.programme.repository.ProgrammeRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
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
public class BudgetControllerIntegrationTest {

    /** V109 seeds budget categories 1 Personnel … 6 Admin & overheads. */
    private static final long PERSONNEL = 1L;
    private static final long TRAVEL = 4L;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProgrammeRepository programmeRepository;

    @Autowired
    private FinancialYearRepository financialYearRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private Long programmeId;

    /** Id of the 2026-27 Financial Year master row (seeded, or created here). */
    private Long fy2026Id;

    @BeforeEach
    void setUp() {
        programmeId = programmeRepository.save(Programme.builder()
                .programmeCode("PRG-BUDGET-IT")
                .programmeName("Budget IT Programme")
                .build()).getId();
        fy2026Id = financialYearRepository.findAllByOrderByStartDateAsc().stream()
                .filter(fy -> fy.getStartDate().getYear() == 2026)
                .findFirst()
                .orElseGet(() -> financialYearRepository.save(FinancialYear.builder()
                        .code("FY 2026-27")
                        .startDate(LocalDate.of(2026, 4, 1))
                        .endDate(LocalDate.of(2027, 3, 31))
                        .build()))
                .getId();
    }

    private static BudgetLineRequest line(long categoryId, String description, String q1, String q2) {
        return BudgetLineRequest.builder()
                .categoryId(categoryId)
                .description(description)
                .book(ContributionType.LC)
                .q1(new BigDecimal(q1))
                .q2(new BigDecimal(q2))
                .build();
    }

    private SaveBudgetRequest programmeBudget(List<BudgetLineRequest> lines) {
        return SaveBudgetRequest.builder()
                .name("  Clean   Air FY budget ")
                .financialYearId(fy2026Id)
                .budgetType(BudgetType.PROGRAMME)
                .programmeId(programmeId)
                .owner("Programme Finance")
                .lines(lines)
                .actor("Tester")
                .build();
    }

    private ResultActions postBudget(SaveBudgetRequest request) throws Exception {
        return mockMvc.perform(post("/api/v1/budgets")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));
    }

    private Long createDraft() throws Exception {
        String body = postBudget(programmeBudget(List.of(
                        line(PERSONNEL, "Salaries", "1000", "500"),
                        line(TRAVEL, "Field visits", "200", "0"))))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(body).get("id").asLong();
    }

    private ResultActions move(Long id, String action, String note) throws Exception {
        return mockMvc.perform(patch("/api/v1/budgets/" + id + "/" + action)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                        BudgetTransitionRequest.builder().note(note).actor("Controller").build())));
    }

    @Test
    public void testCreate_DraftWithNumberedLinesAndTotals() throws Exception {
        postBudget(programmeBudget(List.of(
                        line(PERSONNEL, "Salaries", "1000", "500"),
                        line(TRAVEL, "Field visits", "200", "0"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.budgetCode").value(matchesPattern("BUD-2026-\\d{3}")))
                .andExpect(jsonPath("$.name").value("Clean Air FY budget"))
                .andExpect(jsonPath("$.financialYear").value("2026-27"))
                .andExpect(jsonPath("$.financialYearId").value(fy2026Id))
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.scope").value("Budget IT Programme"))
                .andExpect(jsonPath("$.total").value(1700))
                .andExpect(jsonPath("$.lineCount").value(2))
                .andExpect(jsonPath("$.lines[0].lineCode").value("BL-01"))
                .andExpect(jsonPath("$.lines[0].categoryName").value("Personnel"))
                .andExpect(jsonPath("$.lines[1].total").value(200))
                .andExpect(jsonPath("$.history[0].status").value("DRAFT"))
                .andExpect(jsonPath("$.history[0].by").value("Tester"));
    }

    @Test
    public void testCreate_SubmitTrue_SavesAsSubmitted() throws Exception {
        SaveBudgetRequest request = programmeBudget(List.of(line(PERSONNEL, "Salaries", "10", "0")));
        request.setSubmit(true);
        postBudget(request)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("SUBMITTED"))
                .andExpect(jsonPath("$.history[*].status", contains("DRAFT", "SUBMITTED")));
    }

    @Test
    public void testCreate_OrganisationBudgetNeedsNoProgramme() throws Exception {
        SaveBudgetRequest request = programmeBudget(List.of(line(PERSONNEL, "Admin staff", "10", "0")));
        request.setBudgetType(BudgetType.ORGANISATION);
        request.setProgrammeId(null);
        postBudget(request)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.scope").value("Organisation-wide"))
                .andExpect(jsonPath("$.programmeId").doesNotExist());
    }

    @Test
    public void testCreate_RejectsInvalidInput() throws Exception {
        SaveBudgetRequest noProgramme = programmeBudget(List.of(line(PERSONNEL, "Salaries", "10", "0")));
        noProgramme.setProgrammeId(null);
        postBudget(noProgramme).andExpect(status().isBadRequest());

        postBudget(programmeBudget(List.of(line(PERSONNEL, "Nothing phased", "0", "0"))))
                .andExpect(status().isBadRequest());

        postBudget(programmeBudget(List.of(line(PERSONNEL, "Negative", "-5", "10"))))
                .andExpect(status().isBadRequest());

        postBudget(programmeBudget(List.of(line(999_999L, "Unknown category", "10", "0"))))
                .andExpect(status().isBadRequest());

        postBudget(programmeBudget(List.of())).andExpect(status().isBadRequest());

        SaveBudgetRequest unknownFy = programmeBudget(List.of(line(PERSONNEL, "Salaries", "10", "0")));
        unknownFy.setFinancialYearId(999_999L);
        postBudget(unknownFy).andExpect(status().isBadRequest());

        Long closedFyId = financialYearRepository.save(FinancialYear.builder()
                .code("FY-IT-CLOSED")
                .startDate(LocalDate.of(2010, 4, 1))
                .endDate(LocalDate.of(2011, 3, 31))
                .build()).getId();
        SaveBudgetRequest closedFy = programmeBudget(List.of(line(PERSONNEL, "Salaries", "10", "0")));
        closedFy.setFinancialYearId(closedFyId);
        postBudget(closedFy).andExpect(status().isBadRequest());
    }

    @Test
    public void testUpdate_ReplacesAndRenumbersLines() throws Exception {
        Long id = createDraft();
        SaveBudgetRequest update = programmeBudget(List.of(line(TRAVEL, "Only travel now", "300", "0")));
        update.setName("Renamed");

        mockMvc.perform(put("/api/v1/budgets/" + id)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Renamed"))
                .andExpect(jsonPath("$.lineCount").value(1))
                .andExpect(jsonPath("$.lines[0].lineCode").value("BL-01"))
                .andExpect(jsonPath("$.lines[0].categoryName").value("Travel"))
                .andExpect(jsonPath("$.total").value(300));
    }

    @Test
    public void testWorkflow_RejectReviseApprove() throws Exception {
        Long id = createDraft();

        move(id, "submit", null).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("SUBMITTED"));
        move(id, "reject", " ").andExpect(status().isBadRequest()); // reason required
        move(id, "reject", "Too high").andExpect(status().isOk()).andExpect(jsonPath("$.status").value("REJECTED"));

        // Revising a rejected budget puts it back to Draft; submitting again works.
        mockMvc.perform(put("/api/v1/budgets/" + id)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                programmeBudget(List.of(line(PERSONNEL, "Salaries", "800", "0"))))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DRAFT"));
        move(id, "submit", null).andExpect(status().isOk());
        move(id, "approve", "Board approved").andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"))
                .andExpect(jsonPath("$.history[*].status",
                        contains("DRAFT", "SUBMITTED", "REJECTED", "DRAFT", "SUBMITTED", "APPROVED")))
                .andExpect(jsonPath("$.history[2].note").value("Too high"));

        // Approved is final.
        move(id, "withdraw", null).andExpect(status().isBadRequest());
        mockMvc.perform(put("/api/v1/budgets/" + id)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                programmeBudget(List.of(line(PERSONNEL, "Salaries", "1", "0"))))))
                .andExpect(status().isBadRequest());
        mockMvc.perform(delete("/api/v1/budgets/" + id).with(csrf())).andExpect(status().isBadRequest());
    }

    @Test
    public void testWithdraw_AndDeleteDraft() throws Exception {
        Long id = createDraft();
        move(id, "submit", null).andExpect(status().isOk());
        move(id, "withdraw", null).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("DRAFT"));

        mockMvc.perform(delete("/api/v1/budgets/" + id).with(csrf())).andExpect(status().isNoContent());
        mockMvc.perform(get("/api/v1/budgets/" + id)).andExpect(status().isNotFound());
    }

    @Test
    public void testList_FiltersAndCategoryUsage() throws Exception {
        Long id = createDraft();

        mockMvc.perform(get("/api/v1/budgets").param("financialYear", "2026-27").param("status", "DRAFT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id", hasItem(id.intValue())))
                .andExpect(jsonPath("$[0].lines").doesNotExist());

        mockMvc.perform(get("/api/v1/budgets").param("financialYear", "2027-28"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id", not(hasItem(id.intValue()))));

        mockMvc.perform(get("/api/v1/budgets").param("search", "budget it programme"))
                .andExpect(jsonPath("$[*].id", hasItem(id.intValue())));

        mockMvc.perform(get("/api/v1/budgets/category-usage"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$['" + PERSONNEL + "']").isNumber());
    }
}
