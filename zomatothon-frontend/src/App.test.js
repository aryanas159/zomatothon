import { render, screen } from '@testing-library/react';
import App from './App';

test('renders zomatothon heading', () => {
  render(<App />);
  const heading = screen.getByText(/zomatothon engine/i);
  expect(heading).toBeInTheDocument();
});
