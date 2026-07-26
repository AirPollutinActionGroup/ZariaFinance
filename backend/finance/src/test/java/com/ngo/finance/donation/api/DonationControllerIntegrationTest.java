package com.ngo.finance.donation.api;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ngo.finance.donation.dto.request.CreateDonationRequest;
import com.ngo.finance.donation.enums.DonationBankAccountType;
import com.ngo.finance.donation.enums.DonationChannel;
import com.ngo.finance.donation.enums.DonationType;
import com.ngo.finance.donation.enums.DonorIdentification;
import com.ngo.finance.donation.enums.FundMode;
import com.ngo.finance.donation.enums.UtilisationPeriodType;
import com.ngo.finance.donor.entity.DonorMaster;
import com.ngo.finance.donor.entity.StateMaster;
import com.ngo.finance.donor.enums.DonorType;
import com.ngo.finance.donor.enums.FundSourceDomicile;
import com.ngo.finance.donor.repository.DonorRepository;
import com.ngo.finance.donor.repository.StateRepository;
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
 * Integration test for the donation register + intake API. Runs against the
 * seeded DB (states + tenant_tax_config are seeded by migration), so
 * assertions filter by the unique donation code rather than assuming an
 * empty table.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class DonationControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private DonorRepository donorRepository;

    @Autowired
    private StateRepository stateRepository;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Test
    @WithMockUser
    void testCreateNamedMajorGiftDonation_Success() throws Exception {
        DonorMaster donor = donorRepository.save(DonorMaster.builder()
                .donorCode("DN-DON-TEST-1")
                .donorName("Test Donation Donor")
                .donorType(DonorType.INDIVIDUAL)
                .email("donor-donation-test@example.com")
                .spocNameOfThePerson("Test Contact")
                .spocEmail("donor-donation-test@example.com")
                .fundSourceDomicile(FundSourceDomicile.DOMESTIC)
                .panCardNumber("ABCDE1234F")
                .address("14 Nehru Park, New Delhi 110021")
                .isActive(true)
                .build());

        StateMaster state = stateRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("No seeded state found"));

        CreateDonationRequest request = CreateDonationRequest.builder()
                .donationType(DonationType.MAJOR_GIFT)
                .receiptDate(LocalDate.of(2026, 4, 12))
                .channel(DonationChannel.BANK_TRANSFER)
                .identification(DonorIdentification.NAMED)
                .donorId(donor.getId())
                .fundMode(FundMode.RESTRICTED)
                .stateIds(List.of(state.getId()))
                .utilisationPeriodType(UtilisationPeriodType.SINGLE_FY)
                .currency("INR")
                .amount(new BigDecimal("2500000"))
                .bankAccountType(DonationBankAccountType.DOMESTIC_CURRENT)
                .transactionRef("UTR-TEST-1")
                .build();

        mockMvc.perform(post("/api/v1/donations")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.donationType").value("MAJOR_GIFT"))
                .andExpect(jsonPath("$.donorId").value(donor.getId()))
                .andExpect(jsonPath("$.book").value("LC"))
                .andExpect(jsonPath("$.recognitionStatus").value("INCOME_RECOGNISED"))
                .andExpect(jsonPath("$.donationCode").exists());

        // Robust against seeded data: filter the register by donor id.
        mockMvc.perform(get("/api/v1/donations").param("donorId", donor.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].donorName").value("Test Donation Donor"));
    }

    @Test
    @WithMockUser
    void testCreateAnonymousRecurringDonation_Blocked() throws Exception {
        StateMaster state = stateRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("No seeded state found"));

        CreateDonationRequest request = CreateDonationRequest.builder()
                .donationType(DonationType.RECURRING)
                .receiptDate(LocalDate.of(2026, 4, 12))
                .channel(DonationChannel.UPI)
                .identification(DonorIdentification.ANONYMOUS)
                .anonymousCollectionSource("Donation box")
                .anonymousSourceReference("Box #2, HQ lobby")
                .fundMode(FundMode.UNRESTRICTED)
                .stateIds(List.of(state.getId()))
                .utilisationPeriodType(UtilisationPeriodType.SINGLE_FY)
                .currency("INR")
                .amount(new BigDecimal("2500"))
                .bankAccountType(DonationBankAccountType.DOMESTIC_CURRENT)
                .build();

        mockMvc.perform(post("/api/v1/donations")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.donationType").exists());
    }
}
