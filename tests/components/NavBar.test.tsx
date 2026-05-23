import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { NavBar } from '@/components/NavBar';

function renderNavBar(initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <NavBar />
      <Routes>
        <Route path="/" element={<h1>Employees Page</h1>} />
        <Route path="/insights" element={<h1>Insights Page</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe.skip('NavBar', () => {
  it('renders both nav links', () => {
    renderNavBar();

    expect(screen.getByRole('link', { name: /employees/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /insights/i })).toBeInTheDocument();
  });

  it('highlights the Employees link on the / route', () => {
    renderNavBar('/');

    expect(screen.getByRole('link', { name: /employees/i })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: /insights/i })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('highlights the Insights link on the /insights route', () => {
    renderNavBar('/insights');

    expect(screen.getByRole('link', { name: /insights/i })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: /employees/i })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('navigates to /insights when the Insights link is clicked', async () => {
    const user = userEvent.setup();
    renderNavBar('/');

    await user.click(screen.getByRole('link', { name: /insights/i }));

    expect(screen.getByRole('heading', { name: /insights page/i })).toBeInTheDocument();
  });
});

describe('NavBar placeholder', () => {
  it('renders the stub component', () => {
    const { container } = render(<NavBar />);
    expect(container).toBeEmptyDOMElement();
  });
});
