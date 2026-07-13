import {
  Html, Head, Body, Container, Heading, Text, Hr, Section, Link,
} from "@react-email/components";

export interface TasterConfirmationData {
  name: string;
  subjectLabel: string;
  slotLabel: string;
  startDate: string;
  joinUrl: string;
  cancellationPolicy: string;
}

export default function TasterConfirmation({ data }: { data: TasterConfirmationData }) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "Georgia, serif", backgroundColor: "#faf8f4" }}>
        <Container style={{ maxWidth: "600px", margin: "40px auto", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e5e0d6", padding: "32px" }}>
          <Heading style={{ color: "#1e3a5f", fontSize: "22px", marginBottom: "8px" }}>
            Your Initial Assessment &amp; Taster Lesson is booked
          </Heading>

          <Text style={{ fontSize: "15px", lineHeight: "1.6", color: "#1a1a1a" }}>Hi {data.name},</Text>
          <Text style={{ fontSize: "15px", lineHeight: "1.6", color: "#1a1a1a", marginTop: "0" }}>
            Thank you for your payment. Your 60-minute introductory session — a 30-minute initial assessment
            followed by a 30-minute taster lesson — is confirmed.
          </Text>

          <Hr style={{ borderColor: "#e5e0d6", margin: "24px 0" }} />

          <Section>
            <Heading as="h2" style={{ fontSize: "15px", color: "#1a1a1a", marginBottom: "10px" }}>Session details</Heading>
            <Text style={{ margin: "0", fontSize: "14px", color: "#5a5a5a" }}><strong>Subject:</strong> {data.subjectLabel}</Text>
            <Text style={{ margin: "4px 0 0", fontSize: "14px", color: "#5a5a5a" }}><strong>Date:</strong> {data.startDate}</Text>
            <Text style={{ margin: "4px 0 0", fontSize: "14px", color: "#5a5a5a" }}><strong>Time (UK):</strong> {data.slotLabel}</Text>
          </Section>

          <Hr style={{ borderColor: "#e5e0d6", margin: "24px 0" }} />

          <Section>
            <Heading as="h2" style={{ fontSize: "15px", color: "#1a1a1a", marginBottom: "10px" }}>Join your session</Heading>
            <Text style={{ margin: "8px 0 0", fontSize: "14px" }}>
              <Link href={data.joinUrl} style={{ color: "#1e3a5f" }}>{data.joinUrl}</Link>
            </Text>
            <Text style={{ margin: "12px 0 0", fontSize: "14px", color: "#5a5a5a" }}>
              Please have your topic, exam board or syllabus, and any specific areas of difficulty ready so the
              session can be prepared properly.
            </Text>
          </Section>

          <Hr style={{ borderColor: "#e5e0d6", margin: "24px 0" }} />

          <Text style={{ fontSize: "13px", color: "#a87c4f", marginTop: "0" }}>{data.cancellationPolicy}</Text>
          <Text style={{ fontSize: "14px", color: "#5a5a5a", marginTop: "16px" }}>
            Best regards,<br />
            Professor Dr Munir Ahmed Tuition
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
