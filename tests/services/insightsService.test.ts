import { http, HttpResponse } from 'msw';
import {
  getAverageSalaryByJobTitle,
  getHeadcountByCountry,
  getSalaryByDepartment,
  getSalaryStatsByCountry,
} from '@/services/insightsService';
import { server } from '../mocks/server';

describe('insightsService', () => {
  it('fetches salary stats by country', async () => {
    const result = await getSalaryStatsByCountry('United States');

    expect(result.data).toEqual({
      country: 'United States',
      min: 95000,
      max: 95000,
      average: 95000,
    });
  });

  it('fetches average salary by job title', async () => {
    const result = await getAverageSalaryByJobTitle(
      'Software Engineer',
      'United States',
    );

    expect(result.data).toEqual({
      country: 'United States',
      jobTitle: 'Software Engineer',
      average: 95000,
    });
  });

  it('fetches salary by department', async () => {
    const result = await getSalaryByDepartment();

    expect(result.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ department: 'Engineering', average: 95000 }),
      ]),
    );
  });

  it('fetches headcount by country', async () => {
    const result = await getHeadcountByCountry();

    expect(result.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ country: 'United States', headcount: 1 }),
      ]),
    );
  });

  it('throws when insight requests fail', async () => {
    server.use(
      http.get('/api/insights/salary/country', () =>
        HttpResponse.json(
          { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Server error' } },
          { status: 500 },
        ),
      ),
    );

    await expect(getSalaryStatsByCountry('United States')).rejects.toMatchObject({
      message: 'Server error',
    });
  });
});
