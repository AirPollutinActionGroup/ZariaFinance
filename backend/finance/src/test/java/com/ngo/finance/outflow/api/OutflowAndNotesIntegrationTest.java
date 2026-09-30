package com.ngo.finance.outflow.api;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.matchesPattern;
import static org.hamcrest.Matchers.not;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ngo.finance.budget.dto.request.BudgetLineRequest;
import com.ngo.finance.budget.dto.request.SaveBudgetRequest;
import com.ngo.finance.budget.enums.BudgetType;
import com.ngo.finance.common.enums.ContributionType;
import com.ngo.finance.financialYear.entity.FinancialYear;
import com.ngo.finance.financialYear.repository.FinancialYearRepository;
import com.ngo.finance.outflow.dto.RefDto;
import com.ngo.finance.outflow.dto.request.CreateCreditNoteRequest;
import com.ngo.finance.outflow.dto.request.CreateDebitNoteRequest;
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
public class OutflowAndNotesIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProgrammeRepository programmeRepository;

    @Autowired
    private FinancialYearRepository financialYearRepository;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    /** Q1 row (₹1,000) and Q2 row (₹500) of the approved budget's only line. */
    private String q1Row;
    private String q2Row;
    private String draftBudgetCode;

    @BeforeEach
    void setUp() throws Exception {
        Long programmeId = programmeRepository.save(Programme.builder()
                .programmeCode("PRG-OUTFLOW-IT").programmeName("Outflow IT Programme").build()).getId();
        Long fyId = financialYearRepository.findAllByOrderByStartDateAsc().stream()
                .filter(fy -> fy.getStartDate().getYear() == 2026)
                .findFirst()
                .orElseGet(() -> financialYearRepository.save(FinancialYear.builder()
                        .code("FY 2026-27").startDate(LocalDate.of(2026, 4, 1)).endDate(LocalDate.of(2027, 3, 31)).build()))
                .getId();

        SaveBudgetRequest budget = SaveBudgetRequest.builder()
                .name("Outflow IT budget")
                .financialYearId(fyId)
                .budgetType(BudgetType.PROGRAMME)
                .programmeId(programmeId)
                .lines(List.of(BudgetLineRequest.builder()
                        .categoryId(1L).description("Salaries").book(ContributionType.LC)
                        .q1(new BigDecimal("1000")).q2(new BigDecimal("500")).build()))
                .submit(true)
                .actor("Tester")
                .build();
        String approvedCode = objectMapper.readTree(post("/api/v1/budgets", budget).andReturn().getResponse().getContentAsString())
                .get("budgetCode").asText();
        Long approvedId = budgetIdOf(approvedCode);
        mockMvc.perform(patch("/api/v1/budgets/" + approvedId + "/approve").with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{}")).andExpect(status().isOk());
        q1Row = approvedCode + "-BL01-Q1";
        q2Row = approvedCode + "-BL01-Q2";

        budget.setSubmit(false);
        draftBudgetCode = objectMapper.readTree(post("/api/v1/budgets", budget).andReturn().getResponse().getContentAsString())
                .get("budgetCode").asText();
    }

    private Long budgetIdOf(String code) throws Exception {
        String body = mockMvc.perform(get("/api/v1/budgets")).andReturn().getResponse().getContentAsString();
        for (var node : objectMapper.readTree(body)) {
            if (code.equals(node.get("budgetCode").asText())) {
                return node.get("id").asLong();
            }
        }
        throw new IllegalStateException("budget " + code + " not listed");
    }

    private ResultActions post(String url, Object body) throws Exception {
        return mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(url)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)));
    }

    private static CreateDebitNoteRequest debit(String row, String amount, String reason) {
        return CreateDebitNoteRequest.builder()
                .outflowLineId(row)
                .date(LocalDate.of(2026, 6, 10))
                .amount(new BigDecimal(amount))
                .reason(reason)
                .book(ContributionType.LC)
                .payeeCategory("VENDOR")
                .payee(new RefDto("PAYEE-003", "Apex Solar Technologies Pvt Ltd"))
                .paymentMode(new RefDto("1", "NEFT"))
                .group(new RefDto("2", "Programme Expenses"))
                .actor("Tester")
                .build();
    }

    private static CreateCreditNoteRequest credit(String amount) {
        return CreateCreditNoteRequest.builder()
                .date(LocalDate.of(2026, 7, 1))
                .amount(new BigDecimal(amount))
                .book(ContributionType.LC)
                .paymentMode(new RefDto("1", "NEFT"))
                .actor("Tester")
                .build();
    }

    private String issueDebit(String row, String amount) throws Exception {
        String body = post("/api/v1/debit-notes", debit(row, amount, null))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(body).get("id").asText();
    }

    @Test
    public void testOutflow_RowsComeFromApprovedBudgetsOnly() throws Exception {
        mockMvc.perform(get("/api/v1/outflow-budget").param("financialYear", "2026-27"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id", hasItem(q1Row)))
                .andExpect(jsonPath("$[*].id", hasItem(q2Row)))
                .andExpect(jsonPath("$[*].id", not(hasItem(q1Row.replace("-Q1", "-Q3"))))) // nothing phased into Q3
                .andExpect(jsonPath("$[*].budgetCode", not(hasItem(draftBudgetCode))));

        mockMvc.perform(get("/api/v1/outflow-budget/" + q2Row))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.expectedDate").value("2026-09-30"))
                .andExpect(jsonPath("$.expectedAmount").value(500))
                .andExpect(jsonPath("$.spent").value(0))
                .andExpect(jsonPath("$.quarterLabel").value("Q2 (Jul–Sep)"));

        mockMvc.perform(get("/api/v1/outflow-budget/" + draftBudgetCode + "-BL01-Q1")).andExpect(status().isBadRequest());
        mockMvc.perform(get("/api/v1/outflow-budget/not-a-row")).andExpect(status().isNotFound());
    }

    @Test
    public void testDebitNotes_AddToSpentAndNeedReasonWhenOverBudget() throws Exception {
        post("/api/v1/debit-notes", debit(q1Row, "400", null))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(matchesPattern("DN-2026-\\d{3}")))
                .andExpect(jsonPath("$.outflowLineId").value(q1Row))
                .andExpect(jsonPath("$.payee.name").value("Apex Solar Technologies Pvt Ltd"));

        mockMvc.perform(get("/api/v1/outflow-budget/" + q1Row))
                .andExpect(jsonPath("$.debitTotal").value(400))
                .andExpect(jsonPath("$.remaining").value(600));

        // 400 + 700 > 1000 → over budget: a reason is required.
        post("/api/v1/debit-notes", debit(q1Row, "700", null)).andExpect(status().isBadRequest());
        post("/api/v1/debit-notes", debit(q1Row, "700", "ADDITIONAL_CHARGE"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.reason").value("ADDITIONAL_CHARGE"));
        mockMvc.perform(get("/api/v1/outflow-budget/" + q1Row))
                .andExpect(jsonPath("$.remaining").value(-100))
                .andExpect(jsonPath("$.status").value("PAID"));

        // Bad requests: unknown row, draft budget row, missing payee.
        post("/api/v1/debit-notes", debit("BUD-2026-999-BL01-Q1", "1", null)).andExpect(status().isBadRequest());
        post("/api/v1/debit-notes", debit(draftBudgetCode + "-BL01-Q1", "1", null)).andExpect(status().isBadRequest());
        CreateDebitNoteRequest noPayee = debit(q1Row, "1", null);
        noPayee.setPayee(null);
        post("/api/v1/debit-notes", noPayee).andExpect(status().isBadRequest());
    }

    @Test
    public void testCreditNotes_NotTiedToARow_DontChangeSpent() throws Exception {
        issueDebit(q1Row, "300");

        post("/api/v1/credit-notes", credit("5000"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(matchesPattern("CN-2026-\\d{3}")))
                .andExpect(jsonPath("$.outflowLineId").doesNotExist())
                .andExpect(jsonPath("$.debitNoteId").doesNotExist());

        mockMvc.perform(get("/api/v1/outflow-budget/" + q1Row))
                .andExpect(jsonPath("$.debitTotal").value(300))
                .andExpect(jsonPath("$.creditTotal").doesNotExist())
                .andExpect(jsonPath("$.spent").value(300));

        // A fund needs a donor.
        CreateCreditNoteRequest noDonor = credit("10");
        noDonor.setFundProfile(new RefDto("1", "Air quality fund"));
        post("/api/v1/credit-notes", noDonor).andExpect(status().isBadRequest());
    }

    @Test
    public void testNotes_ListedAndFetchedByCode_NoCancelWorkflow() throws Exception {
        String dn = issueDebit(q2Row, "250");

        mockMvc.perform(get("/api/v1/debit-notes")).andExpect(jsonPath("$[*].id", hasItem(dn)));
        mockMvc.perform(get("/api/v1/debit-notes/" + dn))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(250))
                .andExpect(jsonPath("$.status").doesNotExist())
                .andExpect(jsonPath("$.cancelNote").doesNotExist());
        mockMvc.perform(get("/api/v1/debit-notes/DN-1999-999")).andExpect(status().isNotFound());

        // There is no cancel endpoint any more.
        mockMvc.perform(patch("/api/v1/debit-notes/" + dn + "/cancel").with(csrf()))
                .andExpect(result -> org.junit.jupiter.api.Assertions.assertTrue(
                        result.getResponse().getStatus() >= 400, "cancel should not be available"));
        mockMvc.perform(get("/api/v1/outflow-budget/" + q2Row)).andExpect(jsonPath("$.spent").value(250));
    }

    @Test
    public void testDebitNote_CantBeMoreThanTheFundHasAvailable() throws Exception {
        RefDto donor = new RefDto("77", "Balance Donor");
        RefDto fund = new RefDto("9001", "Balance test fund");

        // Nothing received into the fund yet → no debit can be charged to it.
        CreateDebitNoteRequest first = debit(q1Row, "1", null);
        first.setDonor(donor);
        first.setFundProfile(fund);
        post("/api/v1/debit-notes", first).andExpect(status().isBadRequest());

        // ₹300 received as a credit note → up to ₹300 can go out.
        CreateCreditNoteRequest received = credit("300");
        received.setDonor(donor);
        received.setFundProfile(fund);
        post("/api/v1/credit-notes", received).andExpect(status().isCreated());

        CreateDebitNoteRequest tooMuch = debit(q1Row, "301", null);
        tooMuch.setDonor(donor);
        tooMuch.setFundProfile(fund);
        post("/api/v1/debit-notes", tooMuch)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("300")));

        CreateDebitNoteRequest exact = debit(q1Row, "300", null);
        exact.setDonor(donor);
        exact.setFundProfile(fund);
        post("/api/v1/debit-notes", exact).andExpect(status().isCreated());

        // Fully used now.
        CreateDebitNoteRequest more = debit(q1Row, "1", null);
        more.setDonor(donor);
        more.setFundProfile(fund);
        post("/api/v1/debit-notes", more).andExpect(status().isBadRequest());

        // A debit not charged to any fund isn't limited by a fund balance.
        post("/api/v1/debit-notes", debit(q1Row, "50", null)).andExpect(status().isCreated());
    }
}
