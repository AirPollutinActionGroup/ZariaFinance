package com.ngo.finance.userRegister;

import com.ngo.finance.config.SecurityConfig;
import com.ngo.finance.userRegister.controller.UserLoginController;
import com.ngo.finance.userRegister.dto.UserRegisterDto;
import com.ngo.finance.userRegister.service.LoginService;
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
    private LoginService loginService;

    @Test
    void login_returnsOk_whenCredentialsValid() throws Exception {
        UserRegisterDto dto = new UserRegisterDto();
        dto.setId(1L);
        dto.setUsername("testuser");
        when(loginService.login("testuser", "password")).thenReturn(dto);

        mockMvc.perform(post("/api/userLogin")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"testuser\",\"password\":\"password\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("testuser"));
    }
}