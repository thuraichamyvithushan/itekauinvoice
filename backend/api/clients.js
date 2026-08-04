import Client from '../models/Client.js';
import { connectDB, handleOptions, parseJsonBody, requireAuthUser, setCorsHeaders } from './_lib/authHelpers.js';

export default async function handler(req, res) {
  const applyCors = setCorsHeaders(res);
  applyCors(req.headers.origin);

  if (req.method === 'OPTIONS') {
    return handleOptions(req, res);
  }

  try {
    await connectDB();
    const user = await requireAuthUser(req);
    const pathname = new URL(req.url, `http://${req.headers.host}`).pathname;
    const clientId = pathname.replace(/^\/api\/clients\/?/, '').replace(/\/$/, '');

    if (!clientId) {
      if (req.method === 'GET') {
        const clients = await Client.find({ userId: user._id }).sort({ name: 1 });
        return res.status(200).json(clients);
      }

      if (req.method === 'POST') {
        const body = await parseJsonBody(req);
        const client = new Client({
          ...body,
          userId: user._id
        });
        await client.save();
        return res.status(201).json(client);
      }

      return res.status(405).json({ message: 'Method not allowed' });
    }

    if (req.method === 'PUT') {
      const body = await parseJsonBody(req);
      const client = await Client.findOneAndUpdate(
        { _id: clientId, userId: user._id },
        body,
        { new: true }
      );

      if (!client) {
        return res.status(404).json({ message: 'Client not found' });
      }

      return res.status(200).json(client);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    const status = error.message === 'No token provided' || error.message === 'User not found' ? 401 : 500;
    return res.status(status).json({ message: status === 401 ? 'Please authenticate.' : error.message });
  }
}
