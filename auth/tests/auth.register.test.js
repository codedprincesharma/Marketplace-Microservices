const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user.model')

describe('POST /api/v1/auth/register', () => {
  it('creates a user with valid payload and returns 201', async () => {
    const payload = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!',
      fullName: { firstName: 'Test', lastName: 'User' }
    }

    const res = await request(app).post('/api/v1/auth/register').send(payload)
    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body.email).toBe(payload.email)

    const userInDb = await User.findOne({ email: payload.email })
    expect(userInDb).not.toBeNull()
    expect(userInDb.username).toBe(payload.username)
  })

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({})
    expect(res.status).toBe(400)
  })

  it('returns 409 when email already exists', async () => {
    const payload = {
      username: 'testuser',
      email: 'dup@example.com',
      password: 'Password123!',
      fullName: { firstName: 'Dup', lastName: 'User' }
    }
    // create existing user
    await User.create({ username: payload.username, email: payload.email, password: 'x', fullName: payload.fullName })

    const res = await request(app).post('/api/v1/auth/register').send(payload)
    expect(res.status).toBe(409)
  })
})
