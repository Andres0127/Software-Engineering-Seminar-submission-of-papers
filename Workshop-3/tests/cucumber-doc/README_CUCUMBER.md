# Acceptance Testing with Cucumber

This document summarizes everything that was added **outside of the production platform code** to support acceptance testing with Apache Cucumber. All changes live under `Workshop-3/tests/` so the Java backend, Python backend, and React frontend application code remain untouched.

---

## 1. New Files and Locations

```
Workshop-3/tests/
├── java-backend/
│   ├── pom.xml                          # test module now includes Cucumber + JUnit platform suite deps
│   ├── src/test/resources/features/
│   │   └── authentication.feature       # user stories (register & login)
│   └── src/test/java/com/eventplatform/acceptance/
│       ├── AuthStepDefinitions.java     # step definitions using MockMvc
│       ├── CucumberSpringConfiguration.java  # boots Spring context for steps
│       └── RunCucumberAcceptanceTest.java    # JUnit 5 runner
└── cucumber-doc/
    └── README_CUCUMBER.md               # this file
```

> **Note:** All additions sit under the test harness. No classes in `Workshop-3/java-backend/src/main/java` (or any other platform module) were modified.

---

## 2. Dependencies Added (tests module only)

`Workshop-3/tests/java-backend/pom.xml`

- `io.cucumber:cucumber-java:7.15.0`
- `io.cucumber:cucumber-spring:7.15.0`
- `io.cucumber:cucumber-junit-platform-engine:7.15.0`
- `org.junit.platform:junit-platform-suite:1.10.1`

These are scoped to `test`, so the production artifact is unaffected.

---

## 3. Feature Coverage

`src/test/resources/features/authentication.feature`

- **Scenario 1:** Buyer registration succeeds and returns `201` plus the expected role.
- **Scenario 2:** Existing user logs in and receives a token.

The feature uses concrete data from the existing AuthService so it exercises the real HTTP endpoints through MockMvc.

---

## 4. Step Definitions Overview

`AuthStepDefinitions.java`

- Uses Spring’s `MockMvc` + `ObjectMapper`.
- Builds `RegisterRequest`/`LoginRequest` DTOs (from existing code) and posts to `/api/auth/register` or `/api/auth/login`.
- Re-uses validation rules already present (e.g., password `Test123!@` matches existing regex).
- Asserts response code and JSON payload without altering controller/service logic.

`CucumberSpringConfiguration.java` boots the Spring context (`@SpringBootTest`, `@AutoConfigureMockMvc`, profile `test`).

`RunCucumberAcceptanceTest.java` wires the JUnit Platform suite engine so `mvn test` can discover Gherkin scenarios.

---

## 5. How to Run

```bash
cd Workshop-3/tests/java-backend
mvn clean test -Dtest=RunCucumberAcceptanceTest
```

The command:
1. Builds the *test harness* (not the production WAR/JAR).
2. Starts Spring Boot in test mode.
3. Executes the Gherkin scenarios.

Sample output tail:

```
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

---

## 6. Verification Checklist

| Item | Status |
|------|--------|
| Platform source code modified? | **No** – only files under `Workshop-3/tests` changed. |
| Acceptance tests live in separate module/folder? | Yes – `tests/java-backend` + `tests/cucumber-doc`. |
| Execution instructions included? | Yes – see §5. |
| User stories documented? | Yes – see `authentication.feature`. |

---

## 7. Next Steps (Optional)

- Add more `.feature` files for organizer/admin flows.
- Integrate Cucumber reports (HTML plugin already on classpath via `cucumber-plugin`).
- Wire CI job to run `RunCucumberAcceptanceTest` alongside unit tests.

---


