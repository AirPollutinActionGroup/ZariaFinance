package com.ngo.finance.userRegister;

import com.ngo.finance.config.SecurityConfig;
import com.ngo.finance.userRegister.controller.UserLoginController;
import com.ngo.finance.userRegisterNew.dto.response.UserRegisterResponse;
import com.ngo.finance.userRegisterNew.service.UserRegisterNewService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserLoginController.class)
@Import(SecurityConfig.class)
class UserLoginControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserRegisterNewService userRegisterNewService;

    @Test
    void login_returnsOk_whenCredentialsValid() throws Exception {
        UserRegisterResponse response = UserRegisterResponse.builder()
                .id(1L)
                .username("testuser")
                .permissionRole("FINANCE_OFFICER")
                .build();
        when(userRegisterNewService.login("testuser", "password")).thenReturn(response);

        mockMvc.perform(post("/api/userLogin")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"testuser\",\"password\":\"password\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.permissionRole").value("FINANCE_OFFICER"));
    }
}
