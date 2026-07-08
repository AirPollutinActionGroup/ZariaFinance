package com.ngo.finance.userRegister.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserRegisterDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String emailId;
    private String mobileNo;
    private String username;
    private String password;
    private String role;
    private Boolean status;
}