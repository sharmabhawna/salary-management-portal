import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import App from '@/App';
import { mockEmployees } from './mocks/employees';
import { server } from './mocks/server';
import { renderWithRouter } from './helpers/renderWithRouter';

describe('App', () => {
  it('should render the employee list', async () => {
    server.use(
      http.get('/api/employees', () =>
        HttpResponse.json({
          data: mockEmployees,
          total: mockEmployees.length,
          page: 1,
          limit: 20,
        }),
      ),
    );

    renderWithRouter(<App />);

    expect(await screen.findByRole('heading', { name: /employees/i })).toBeInTheDocument();
  });
});
