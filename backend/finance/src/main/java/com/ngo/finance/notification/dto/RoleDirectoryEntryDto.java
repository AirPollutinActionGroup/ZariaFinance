package com.ngo.finance.notification.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
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

    /** Id of the Designation row this directory entry is for. */
    private Long designationId;

    private String roleLabel;

    private Long primaryUserId;

    private String primaryUserName;

    private Long deputyUserId;

    private String deputyUserName;
}
