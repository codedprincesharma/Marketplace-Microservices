const { imagekit, uploadImage } = require('../services/imageKit.service');
const Product = require('../models/product.model');

async function createProduct(req, res) {
  try {
    const { title, description, priceAmount, priceCurrency = 'INR' } = req.body;

    // validate required fields (express-validator will handle most checks, but keep a guard)
    if (!title || !priceAmount) {
      return res.status(400).json({ success: false, message: 'title and priceAmount are required' });
    }

    const seller = req.user && req.user.id;
    if (!seller) {
      return res.status(401).json({ success: false, message: 'Unauthorized: seller not found' });
    }

    const price = {
      amount: Number(priceAmount),
      currency: priceCurrency,
    };

    // upload images (if any) and collect results
    const images = await Promise.all((req.files || []).map(async (file) => {
      const r = await uploadImage({ buffer: file.buffer, fileName: file.originalname });
      return {
        url: r.url,
        thumbnailUrl: r.thumbnail || r.thumbnailUrl || r.url,
        id: r.file || r.fileId || r.file_id
      };
    }));

    const product = await Product.create({
      title,
      description,
      price,
      seller,
      images
    });

    return res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.log('error:-', error);
    return res.status(500).json({ success: false, message: 'internal server error' });
  }
}

module.exports = { createProduct };
