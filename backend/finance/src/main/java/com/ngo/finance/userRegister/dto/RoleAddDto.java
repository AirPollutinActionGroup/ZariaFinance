package com.ngo.finance.userRegister.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RoleAddDto {
    @NotBlank(message = "Role name is required")
    public String name;
}
