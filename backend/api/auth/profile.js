import { connectDB, handleOptions, parseJsonBody, requireAuthUser, setCorsHeaders } from '../_lib/authHelpers.js';

export default async function handler(req, res) {
  const applyCors = setCorsHeaders(res);
  applyCors(req.headers.origin);

  if (req.method === 'OPTIONS') {
    return handleOptions(req, res);
  }

  try {
    await connectDB();
    const user = await requireAuthUser(req);

    if (req.method === 'GET') {
      return res.status(200).json(user);
    }

    if (req.method === 'PUT') {
      const { companyProfile } = await parseJsonBody(req);
      user.companyProfile = companyProfile;
      await user.save();
      return res.status(200).json(user);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    const status = error.message === 'No token provided' || error.message === 'User not found' ? 401 : 500;
    return res.status(status).json({ message: status === 401 ? 'Please authenticate.' : error.message });
  }
}
