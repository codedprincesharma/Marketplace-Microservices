const imagekit = require('../utlis/imageKit');
const Product = require('../models/product.model');

async function createProduct(req, res) {
  try {
    const { name, description, price, seller } = req.body;

    // safely parse price
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

    // if multiple files present, upload them all
    if (req.files && req.files.length > 0) {
      const uploads = await Promise.all(
        req.files.map((file) =>
          imagekit.upload({
            file: file.buffer,
            fileName: file.originalname,
          })
        )
      );

      productData.images = uploads.map((upload) => ({
        url: upload.url,
        id: upload.fileId || upload.file_id || upload.id,
      }));
    }

    const created = await Product.create(productData);
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error('createProduct error', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
module.exports = { createProduct };
