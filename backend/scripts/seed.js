import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import User from '../models/User.js';

dotenv.config();

const mockProducts = [
  {
    name: "Classic Over-sized Blank",
    description: "Our signature heavyweight oversized blank tee featuring premium 240 GSM organic cotton. Dropped shoulders, wide sleeves, and a boxy fit designed for effortless daily styling.",
    price: 999,
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800"],
    category: "Oversized",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Black", "Charcoal"],
    stock: 120,
    rating: 4.8,
    numReviews: 24,
  },
  {
    name: "Urban Graphic Print Tee",
    description: "Inspired by Tokyo street culture, this graphic tee combines comfort with striking visual elements. Puff print detailing on the back with a subtle chest logo.",
    price: 1299,
    images: ["https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800"],
    category: "Streetwear",
    sizes: ["M", "L", "XL"],
    colors: ["Black", "Mint"],
    stock: 50,
    rating: 4.5,
    numReviews: 12,
  },
  {
    name: "Vintage Wash College Tee",
    description: "Achieve the perfect worn-in look from day one. Our vintage wash process creates a unique fade on every piece while maintaining the structural integrity of the garment.",
    price: 1199,
    images: ["https://images.unsplash.com/photo-1618354691438-25bc04584c23?auto=format&fit=crop&q=80&w=800"],
    category: "T-Shirts",
    sizes: ["S", "M", "L"],
    colors: ["Faded Navy", "Washed Grey"],
    stock: 85,
    rating: 4.9,
    numReviews: 56,
  },
];

const connectDB = async () => {
  try {
    console.log(`Attempting connection to ${process.env.MONGO_URI} ...`);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected!');

    console.log('Clearing existing records...');
    await Product.deleteMany();
    
    console.log('Seeding mock structural payload...');
    await Product.insertMany(mockProducts);
    
    console.log('Data Imported Successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error with data import: ${error.message}`);
    process.exit(1);
  }
};

connectDB();
