const request = require('supertest');

// mock auth middleware to inject a user
jest.mock('../src/middlewares/auth.middleware', () => {
  return jest.fn(() => (req, res, next) => {
    req.user = { id: '507f1f77bcf86cd799439011', role: 'user' };
    next();
  });
});

const app = require('../src/app');
const Product = require('../src/models/product.model');

describe('GET /api/v1/product', () => {
  beforeAll(() => {
    jest.spyOn(Product, 'find').mockImplementation(() => ({
      skip: () => ({
        limit: () => ({
          sort: () => Promise.resolve([
            { _id: '1', title: 'P1' },
            { _id: '2', title: 'P2' }
          ])
        })
      })
    }));
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('returns a list of products', async () => {
    const res = await request(app).get('/api/v1/product').query({ skip: 0, limit: 10 });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data[0]).toHaveProperty('title', 'P1');
  });
});
