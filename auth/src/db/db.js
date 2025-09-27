const mongoose = require('mongoose')



async function connectDb() {
  try {
    await mongoose.connect(process.env.MONGODB_URL)
    console.log("connect to mongodb")
  } catch (error) {
    console.log("error", error);

  }
}



module.exports = connectDb