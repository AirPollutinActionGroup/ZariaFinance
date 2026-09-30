package com.ngo.finance.inflowbudget.api;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ngo.finance.common.enums.ContributionType;
import com.ngo.finance.donor.dto.request.CreateFundProfileRequest;
import com.ngo.finance.donor.dto.request.CreateFundProfileRequest.DisbursementRuleItem;
import com.ngo.finance.donor.dto.request.CreateFundProfileRequest.ReleaseCriterionItem;
import com.ngo.finance.donor.dto.request.CreateFundProfileRequest.TrancheCriterionItem;
import com.ngo.finance.donor.entity.DonorMaster;
import com.ngo.finance.donor.enums.CriterionType;
import com.ngo.finance.donor.enums.DisbursementType;
import com.ngo.finance.donor.enums.FundClass;
import com.ngo.finance.donor.enums.FundMode;
import com.ngo.finance.donor.repository.DonorRepository;
import com.ngo.finance.masters.donortype.repository.DonorTypeMasterRepository;
import com.ngo.finance.outflow.dto.RefDto;
import com.ngo.finance.outflow.dto.request.CreateCreditNoteRequest;
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
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

/**
 * Money received as a credit note shows up as Received on the Inflow Budget:
 * on the tranche the note names, or — for a lump sum — on the fund's earliest line.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@WithMockUser
public class InflowBudgetCreditNoteIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private DonorRepository donorRepository;

    @Autowired
    private DonorTypeMasterRepository donorTypeMasterRepository;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    private ResultActions post(String url, Object body) throws Exception {
        return mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(url)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)));
    }

    private static TrancheCriterionItem tranche(String amount, LocalDate date, boolean last) {
        return TrancheCriterionItem.builder()
                .amountCriteria(new BigDecimal(amount))
                .expectedReleaseDate(date)
                .isFinalTranche(last)
                .criteria(List.of(ReleaseCriterionItem.builder().releaseCriteria(CriterionType.ON_SIGNING).build()))
                .build();
    }

    private CreateCreditNoteRequest.CreateCreditNoteRequestBuilder credit(String amount, DonorMaster donor, long fundId) {
        return CreateCreditNoteRequest.builder()
                .date(LocalDate.of(2026, 9, 29))
                .amount(new BigDecimal(amount))
                .book(ContributionType.LC)
                .paymentMode(new RefDto("1", "NEFT"))
                .donor(new RefDto(String.valueOf(donor.getId()), donor.getDonorName()))
                .fundProfile(new RefDto(String.valueOf(fundId), "Inflow test fund"))
                .reference("UTR-1")
                .actor("Tester");
    }

    @Test
    public void testCreditNotes_ShowAsReceivedOnTheirInflowLine() throws Exception {
        DonorMaster donor = donorRepository.save(DonorMaster.builder()
                .donorCode("DN-INF-1")
                .donorName("Inflow Donor")
                .donorType(donorTypeMasterRepository.searchByName("Corporate CSR").get(0))
                .email("inflow@example.com")
                .spocNameOfThePerson("Test POC")
                .spocEmail("poc-inflow@example.com")
                .isActive(true)
                .build());

        CreateFundProfileRequest profile = CreateFundProfileRequest.builder()
                .fundMode(FundMode.RESTRICTED)
                .fundClass(FundClass.CLASS_A_RESTRICTED)
                .purpose("Inflow credit note test")
                .disbursementRules(List.of(DisbursementRuleItem.builder()
                        .totalAmount(new BigDecimal("1000.00"))
                        .disbursementType(DisbursementType.TRANCHES)
                        .trancheCriteria(List.of(
                                tranche("600.00", LocalDate.of(2026, 9, 1), false),
                                tranche("400.00", LocalDate.of(2026, 12, 1), true)))
                        .build()))
                .build();
        JsonNode created = objectMapper.readTree(post("/api/v1/donors/" + donor.getId() + "/fund-profiles", profile)
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString());
        long fundId = created.get("id").asLong();
        JsonNode criteria = created.get("disbursementRules").get(0).get("trancheCriteria");
        long first = criteria.get(0).get("id").asLong();
        long second = criteria.get(1).get("id").asLong();

        // Nothing received yet.
        mockMvc.perform(get("/api/v1/inflow-budget/" + second)).andExpect(jsonPath("$.actualAmount").doesNotExist());

        // A credit note on the second tranche…
        post("/api/v1/credit-notes", credit("250", donor, fundId)
                .disbursementType("Tranches")
                .tranche(new RefDto(String.valueOf(second), "Tranche 2"))
                .build())
                .andExpect(status().isCreated());
        mockMvc.perform(get("/api/v1/inflow-budget/" + second))
                .andExpect(jsonPath("$.actualAmount").value(250))
                .andExpect(jsonPath("$.actualDate").value("2026-09-29"))
                .andExpect(jsonPath("$.receiptRef").value("UTR-1"))
                .andExpect(jsonPath("$.receiptNo").value(org.hamcrest.Matchers.matchesPattern("CN-2026-\\d{3}")))
                .andExpect(jsonPath("$.receipts.length()").value(1))
                .andExpect(jsonPath("$.receipts[0].amount").value(250))
                .andExpect(jsonPath("$.receipts[0].reference").value("UTR-1"))
                .andExpect(jsonPath("$.receipts[0].creditNoteId").value(org.hamcrest.Matchers.matchesPattern("CN-2026-\\d{3}")));

        // …and a lump-sum one (no tranche) lands on the fund's earliest line.
        post("/api/v1/credit-notes", credit("100", donor, fundId).disbursementType("Lump Sum").build())
                .andExpect(status().isCreated());
        mockMvc.perform(get("/api/v1/inflow-budget/" + first)).andExpect(jsonPath("$.actualAmount").value(100));
        mockMvc.perform(get("/api/v1/inflow-budget/" + second)).andExpect(jsonPath("$.actualAmount").value(250));

        // The list agrees with the detail.
        mockMvc.perform(get("/api/v1/inflow-budget"))
                .andExpect(jsonPath("$[?(@.id == " + first + ")].actualAmount").value(100))
                .andExpect(jsonPath("$[?(@.id == " + second + ")].actualAmount").value(250));
    }
}
