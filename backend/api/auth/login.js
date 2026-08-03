import { connectDB, handleOptions, parseJsonBody, setCorsHeaders, signUserToken, User } from '../_lib/authHelpers.js';

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
    const { email, password } = await parseJsonBody(req);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = signUserToken(user);
    return res.status(200).json({ user, token });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
