import prisma from '../config/db.js';
import { paginate, buildPaginationMeta, sanitizeUser } from '../utils/helpers.js';
import { AppError } from '../middleware/errorHandler.js';
import bcrypt from 'bcryptjs';
export const getUsers = async (req, res, next) => {
  try {
    const { page, limit, search, role } = req.query;
    const { skip, take, page: pageNum, limit: limitNum } = paginate(page, limit);

    const where = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: users,
      meta: buildPaginationMeta(total, pageNum, limitNum),
    });
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { fullName, email, phone, password, role } = req.body;

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        password, // haddii aad hash gareyso, hash ku samee halkan
        role,
      },
    });

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true, productsAsSupplier: true } },
      },
    });

    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { fullName, phone, role } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { fullName, phone, role },
    });
    res.json({ success: true, data: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      throw new AppError('Cannot delete your own account', 400);
    }
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

export const getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await prisma.user.findMany({
      where: { role: 'SUPPLIER' },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        _count: { select: { productsAsSupplier: true } },
      },
    });
    res.json({ success: true, data: suppliers });
  } catch (err) {
    next(err);
  }
};

export const getFarmers = async (req, res, next) => {
  try {
    const farmers = await prisma.user.findMany({
      where: { role: 'FARMER' },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        _count: { select: { productsAsFarmer: true } },
      },
    });
    res.json({ success: true, data: farmers });
  } catch (err) {
    next(err);
  }
};
