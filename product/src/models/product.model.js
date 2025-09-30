const mongoose = require('mongoose');



const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,

  },
  price: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      enum: ['USD', 'INR'],
      default: 'INR'
    }
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  images: [
    {
      url: String,
      // thumbnailUrl: String,
      id: String
    },
  ]
}, {
  timestamps: true
});

productSchema.index({ title: 'text', description: 'text' })
const Product = mongoose.model('Product', productSchema);
module.exports = Product;