const app = require('./src/app')
const dotenv = require('dotenv')
const connectDb = require('./src/db/db')
dotenv.config()

const PORT = 8080
connectDb()






app.listen(PORT, () => {
  console.log(`server running on port number ${PORT}`);
})