package com.ngo.finance.notification.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.ngo.finance.donor.enums.ResponsibleRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Who holds an organisational role and who deputises. Used for both reading and
 * writing the directory; names are resolved on read only.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RoleDirectoryEntryDto {

    private ResponsibleRole role;

    private String roleLabel;

    private Long primaryUserId;

    private String primaryUserName;

    private Long deputyUserId;

    private String deputyUserName;
}
