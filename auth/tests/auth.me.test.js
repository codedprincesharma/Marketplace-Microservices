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

  beforeEach(async () => {
    // no-op: we'll register/login via the API in the happy path test to get a valid token
  })

  it('returns 200 and user info when token is valid', async () => {
    // register a user through the API so the server issues a valid token cookie
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: payload.username,
        email: payload.email,
        password: 'Password1!',
        fullName: { firstName: 'Me', lastName: 'User' }
      })
      .expect(201)

    const cookies = regRes.headers['set-cookie']
    expect(cookies).toBeDefined()
    const tokenCookie = cookies.find(c => c.startsWith('token='))
    expect(tokenCookie).toBeDefined()

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', [tokenCookie])
      .expect(200)

    expect(res.body).toHaveProperty('email', payload.email)
    expect(res.body).toHaveProperty('username', payload.username)
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
