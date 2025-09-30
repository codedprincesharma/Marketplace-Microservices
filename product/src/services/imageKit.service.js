const ImageKit = require("imagekit");
const { randomUUID } = require('crypto');


const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY?.trim(),
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY?.trim(),
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT?.trim(),
});


async function uploadImage({ buffer, fileName, folder = '/products' }) {

  const res = await imagekit.upload({
    file: buffer,
    fileName: fileName || randomUUID(),
    folder
  });
  return {
    url: res.url,
    thumbnail: res.thumbnailUrl || res.url,
    file: res.fileId
  }

}

module.exports = { imagekit, uploadImage };
