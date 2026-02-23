import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Contact } from "@/models/Contact";
import { sendMail } from "@/app/lib/mail/sendMail";
import { contactToAdmin, contactToUser } from "@/app/lib/mail/templates/contact";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, topic, message } = body;

    if (!name || !email || !topic || !message) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }

    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "Unknown";

    const date = new Date().toLocaleString();
    await connectDB();
    await Contact.create({
      name,
      email,
      topic,
      message,
      ip,
    });

    await sendMail(
      process.env.GMAIL_USER!,
      `📩 New Contact: ${topic}`,
      contactToAdmin({
        Name: name,
        Email: email,
        Topic: topic,
        Message: message,
        Date: date,
        IP: ip,
      }),
      "contact",
    );

    await sendMail(
      email,
      "Contact Form Submission Received ✅",
      contactToUser(name, topic, message),
      "contact",
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
