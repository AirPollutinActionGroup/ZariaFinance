package com.ngo.finance.donor.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StateLookupResponse {
    private Long id;
    private String stateCode;
    private String stateName;
}
