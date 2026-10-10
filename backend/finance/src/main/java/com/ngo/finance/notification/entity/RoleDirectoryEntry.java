package com.ngo.finance.notification.entity;

import com.ngo.finance.common.entity.AuditEntity;
import com.ngo.finance.masters.designation.entity.Designation;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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

    @ManyToOne
    @JoinColumn(name = "designation_id", nullable = false, unique = true,
            foreignKey = @ForeignKey(name = "fk_role_directory_designation"))
    private Designation designation;

    /** Null until an administrator assigns a holder. */
    @Column(name = "primary_user_id")
    private Long primaryUserId;

    @Column(name = "deputy_user_id")
    private Long deputyUserId;
}
