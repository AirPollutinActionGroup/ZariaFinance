package com.ngo.finance.paymentType.group.service;

import com.ngo.finance.paymentType.group.dto.request.CreatePaymentTypeGroupRequest;
import com.ngo.finance.paymentType.group.dto.request.UpdatePaymentTypeGroupRequest;
import com.ngo.finance.paymentType.group.dto.response.PaymentTypeGroupResponse;
import java.util.List;

/**
 * Service interface for Payment Type Group operations
 */
public interface PaymentTypeGroupService {

    PaymentTypeGroupResponse createGroup(CreatePaymentTypeGroupRequest request);

    PaymentTypeGroupResponse getGroupById(Long id);

    List<PaymentTypeGroupResponse> getAllGroups();

    List<PaymentTypeGroupResponse> searchGroups(String searchTerm);

    PaymentTypeGroupResponse updateGroup(Long id, UpdatePaymentTypeGroupRequest request);

    void activateGroup(Long id);

    void deactivateGroup(Long id);
}
