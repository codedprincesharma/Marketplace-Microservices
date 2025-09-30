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

describe('GET /api/v1/product/:id', () => {
  beforeAll(() => {
    jest.spyOn(Product, 'findById').mockImplementation((id) => Promise.resolve({ _id: id, title: 'P-ById' }));
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('returns a product by id', async () => {
    const id = '507f1f77bcf86cd799439011';
    const res = await request(app).get(`/api/v1/product/${id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('_id', id);
    expect(res.body.data).toHaveProperty('title', 'P-ById');
  });
});
