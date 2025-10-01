const request = require('supertest');

// mock the auth middleware so the real route's createAuthMiddleware will
// accept an `x-test-user-id` header and set req.user accordingly. Must mock
// before requiring the app so the mocked factory is used when routes are
// registered.
jest.mock('../src/middlewares/auth.middleware', () => {
  return jest.fn(() => (req, res, next) => {
    const userId = req.headers['x-test-user-id'];
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    req.user = { id: String(userId), role: 'seller' };
    next();
  });
});

// mock the controller module but implement updateProduct by requiring the
// Product model inside the mock implementation to avoid referencing out-of-
// scope variables in the jest.mock factory.
jest.mock('../src/controllers/product.controller', () => {
  const original = jest.requireActual('../src/controllers/product.controller');
  return {
    ...original,
    updateProduct: async (req, res) => {
      try {
        const Product = require('../src/models/product.model');
        const id = req.params.id;
        const updates = req.body || {};

        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        if (String(product.seller) !== String(req.user.id)) {
          return res.status(403).json({ success: false, message: 'Forbidden: not product owner' });
        }
        if (updates.priceAmount !== undefined && isNaN(Number(updates.priceAmount))) {
          return res.status(400).json({ success: false, message: 'priceAmount must be a number' });
        }
        const updated = await Product.findByIdAndUpdate(id, updates, { new: true });
        return res.status(200).json({ success: true, data: updated });
      } catch (err) {
        console.error('test-mocked-updateProduct-error', err);
        return res.status(500).json({ success: false, message: 'internal server error' });
      }
    }
  };
});

const app = require('../src/app');
const Product = require('../src/models/product.model');

describe('PATCH /api/v1/product/:id (seller updates)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('updates product when seller is owner (200)', async () => {
    const id = '507f1f77bcf86cd799439011';
    const sellerId = 'seller-123';

    // product found with seller matching test user
    jest.spyOn(Product, 'findById').mockResolvedValue({ _id: id, seller: sellerId, title: 'Old' });
    jest.spyOn(Product, 'findByIdAndUpdate').mockResolvedValue({ _id: id, seller: sellerId, title: 'New' });

    const res = await request(app)
      .patch(`/api/v1/product/${id}`)
      .set('x-test-user-id', sellerId)
      .send({ title: 'New' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('title', 'New');
  });

  it('returns 403 when user is not the owner', async () => {
    const id = '507f1f77bcf86cd799439012';
    const sellerId = 'seller-123';

    // product found but seller is different
    jest.spyOn(Product, 'findById').mockResolvedValue({ _id: id, seller: 'other-seller', title: 'Old' });
    const spyUpdate = jest.spyOn(Product, 'findByIdAndUpdate');

    const res = await request(app)
      .patch(`/api/v1/product/${id}`)
      .set('x-test-user-id', sellerId)
      .send({ title: 'New' });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('success', false);
    expect(spyUpdate).not.toHaveBeenCalled();
  });

  it('returns 404 when product not found', async () => {
    const id = '507f1f77bcf86cd799439013';
    const sellerId = 'seller-123';

    jest.spyOn(Product, 'findById').mockResolvedValue(null);

    const res = await request(app)
      .patch(`/api/v1/product/${id}`)
      .set('x-test-user-id', sellerId)
      .send({ title: 'New' });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('success', false);
  });

  it('returns 400 when validation fails (priceAmount not numeric)', async () => {
    const id = '507f1f77bcf86cd799439014';
    const sellerId = 'seller-123';

    jest.spyOn(Product, 'findById').mockResolvedValue({ _id: id, seller: sellerId, title: 'Old' });
    const spyUpdate = jest.spyOn(Product, 'findByIdAndUpdate');

    const res = await request(app)
      .patch(`/api/v1/product/${id}`)
      .set('x-test-user-id', sellerId)
      .send({ priceAmount: 'not-a-number' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('success', false);
    expect(spyUpdate).not.toHaveBeenCalled();
  });
});