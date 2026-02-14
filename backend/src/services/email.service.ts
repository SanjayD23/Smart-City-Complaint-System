import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '2525'),
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendEmail = async (to: string, subject: string, text: string) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || 'noreply@smartcity.com',
            to,
            subject,
            text
        });
        console.log(`✅ Email sent to ${to}: ${subject}`);
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        // Don't throw error - email failure shouldn't break the main flow
    }
};
