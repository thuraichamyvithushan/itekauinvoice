import crypto from 'crypto';
import sendResetEmail from '../../utils/emailService.js';
import { connectDB, handleOptions, parseJsonBody, setCorsHeaders, User } from '../_lib/authHelpers.js';

export default async function handler(req, res) {
  const applyCors = setCorsHeaders(res);
  applyCors(req.headers.origin);

  if (req.method === 'OPTIONS') {
    return handleOptions(req, res);
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const body = await parseJsonBody(req);
    const email = body.email?.toLowerCase();
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || req.headers.origin || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    await sendResetEmail(email, resetUrl);

    return res.status(200).json({
      message: 'Password reset link sent to your email.'
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
