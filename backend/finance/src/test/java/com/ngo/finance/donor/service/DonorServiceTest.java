package com.ngo.finance.donor.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.ngo.finance.donor.dto.request.CreateDonorRequest;
import com.ngo.finance.donor.dto.response.DonorResponse;
import com.ngo.finance.donor.entity.DonorMaster;
import com.ngo.finance.donor.enums.DonorStatus;
import com.ngo.finance.donor.mapper.DonorMapper;
import com.ngo.finance.donor.repository.CityRepository;
import com.ngo.finance.donor.repository.DonorRepository;
import com.ngo.finance.donor.repository.StateRepository;
import com.ngo.finance.donor.service.impl.DonorServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class DonorServiceTest {

    @Mock
    private DonorRepository donorRepository;

    @Mock
    private StateRepository stateRepository;

    @Mock
    private CityRepository cityRepository;

    @Mock
    private DonorMapper donorMapper;

    @InjectMocks
    private DonorServiceImpl donorService;

    @Test
    public void testCreateDonor_Success() {
        // Arrange
        CreateDonorRequest request = new CreateDonorRequest();
        request.setDonorCode("D001");
        request.setDonorName("Test Donor");

        DonorMaster donorEntity = new DonorMaster();
        donorEntity.setDonorCode("D001");
        donorEntity.setDonorName("Test Donor");

        DonorMaster savedEntity = new DonorMaster();
        savedEntity.setId(1L);
        savedEntity.setDonorCode("D001");
        savedEntity.setDonorName("Test Donor");
        savedEntity.setStatus(DonorStatus.DRAFT);

        DonorResponse expectedResponse = new DonorResponse();
        expectedResponse.setId(1L);
        expectedResponse.setDonorCode("D001");
        expectedResponse.setDonorName("Test Donor");
        expectedResponse.setStatus(DonorStatus.DRAFT);

        when(donorMapper.toEntity(request)).thenReturn(donorEntity);
        when(donorRepository.save(any(DonorMaster.class))).thenReturn(savedEntity);
        when(donorMapper.toResponse(savedEntity)).thenReturn(expectedResponse);

        // Act
        DonorResponse result = donorService.createDonor(request);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("D001", result.getDonorCode());
        assertEquals("Test Donor", result.getDonorName());

        verify(donorMapper).toEntity(request);
        verify(donorRepository).save(any(DonorMaster.class));
        verify(donorMapper).toResponse(savedEntity);
    }
}
