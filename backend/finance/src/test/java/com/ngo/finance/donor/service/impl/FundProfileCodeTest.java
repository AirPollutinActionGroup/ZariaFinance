package com.ngo.finance.donor.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import com.ngo.finance.donor.repository.DonorFundProfileRepository;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/** FP-{year}-{nnn} generation in {@link FundProfileServiceImpl#nextProfileCode(int)}. */
@ExtendWith(MockitoExtension.class)
class FundProfileCodeTest {

    @Mock
    private DonorFundProfileRepository profileRepository;

    @InjectMocks
    private FundProfileServiceImpl service;

    @Test
    void startsAtOneForANewYear() {
        when(profileRepository.findProfileCodesByPrefix("FP-2026-")).thenReturn(List.of());
        assertEquals("FP-2026-001", service.nextProfileCode(2026));
    }

    @Test
    void followsTheHighestNumberNotTheLastInStringOrder() {
        when(profileRepository.findProfileCodesByPrefix("FP-2026-"))
                .thenReturn(List.of("FP-2026-999", "FP-2026-1000", "FP-2026-007"));
        assertEquals("FP-2026-1001", service.nextProfileCode(2026));
    }

    @Test
    void ignoresCodesWithANonNumericSuffix() {
        when(profileRepository.findProfileCodesByPrefix("FP-2026-"))
                .thenReturn(List.of("FP-2026-004", "FP-2026-X1"));
        assertEquals("FP-2026-005", service.nextProfileCode(2026));
    }
}
