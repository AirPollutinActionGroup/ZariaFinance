package com.ngo.finance.userRegisterNew.service;

import com.ngo.finance.userRegisterNew.dto.request.CreateUserRegisterRequest;
import com.ngo.finance.userRegisterNew.dto.response.UserRegisterResponse;
import java.util.List;

public interface UserRegisterNewService {

    UserRegisterResponse register(CreateUserRegisterRequest request);

    boolean usernameExists(String username);

    List<UserRegisterResponse> listAll();

    UserRegisterResponse getById(Long id);

    UserRegisterResponse approve(Long id);

    UserRegisterResponse reject(Long id);

    UserRegisterResponse login(String username, String password);
}
