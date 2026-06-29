package com.ngo.finance.userRegister.service.impl;

import org.springframework.stereotype.Service;
import com.ngo.finance.userRegister.dto.AddUserRegisterDto;
import com.ngo.finance.userRegister.dto.UserRegisterDto;
import com.ngo.finance.userRegister.repository.UserRegisterRepo;
import com.ngo.finance.userRegister.service.UserRegisterService;
import lombok.RequiredArgsConstructor;
import java.util.List;
import com.ngo.finance.userRegister.entity.UserRegister;

@Service
@RequiredArgsConstructor
public class UserRegisterServiceImpl implements UserRegisterService {

    private final UserRegisterRepo userRegisterRepo;

    @Override
    public UserRegisterDto registerUser(AddUserRegisterDto addUserRegisterDto) {
        UserRegister userRegister = new UserRegister();
        userRegister.setFirstName(addUserRegisterDto.getFirstName());
        userRegister.setLastName(addUserRegisterDto.getLastName());
        userRegister.setEmailId(addUserRegisterDto.getEmailId());
        userRegister.setMobileNo(addUserRegisterDto.getMobileNo());
        userRegister.setUsername(addUserRegisterDto.getUsername());
        userRegister.setPassword(addUserRegisterDto.getPassword());
        userRegisterRepo.save(userRegister);

        UserRegisterDto userRegisterDto = new UserRegisterDto();
        userRegisterDto.setId(userRegister.getId());
        userRegisterDto.setFirstName(userRegister.getFirstName());
        userRegisterDto.setLastName(userRegister.getLastName());
        userRegisterDto.setEmailId(userRegister.getEmailId());
        userRegisterDto.setMobileNo(userRegister.getMobileNo());
        userRegisterDto.setUsername(userRegister.getUsername());

        return userRegisterDto;
    }

    @Override
    public void deleteUser(Long userId) {
        if (!userRegisterRepo.existsById(userId)) {
            throw new RuntimeException("User not found with id: " + userId);
        }
        userRegisterRepo.deleteById(userId);
    }

    @Override
    public UserRegisterDto getUserById(Long userId) {
        if (!userRegisterRepo.existsById(userId)) {
            throw new RuntimeException("User not found with id: " + userId);
        }
        UserRegister userRegister = userRegisterRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        UserRegisterDto userRegisterDto = new UserRegisterDto();

        return userRegisterDto;
    }

    @Override
    public List<UserRegisterDto> getAllUsers() {
        List<UserRegister> userRegisters = userRegisterRepo.findAll();

        List<UserRegisterDto> userList = userRegisters.stream()
                .map(user -> new UserRegisterDto(
                        user.getId(),
                        user.getFirstName(),
                        user.getLastName(),
                        user.getEmailId(),
                        user.getMobileNo(),
                        user.getUsername(),
                        user.getPassword()))
                .toList();

        return userList;
    }

}
