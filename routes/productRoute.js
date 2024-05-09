import express from 'express';
import Product from '../model/productModel.js';
import expressAsyncHandler from 'express-async-handler';
import { isAdmin, isAuth } from '../utils.js';
import multer from 'multer';
import path from 'path'; 

const productRouter = express.Router(); 

productRouter.use('/uploads', express.static('uploads'));

// Image upload 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  }, 
  filename: (req, file, cb) => { 
    cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 6, // 6 MB limit
  },
});

//get all Products
productRouter.get('/', async (req, res) => {
  const products = await Product.find();
  res.send(products);
});

// Set search  , Filter , Sort ,Pagination
const PAGE_SIZE = 3;

productRouter.get(
  '/search',
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const pageSize = query.pageSize || PAGE_SIZE;
    const page = query.page || 1;
    const category = query.category || '';
    const price = query.price || '';
    const rating = query.rating || '';
    const order = query.order || '';
    const searchQuery = query.query || '';

 
    const queryFilter =
      searchQuery && searchQuery !== 'all'
        ? {
            name: {
              $regex: searchQuery,
              $options: 'i',
            },
          }
        : {};

    const categoryFilter = category && category !== 'all' ? { category } : {};
    const ratingFilter =
      rating && rating !== 'all'
        ? {
            rating: {
              $gte: Number(rating),
            },
          }
        : {};
    const priceFilter =
      price && price !== 'all'
        ? {
            // 1-50
            price: {
              $gte: Number(price.split('-') [0]),
              $lte: Number(price.split('-')[1]),
            },
          }
        : {};
    const sortOrder = 
      order === 'featured'
        ? { featured: -1 }
        : order === 'lowest'
        ? { price: 1 }
        : order === 'highest'
        ? { price: -1 }
        : order === 'toprated'
        ? { rating: -1 }
        : order === 'newest'
        ? { createdAt: -1 }
        : { _id: -1 };

    const products = await Product.find({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    })
      .sort(sortOrder) 
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countProducts = await Product.countDocuments({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter, 
      ...ratingFilter,
    });
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);

productRouter.get(
  '/categories',
  expressAsyncHandler(async (req, res) => {
    const categories = await Product.find().distinct('category');
    res.send(categories);
  })
);

// GET product by slug
productRouter.get('/slug/:slug', async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Product Not Found' });
  }
});

//get product:id
productRouter.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Product Not Found' });
  }
});


// Admin products
productRouter.get(
  '/admin',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
  
    const products = await Product.find()
    
    res.send(products);
  })
);


//review
productRouter.post(
  '/:id/reviews',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
      if (product.reviews.find((x) => x.name === req.user.name)) {
        return res
          .status(400)
          .send({ message: 'You already submitted a review' });
      }

      const review = {
        name: req.user.name,
        rating: Number(req.body.rating),
        comment: req.body.comment,
      };
      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((a, c) => c.rating + a, 0) /
        product.reviews.length;
      const updatedProduct = await product.save();
      res.status(201).send({
        message: 'Review Created',
        review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
        numReviews: product.numReviews,
        rating: product.rating,
      });
    } else {
      res.status(404).send({ message: 'Product Not Found' });
    }
  })
);

// DELETE a product by ID
productRouter.delete('/:id', isAuth, isAdmin, expressAsyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "product not found" });
    }

    res.status(200).json({ message: "product deleted successfully", product });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: "Internal server error" });
  }
}));

// POST create a new product  (only admin)
productRouter.post('/create',upload.single('image'),
  
  expressAsyncHandler(async (req, res) => {
    try {
     
      if (!req.file) {
        throw new Error('No file uploaded');
      }
      const imagePath = req.file ? req.file.filename : null;

      const newProduct = new Product({
        name: req.body.name,
        slug: req.body.slug,
        image: imagePath, 
        price: req.body.price,
        category: req.body.category,
        brand: req.body.brand,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        offerPrice:req.body.offerPrice,
        description: req.body.description,
      });

      const product = await newProduct.save();
      res.status(201).send({ message: 'Product Created', product });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(400).send({ message: error.message || 'Invalid request' }); 
    }
  })
);

// PUT update a product by ID (only Admin)
productRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  upload.single('image'), 
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;

    try {
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).send({ message: 'Product Not Found' });
      }

      product.name = req.body.name || product.name;
      product.slug = req.body.slug || product.slug;
      product.price = req.body.price || product.price;
      product.category = req.body.category || product.category;
      product.brand = req.body.brand || product.brand;
      product.countInStock = req.body.countInStock || product.countInStock;
      product.offerPrice = req.body.offerPrice || product.offerPrice;
      product.description = req.body.description || product.description;
      
      if (req.file) {
        const imagePath = req.file.filename;
        product.image = imagePath;
      }

      await product.save();
      return res.send({ message: 'Product Updated', product });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Internal Server Error' });
    }
  })
);

// GET a product by ID
productRouter.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Product Not Found' });
  }
});



export default productRouter