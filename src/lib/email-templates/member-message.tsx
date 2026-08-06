import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface MemberMessageProps {
  memberName?: string;
  title?: string;
  body?: string;
  linkUrl?: string;
}

export function MemberMessage({
  memberName = "Member",
  title = "A message from BABA",
  body = "",
  linkUrl,
}: MemberMessageProps) {
  const paragraphs = body.split(/\n{2,}/).filter(Boolean);
  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={{ backgroundColor: "#f5f7fb", fontFamily: "Arial, Helvetica, sans-serif" }}>
        <Container
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            margin: "32px auto",
            maxWidth: "560px",
            padding: "32px",
          }}
        >
          <Text style={{ color: "#1b3a6b", fontSize: "13px", fontWeight: 700, letterSpacing: "1px", margin: 0 }}>
            BUY AFRICA · BUILD AFRICA
          </Text>
          <Heading style={{ color: "#0f2447", fontSize: "22px", margin: "12px 0 4px" }}>{title}</Heading>
          <Text style={{ color: "#5a6b85", fontSize: "14px", margin: "0 0 16px" }}>Hi {memberName},</Text>
          <Section>
            {paragraphs.length === 0 ? (
              <Text style={{ color: "#22334d", fontSize: "15px", lineHeight: "24px" }}>{body}</Text>
            ) : (
              paragraphs.map((p, i) => (
                <Text key={i} style={{ color: "#22334d", fontSize: "15px", lineHeight: "24px" }}>
                  {p}
                </Text>
              ))
            )}
          </Section>
          {linkUrl ? (
            <Section style={{ marginTop: "20px" }}>
              <Link
                href={linkUrl}
                style={{
                  backgroundColor: "#1b3a6b",
                  borderRadius: "10px",
                  color: "#ffffff",
                  display: "inline-block",
                  fontSize: "14px",
                  fontWeight: 700,
                  padding: "12px 22px",
                  textDecoration: "none",
                }}
              >
                Open in your portal
              </Link>
            </Section>
          ) : null}
          <Hr style={{ borderColor: "#e6eaf2", margin: "28px 0 12px" }} />
          <Text style={{ color: "#8b98ad", fontSize: "12px", margin: 0 }}>
            You are receiving this because you are a registered BABA member.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export const template = {
  component: MemberMessage,
  subject: (data: Record<string, any>) => (data['title'] as string) || "A message from BABA",
  displayName: "Member message",
  previewData: {
    memberName: "Jane Wanjiru",
    title: "Welcome to the next BABA forum",
    body: "We are hosting a members forum next week.\n\nSee you there!",
  },
} satisfies TemplateEntry;
