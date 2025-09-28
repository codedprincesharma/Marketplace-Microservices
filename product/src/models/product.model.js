const e = require('express');
const mongoose = require('mongoose');
const { string } = require('three/tsl');



const productSchema = new mongoose.Schema({
  name: {
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
      thumbnailUrl: String,
      id: String
    },
  ]
}, {
  timestamps: true
});


const Product = mongoose.model('Product', productSchema);
module.exports = Product;