"""
Pytest configuration and shared fixtures for all tests
"""
import pytest
import sys
import os

# Set environment variable for test database before importing backend modules
os.environ['DATABASE_URL'] = 'sqlite:///:memory:'

# Add the python-backend directory to the path to import from the main backend
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../python-backend'))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

