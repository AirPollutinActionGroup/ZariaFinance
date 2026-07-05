package com.ngo.finance.donor.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CityLookupResponse {
    private Long id;
    private String cityCode;
    private String cityName;
}
