import jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import User from '../models/User.js';
import sendResetEmail from '../utils/emailService.js';

export const register = async (req, res) => {
    try {
        const { email, password, companyProfile } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = new User({ email, password, companyProfile });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ user, token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ user, token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getProfile = async (req, res) => {
    res.json(req.user);
};

export const updateProfile = async (req, res) => {
    try {
        const { companyProfile } = req.body;
        req.user.companyProfile = companyProfile;
        await req.user.save();
        res.json(req.user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const email = req.body.email?.toLowerCase();
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        const frontendUrl = process.env.FRONTEND_URL || req.get('origin') || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
        // Send real email
        await sendResetEmail(email, resetUrl);

        res.json({
            message: 'Password reset link sent to your email.'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
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

        res.json({ message: 'Password has been reset' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
