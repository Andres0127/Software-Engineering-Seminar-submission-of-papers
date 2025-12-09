package com.eventplatform.acceptance;

import com.eventplatform.dto.LoginRequest;
import com.eventplatform.dto.RegisterRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class AuthStepDefinitions {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private ResultActions lastResponse;

    @Given("a registration request with name {string}, email {string}, password {string}, user type {string}")
    public void aRegistrationRequest(String name, String email, String password, String userType) {
        registerRequest = new RegisterRequest();
        registerRequest.setName(name);
        registerRequest.setEmail(email);
        registerRequest.setPhoneNumber(null);
        registerRequest.setPassword(password);
        registerRequest.setUserType(userType);
    }

    @When("the client sends a POST request to {string}")
    public void theClientSendsPost(String path) throws Exception {
        Object body;
        if (path.contains("/register")) {
            body = registerRequest;
        } else {
            body = loginRequest;
        }

        lastResponse = mockMvc.perform(
                post(path)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body))
        );
    }

    @Then("the response status should be {int}")
    public void theResponseStatusShouldBe(int status) throws Exception {
        lastResponse.andExpect(status().is(status));
    }

    @And("the JSON response should have field {string} equal to {string}")
    public void theJsonResponseShouldHaveFieldEqualTo(String field, String value) throws Exception {
        lastResponse.andExpect(jsonPath("$." + field).value(value));
    }

    @And("the JSON response should have field {string} present")
    public void theJsonResponseShouldHaveFieldPresent(String field) throws Exception {
        lastResponse.andExpect(jsonPath("$." + field, notNullValue()));
    }

    @Given("an existing user with email {string} and password {string}")
    public void anExistingUserWithEmailAndPassword(String email, String password) throws Exception {
        // First, register the user to ensure they exist
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setName("Test User");
        registerRequest.setEmail(email);
        registerRequest.setPassword(password);
        registerRequest.setUserType("BUYER");
        
        // Register the user
        mockMvc.perform(
                post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest))
        );
        
        // Now set up the login request
        loginRequest = new LoginRequest();
        loginRequest.setEmail(email);
        loginRequest.setPassword(password);
    }
}



