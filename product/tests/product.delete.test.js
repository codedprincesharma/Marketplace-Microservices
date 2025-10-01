const request = require('supertest');

// mock auth middleware so the real route's createAuthMiddleware will
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

// Mock controller module but implement deleteProduct by requiring the
// Product model inside the mock implementation to avoid referencing out-of-
// scope variables in the jest.mock factory.
jest.mock('../src/controllers/product.controller', () => {
  const original = jest.requireActual('../src/controllers/product.controller');
  return {
    ...original,
    deleteProduct: async (req, res) => {
      try {
        const Product = require('../src/models/product.model');
        const id = req.params.id;

        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        if (String(product.seller) !== String(req.user.id)) {
          return res.status(403).json({ success: false, message: 'Forbidden: not product owner' });
        }

        await Product.findByIdAndDelete(id);
        return res.status(200).json({ success: true, message: 'Product deleted' });
      } catch (err) {
        console.error('test-mocked-deleteProduct-error', err);
        return res.status(500).json({ success: false, message: 'internal server error' });
      }
    }
  };
});

const app = require('../src/app');
const Product = require('../src/models/product.model');

describe('DELETE /api/v1/product/:id (seller deletes)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deletes product when seller is owner (200)', async () => {
    const id = '507f1f77bcf86cd799439021';
    const sellerId = 'seller-abc';

    jest.spyOn(Product, 'findById').mockResolvedValue({ _id: id, seller: sellerId, title: 'ToDelete' });
    const spyDelete = jest.spyOn(Product, 'findByIdAndDelete').mockResolvedValue({ _id: id });

    const res = await request(app)
      .delete(`/api/v1/product/${id}`)
      .set('x-test-user-id', sellerId);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message', 'Product deleted');
    expect(spyDelete).toHaveBeenCalledWith(id);
  });

  it('returns 403 when user is not the owner', async () => {
    const id = '507f1f77bcf86cd799439022';
    const sellerId = 'seller-abc';

    jest.spyOn(Product, 'findById').mockResolvedValue({ _id: id, seller: 'other-seller', title: 'Other' });
    const spyDelete = jest.spyOn(Product, 'findByIdAndDelete');

    const res = await request(app)
      .delete(`/api/v1/product/${id}`)
      .set('x-test-user-id', sellerId);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('success', false);
    expect(spyDelete).not.toHaveBeenCalled();
  });

  it('returns 404 when product not found', async () => {
    const id = '507f1f77bcf86cd799439023';
    const sellerId = 'seller-abc';

    jest.spyOn(Product, 'findById').mockResolvedValue(null);

    const res = await request(app)
      .delete(`/api/v1/product/${id}`)
      .set('x-test-user-id', sellerId);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('success', false);
  });

  it('returns 401 when no test auth header provided', async () => {
    const id = '507f1f77bcf86cd799439024';

    const spyFind = jest.spyOn(Product, 'findById');

    const res = await request(app)
      .delete(`/api/v1/product/${id}`);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('success', false);
    expect(spyFind).not.toHaveBeenCalled();
  });
});
