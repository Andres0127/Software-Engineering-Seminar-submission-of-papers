import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Eventify app', () => {
  render(<App />);
  // Verificar que la aplicación se renderiza sin errores
  const appElement = screen.getByText(/Welcome to Eventify/i);
  expect(appElement).toBeInTheDocument();
});
