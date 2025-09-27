const request = require('supertest')
const app = require('../src/app')

// Tests for address management endpoints
// - GET /api/v1/auth/user/addresses
// - POST /api/v1/auth/user/addresses
// - DELETE /api/v1/auth/user/addresses/:addressID

describe('Address APIs', () => {
  let cookie

  beforeEach(async () => {
    // register user and capture auth cookie before each test (tests/setup clears DB between tests)
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'addruser',
        email: 'addr@example.com',
        password: 'Password1!',
        fullName: { firstName: 'Addr', lastName: 'User' }
      })
      .expect(201)

    const cookies = res.headers['set-cookie']
    cookie = cookies.find(c => c.startsWith('token='))
  })

  test('GET /api/v1/auth/user/addresses returns empty list initially', async () => {
    const res = await request(app)
      .get('/api/v1/auth/user/addresses')
      .set('Cookie', [cookie])
      .expect(200)

    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBe(0)
  })

  test('POST /api/v1/auth/user/addresses adds an address (valid)', async () => {
    const address = {
      street: '123 Test St',
      city: 'Testville',
      state: 'TS',
      country: 'Testland',
      zipCode: '123456',
      isDefault: true
    }

    const res = await request(app)
      .post('/api/v1/auth/user/addresses')
      .set('Cookie', [cookie])
      .send(address)
      .expect(201)

    expect(res.body).toHaveProperty('street', address.street)
    expect(res.body).toHaveProperty('zipCode', address.zipCode)
    // ensure ID is returned
    expect(res.body).toHaveProperty('_id')
  })

  test('POST /api/v1/auth/user/addresses rejects invalid zipCode (pin)', async () => {
    const bad = {
      street: '1 Bad St',
      city: 'Nope',
      state: 'NS',
      country: 'Nowhere',
      zipCode: 'abcde' // invalid
    }

    const res = await request(app)
      .post('/api/v1/auth/user/addresses')
      .set('Cookie', [cookie])
      .send(bad)
      .expect(400)

    expect(res.body).toHaveProperty('errors')
  })

  test('DELETE /api/v1/auth/user/addresses/:addressID removes an address', async () => {
    // add an address first
    const addr = {
      street: 'To Delete',
      city: 'Delcity',
      state: 'DL',
      country: 'DeleteLand',
      zipCode: '999999'
    }

    const addRes = await request(app)
      .post('/api/v1/auth/user/addresses')
      .set('Cookie', [cookie])
      .send(addr)
      .expect(201)

    const id = addRes.body._id

    // delete
    await request(app)
      .delete(`/api/v1/auth/user/addresses/${id}`)
      .set('Cookie', [cookie])
      .expect(200)

    // verify it's gone
    const listRes = await request(app)
      .get('/api/v1/auth/user/addresses')
      .set('Cookie', [cookie])
      .expect(200)

    const found = listRes.body.find(a => a._id === id)
    expect(found).toBeUndefined()
  })
})
