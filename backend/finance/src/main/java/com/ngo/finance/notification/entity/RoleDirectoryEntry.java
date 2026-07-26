package com.ngo.finance.notification.entity;

import com.ngo.finance.common.entity.AuditEntity;
import com.ngo.finance.donor.enums.ResponsibleRole;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Who currently holds an organisational role, and who deputises for them
 * (Disbursement Rules §5).
 *
 * The deputy is notified only — approval authority does not transfer. Nothing in
 * this class grants permission; it exists purely so a reminder has recipients.
 */
@Entity
@Table(name = "role_directory")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class RoleDirectoryEntry extends AuditEntity {

    @Column(nullable = false, unique = true, length = 30)
    @Enumerated(EnumType.STRING)
    private ResponsibleRole role;

    /** Null until an administrator assigns a holder. */
    @Column(name = "primary_user_id")
    private Long primaryUserId;

    @Column(name = "deputy_user_id")
    private Long deputyUserId;
}
