import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { users } from '../database/models.js';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// Token generation
export const generateTokens = async (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'Veloura-hotel-backend',
    audience: 'Veloura-hotel-frontend'
  });

  const refreshToken = jwt.sign(
    { id: user.id, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
};

// Token verification
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'Veloura-hotel-backend',
      audience: 'Veloura-hotel-frontend'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

export const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid refresh token');
    }
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    } else {
      throw new Error('Refresh token verification failed');
    }
  }
};

// Password hashing
export const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Authentication service
export class AuthService {
  // User registration
  async register(userData) {
    const { email, password, name, phone, nationality } = userData;

    // Check if user already exists
    const existingUser = await users.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await users.create({
      email,
      password_hash: passwordHash,
      name,
      phone,
      nationality
    });

    // Generate tokens
    const tokens = await generateTokens(user);

    // Remove password hash from response
    delete user.password_hash;

    return {
      user,
      tokens
    };
  }

  // User login
  async login(email, password) {
    // Find user
    const user = await users.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check password
    if (!await comparePassword(password, user.password_hash)) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await users.update(user.id, { last_login: new Date() });

    // Generate tokens
    const tokens = await generateTokens(user);

    // Remove password hash from response
    delete user.password_hash;

    return {
      user,
      tokens
    };
  }

  // Refresh access token
  async refreshToken(refreshToken) {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user
    const user = await users.findById(decoded.id);
    if (!user || !user.is_active) {
      throw new Error('User not found or inactive');
    }

    // Generate new tokens
    const tokens = await generateTokens(user);

    return tokens;
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    // Find user
    const user = await users.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    if (!await comparePassword(currentPassword, user.password_hash)) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await users.update(userId, { password_hash: newPasswordHash });

    return { success: true, message: 'Password changed successfully' };
  }

  // Reset password request
  async requestPasswordReset(email) {
    const user = await users.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not
      return { success: true, message: 'If an account exists, a reset link has been sent' };
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { id: user.id, type: 'password_reset' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // In a real application, you would send this via email
    console.log(`Password reset token for ${email}: ${resetToken}`);

    return { 
      success: true, 
      message: 'If an account exists, a reset link has been sent',
      resetToken // Only for development/testing
    };
  }

  // Reset password
  async resetPassword(token, newPassword) {
    try {
      // Verify reset token
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.type !== 'password_reset') {
        throw new Error('Invalid reset token');
      }

      // Find user
      const user = await users.findById(decoded.id);
      if (!user) {
        throw new Error('User not found');
      }

      // Hash new password
      const passwordHash = await hashPassword(newPassword);

      // Update password
      await users.update(user.id, { password_hash: passwordHash });

      return { success: true, message: 'Password reset successfully' };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Reset token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid reset token');
      } else {
        throw error;
      }
    }
  }

  // Verify email
  async verifyEmail(token) {
    try {
      // Verify email token
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.type !== 'email_verification') {
        throw new Error('Invalid verification token');
      }

      // Update user email verification status
      await users.update(decoded.id, { email_verified: true });

      return { success: true, message: 'Email verified successfully' };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Verification token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid verification token');
      } else {
        throw error;
      }
    }
  }

  // Generate email verification token
  async generateEmailVerification(userId) {
    const token = jwt.sign(
      { id: userId, type: 'email_verification' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return token;
  }

  // Logout (revoke tokens - in a real app, you'd maintain a blacklist)
  async logout(refreshToken) {
    try {
      // Verify the refresh token to get user info
      const decoded = verifyRefreshToken(refreshToken);
      
      // In a real application, you would add the token to a blacklist
      // For now, we just verify it's valid and return success
      console.log(`User ${decoded.id} logged out`);
      
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      // Even if token is invalid, we return success for security
      return { success: true, message: 'Logged out successfully' };
    }
  }

  // Get user profile
  async getProfile(userId) {
    const user = await users.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Remove sensitive data
    delete user.password_hash;

    return user;
  }

  // Update user profile
  async updateProfile(userId, updates) {
    const allowedFields = ['name', 'phone', 'nationality'];
    const filteredUpdates = {};
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      throw new Error('No valid fields to update');
    }

    const user = await users.update(userId, filteredUpdates);
    if (!user) {
      throw new Error('User not found');
    }

    // Remove sensitive data
    delete user.password_hash;

    return user;
  }
}

// Role-based access control
export const hasRole = (userRole, requiredRoles) => {
  if (typeof requiredRoles === 'string') {
    requiredRoles = [requiredRoles];
  }
  return requiredRoles.includes(userRole);
};

export const hasPermission = (userRole, permission) => {
  const permissions = {
    guest: ['read_own_profile', 'create_booking', 'read_own_bookings'],
    staff: ['read_own_profile', 'create_booking', 'read_own_bookings', 'read_hotels', 'read_rooms', 'manage_bookings'],
    manager: ['read_own_profile', 'create_booking', 'read_own_bookings', 'read_hotels', 'read_rooms', 'manage_bookings', 'manage_rooms', 'read_analytics', 'manage_staff'],
    admin: ['*'] // All permissions
  };

  if (permissions[userRole]?.includes('*')) {
    return true;
  }

  return permissions[userRole]?.includes(permission) || false;
};

// Rate limiting for auth attempts
export const authAttempts = new Map(); // In production, use Redis

export const recordAuthAttempt = (identifier) => {
  const now = Date.now();
  const attempts = authAttempts.get(identifier) || [];
  
  // Remove attempts older than 15 minutes
  const recentAttempts = attempts.filter(time => now - time < 15 * 60 * 1000);
  recentAttempts.push(now);
  
  authAttempts.set(identifier, recentAttempts);
  
  return recentAttempts.length;
};

export const isAuthBlocked = (identifier) => {
  const attempts = authAttempts.get(identifier) || [];
  const now = Date.now();
  
  // Count attempts in last 15 minutes
  const recentAttempts = attempts.filter(time => now - time < 15 * 60 * 1000);
  
  // Block after 5 failed attempts
  return recentAttempts.length >= 5;
};

export const clearAuthAttempts = (identifier) => {
  authAttempts.delete(identifier);
};

// Export service instance
export const authService = new AuthService();

// Export default
export default {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  hashPassword,
  comparePassword,
  AuthService,
  authService,
  hasRole,
  hasPermission,
  recordAuthAttempt,
  isAuthBlocked,
  clearAuthAttempts
};
