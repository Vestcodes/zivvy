import { Text } from "@react-email/components";
import {
  FallbackLink,
  Heading,
  Paragraph,
  SmallText,
  ZivvyButton,
  ZivvyLayout,
} from "./components";

interface InvoiceEmailProps {
  customerName: string;
  invoiceId: string;
  amount: string;
  currency: string;
  dueDate: string;
  status: string;
  viewUrl: string;
}

export default function InvoiceEmail({
  customerName = "Customer",
  invoiceId = "INV-2024-00001",
  amount = "1,200.00",
  currency = "EUR",
  dueDate = "2024-02-15",
  status = "Submitted",
  viewUrl = "https://zivvy.xyz/sales/invoices/INV-2024-00001",
}: InvoiceEmailProps) {
  const isOverdue = status === "Overdue";
  const isPaid = status === "Paid";

  const statusColor = isPaid
    ? "#16A34A"
    : isOverdue
      ? "#DC2626"
      : "#111111";

  return (
    <ZivvyLayout
      preview={`Invoice ${invoiceId} — ${currency} ${amount}`}
    >
      <Heading>
        {isPaid
          ? "Payment received"
          : isOverdue
            ? "Payment overdue"
            : `Invoice ${invoiceId}`}
      </Heading>

      <Paragraph>
        {isPaid
          ? `Hi ${customerName}, we've received your payment. Here are the details.`
          : isOverdue
            ? `Hi ${customerName}, this is a reminder that the following invoice is overdue.`
            : `Hi ${customerName}, here's your invoice from Zivvy.`}
      </Paragraph>

      {/* Invoice summary card */}
      <Text
        style={{
          margin: "0 0 24px",
          padding: "20px",
          backgroundColor: "#F7F7F8",
          borderRadius: "10px",
          border: "1px solid #E5E5E5",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        <Text
          style={{
            display: "flex" as const,
            fontSize: "13px",
            color: "#888888",
            margin: "0 0 12px",
          }}
        >
          {invoiceId}
        </Text>
        <Text
          style={{
            fontSize: "28px",
            fontWeight: 800,
            color: "#111111",
            letterSpacing: "-0.5px",
            margin: "0 0 4px",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {currency} {amount}
        </Text>
        <Text
          style={{
            fontSize: "13px",
            color: "#888888",
            margin: "0 0 12px",
          }}
        >
          {isPaid ? "Paid" : `Due ${dueDate}`}
        </Text>
        <Text
          style={{
            display: "inline-block" as const,
            fontSize: "12px",
            fontWeight: 700,
            color: statusColor,
            backgroundColor: isPaid
              ? "#DCFCE7"
              : isOverdue
                ? "#FEE2E2"
                : "#F3F4F6",
            padding: "3px 10px",
            borderRadius: "100px",
            margin: 0,
          }}
        >
          {status}
        </Text>
      </Text>

      <ZivvyButton href={viewUrl}>View invoice</ZivvyButton>
      <FallbackLink href={viewUrl} />

      <SmallText>
        If you have questions about this invoice, reply to this email.
      </SmallText>
    </ZivvyLayout>
  );
}
