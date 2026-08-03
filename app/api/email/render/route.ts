import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/render";
import { createElement } from "react";
import {
  WelcomeEmail,
  LoginLinkEmail,
  ResetPasswordEmail,
  NotificationEmail,
  InvoiceEmail,
  ContactReceiptEmail,
} from "@/emails";

const INTERNAL_SECRET = process.env.EMAIL_RENDER_SECRET || "";

const TEMPLATES: Record<string, React.ComponentType<any>> = {
  welcome: WelcomeEmail,
  "login-link": LoginLinkEmail,
  "reset-password": ResetPasswordEmail,
  notification: NotificationEmail,
  invoice: InvoiceEmail,
  "contact-receipt": ContactReceiptEmail,
};

export async function POST(req: NextRequest) {
  if (INTERNAL_SECRET) {
    const auth = req.headers.get("x-email-secret");
    if (auth !== INTERNAL_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const body = await req.json();
  const { template, data } = body as {
    template: string;
    data: Record<string, unknown>;
  };

  const Component = TEMPLATES[template];
  if (!Component) {
    return NextResponse.json(
      {
        error: `Unknown template: ${template}`,
        available: Object.keys(TEMPLATES),
      },
      { status: 400 },
    );
  }

  const element = createElement(Component, data || {});
  const html = await render(element);
  const text = await render(element, { plainText: true });

  return NextResponse.json({ html, text });
}
