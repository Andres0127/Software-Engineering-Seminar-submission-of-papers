#!/bin/bash

# Event Platform - Java Backend Initialization Script
# This script sets up the database and runs the application

echo "========================================="
echo "Event Platform - Backend Initialization"
echo "========================================="
echo ""

# Check if MySQL is running
echo "Checking MySQL connection..."
mysql -u root -p -e "SELECT 1;" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✓ MySQL is running"
else
    echo "✗ MySQL is not running. Please start MySQL first."
    exit 1
fi

# Create database
echo ""
echo "Creating database..."
mysql -u root -p < scripts/01-create-database.sql

if [ $? -eq 0 ]; then
    echo "✓ Database created successfully"
else
    echo "✗ Failed to create database"
    exit 1
fi

# Load seed data (optional)
read -p "Do you want to load seed data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "Loading seed data..."
    mysql -u root -p < scripts/02-seed-data.sql
    echo "✓ Seed data loaded"
fi

# Build project
echo ""
echo "Building project..."
mvn clean install -DskipTests

if [ $? -eq 0 ]; then
    echo "✓ Project built successfully"
else
    echo "✗ Failed to build project"
    exit 1
fi

# Run application
echo ""
echo "Starting application..."
echo "========================================="
echo ""
mvn spring-boot:run
