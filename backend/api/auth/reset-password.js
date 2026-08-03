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
    const { token, password } = await parseJsonBody(req);
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token is invalid or has expired' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({ message: 'Password has been reset' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
