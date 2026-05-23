import { render, type RenderOptions } from '@testing-library/react';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';
import type { ReactElement } from 'react';

type RenderWithRouterOptions = {
  routerProps?: MemoryRouterProps;
} & Omit<RenderOptions, 'wrapper'>;

export function renderWithRouter(
  ui: ReactElement,
  { routerProps = { initialEntries: ['/'] }, ...renderOptions }: RenderWithRouterOptions = {},
) {
  return render(
    <MemoryRouter {...routerProps}>{ui}</MemoryRouter>,
    renderOptions,
  );
}
