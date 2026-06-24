import {
  Html, Head, Body, Container, Heading, Text, Hr, Section,
} from "@react-email/components";
import { subjectLabels, formatLabels, slotLabel, type EnquiryInput } from "@/lib/enquiry-schema";

interface EnquirerConfirmationProps {
  data: EnquiryInput;
}

export default function EnquirerConfirmation({ data }: EnquirerConfirmationProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "Georgia, serif", backgroundColor: "#faf8f4" }}>
        <Container style={{ maxWidth: "600px", margin: "40px auto", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e5e0d6", padding: "32px" }}>
          <Heading style={{ color: "#1e3a5f", fontSize: "22px", marginBottom: "8px" }}>
            We&apos;ve received your enquiry
          </Heading>

          <Text style={{ fontSize: "15px", lineHeight: "1.6", color: "#1a1a1a" }}>
            Hi {data.name},
          </Text>
          <Text style={{ fontSize: "15px", lineHeight: "1.6", color: "#1a1a1a", marginTop: "0" }}>
            {`Thanks for your enquiry about ${subjectLabels[data.subject] ?? data.subject} tuition. We've received your request and Dr Munir will reply within 48 hours to confirm availability and next steps.`}
          </Text>
          <Text style={{ fontSize: "15px", lineHeight: "1.6", color: "#1a1a1a", marginTop: "0" }}>
            A copy of what you submitted is below for your records.
          </Text>

          <Hr style={{ borderColor: "#e5e0d6", margin: "24px 0" }} />

          <Section>
            <Heading as="h2" style={{ fontSize: "15px", color: "#1a1a1a", marginBottom: "10px" }}>
              Your submission
            </Heading>
            <Text style={{ margin: "0", fontSize: "14px", color: "#5a5a5a" }}><strong>Name:</strong> {data.name}</Text>
            <Text style={{ margin: "4px 0 0", fontSize: "14px", color: "#5a5a5a" }}><strong>Student name:</strong> {data.studentName}</Text>
            <Text style={{ margin: "4px 0 0", fontSize: "14px", color: "#5a5a5a" }}><strong>Year/age:</strong> {data.studentYear}</Text>
            <Text style={{ margin: "4px 0 0", fontSize: "14px", color: "#5a5a5a" }}><strong>Subject:</strong> {subjectLabels[data.subject] ?? data.subject}</Text>
            <Text style={{ margin: "4px 0 0", fontSize: "14px", color: "#5a5a5a" }}><strong>Level:</strong> {data.level}</Text>
            <Text style={{ margin: "4px 0 0", fontSize: "14px", color: "#5a5a5a" }}><strong>Format:</strong> {formatLabels[data.format] ?? data.format}</Text>
            <Text style={{ margin: "4px 0 0", fontSize: "14px", color: "#5a5a5a" }}><strong>Preferred times:</strong> {data.preferredTimes.map(slotLabel).join(", ")}</Text>
            {data.message && <Text style={{ margin: "4px 0 0", fontSize: "14px", color: "#5a5a5a" }}><strong>Message:</strong> {data.message}</Text>}
          </Section>

          <Hr style={{ borderColor: "#e5e0d6", margin: "24px 0" }} />

          <Text style={{ fontSize: "14px", color: "#5a5a5a", marginTop: "0" }}>
            If anything has changed, just reply to this email.
          </Text>
          <Text style={{ fontSize: "14px", color: "#5a5a5a", marginTop: "8px" }}>
            Best regards,<br />
            Professor Dr Munir Ahmed Tuition
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
