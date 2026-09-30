package com.ngo.finance.employeeallocation.api;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ngo.finance.employee.dto.request.CreateEmployeeRequest;
import com.ngo.finance.employeeallocation.dto.request.CreateEmployeeAllocationRequest;
import com.ngo.finance.programme.ProgrammeTypes;
import com.ngo.finance.programme.dto.request.CreateProgrammeRequest;
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

/**
 * An allocation is made against a Program alone, or against a Project under
 * that Program — the Project is optional (V120).
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@WithMockUser
public class EmployeeAllocationControllerIntegrationTest {

    // Seeded by V8 / V70 / V71: a state, and a designation under its department.
    private static final long SEED_STATE_ID = 1L;
    private static final long SEED_DEPARTMENT_ID = 1L;
    private static final long SEED_DESIGNATION_ID = 1L;

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    private Long employeeId;
    private Long programId;
    private Long projectId;

    @BeforeEach
    void setUp() throws Exception {
        employeeId = createAndGetId("/api/v1/employees", CreateEmployeeRequest.builder()
                .empId("EMP-ALLOC-TEST")
                .name("Allocation Test Employee")
                .departmentId(SEED_DEPARTMENT_ID)
                .designationId(SEED_DESIGNATION_ID)
                .bucket("Project")
                .stateIds(List.of(SEED_STATE_ID))
                .joiningDate(LocalDate.of(2025, 4, 1))
                .annualCtc(new BigDecimal("600000"))
                .employmentType("Permanent")
                .pf("Yes")
                .esi("No")
                .gratuity("Yes")
                .build());
        programId = createProgramme("Allocation Test Program", ProgrammeTypes.PROGRAMME, null);
        projectId = createProgramme("Allocation Test Project", ProgrammeTypes.PROJECT, programId);
    }

    @Test
    public void testCreateAllocation_ProgramOnly_Success() throws Exception {
        postAllocation(allocation(programId, null, 40))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.programmeId").value(programId))
                .andExpect(jsonPath("$.projectId").doesNotExist())
                .andExpect(jsonPath("$.projectName").doesNotExist())
                .andExpect(jsonPath("$.allocationPct").value(40));
    }

    @Test
    public void testCreateAllocation_ProgramAndProject_Success() throws Exception {
        postAllocation(allocation(programId, projectId, 60))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.programmeId").value(programId))
                .andExpect(jsonPath("$.projectId").value(projectId))
                .andExpect(jsonPath("$.projectName").value("Allocation Test Project"));
    }

    @Test
    public void testCreateAllocation_ProjectUnderAnotherProgram_Fails() throws Exception {
        Long otherProgramId = createProgramme("Other Test Program", ProgrammeTypes.PROGRAMME, null);

        postAllocation(allocation(otherProgramId, projectId, 40))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.projectId").exists());
    }

    @Test
    public void testCreateAllocation_ProjectAsProgram_Fails() throws Exception {
        postAllocation(allocation(projectId, null, 40))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.programmeId").exists());
    }

    private CreateEmployeeAllocationRequest allocation(Long programmeId, Long projectId, int pct) {
        return CreateEmployeeAllocationRequest.builder()
                .employeeId(employeeId)
                .programmeId(programmeId)
                .projectId(projectId)
                .allocationPct(pct)
                .build();
    }

    private ResultActions postAllocation(CreateEmployeeAllocationRequest request) throws Exception {
        return mockMvc.perform(post("/api/v1/employee-allocations")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));
    }

    private Long createProgramme(String name, String type, Long parentProgrammeId) throws Exception {
        return createAndGetId("/api/v1/programmes", CreateProgrammeRequest.builder()
                .programmeName(name)
                .type(type)
                .parentProgrammeId(parentProgrammeId)
                .build());
    }

    private Long createAndGetId(String url, Object request) throws Exception {
        String body = mockMvc.perform(post(url)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(body).get("id").asLong();
    }
}
