import { Router } from 'express';
import { registerSchema, loginSchema } from '../utils/validation.js';
import { catchAsync } from '../middleware/errorHandler.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { authService } from '../services/auth.service.js';

const router = Router();

// Register
router.post('/register', catchAsync(async (req, res) => {
  const validated = registerSchema.parse(req.body) as { name: string; email: string; password: string };
  const result = await authService.register(validated);

  res.status(201).json({
    success: true,
    data: result,
  });
}));

// Login
router.post('/login', catchAsync(async (req, res) => {
  const validated = loginSchema.parse(req.body) as { email: string; password: string };
  const result = await authService.login(validated);

  res.json({
    success: true,
    data: result,
  });
}));

// Refresh token
router.post('/refresh', catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Refresh token required' },
    });
  }

  const tokens = await authService.refreshToken(refreshToken);

  res.json({
    success: true,
    data: tokens,
  });
}));

// Logout
router.post('/logout', authenticate, catchAsync(async (req: AuthRequest, res) => {
  await authService.logout(req.userId!);

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
}));

// Get current user
router.get('/me', authenticate, catchAsync(async (req: AuthRequest, res) => {
  const user = await authService.getCurrentUser(req.userId!);

  res.json({
    success: true,
    data: user,
  });
}));

export { router as authRouter };
