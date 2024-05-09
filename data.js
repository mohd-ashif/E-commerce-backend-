
import bcrypt from 'bcryptjs';

const data = {

  users: [
    {
      name: 'ashif',
      email: 'admin@example.com',
      password: bcrypt.hashSync('123456'),
      isAdmin: true,
    },
    {
      name: 'John',
      email: 'user@example.com',
      password: bcrypt.hashSync('123456'),
      isAdmin: false,
    },
  ],

  products: [
    {
      // _id: '1',
      name: 'Nike Slim Shirt',
      slug: 'nike-slim-shirt',
      category: 'Shirts',
      image: '/images/p1.jpg',
      price: 120,
      countInStock: 10,
      brand: 'Nike',
      rating: 4.5,
      numReviews: 10,
      description: 'High-quality shirt from Nike. This slim-fit shirt is designed for both style and comfort, making it a perfect addition to your wardrobe.',
    },
    {
      // _id: '2',
      name: 'Adidas Fit Shirt',
      slug: 'adidas-fit-shirt',
      category: 'Shirts',
      image: '/images/p2.jpg',
      price: 250,
      countInStock: 0,
      brand: 'Adidas',
      rating: 4.0,
      numReviews: 10,
      description: 'Discover comfort and style with the Adidas Fit Shirt. Made with premium materials, this shirt offers a perfect fit for your active lifestyle.',
    },
    {
      // _id: '3',
      name: 'Nike Slim Pant',
      slug: 'nike-slim-pant',
      category: 'Pants',
      image: '/images/p7.jpg',
      price: 25,
      countInStock: 15,
      brand: 'Nike',
      rating: 4.5,
      numReviews: 14,
      description: 'Upgrade your wardrobe with the Nike Slim Pant. These comfortable and stylish pants are perfect for both casual and active wear.',
    },
    {
      // _id: '4',
      name: 'Adidas Fit Pant',
      slug: 'adidas-fit-pant',
      category: 'Pants',
      image: '/images/p8.jpg',
      price: 65,
      countInStock: 5,
      brand: 'Puma',
      rating: 4.5,
      numReviews: 10,
      description: 'Experience ultimate comfort with the Adidas Fit Pant. Ideal for various activities, these pants provide flexibility and style in one package.',
    },
    {
      // _id: '5',
      name: 'Nike Running Shoes',
      slug: 'nike-nike-t-shoes',
      category: 'Shoes',
      image: '/images/p5.jpg',
      price: 150,
      countInStock: 0,
      brand: 'Nike',
      rating: 4.5,
      numReviews: 8,
      description: 'Enhance your running experience with Nike Running Shoes. Designed for comfort and performance, these shoes are perfect for your daily runs.',
    },
    {
      // _id: '6',
      name: 'Levi\'s Slim Jeans',
      slug: 'levis-slim-jeans',
      category: 'Jeans',
      image: '/images/p9.jpg',
      price: 80,
      countInStock: 25,
      brand: 'Levi\'s',
      rating: 3.8,
      numReviews: 12,
      description: 'Get the classic look with Levi\'s Slim Jeans. These timeless jeans offer a slim fit and enduring style, making them a wardrobe essential.',
    },
   
  ],
};

export default data;
