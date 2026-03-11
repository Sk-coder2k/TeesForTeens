import express from "express";
import {
  submitContactForm,
  subscribeNewsletter,
} from "../controllers/contactController.js";
import nodemailer from "nodemailer";

const router = express.Router();

router.post("/", submitContactForm);
router.post("/newsletter", subscribeNewsletter);

// GET /api/contact/test-email
router.get("/test-email", async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    await transporter.verify();
    await transporter.sendMail({
      from: `"TeesforTeens" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "Test Email from TeesforTeens",
      text: "Gmail is working correctly!",
    });
    res.json({
      success: true,
      message: `Test email sent to ${process.env.EMAIL_USER}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
