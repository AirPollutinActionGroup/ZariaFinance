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
 * Join entity assigning a user to a role_master entry
 */
@Entity
@Table(name = "role_master_user")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleMasterUser extends AuditEntity {

    @Column(name = "role_master_id", nullable = false)
    private Long roleMasterId;

    @Column(name = "user_id", nullable = false)
    private Long userId;
}
