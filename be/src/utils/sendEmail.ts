import dotenv from "dotenv";
dotenv.config();
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailOptions) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Student Project Management <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Error sending email:", error);
      throw new Error("Failed to send email");
    }
    console.log("Email sent successfully:", data);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};
