package com.ngo.finance.roleDirectory.entity;

import com.ngo.finance.common.entity.AuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Role master entity - represents an organisational role entry in the Role
 * Directory admin screen (role name, short name, and Active/Inactive status)
 */
@Entity
@Table(name = "role_master")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleMaster extends AuditEntity {

    @Column(name = "role_name", nullable = false, unique = true, length = 255)
    private String roleName;

    @Column(name = "short_name", nullable = false, unique = true, length = 50)
    private String shortName;

    @Column(name = "user_limit", nullable = false, length = 50)
    private String userLimit;

    /** One of PermissionRole's values — which frontend permission tier
     * accounts holding this role are granted at login. */
    @Column(name = "permission_role", nullable = false, length = 30)
    private String permissionRole;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private Boolean status = true;
}
