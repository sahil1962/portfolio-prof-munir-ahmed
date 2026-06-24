import {
  Html, Head, Body, Container, Heading, Text, Hr, Section, Link,
} from "@react-email/components";
import type { BookingConfirmationData } from "@/components/emails/BookingConfirmation";

interface TutorBookingNotificationProps {
  data: BookingConfirmationData & { email: string; topicList?: string };
}

export default function TutorBookingNotification({ data }: TutorBookingNotificationProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "Georgia, serif", backgroundColor: "#faf8f4" }}>
        <Container style={{ maxWidth: "600px", margin: "40px auto", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e5e0d6", padding: "32px" }}>
          <Heading style={{ color: "#1e3a5f", fontSize: "22px", marginBottom: "8px" }}>
            New paid booking
          </Heading>
          <Text style={{ color: "#5a5a5a", marginTop: "0" }}>
            {data.description} — {data.name}
          </Text>

          <Hr style={{ borderColor: "#e5e0d6", margin: "24px 0" }} />

          <Section>
            <Heading as="h2" style={{ fontSize: "16px", color: "#1a1a1a", marginBottom: "12px" }}>
              Contact &amp; student
            </Heading>
            <Text style={{ margin: "0", fontSize: "14px" }}><strong>Name:</strong> {data.name}</Text>
            <Text style={{ margin: "4px 0 0", fontSize: "14px" }}><strong>Email:</strong> {data.email}</Text>
            <Text style={{ margin: "4px 0 0", fontSize: "14px" }}><strong>Student name:</strong> {data.studentName}</Text>
          </Section>

          <Hr style={{ borderColor: "#e5e0d6", margin: "24px 0" }} />

          <Section>
            <Heading as="h2" style={{ fontSize: "16px", color: "#1a1a1a", marginBottom: "12px" }}>
              Schedule
            </Heading>
            <Text style={{ margin: "0", fontSize: "14px" }}><strong>Weekly slot:</strong> {data.slotLabel}</Text>
            <Text style={{ margin: "4px 0 0", fontSize: "14px" }}><strong>First lesson:</strong> {data.startDate}</Text>
            <Text style={{ margin: "4px 0 0", fontSize: "14px" }}><strong>Number of lessons:</strong> {data.occurrences}</Text>
            {data.groupSize && <Text style={{ margin: "4px 0 0", fontSize: "14px" }}><strong>Group size:</strong> {data.groupSize}</Text>}
            {data.topicList && <Text style={{ margin: "4px 0 0", fontSize: "14px" }}><strong>Topics:</strong> {data.topicList}</Text>}
          </Section>

          <Hr style={{ borderColor: "#e5e0d6", margin: "24px 0" }} />

          <Section>
            <Heading as="h2" style={{ fontSize: "16px", color: "#1a1a1a", marginBottom: "12px" }}>
              Zoom
            </Heading>
            <Text style={{ margin: "0", fontSize: "14px" }}>
              <Link href={data.joinUrl} style={{ color: "#1e3a5f" }}>{data.joinUrl}</Link>
            </Text>
          </Section>

          {data.groupSize && (
            <>
              <Hr style={{ borderColor: "#e5e0d6", margin: "24px 0" }} />
              <Text style={{ fontSize: "13px", color: "#a87c4f", marginTop: "0" }}>
                Group booking — one payment covers the whole group; the payer is responsible for collecting shares from other members.
              </Text>
            </>
          )}
        </Container>
      </Body>
    </Html>
  );
}
