# Workshop 4: Containerization, Acceptance Testing, and CI/CD

This folder contains all deliverables for Workshop 4 of the Software Engineering Seminar course.

## 📋 Contents

### 1. Documentation
- **Workshop-4-Report.tex**: Complete LaTeX document describing all workshop deliverables
- **Workshop-4-Report.pdf**: Compiled PDF version of the report (after compilation)
- **COMPILATION-GUIDE.md**: Instructions for compiling the LaTeX document
- **build.bat**: Windows build script for easy compilation

### 2. Docker Containerization
- **docker-compose.yml**: Orchestration file for all services
- **Dockerfiles**: Located in respective component folders:
  - `java-backend/Dockerfile`
  - `python-backend/Dockerfile`
  - `react-frontend/Dockerfile`

### 3. Cucumber Acceptance Tests
- **Feature Files**: Gherkin feature files describing user stories
- **Step Definitions**: Java implementation of test steps
- **Test Results**: Execution reports and results

### 4. JMeter Stress Tests
- **Test Plans**: JMeter test plans (.jmx files) for API stress testing
- **Results**: Test execution results and analysis reports

### 5. CI/CD Pipeline
- **GitHub Actions Workflow**: `.github/workflows/ci-cd.yml` configuration file
- **Workflow Evidence**: Screenshots and logs from successful workflow runs

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- Git repository cloned locally

### Running with Docker

1. Navigate to Workshop-3 directory:
   ```bash
   cd Workshop-3
   ```

2. Build and start all services:
   ```bash
   docker-compose up -d --build
   ```

3. Verify services are running:
   - Frontend: http://localhost:3000
   - Java Backend: http://localhost:8081
   - Python Backend: http://localhost:8000

### Running Acceptance Tests

1. Navigate to test directory:
   ```bash
   cd Workshop-3/tests/java-backend
   ```

2. Run Cucumber tests:
   ```bash
   mvn clean test
   ```

### Running JMeter Stress Tests

1. Open Apache JMeter
2. Load test plan from `Workshop-4/jmeter/test-plans/`
3. Configure thread groups and endpoints
4. Run test and analyze results

## 📖 Detailed Documentation

For complete setup instructions, troubleshooting, and detailed explanations, refer to:
- **Workshop-4-Report.pdf**: Comprehensive LaTeX document with all sections
- **Workshop-3/README.md**: Execution guide for the application

## 📁 Folder Structure

```
Workshop-4/
├── README.md                      # This file
├── Workshop-4-Report.tex          # LaTeX source document
├── Workshop-4-Report.pdf          # Compiled PDF report
├── docker/                        # Docker configurations
│   └── docker-compose.yml
├── cucumber/                      # Acceptance test files
│   ├── features/
│   ├── step-definitions/
│   └── test-results/
├── jmeter/                        # Stress test files
│   ├── test-plans/
│   └── results/
└── ci-cd/                         # CI/CD configuration
    └── .github/
        └── workflows/
            └── ci-cd.yml
```

## ✅ Checklist

- [x] Dockerfiles for all components (Java, Python, Frontend)
- [x] docker-compose.yml for orchestration
- [x] Cucumber acceptance tests and results
- [x] JMeter stress tests and results
- [x] GitHub Actions CI/CD workflow
- [x] Organized documentation (README.md and LaTeX report)

## 📚 References

- Docker Documentation: https://docs.docker.com/
- Cucumber Documentation: https://cucumber.io/docs/
- JMeter Documentation: https://jmeter.apache.org/
- GitHub Actions: https://docs.github.com/en/actions

## 👥 Team

- Carlos Andres Abella
- Daniel Felipe Paez
- Leidy Marcela Morales

**Supervisor:** Eng. Carlos Andrés Sierra, M.Sc.

