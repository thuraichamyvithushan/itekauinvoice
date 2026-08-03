import Client from '../models/Client.js';

export const getClients = async (req, res) => {
    try {
        const clients = await Client.find({ userId: req.user._id }).sort({ name: 1 });
        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createClient = async (req, res) => {
    try {
        const client = new Client({
            ...req.body,
            userId: req.user._id
        });
        await client.save();
        res.status(201).json(client);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateClient = async (req, res) => {
    try {
        const client = await Client.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true }
        );
        if (!client) return res.status(404).json({ message: 'Client not found' });
        res.json(client);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
