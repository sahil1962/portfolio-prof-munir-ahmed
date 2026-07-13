import {
  Html, Head, Body, Container, Heading, Text, Hr, Section, Link,
} from "@react-email/components";
import { format as formatDate } from "date-fns";

export interface BookingLesson {
  date: string;
  time: string;
}

export interface BookingConfirmationData {
  name: string;
  studentName: string;
  description: string;
  lessons: BookingLesson[];
  joinUrl: string;
  groupSize?: string;
  cancellationPolicy: string;
}

export function formatLesson(l: BookingLesson): string {
  try {
    return `${formatDate(new Date(`${l.date}T00:00:00`), "EEE d MMM yyyy")} · ${l.time}`;
  } catch {
    return `${l.date} · ${l.time}`;
  }
}

export default function BookingConfirmation({ data }: { data: BookingConfirmationData }) {
  const n = data.lessons.length;
  const forStudent = data.studentName && data.studentName !== data.name ? ` for ${data.studentName}` : "";
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "Georgia, serif", backgroundColor: "#faf8f4" }}>
        <Container style={{ maxWidth: "600px", margin: "40px auto", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e5e0d6", padding: "32px" }}>
          <Heading style={{ color: "#1e3a5f", fontSize: "22px", marginBottom: "8px" }}>Your booking is confirmed</Heading>

          <Text style={{ fontSize: "15px", lineHeight: "1.6", color: "#1a1a1a" }}>Hi {data.name},</Text>
          <Text style={{ fontSize: "15px", lineHeight: "1.6", color: "#1a1a1a", marginTop: "0" }}>
            Thank you for your payment. Your {n} lesson{n > 1 ? "s" : ""}{forStudent} are booked and the times below are reserved.
          </Text>

          <Hr style={{ borderColor: "#e5e0d6", margin: "24px 0" }} />

          <Section>
            <Heading as="h2" style={{ fontSize: "15px", color: "#1a1a1a", marginBottom: "10px" }}>Booking details</Heading>
            <Text style={{ margin: "0", fontSize: "14px", color: "#5a5a5a" }}><strong>Booking:</strong> {data.description}</Text>
            {data.groupSize && <Text style={{ margin: "4px 0 0", fontSize: "14px", color: "#5a5a5a" }}><strong>Group size:</strong> {data.groupSize}</Text>}
          </Section>

          <Hr style={{ borderColor: "#e5e0d6", margin: "24px 0" }} />

          <Section>
            <Heading as="h2" style={{ fontSize: "15px", color: "#1a1a1a", marginBottom: "10px" }}>Your lessons ({n}) — UK time</Heading>
            {data.lessons.map((l, i) => (
              <Text key={i} style={{ margin: "2px 0", fontSize: "14px", color: "#5a5a5a" }}>• {formatLesson(l)}</Text>
            ))}
          </Section>

          <Hr style={{ borderColor: "#e5e0d6", margin: "24px 0" }} />

          <Section>
            <Heading as="h2" style={{ fontSize: "15px", color: "#1a1a1a", marginBottom: "10px" }}>Join your lessons</Heading>
            <Text style={{ margin: "0", fontSize: "14px", color: "#5a5a5a" }}>Use this Zoom link for every lesson at the booked time:</Text>
            <Text style={{ margin: "8px 0 0", fontSize: "14px" }}>
              <Link href={data.joinUrl} style={{ color: "#1e3a5f" }}>{data.joinUrl}</Link>
            </Text>
          </Section>

          <Hr style={{ borderColor: "#e5e0d6", margin: "24px 0" }} />

          <Text style={{ fontSize: "13px", color: "#a87c4f", marginTop: "0" }}>{data.cancellationPolicy}</Text>
          <Text style={{ fontSize: "14px", color: "#5a5a5a", marginTop: "16px" }}>If anything has changed, just reply to this email.</Text>
          <Text style={{ fontSize: "14px", color: "#5a5a5a", marginTop: "8px" }}>
            Best regards,<br />
            Professor Dr Munir Ahmed Tuition
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
