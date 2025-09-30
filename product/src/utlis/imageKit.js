const ImageKit = require("imagekit");



const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY?.trim(),
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY?.trim(),
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT?.trim(),
});


module.exports = imagekit;
