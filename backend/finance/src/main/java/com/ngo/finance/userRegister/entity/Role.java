package com.ngo.finance.userRegister.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.NotBlank;

@Entity

@Table(name = "roles")

@Getter

@Setter
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @NotBlank(message = "Role name is required")
    @Column(name = "name", nullable = false, unique = true)
    public String name;

}