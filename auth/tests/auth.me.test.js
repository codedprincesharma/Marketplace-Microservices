const request = require('supertest')
const app = require('../src/app')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

describe('GET /api/v1/auth/me', () => {
  // sample user payload used in token
  const payload = {
    id: new mongoose.Types.ObjectId().toString(),
    username: 'meuser',
    email: 'me@example.com',
    role: 'user'
  }

  it('returns 200 and user info when token is valid', async () => {
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' })

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', [`token=${token}`])
      .expect(200)

    expect(res.body).toHaveProperty('id', payload.id)
    expect(res.body).toHaveProperty('username', payload.username)
    expect(res.body).toHaveProperty('email', payload.email)
  })

  it('returns 401 when token is missing', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .expect(401)

    expect(res.body).toHaveProperty('message')
  })

  it('returns 401 when token is invalid', async () => {
    const badToken = 'this.is.not.a.valid.token'
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', [`token=${badToken}`])
      .expect(401)

    expect(res.body).toHaveProperty('message')
  })
})
