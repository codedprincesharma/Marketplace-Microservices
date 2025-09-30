const imagekit = require('../utlis/imageKit');
const Product = require('../models/product.model');

// initialize ImageKit with env vars (in tests we'll mock the SDK)

async function createProduct(req, res) {
  try {
    const { name, description, price, seller } = req.body;


    let parsedPrice = { amount: 0, currency: 'INR' };
    try {
      if (price) {
        const temp = JSON.parse(price);
        parsedPrice.amount = temp.amount || 0;
        parsedPrice.currency = temp.currency || 'INR';
      }
    } catch (err) {
      console.error("Price parsing failed, using default:", err);
    }

    const productData = { name, description, price: parsedPrice, seller };

    // if file present, upload to ImageKit
    if (req.file) {
      const uploadResult = await imagekit.upload({
        file: req.file.buffer,
        fileName: req.file.originalname
      });

      productData.images = [
        {
          url: uploadResult.url,
          thumbnailUrl: uploadResult.thumbnailUrl || uploadResult.url,
          id: uploadResult.fileId || uploadResult.file_id || uploadResult.id
        }
      ];
    }

    const created = await Product.create(productData);
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error('createProduct error', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = { createProduct };