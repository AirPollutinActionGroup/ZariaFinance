package com.ngo.finance.userRegisterNew.entity;

import com.ngo.finance.common.entity.AuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Extended registration entity — standalone from the legacy userRegister
 * module's `users` table. Stores the applicant's account details together
 * with the selected Role Directory role and Organisation as plain FK id
 * columns (repo convention, see role_master_user.user_id).
 */
@Entity
@Table(name = "user_register_new")
@Getter
@Setter
public class UserRegisterNew extends AuditEntity {

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "email_id", nullable = false, unique = true)
    private String emailId;

    @Column(name = "mobile_no", nullable = false, unique = true, length = 10)
    private String mobileNo;

    @Column(nullable = false, unique = true, length = 20)
    private String username;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(name = "role_id", nullable = false)
    private Long roleId;

    @Column(name = "organization_id", nullable = false)
    private Long organizationId;

    @Column(name = "approved_by", nullable = true)
    private Long approvedBy;

    @Column(name = "is_approved", nullable = false)
    private Integer isApproved = 2; // 1 = approved, 2 = pending, 3 = rejected

    @Column(nullable = false)
    private Boolean status = true;
}
