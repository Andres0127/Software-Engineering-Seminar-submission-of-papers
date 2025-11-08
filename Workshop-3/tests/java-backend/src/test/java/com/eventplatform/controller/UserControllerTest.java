package com.eventplatform.controller;

import com.eventplatform.dto.UpdateUserRequest;
import com.eventplatform.dto.UserDTO;
import com.eventplatform.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import com.eventplatform.security.TestSecurityUtils;
import org.junit.jupiter.api.AfterEach;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    private UserDTO userDTO;
    private UpdateUserRequest updateRequest;

    @BeforeEach
    void setUp() {
        userDTO = UserDTO.builder()
                .id(1L)
                .name("Test User")
                .email("test@example.com")
                .phoneNumber("+1234567890")
                .role("ROLE_BUYER")
                .status("ACTIVE")
                .build();

        updateRequest = new UpdateUserRequest();
        updateRequest.setName("Updated Name");
        updateRequest.setPhoneNumber("+1111111111");
    }

    @AfterEach
    void tearDown() {
        TestSecurityUtils.clearSecurityContext();
    }

    @Test
    void testGetUserById_Success() throws Exception {
        // Arrange
        TestSecurityUtils.setSecurityContext(1L, "ROLE_BUYER");
        // Arrange
        when(userService.getUserById(1L)).thenReturn(userDTO);

        // Act & Assert
        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Test User"))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    void testGetAllUsers_Success() throws Exception {
        // Arrange
        TestSecurityUtils.setSecurityContext(1L, "ROLE_ADMIN");
        UserDTO user2 = UserDTO.builder()
                .id(2L)
                .name("User 2")
                .email("user2@example.com")
                .role("ROLE_ORGANIZER")
                .build();

        List<UserDTO> users = Arrays.asList(userDTO, user2);
        when(userService.getAllUsers()).thenReturn(users);

        // Act & Assert
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[1].id").value(2L));
    }

    @Test
    void testGetAllUsers_Forbidden() throws Exception {
        // Arrange
        TestSecurityUtils.setSecurityContext(1L, "ROLE_BUYER");
        // Act & Assert - Non-admin user should get 403
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testUpdateUser_OwnProfile_Success() throws Exception {
        // Arrange
        TestSecurityUtils.setSecurityContext(1L, "ROLE_BUYER");
        UserDTO updatedUser = UserDTO.builder()
                .id(1L)
                .name("Updated Name")
                .email("test@example.com")
                .phoneNumber("+1111111111")
                .role("ROLE_BUYER")
                .build();

        when(userService.updateUser(eq(1L), any(UpdateUserRequest.class))).thenReturn(updatedUser);

        // Act & Assert
        mockMvc.perform(put("/api/users/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Name"))
                .andExpect(jsonPath("$.phoneNumber").value("+1111111111"));
    }

    @Test
    void testUpdateUser_OtherUser_Forbidden() throws Exception {
        // Arrange
        TestSecurityUtils.setSecurityContext(1L, "ROLE_BUYER");
        // Act & Assert - User trying to update another user's profile should get 403
        mockMvc.perform(put("/api/users/2")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isForbidden());
    }

    @Test
    void testUpdateUser_AdminCanUpdateAnyUser() throws Exception {
        // Arrange
        TestSecurityUtils.setSecurityContext(1L, "ROLE_ADMIN");
        UserDTO updatedUser = UserDTO.builder()
                .id(2L)
                .name("Updated Name")
                .email("user2@example.com")
                .role("ROLE_ORGANIZER")
                .build();

        when(userService.updateUser(eq(2L), any(UpdateUserRequest.class))).thenReturn(updatedUser);

        // Act & Assert
        mockMvc.perform(put("/api/users/2")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk());
    }

    @Test
    void testDeleteUser_Success() throws Exception {
        // Arrange
        TestSecurityUtils.setSecurityContext(1L, "ROLE_ADMIN");
        doNothing().when(userService).deleteUser(1L);

        // Act & Assert
        mockMvc.perform(delete("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("User deleted successfully"));
    }

    @Test
    void testDeleteUser_Forbidden() throws Exception {
        // Arrange
        TestSecurityUtils.setSecurityContext(1L, "ROLE_BUYER");
        // Act & Assert - Non-admin user should get 403
        mockMvc.perform(delete("/api/users/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testGetUserStatistics_Success() throws Exception {
        // Arrange
        TestSecurityUtils.setSecurityContext(1L, "ROLE_ADMIN");
        Object statistics = new Object() {
            public final long total = 10;
            public final long active = 8;
            public final long suspended = 2;
        };

        when(userService.getUserStatistics()).thenReturn(statistics);

        // Act & Assert
        mockMvc.perform(get("/api/users/statistics"))
                .andExpect(status().isOk());
    }

    @Test
    void testGetUserStatistics_Forbidden() throws Exception {
        // Arrange
        TestSecurityUtils.setSecurityContext(1L, "ROLE_BUYER");
        // Act & Assert - Non-admin user should get 403
        mockMvc.perform(get("/api/users/statistics"))
                .andExpect(status().isForbidden());
    }
}

