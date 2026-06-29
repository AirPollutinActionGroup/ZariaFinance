package com.ngo.finance.userRegister.service;

import com.ngo.finance.userRegister.dto.AddUserRegisterDto;
import com.ngo.finance.userRegister.dto.UserRegisterDto;
import java.util.List;

public interface UserRegisterService {

    UserRegisterDto registerUser(AddUserRegisterDto addUserRegisterDto);

    void deleteUser(Long userId);

    UserRegisterDto getUserById(Long userId);

    // UserRegisterDto updateUser(Long userId, AddUserRegisterDto
    // addUserRegisterDto);

    List<UserRegisterDto> getAllUsers();
}