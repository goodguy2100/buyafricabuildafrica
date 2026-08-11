import * as React from 'react'
import type { TemplateEntry } from './registry'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'

interface EventSignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  eventTitle: string
  eventDate: string
  eventLocation: string
  eventDescription: string
  isOnline: boolean
  onlineUrl?: string | null
}

export const EventSignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  eventTitle,
  eventDate,
  eventLocation,
  eventDescription,
  isOnline,
  onlineUrl,
}: EventSignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You're signed up for {eventTitle}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>You're signed up! 🎉</Heading>
        <Text style={text}>
          Hi {recipient}, you're confirmed for{' '}
          <strong>{eventTitle}</strong> on {siteName}.
        </Text>

        <Container style={card}>
          <Text style={cardTitle}>{eventTitle}</Text>
          <Text style={cardLine}>📅 {eventDate}</Text>
          <Text style={cardLine}>
            {isOnline ? '🌐 Online event' : `📍 ${eventLocation}`}
          </Text>
          {eventDescription && <Text style={cardDesc}>{eventDescription}</Text>}
        </Container>

        <Text style={text}>
          We'll send you more details as the event gets closer. Keep an eye on
          your dashboard for updates.
        </Text>

        {isOnline && onlineUrl ? (
          <Button style={button} href={onlineUrl}>
            Join the event online
          </Button>
        ) : (
          <Button style={button} href={`${siteUrl}/events`}>
            View event on BABA
          </Button>
        )}

        <Text style={footer}>
          If you didn't sign up for this event, you can safely ignore this
          email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EventSignupEmail

export const template = {
  component: EventSignupEmail,
  subject: (data: Record<string, any>) =>
    `You're signed up: ${(data['eventTitle'] as string) || 'BABA event'}`,
  displayName: 'Event sign-up confirmation',
  previewData: {
    siteName: 'BABA',
    siteUrl: 'https://buyafricabuildafrica.org',
    recipient: 'Jane Wanjiru',
    eventTitle: 'BABA National Skills Expo',
    eventDate: '28 August 2026 · 08:00',
    eventLocation: 'Sarit Centre, Nairobi',
    eventDescription: 'Connect with builders, artisans and partners across the country.',
    isOnline: false,
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '20px 25px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#000000',
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: '#55575d',
  lineHeight: '1.5',
  margin: '0 0 25px',
}
const card = {
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  padding: '16px 20px',
  margin: '0 0 25px',
  backgroundColor: '#f9fafb',
}
const cardTitle = {
  fontSize: '16px',
  fontWeight: 'bold' as const,
  color: '#000000',
  margin: '0 0 8px',
}
const cardLine = {
  fontSize: '14px',
  color: '#374151',
  margin: '4px 0',
}
const cardDesc = {
  fontSize: '13px',
  color: '#6b7280',
  margin: '10px 0 0',
  lineHeight: '1.5',
}
const link = { color: 'inherit', textDecoration: 'underline' }
const button = {
  backgroundColor: '#000000',
  color: '#ffffff',
  fontSize: '14px',
  borderRadius: '8px',
  padding: '12px 20px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
