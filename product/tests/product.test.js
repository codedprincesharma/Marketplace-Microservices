const request = require('supertest');
const app = require('../src/app');
const Product = require('../src/models/product.model');

jest.mock('imagekit');

describe('POST /api/v1/product', () => {
  beforeAll(() => {
    // mock Product.create to avoid DB
    jest.spyOn(Product, 'create').mockImplementation((data) => Promise.resolve({ _id: 'mock-id', ...data }));
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('uploads image and creates product', async () => {
    const buffer = Buffer.from('fake-image-bytes');

    const res = await request(app)
      .post('/api/v1/product')
      .field('name', 'Test Product')
      .field('description', 'A product')
      .field('price', JSON.stringify({ amount: 100, currency: 'INR' }))
      .field('seller', '507f1f77bcf86cd799439011')
      .attach('image', buffer, { filename: 'test.jpg', contentType: 'image/jpeg' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id', 'mock-id');
    expect(res.body.data).toHaveProperty('images');
    expect(res.body.data.images[0].url).toContain('https://imagekit.example.com/test.jpg');
  });
});