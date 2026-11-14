package com.ngo.finance.employee.api;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ngo.finance.donor.repository.StateRepository;
import com.ngo.finance.employee.dto.request.CreateEmployeeRequest;
import com.ngo.finance.masters.designation.entity.Designation;
import com.ngo.finance.masters.designation.repository.DesignationRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class EmployeeControllerIntegrationTest {

    private static final byte[] PDF = "%PDF-1.4 integration test".getBytes();

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private DesignationRepository designationRepository;

    @Autowired
    private StateRepository stateRepository;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    private CreateEmployeeRequest.CreateEmployeeRequestBuilder baseRequest() {
        Designation designation = designationRepository.findAll().get(0);
        return CreateEmployeeRequest.builder()
                .empId("EMP-IT-01")
                .name("Integration Test Employee")
                .departmentId(designation.getDepartmentId())
                .designationId(designation.getId())
                .bucket("Admin")
                .stateIds(List.of(stateRepository.findAll().get(0).getId()))
                .joiningDate(LocalDate.of(2026, 1, 1))
                .annualCtc(new BigDecimal("500000"))
                .employmentType("Permanent")
                .pf("Yes")
                .esi("No")
                .gratuity("Yes");
    }

    private long createEmployee(CreateEmployeeRequest request) throws Exception {
        String body = mockMvc.perform(post("/api/v1/employees")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(body).get("id").asLong();
    }

    @Test
    @WithMockUser
    void create_savesPanAndBankDetails_upperCasingPanAndIfsc() throws Exception {
        long id = createEmployee(baseRequest()
                .panNumber("abcde1234f")
                .accountHolderName("Integration Test Employee")
                .bankName("HDFC Bank")
                .accountType("Savings")
                .accountNumber("123456789012")
                .ifscCode("hdfc0000123")
                .branchName("Connaught Place")
                .build());

        mockMvc.perform(get("/api/v1/employees/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.panNumber").value("ABCDE1234F"))
                .andExpect(jsonPath("$.ifscCode").value("HDFC0000123"))
                .andExpect(jsonPath("$.accountNumber").value("123456789012"))
                .andExpect(jsonPath("$.accountType").value("Savings"))
                .andExpect(jsonPath("$.documents").isEmpty());
    }

    @Test
    @WithMockUser
    void create_rejectsAMalformedPanOrIfsc() throws Exception {
        mockMvc.perform(post("/api/v1/employees")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(baseRequest()
                                .panNumber("ABC123").ifscCode("HDFC123").build())))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void documents_canBeUploadedListedDownloadedAndRemoved() throws Exception {
        long id = createEmployee(baseRequest().build());
        String url = "/api/v1/employees/" + id + "/documents/PAN_CARD";

        mockMvc.perform(multipart(url)
                        .file(new MockMultipartFile("file", "pan.pdf", "application/pdf", PDF))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.type").value("PAN_CARD"))
                .andExpect(jsonPath("$.fileName").value("pan.pdf"));

        mockMvc.perform(get("/api/v1/employees/" + id))
                .andExpect(jsonPath("$.documents[0].type").value("PAN_CARD"))
                .andExpect(jsonPath("$.documents[0].label").value("PAN Card"))
                .andExpect(jsonPath("$.documents[0].sizeBytes").value(PDF.length));

        mockMvc.perform(get(url))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"))
                .andExpect(content().bytes(PDF));

        mockMvc.perform(delete(url).with(csrf())).andExpect(status().isNoContent());
        mockMvc.perform(get(url)).andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void documents_rejectAFileThatIsNotPdfJpgOrPng() throws Exception {
        long id = createEmployee(baseRequest().build());

        mockMvc.perform(multipart("/api/v1/employees/" + id + "/documents/AADHAAR_CARD")
                        .file(new MockMultipartFile("file", "aadhaar.pdf", "application/pdf", "hello".getBytes()))
                        .with(csrf()))
                .andExpect(status().isBadRequest());
    }
}
