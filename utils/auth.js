export function hashPassword(password) {
  // This is a simple hash function for demo purposes
  // In production, use a proper hashing library like bcrypt
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
}

export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOTP(email, otp) {
  try {
    // Import the email service
    const { sendOTPEmail } = await import('./emailService');
    return await sendOTPEmail(email, otp);
  } catch (error) {
    console.error('Failed to send OTP:', error);
    return false;
  }
}