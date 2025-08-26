// Email service for sending OTP
export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  try {
    // For demo purposes, we'll simulate email sending
    // In production, you would integrate with services like:
    // - EmailJS
    // - SendGrid
    // - AWS SES
    // - Nodemailer with SMTP
    
    console.log(`Sending OTP ${otp} to ${email}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For demo, show the OTP in an alert
    // In production, this would be sent via actual email service
    alert(`OTP sent to ${email}: ${otp}\n\nIn production, this would be sent via email service like SendGrid or AWS SES.`);
    
    return true;
  } catch (error) {
    console.error('Failed to send OTP:', error);
    return false;
  }
}

// Example EmailJS integration (commented out for demo)
/*
import emailjs from '@emailjs/browser';

export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  try {
    const templateParams = {
      to_email: email,
      otp_code: otp,
      company_name: 'GlenceGauge',
      expiry_time: '5 minutes'
    };

    await emailjs.send(
      'YOUR_SERVICE_ID',
      'YOUR_TEMPLATE_ID',
      templateParams,
      'YOUR_PUBLIC_KEY'
    );

    return true;
  } catch (error) {
    console.error('Failed to send OTP:', error);
    return false;
  }
}
*/