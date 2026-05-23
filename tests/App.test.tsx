import { render, screen } from '@testing-library/react';
import App from '@/App';

describe('App', () => {
  it('should render the portal heading', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /portal/i })).toBeInTheDocument();
  });
});
