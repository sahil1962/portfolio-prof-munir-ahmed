import {
  Html, Head, Body, Container, Heading, Text, Hr, Section, Row, Column,
} from "@react-email/components";
import { subjectLabels, formatLabels, slotLabel, type EnquiryInput } from "@/lib/enquiry-schema";

interface TutorNotificationProps {
  data: EnquiryInput;
}

export default function TutorNotification({ data }: TutorNotificationProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "Georgia, serif", backgroundColor: "#faf8f4" }}>
        <Container style={{ maxWidth: "600px", margin: "40px auto", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e5e0d6", padding: "32px" }}>
          <Heading style={{ color: "#1e3a5f", fontSize: "22px", marginBottom: "8px" }}>
            New enquiry received
          </Heading>
          <Text style={{ color: "#5a5a5a", marginTop: "0" }}>
            {subjectLabels[data.subject] ?? data.subject} ({data.level}) — {data.name}
          </Text>

          <Hr style={{ borderColor: "#e5e0d6", margin: "24px 0" }} />

          <Section>
            <Heading as="h2" style={{ fontSize: "16px", color: "#1a1a1a", marginBottom: "12px" }}>
              Contact details
            </Heading>
            <Row>
              <Column style={{ paddingBottom: "8px" }}>
                <Text style={{ margin: "0", fontSize: "14px" }}><strong>Name:</strong> {data.name}</Text>
                <Text style={{ margin: "4px 0 0", fontSize: "14px" }}><strong>Email:</strong> {data.email}</Text>
                {data.phone && <Text style={{ margin: "4px 0 0", fontSize: "14px" }}><strong>Phone:</strong> {data.phone}</Text>}
              </Column>
            </Row>
          </Section>

          <Hr style={{ borderColor: "#e5e0d6", margin: "24px 0" }} />

          <Section>
            <Heading as="h2" style={{ fontSize: "16px", color: "#1a1a1a", marginBottom: "12px" }}>
              Student details
            </Heading>
            {data.studentName && data.studentName !== data.name && (
              <Text style={{ margin: "0", fontSize: "14px" }}><strong>Student name:</strong> {data.studentName}</Text>
            )}
            <Text style={{ margin: "4px 0 0", fontSize: "14px" }}><strong>Year/age:</strong> {data.studentYear}</Text>
            <Text style={{ margin: "4px 0 0", fontSize: "14px" }}><strong>Subject:</strong> {subjectLabels[data.subject] ?? data.subject}</Text>
            <Text style={{ margin: "4px 0 0", fontSize: "14px" }}><strong>Level:</strong> {data.level}</Text>
            <Text style={{ margin: "4px 0 0", fontSize: "14px" }}><strong>Format:</strong> {formatLabels[data.format] ?? data.format}</Text>
            {data.examBoard && <Text style={{ margin: "4px 0 0", fontSize: "14px" }}><strong>Exam board:</strong> {data.examBoard}</Text>}
            {data.package && <Text style={{ margin: "4px 0 0", fontSize: "14px" }}><strong>Package:</strong> {data.package}</Text>}
          </Section>

          {data.format === "group" && (
            <>
              <Hr style={{ borderColor: "#e5e0d6", margin: "24px 0" }} />
              <Section>
                <Heading as="h2" style={{ fontSize: "16px", color: "#1a1a1a", marginBottom: "12px" }}>
                  Group details
                </Heading>
                {data.groupSize && <Text style={{ margin: "0", fontSize: "14px" }}><strong>Group size:</strong> {data.groupSize}</Text>}
                {data.groupMembers && <Text style={{ margin: "4px 0 0", fontSize: "14px" }}><strong>Members:</strong> {data.groupMembers}</Text>}
                {data.topicList && <Text style={{ margin: "4px 0 0", fontSize: "14px" }}><strong>Topics:</strong> {data.topicList}</Text>}
              </Section>
            </>
          )}

          <Hr style={{ borderColor: "#e5e0d6", margin: "24px 0" }} />

          <Section>
            <Heading as="h2" style={{ fontSize: "16px", color: "#1a1a1a", marginBottom: "12px" }}>
              Preferred times
            </Heading>
            <Text style={{ margin: "0", fontSize: "14px" }}>{data.preferredTimes.map(slotLabel).join(", ")}</Text>
          </Section>

          {data.message && (
            <>
              <Hr style={{ borderColor: "#e5e0d6", margin: "24px 0" }} />
              <Section>
                <Heading as="h2" style={{ fontSize: "16px", color: "#1a1a1a", marginBottom: "8px" }}>
                  Additional message
                </Heading>
                <Text style={{ margin: "0", fontSize: "14px", color: "#5a5a5a" }}>{data.message}</Text>
              </Section>
            </>
          )}
        </Container>
      </Body>
    </Html>
  );
}
