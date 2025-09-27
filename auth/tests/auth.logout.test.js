const request = require('supertest')
const app = require('../src/app')
const jwt = require('jsonwebtoken')

describe('POST /api/v1/auth/logout', () => {
  const payload = {
    id: '000000000000000000000000',
    username: 'logoutuser',
    email: 'logout@example.com',
    role: 'user'
  }

  it('clears the token cookie and returns 200 when token is present', async () => {
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' })

    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', [`token=${token}`])
      .expect(200)

    const cookies = res.headers['set-cookie']
    expect(cookies).toBeDefined()
    // expect at least one cookie to clear the token — look for token= and an expiry or max-age=0
    const cleared = cookies.some(c => {
      return c.startsWith('token=') && (c.includes('Max-Age=0') || /Expires=/i.test(c) || /token=;/.test(c))
    })
    expect(cleared).toBe(true)
  })

  it('returns 200 even when there is no token (idempotent logout)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .expect(200)

    // If implementation clears cookie even when none existed, fine; otherwise just ensure no server error
    expect(res.body).toBeDefined()
  })
})
