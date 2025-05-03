const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");

admin.initializeApp();

// Set SendGrid API key from environment variables
const sendgridApiKey = process.env.SENDGRID_API_KEY;
if (sendgridApiKey) {
  sgMail.setApiKey(sendgridApiKey);
}

exports.sendOtpEmail = functions.https.onCall(async (data, context) => {
  const { email, otp, username } = data;

  if (!email || !otp) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Email and OTP are required",
    );
  }

  // Create email template
  const emailContent = `
    <h1>Your Verification Code</h1>
    <p>Hello ${username || email.split("@")[0]},</p>
    <p>Your verification code is: <strong>${otp}</strong></p>
    <p>This code will expire in 10 minutes.</p>
    <p>If you didn't request this code, please ignore this email.</p>
  `;

  // Get environment
  const environment = process.env.NODE_ENV || "development";

  // Always log the OTP in development mode for testing
  if (environment === "development") {
    console.log(`[DEV MODE] Sending OTP email to ${email} with code ${otp}`);
    console.log(`Email content: ${emailContent}`);
  }

  // Store OTP in Firestore with expiration
  try {
    await admin
      .firestore()
      .collection("verification_codes")
      .doc(email)
      .set({
        email,
        code: otp,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        expires_at: admin.firestore.Timestamp.fromMillis(
          Date.now() + 10 * 60 * 1000,
        ), // 10 minutes expiration
      });
  } catch (error) {
    console.error("Error storing OTP in Firestore:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to store verification code",
    );
  }

  // Send email if SendGrid API key is available
  if (sendgridApiKey) {
    try {
      const fromEmail =
        process.env.SENDGRID_FROM_EMAIL || "noreply@numbergame.com";

      await sgMail.send({
        to: email,
        from: fromEmail,
        subject: "Your Verification Code",
        html: emailContent,
      });

      console.log(`Email sent to ${email} successfully`);
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      // Don't throw here - we still want to store the OTP even if email fails
    }
  } else if (environment !== "development") {
    console.error(`SendGrid API key not found in ${environment} environment`);
  }

  return { success: true, message: "Verification code sent" };
});

exports.verifyOtp = functions.https.onCall(async (data, context) => {
  const { email, otp } = data;

  if (!email || !otp) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Email and OTP are required",
    );
  }

  try {
    // Get the stored OTP document
    const otpDoc = await admin
      .firestore()
      .collection("verification_codes")
      .doc(email)
      .get();

    if (!otpDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "OTP not found or expired",
      );
    }

    const otpData = otpDoc.data();

    // Check if OTP has expired
    if (otpData.expires_at.toMillis() < Date.now()) {
      // Delete expired OTP
      await admin
        .firestore()
        .collection("verification_codes")
        .doc(email)
        .delete();
      throw new functions.https.HttpsError(
        "deadline-exceeded",
        "OTP has expired",
      );
    }

    // Verify OTP
    if (otp !== otpData.code) {
      throw new functions.https.HttpsError("permission-denied", "Invalid OTP");
    }

    // OTP is valid, delete it to prevent reuse
    await admin
      .firestore()
      .collection("verification_codes")
      .doc(email)
      .delete();

    return { success: true, message: "OTP verified successfully" };
  } catch (error) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    console.error("Error verifying OTP:", error);
    throw new functions.https.HttpsError("internal", "Failed to verify OTP");
  }
});
