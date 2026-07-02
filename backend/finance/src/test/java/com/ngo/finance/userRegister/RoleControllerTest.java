package com.ngo.finance.userRegister;

import com.ngo.finance.userRegister.controller.RoleController;
import com.ngo.finance.userRegister.dto.RoleDto;
import com.ngo.finance.userRegister.service.RoleService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RoleController.class)
class RoleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RoleService roleService;

    @Test
    void createRole_returnsCreated_whenValidRequest() throws Exception {
        RoleDto dto = new RoleDto();
        dto.setId(1L);
        dto.setName("ADMIN");
        when(roleService.registerUser(any())).thenReturn(dto);

        mockMvc.perform(post("/api/roles")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"ADMIN\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("ADMIN"));
    }
}