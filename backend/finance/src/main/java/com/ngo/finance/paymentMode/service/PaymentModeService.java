package com.ngo.finance.paymentMode.service;

import com.ngo.finance.paymentMode.dto.request.CreatePaymentModeRequest;
import com.ngo.finance.paymentMode.dto.request.UpdatePaymentModeRequest;
import com.ngo.finance.paymentMode.dto.response.PaymentModeResponse;
import java.util.List;

/**
 * Service interface for Payment Mode operations
 */
public interface PaymentModeService {

    PaymentModeResponse createPaymentMode(CreatePaymentModeRequest request);

    PaymentModeResponse getPaymentModeById(Long id);

    List<PaymentModeResponse> getAllPaymentModes();

    List<PaymentModeResponse> searchPaymentModes(String searchTerm);

    PaymentModeResponse updatePaymentMode(Long id, UpdatePaymentModeRequest request);

    void activatePaymentMode(Long id);

    void deactivatePaymentMode(Long id);
}
