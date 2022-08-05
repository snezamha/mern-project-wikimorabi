import bcrypt from 'bcryptjs';

const data = {
  users: [
    {
      fullName: 'Nezameddin Hassani',
      mobile: '09124767102',
      password: bcrypt.hashSync('123456'),
      isAdmin: true,
    },
    {
      fullName: 'Ali Tavakoli',
      mobile: '09133137874',
      password: bcrypt.hashSync('123456'),
      isAdmin: false,
    },
  ],
  products: [
    {
      name: 'Nike Slim shirt',
      slug: 'nike-slim-shirt',
      category: 'Shirts',
      image: 'https://via.placeholder.com/250',
      price: 120,
      countInStock: 0,
      brand: 'Nike',
      rating: 4.5,
      numReviews: 10,
      description: 'high quality shirt',
    },
    {
      name: 'Adidas Fit Shirt',
      slug: 'adidas-fit-shirt',
      category: 'Shirts',
      image: 'https://via.placeholder.com/250',
      price: 250,
      countInStock: 20,
      brand: 'Adidas',
      rating: 4.0,
      numReviews: 10,
      description: 'high quality product',
    },
    {
      name: 'Nike Slim Pant',
      slug: 'nike-slim-pant',
      category: 'Pants',
      image: 'https://via.placeholder.com/250',
      price: 25,
      countInStock: 15,
      brand: 'Nike',
      rating: 4.5,
      numReviews: 14,
      description: 'high quality product',
    },
    {
      name: 'Adidas Fit Pant',
      slug: 'adidas-fit-pant',
      category: 'Pants',
      image: 'https://via.placeholder.com/250',
      price: 65,
      countInStock: 5,
      brand: 'Puma',
      rating: 4.5,
      numReviews: 10,
      description: 'high quality product',
    },
  ],
};
export default data;
