# Event Management Platform - Workshop 3: Full-Stack Implementation

## Project Overview

This workshop implements an **event ticketing platform** similar to "Tu Boleta" with three main components:

- **Java Backend** - User authentication and management
- **Python Backend** - Event management and business logic  
- **React Frontend** - User interface

## Project Structure

```
Workshop-3/
├── java-backend/          # Authentication service (Spring Boot + MySQL)
├── python-backend/        # Business logic service (FastAPI + PostgreSQL) 
├── react-frontend/        # User interface (React)
├── docker/               # Docker configuration files
└── docs/                 # Documentation
```

## Technology Stack

### Java Backend (Authentication)
- **Spring Boot** - Web framework
- **MySQL** - Database
- **JWT** - Authentication tokens
- **Port**: 8081

### Python Backend (Business Logic)  
- **FastAPI** - Web framework
- **PostgreSQL** - Database
- **SQLAlchemy** - Database ORM
- **Port**: 8000

### React Frontend
- **React 18** - UI framework
- **Material-UI** - Component library
- **Axios** - HTTP client
- **Port**: 3000

##  Security

- **JWT Authentication** for secure user sessions
- **Role-based access control** (Admin, Organizer, Buyer)
- **Password encryption** using BCrypt
- **CORS protection** for frontend integration

## Additional Resources

- [Class Diagram](../Workshop-2/ClassDiagram.png)
- [Architecture Diagram](../Workshop-2/ArchitectureDiagram.png)  
- [Business Process](../Workshop-2/TicketPurchaseProcess.png)
- [Business Model](../Workshop-1/Business_Model_Canvas_Planning.png)

## Development Status

### Completed
- [x] Java Backend (Authentication service)
- [x] Database design and implementation
- [x] JWT authentication system
- [x] API documentation with Swagger

### In Progress  
- [ ] Python Backend (Business logic service)
- [ ] React Frontend (User interface)

### Planned
- [ ] Integration testing
- [ ] Docker deployment
- [ ] Production optimization

## Development Team

- **Carlos Andres Abella**
- **Daniel Felipe Paez**  
- **Leidy Marcela Morales**

**Supervisor**: Carlos Andrés Sierra  
**Institution**: Universidad Distrital Francisco José de Caldas  
**Date**: November 2025

## 📄 License

This project is part of an academic assignment for Universidad Distrital Francisco José de Caldas.
