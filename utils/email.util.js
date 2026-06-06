function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
function generateHtmlOtp(otp) {
    return `
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
        <h2 style="color: #333;">Your OTP Code</h2>
        <p style="font-size: 18px; color: #555;">Use the following OTP to complete your action:</p>
        <h3 style="color: #007bff;">${otp}</h3>
    </div>
    `;
}

export { generateOtp, generateHtmlOtp };
