import nodemailer from 'nodemailer';

const sendResetEmail = async (email, resetUrl) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('WARNING: SMTP credentials missing. Falling back to console logging.');
        console.log(`\n--- PASSWORD RESET (SIMULATED) ---`);
        console.log(`To: ${email}`);
        console.log(`Reset URL: ${resetUrl}`);
        console.log(`----------------------------------\n`);
        return;
    }

    const transporter = nodemailer.createTransport({
        service: process.env.SMTP_SERVICE || 'gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS, 
        },
    });

    const mailOptions = {
        from: `"iTEK Invoices" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Password Reset Request - iTEK Invoices',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #f20000; text-align: center;">iTEK Invoices</h2>
                <p>Hello,</p>
                <p>You requested a password reset for your iTEK Invoices account. Click the button below to set a new password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #f20000; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                </div>
                <p>If you did not request this, please ignore this email. The link will expire in 1 hour.</p>
                <hr style="border: 0; border-top: 1px solid #eee;">
                <p style="font-size: 12px; color: #777;">This is an automated email. Please do not reply.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Real email sent to ${email}`);
    } catch (error) {
        console.error('Error sending real email:', error);
        throw new Error('Failed to send reset email. Please check your SMTP settings.');
    }
};

export default sendResetEmail;
