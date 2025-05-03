export const getOtpEmailTemplate = (username: string, otp: string): string => {
  return `
    <h1>Your Verification Code</h1>
    <p>Hello ${username},</p>
    <p>Your verification code is: <strong>${otp}</strong></p>
    <p>This code will expire in 10 minutes.</p>
    <p>If you didn't request this code, please ignore this email.</p>
  `;
};
