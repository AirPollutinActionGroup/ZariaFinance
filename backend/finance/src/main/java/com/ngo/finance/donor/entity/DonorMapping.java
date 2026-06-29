package com.ngo.finance.donor.entity;

import com.ngo.finance.common.entity.AuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Donor Mapping entity - maintains mapping between internal and external donor identifiers
 */
@Entity
@Table(name = "donor_mapping")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = "donor", callSuper = true)
@ToString(exclude = "donor")
public class DonorMapping extends AuditEntity {

    @OneToOne
    @JoinColumn(name = "donor_id", nullable = false, unique = true, foreignKey = @ForeignKey(name = "fk_mapping_donor"))
    private DonorMaster donor;

    @Column(length = 100)
    private String externalDonorId;

    @Column(columnDefinition = "TEXT")
    private String mappingMetadata;
}
