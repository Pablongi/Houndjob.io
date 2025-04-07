import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders HoundJob logo', () => {
  render(<App />);
  const logoElement = screen.getByText(/HoundJob/i);
  expect(logoElement).toBeInTheDocument();
});