Feature: User authentication
  As a visitor of the event platform
  I want to be able to register and log in
  So that I can access the application as a ticket buyer

  Scenario: Successful registration of a BUYER
    Given a registration request with name "Test User", email "test@example.com", password "Test123!@", user type "BUYER"
    When the client sends a POST request to "/api/auth/register"
    Then the response status should be 201
    And the JSON response should have field "email" equal to "test@example.com"
    And the JSON response should have field "role" equal to "ROLE_BUYER"

  Scenario: Successful login of a registered user
    Given an existing user with email "test@example.com" and password "Test123!@"
    When the client sends a POST request to "/api/auth/login"
    Then the response status should be 200
    And the JSON response should have field "email" equal to "test@example.com"
    And the JSON response should have field "token" present



