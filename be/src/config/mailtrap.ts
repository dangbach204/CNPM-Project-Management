import { MailtrapClient } from "mailtrap";

export const mailtrap = new MailtrapClient({
  token: process.env.MAILTRAP_API_KEY!,
});


export const sender = {
  email: "mailtrap@yourdomain.com",
  name: "Developer Team",
};

