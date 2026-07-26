package com.ngo.finance.donor.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CountryLookupResponse {
    private Long id;
    private String countryCode;
    private String countryName;
}
