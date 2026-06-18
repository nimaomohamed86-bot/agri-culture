import { body } from 'express-validator';

export const registerValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['CUSTOMER', 'FARMER', 'SUPPLIER'])
    .withMessage('Invalid role'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('category')
    .isIn([
      'FRUITS',
      'VEGETABLES',
      'GRAINS',
      'SEEDS',
      'FERTILIZERS',
      'LIVESTOCK_FEED',
    ])
    .withMessage('Invalid category'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a positive integer'),
];
