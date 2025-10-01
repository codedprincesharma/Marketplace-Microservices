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
    console.error('error in createProduct:', error && error.stack ? error.stack : error);
    return res.status(500).json({ success: false, message: 'internal server error' });
  }
}

async function getProduct(req, res) {
  try {
    const { q, minprice, maxprice, skip = 0, limit = 20 } = req.query;
    const filter = {}

    if (q) {
      filter.$text = { $search: q }
    }

    if (minprice) {
      filter['price.amount'] = { ...filter['price.amount'], $gte: Number(minprice) }
    }

    if (maxprice) {
      filter['price.amount'] = { ...filter['price.amount'], $lte: Number(maxprice) }
    }
    const products = await Product.find(filter).skip(Number(skip)).limit(Number(limit)).sort({ createdAt: -1 });
    return res.status(200).json({ data: products });
  } catch (error) {
    console.log('error in getProduct:', error && error.stack ? error.stack : error);

  }
}

async function getProductById(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.status(200).json({ success: true, data: product });

  }
  catch (error) {
    console.log('error in getProductById:', error && error.stack ? error.stack : error);
    return res.status(500).json({ success: false, message: 'internal server error' });
  }
}

async function updateProduct(req, res) {
  try {
    const { id } = req.body;

    // validate id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    // find product by id & seller
    const product = await Product.findOne({ _id: id, seller: req.user.id });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or you are not the owner'
      });
    }

    // allowed fields to update
    const allowedUpdates = ['title', 'description', 'priceAmount', 'priceCurrency'];

    for (const key of Object.keys(req.body)) {
      if (allowedUpdates.includes(key)) {
        if (key === 'priceAmount') {
          if (typeof req.body.priceAmount === 'object') {
            if (req.body.priceAmount.amount !== undefined) {
              product.price.amount = Number(req.body.priceAmount.amount);
            }
            if (req.body.priceAmount.currency) {
              product.price.currency = req.body.priceAmount.currency;
            }
          } else {
            product.price.amount = Number(req.body.priceAmount);
          }
        } else if (key === 'priceCurrency') {
          product.price.currency = req.body[key];
        } else {
          product[key] = req.body[key];
        }
      }
    }

    await product.save();

    return res.status(200).json({ success: true, data: product });

  } catch (error) {
    console.error('error in updateProduct:', error.stack || error);
    return res.status(500).json({
      success: false,
      message: 'internal server error'
    });
  }
}

async function deleteProduct(req, res) {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (String(product.seller) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: not product owner' });
    }
    await Product.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Product deleted' });
  }
  catch (err) {
    console.error('error in deleteProduct:', err.stack || err);
    return res.status(500).json({ success: false, message: 'internal server error' });
  }
}

async function getProductBySeller(req, res) {
  try {
    const sellerId = req.params.sellerId;
    const products = await Product.find({ seller: sellerId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: products });
  }
  catch (err) {
    console.error('error in getProductBySeller:', err.stack || err);
    return res.status(500).json({ success: false, message: 'internal server error' });
  }
}






module.exports = { createProduct, getProduct, getProductById, updateProduct, deleteProduct  , getProductBySeller };