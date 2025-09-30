const dotenv = require('dotenv')
dotenv.config()
const app = require('./src/app')
const connectDb = require('./src/db/db')

const PORT = 8081
connectDb()






app.listen(PORT, () => {
  console.log(`server running on port number ${PORT}`);
})