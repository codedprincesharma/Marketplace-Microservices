const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user.model')
const bcrypt = require('bcrypt')

describe('POST /api/v1/auth/login', () => {
  const userData = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'Password1!',
    fullName: { firstName: 'Test', lastName: 'User' }
  }

  beforeEach(async () => {
    // create user in DB with hashed password
    const hashed = await bcrypt.hash(userData.password, 10)
    await User.create({
      username: userData.username,
      email: userData.email,
      password: hashed,
      fullName: userData.fullName
    })
  })

  it('returns 200 and sets cookie on valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: userData.email, password: userData.password })
      .expect(200)

    expect(res.body).toHaveProperty('message', 'Login successful')
    expect(res.body).toHaveProperty('email', userData.email)
    // cookie should be set
    const cookies = res.headers['set-cookie']
    expect(cookies).toBeDefined()
    expect(cookies.some(c => c.startsWith('token='))).toBe(true)
  })

  it('returns 401 on invalid password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: userData.email, password: 'WrongPass1!' })
      .expect(401)

    expect(res.body).toHaveProperty('message', 'Invalid credentials')
  })
})
