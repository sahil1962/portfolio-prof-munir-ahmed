import {
  Html, Head, Body, Container, Heading, Text, Hr, Section,
} from "@react-email/components";

export interface TasterTutorData {
  name: string;
  email: string;
  subjectLabel: string;
  studentYear: string;
  examBoard?: string;
  focus: string;
  slotLabel: string;
  startDate: string;
  joinUrl: string;
}

export default function TasterTutorNotification({ data }: { data: TasterTutorData }) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "Georgia, serif", backgroundColor: "#faf8f4" }}>
        <Container style={{ maxWidth: "600px", margin: "40px auto", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e5e0d6", padding: "32px" }}>
          <Heading style={{ color: "#1e3a5f", fontSize: "22px", marginBottom: "8px" }}>New taster booking</Heading>
          <Text style={{ color: "#5a5a5a", marginTop: "0" }}>
            Initial Assessment &amp; Taster Lesson — {data.name}
          </Text>

          <Hr style={{ borderColor: "#e5e0d6", margin: "24px 0" }} />

          <Section>
            <Heading as="h2" style={{ fontSize: "16px", color: "#1a1a1a", marginBottom: "12px" }}>Contact</Heading>
            <Text style={{ margin: "0", fontSize: "14px" }}><strong>Name:</strong> {data.name}</Text>
            <Text style={{ margin: "4px 0 0", fontSize: "14px" }}><strong>Email:</strong> {data.email}</Text>
          </Section>

          <Hr style={{ borderColor: "#e5e0d6", margin: "24px 0" }} />

          <Section>
            <Heading as="h2" style={{ fontSize: "16px", color: "#1a1a1a", marginBottom: "12px" }}>Assessment details</Heading>
            <Text style={{ margin: "0", fontSize: "14px" }}><strong>Subject:</strong> {data.subjectLabel}</Text>
            <Text style={{ margin: "4px 0 0", fontSize: "14px" }}><strong>Year / level:</strong> {data.studentYear}</Text>
            {data.examBoard && <Text style={{ margin: "4px 0 0", fontSize: "14px" }}><strong>Exam board / syllabus:</strong> {data.examBoard}</Text>}
            <Text style={{ margin: "4px 0 0", fontSize: "14px" }}><strong>Areas to focus on:</strong> {data.focus}</Text>
          </Section>

          <Hr style={{ borderColor: "#e5e0d6", margin: "24px 0" }} />

          <Section>
            <Heading as="h2" style={{ fontSize: "16px", color: "#1a1a1a", marginBottom: "12px" }}>Schedule</Heading>
            <Text style={{ margin: "0", fontSize: "14px" }}><strong>Date:</strong> {data.startDate}</Text>
            <Text style={{ margin: "4px 0 0", fontSize: "14px" }}><strong>Time (UK):</strong> {data.slotLabel}</Text>
            <Text style={{ margin: "4px 0 0", fontSize: "14px" }}><strong>Zoom:</strong> {data.joinUrl}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
