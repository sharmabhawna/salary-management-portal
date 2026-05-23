import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { InsightsDashboard } from '@/features/insights/InsightsDashboard';
import { server } from '../../mocks/server';

describe('InsightsDashboard', () => {
  it('shows country salary stats after country is submitted', async () => {
    const user = userEvent.setup();

    render(<InsightsDashboard />);

    await screen.findByRole('cell', { name: 'Engineering' });

    const countryPanel = screen.getByRole('heading', {
      name: /country salary stats/i,
    }).closest('article') as HTMLElement;

    await user.selectOptions(
      within(countryPanel).getByLabelText(/^country$/i),
      'United States',
    );
    await user.click(within(countryPanel).getByRole('button', { name: /view stats/i }));

    expect(await within(countryPanel).findByText('Minimum')).toBeInTheDocument();
    expect(within(countryPanel).getAllByText('$95,000')).toHaveLength(3);
    expect(within(countryPanel).getByText('Maximum')).toBeInTheDocument();
    expect(within(countryPanel).getByText('Average')).toBeInTheDocument();
  });

  it('shows empty state message for country salary stats', async () => {
    const user = userEvent.setup();

    server.use(
      http.get('/api/insights/salary/country', () =>
        HttpResponse.json({
          data: null,
          message: 'No employees found in Atlantis',
        }),
      ),
    );

    render(<InsightsDashboard />);
    await screen.findByRole('cell', { name: 'Engineering' });

    const countryPanel = screen.getByRole('heading', {
      name: /country salary stats/i,
    }).closest('article') as HTMLElement;

    await user.selectOptions(
      within(countryPanel).getByLabelText(/^country$/i),
      'United States',
    );
    await user.click(within(countryPanel).getByRole('button', { name: /view stats/i }));

    expect(
      await within(countryPanel).findByText('No employees found in Atlantis'),
    ).toBeInTheDocument();
  });

  it('shows job title salary result after inputs are submitted', async () => {
    const user = userEvent.setup();

    render(<InsightsDashboard />);
    await screen.findByRole('cell', { name: 'Engineering' });

    const jobTitlePanel = screen.getByRole('heading', {
      name: /average salary by job title/i,
    }).closest('article') as HTMLElement;

    await user.type(within(jobTitlePanel).getByLabelText(/job title/i), 'Software Engineer');
    await user.selectOptions(
      within(jobTitlePanel).getByLabelText(/^country$/i),
      'United States',
    );
    await user.click(within(jobTitlePanel).getByRole('button', { name: /view average/i }));

    expect(
      await within(jobTitlePanel).findByText(/average salary for software engineer/i),
    ).toBeInTheDocument();
    expect(within(jobTitlePanel).getByText('$95,000')).toBeInTheDocument();
  });

  it('renders department salary table on load', async () => {
    render(<InsightsDashboard />);

    expect(await screen.findByRole('cell', { name: 'Engineering' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Finance' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '$95,000' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '$88,000' })).toBeInTheDocument();

    const departmentRows = screen
      .getAllByRole('row')
      .filter((row) => within(row).queryByRole('cell', { name: 'Engineering' }));

    expect(departmentRows.length).toBeGreaterThan(0);
  });

  it('renders headcount by country table on load sorted by count descending', async () => {
    server.use(
      http.get('/api/insights/headcount/country', () =>
        HttpResponse.json({
          data: [
            { country: 'Canada', headcount: 1 },
            { country: 'United States', headcount: 3 },
            { country: 'Germany', headcount: 2 },
          ],
        }),
      ),
    );

    render(<InsightsDashboard />);

    await screen.findByRole('cell', { name: 'Engineering' });

    const headcountPanel = screen.getByRole('heading', {
      name: /headcount by country/i,
    }).closest('article') as HTMLElement;

    const rows = within(headcountPanel).getAllByRole('row').slice(1);
    expect(within(rows[0]).getByRole('cell', { name: 'United States' })).toBeInTheDocument();
    expect(within(rows[0]).getByRole('cell', { name: '3' })).toBeInTheDocument();
    expect(within(rows[1]).getByRole('cell', { name: 'Germany' })).toBeInTheDocument();
    expect(within(rows[2]).getByRole('cell', { name: 'Canada' })).toBeInTheDocument();
  });

  it('shows loading states for all panels', async () => {
    server.use(
      http.get('/api/insights/salary/country', async () => {
        await new Promise((resolve) => {
          setTimeout(resolve, 100);
        });
        return HttpResponse.json({
          data: { country: 'United States', min: 95000, max: 95000, average: 95000 },
        });
      }),
      http.get('/api/insights/salary/job-title', async () => {
        await new Promise((resolve) => {
          setTimeout(resolve, 100);
        });
        return HttpResponse.json({
          data: {
            country: 'United States',
            jobTitle: 'Software Engineer',
            average: 95000,
          },
        });
      }),
      http.get('/api/insights/salary/department', async () => {
        await new Promise((resolve) => {
          setTimeout(resolve, 100);
        });
        return HttpResponse.json({
          data: [{ department: 'Engineering', average: 95000 }],
        });
      }),
      http.get('/api/insights/headcount/country', async () => {
        await new Promise((resolve) => {
          setTimeout(resolve, 100);
        });
        return HttpResponse.json({
          data: [{ country: 'United States', headcount: 1 }],
        });
      }),
    );

    const user = userEvent.setup();
    render(<InsightsDashboard />);

    expect(
      screen.getByRole('status', { name: /loading department salary table/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('status', { name: /loading headcount by country table/i }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.queryByRole('status', { name: /loading department salary table/i }),
      ).not.toBeInTheDocument();
    });

    const countryPanel = screen.getByRole('heading', {
      name: /country salary stats/i,
    }).closest('article') as HTMLElement;

    await user.selectOptions(
      within(countryPanel).getByLabelText(/^country$/i),
      'United States',
    );
    await user.click(within(countryPanel).getByRole('button', { name: /view stats/i }));

    expect(
      within(countryPanel).getByRole('status', {
        name: /loading country salary stats/i,
      }),
    ).toBeInTheDocument();

    const jobTitlePanel = screen.getByRole('heading', {
      name: /average salary by job title/i,
    }).closest('article') as HTMLElement;

    await user.type(within(jobTitlePanel).getByLabelText(/job title/i), 'Software Engineer');
    await user.selectOptions(
      within(jobTitlePanel).getByLabelText(/^country$/i),
      'United States',
    );
    await user.click(within(jobTitlePanel).getByRole('button', { name: /view average/i }));

    expect(
      within(jobTitlePanel).getByRole('status', {
        name: /loading job title salary insight/i,
      }),
    ).toBeInTheDocument();
  });

  it('shows empty department and headcount states', async () => {
    server.use(
      http.get('/api/insights/salary/department', () =>
        HttpResponse.json({ data: [] }),
      ),
      http.get('/api/insights/headcount/country', () =>
        HttpResponse.json({ data: [] }),
      ),
    );

    render(<InsightsDashboard />);

    expect(
      await screen.findByText('No department salary data available.'),
    ).toBeInTheDocument();
    expect(screen.getByText('No headcount data available.')).toBeInTheDocument();
  });

  it('shows error states for department and headcount panels', async () => {
    server.use(
      http.get('/api/insights/salary/department', () =>
        HttpResponse.json(
          { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Department failed' } },
          { status: 500 },
        ),
      ),
      http.get('/api/insights/headcount/country', () =>
        HttpResponse.json(
          { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Headcount failed' } },
          { status: 500 },
        ),
      ),
    );

    render(<InsightsDashboard />);

    const alerts = await screen.findAllByRole('alert');
    expect(alerts.some((alert) => alert.textContent.includes('Department failed'))).toBe(
      true,
    );
    expect(alerts.some((alert) => alert.textContent.includes('Headcount failed'))).toBe(
      true,
    );
  });

  it('shows country stats and job title panel errors', async () => {
    const user = userEvent.setup();

    server.use(
      http.get('/api/insights/salary/country', () =>
        HttpResponse.json(
          { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Country failed' } },
          { status: 500 },
        ),
      ),
      http.get('/api/insights/salary/job-title', () =>
        HttpResponse.json(
          { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Job title failed' } },
          { status: 500 },
        ),
      ),
    );

    render(<InsightsDashboard />);
    await screen.findByRole('cell', { name: 'Engineering' });

    const countryPanel = screen.getByRole('heading', {
      name: /country salary stats/i,
    }).closest('article') as HTMLElement;

    await user.selectOptions(
      within(countryPanel).getByLabelText(/^country$/i),
      'United States',
    );
    await user.click(within(countryPanel).getByRole('button', { name: /view stats/i }));

    expect(await within(countryPanel).findByText('Country failed')).toBeInTheDocument();

    const jobTitlePanel = screen.getByRole('heading', {
      name: /average salary by job title/i,
    }).closest('article') as HTMLElement;

    await user.type(within(jobTitlePanel).getByLabelText(/job title/i), 'Software Engineer');
    await user.selectOptions(
      within(jobTitlePanel).getByLabelText(/^country$/i),
      'United States',
    );
    await user.click(within(jobTitlePanel).getByRole('button', { name: /view average/i }));

    expect(await within(jobTitlePanel).findByText('Job title failed')).toBeInTheDocument();
  });

  it('shows empty job title message when no employees match', async () => {
    const user = userEvent.setup();

    server.use(
      http.get('/api/insights/salary/job-title', () =>
        HttpResponse.json({
          data: null,
          message: "No employees found with job title 'Designer' in France",
        }),
      ),
    );

    render(<InsightsDashboard />);
    await screen.findByRole('cell', { name: 'Engineering' });

    const jobTitlePanel = screen.getByRole('heading', {
      name: /average salary by job title/i,
    }).closest('article') as HTMLElement;

    await user.type(within(jobTitlePanel).getByLabelText(/job title/i), 'Designer');
    await user.selectOptions(
      within(jobTitlePanel).getByLabelText(/^country$/i),
      'France',
    );
    await user.click(within(jobTitlePanel).getByRole('button', { name: /view average/i }));

    expect(
      await within(jobTitlePanel).findByText(
        "No employees found with job title 'Designer' in France",
      ),
    ).toBeInTheDocument();
  });
});
