package com.ngo.finance.userRegister;

import com.ngo.finance.userRegister.dto.AddUserRegisterDto;
import com.ngo.finance.userRegister.dto.UserRegisterDto;
import com.ngo.finance.userRegister.entity.UserRegister;
import com.ngo.finance.userRegister.repository.UserRegisterRepo;
import com.ngo.finance.userRegister.service.impl.UserRegisterServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserRegisterTests {

    @Mock
    private UserRegisterRepo userRegisterRepo;

    @InjectMocks
    private UserRegisterServiceImpl userRegisterService;

    @Test
    void registerUser_createsAndReturnsDto() {
        AddUserRegisterDto request = new AddUserRegisterDto();
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setEmailId("john.doe@example.com");
        request.setMobileNo("9123456789");
        request.setUsername("johndoe");
        request.setPassword("Password123");

        UserRegister saved = new UserRegister();
        saved.setId(1L);
        saved.setFirstName(request.getFirstName());
        saved.setLastName(request.getLastName());
        saved.setEmailId(request.getEmailId());
        saved.setMobileNo(request.getMobileNo());
        saved.setUsername(request.getUsername());
        saved.setPassword(request.getPassword());

        when(userRegisterRepo.save(any(UserRegister.class))).thenReturn(saved);

        UserRegisterDto result = userRegisterService.registerUser(request);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getUsername()).isEqualTo("johndoe");
        assertThat(result.getEmailId()).isEqualTo("john.doe@example.com");
        verify(userRegisterRepo).save(any(UserRegister.class));
    }

    @Test
    void getUserById_returnsDto_whenUserExists() {
        UserRegister user = new UserRegister();
        user.setId(2L);
        user.setFirstName("Alice");
        user.setLastName("Smith");
        user.setEmailId("alice@example.com");
        user.setMobileNo("9123456790");
        user.setUsername("alice");
        user.setPassword("secret");

        when(userRegisterRepo.existsById(2L)).thenReturn(true);
        when(userRegisterRepo.findById(2L)).thenReturn(Optional.of(user));

        UserRegisterDto result = userRegisterService.getUserById(2L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(2L);
        assertThat(result.getUsername()).isEqualTo("alice");
        assertThat(result.getEmailId()).isEqualTo("alice@example.com");
    }

    @Test
    void getUserById_throwsException_whenUserNotFound() {
        when(userRegisterRepo.existsById(3L)).thenReturn(false);

        assertThrows(RuntimeException.class, () -> userRegisterService.getUserById(3L));
    }

    @Test
    void getAllUsers_returnsList() {
        UserRegister first = new UserRegister();
        first.setId(1L);
        first.setUsername("user1");
        first.setEmailId("user1@example.com");
        first.setPassword("pass1");

        UserRegister second = new UserRegister();
        second.setId(2L);
        second.setUsername("user2");
        second.setEmailId("user2@example.com");
        second.setPassword("pass2");

        when(userRegisterRepo.findAll()).thenReturn(List.of(first, second));

        List<UserRegisterDto> users = userRegisterService.getAllUsers();

        assertThat(users).hasSize(2);
        assertThat(users).extracting(UserRegisterDto::getUsername).containsExactly("user1", "user2");
    }

    @Test
    void deleteUser_deletesWhenUserExists() {
        when(userRegisterRepo.existsById(4L)).thenReturn(true);
        doNothing().when(userRegisterRepo).deleteById(4L);

        userRegisterService.deleteUser(4L);

        verify(userRegisterRepo).deleteById(4L);
    }

    @Test
    void deleteUser_throwsWhenUserDoesNotExist() {
        when(userRegisterRepo.existsById(5L)).thenReturn(false);

        assertThrows(RuntimeException.class, () -> userRegisterService.deleteUser(5L));
    }

    @Test
    void userNameVerified_returnsTrueWhenExists() {
        when(userRegisterRepo.existsByUsername("existing")).thenReturn(true);

        boolean exists = userRegisterService.userNameVerified("existing");

        assertThat(exists).isTrue();
    }

    @Test
    void userNameVerified_returnsFalseWhenNotExists() {
        when(userRegisterRepo.existsByUsername("missing")).thenReturn(false);

        boolean exists = userRegisterService.userNameVerified("missing");

        assertThat(exists).isFalse();
    }
}
