package com.ngo.finance.userRegister.service.impl;

import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserRegisterDto registerUser(AddUserRegisterDto addUserRegisterDto) {
        UserRegister userRegister = new UserRegister();
        userRegister.setFirstName(addUserRegisterDto.getFirstName());
        userRegister.setLastName(addUserRegisterDto.getLastName());
        userRegister.setEmailId(addUserRegisterDto.getEmailId());
        userRegister.setMobileNo(addUserRegisterDto.getMobileNo());
        userRegister.setUsername(addUserRegisterDto.getUsername());
        userRegister.setPassword(passwordEncoder.encode(addUserRegisterDto.getPassword()));
        UserRegister saved = userRegisterRepo.save(userRegister);

        UserRegisterDto userRegisterDto = new UserRegisterDto();
        userRegisterDto.setId(saved.getId());
        userRegisterDto.setFirstName(saved.getFirstName());
        userRegisterDto.setLastName(saved.getLastName());
        userRegisterDto.setEmailId(saved.getEmailId());
        userRegisterDto.setMobileNo(saved.getMobileNo());
        userRegisterDto.setUsername(saved.getUsername());
        userRegisterDto.setRole(saved.getRole());
        userRegisterDto.setStatus(saved.getStatus());

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
        userRegisterDto.setId(userRegister.getId());
        userRegisterDto.setFirstName(userRegister.getFirstName());
        userRegisterDto.setLastName(userRegister.getLastName());
        userRegisterDto.setEmailId(userRegister.getEmailId());
        userRegisterDto.setMobileNo(userRegister.getMobileNo());
        userRegisterDto.setUsername(userRegister.getUsername());
        userRegisterDto.setPassword(userRegister.getPassword());
        userRegisterDto.setRole(userRegister.getRole());
        userRegisterDto.setStatus(userRegister.getStatus());

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
                        user.getPassword(),
                        user.getRole(),
                        user.getStatus()))
                .toList();

        return userList;
    }

    @Override
    public Boolean userNameVerified(String userName) {

        return userRegisterRepo.existsByUsername(userName);
    }

    @Override
    public List<UserRegisterDto> getPendingUsers() {
        List<UserRegister> pendingUsers = userRegisterRepo.findByIsApproved(2); // 2 = pending
        return pendingUsers.stream()
                .map(user -> new UserRegisterDto(
                        user.getId(),
                        user.getFirstName(),
                        user.getLastName(),
                        user.getEmailId(),
                        user.getMobileNo(),
                        user.getUsername(),
                        user.getPassword(),
                        user.getRole(),
                        user.getStatus()))
                .toList();
    }

    @Override
    public UserRegisterDto approveRejectUser(Long userId, Long primaryId, Integer approveReject) {
        // `primaryId` is the id of the user row to update. `userId` is the approver's
        // id.
        UserRegister user = userRegisterRepo.findById(primaryId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + primaryId));

        if (approveReject == 1 || approveReject == 3) {
            user.setApprovedBy(userId);
            user.setIsApproved(approveReject); // 1 = approved, 3 = rejected
        } else {
            throw new IllegalArgumentException("Invalid action: " + approveReject);
        }

        userRegisterRepo.save(user);

        UserRegisterDto userRegisterDto = new UserRegisterDto();
        userRegisterDto.setId(user.getId());
        userRegisterDto.setFirstName(user.getFirstName());
        userRegisterDto.setLastName(user.getLastName());
        userRegisterDto.setEmailId(user.getEmailId());
        userRegisterDto.setMobileNo(user.getMobileNo());
        userRegisterDto.setUsername(user.getUsername());
        userRegisterDto.setRole(user.getRole());
        userRegisterDto.setStatus(user.getStatus());

        return userRegisterDto;
    }

}
