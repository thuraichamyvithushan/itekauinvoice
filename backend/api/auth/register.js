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
    const { email, password, companyProfile } = await parseJsonBody(req);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ email, password, companyProfile });
    await user.save();

    const token = signUserToken(user);
    return res.status(201).json({ user, token });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
