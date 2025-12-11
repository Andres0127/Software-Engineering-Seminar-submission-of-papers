import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Eventify app', () => {
  render(<App />);
  // Verificar que la aplicación se renderiza sin errores buscando un texto que no esté dividido
  const appElement = screen.getByText(/The all-in-one platform for creating, managing, and scaling unforgettable events/i);
  expect(appElement).toBeInTheDocument();
});
