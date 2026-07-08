package com.ngo.finance.userRegister.service;

import com.ngo.finance.userRegister.dto.UserRegisterDto;

public interface LoginService {

    UserRegisterDto login(String username, String password);

}