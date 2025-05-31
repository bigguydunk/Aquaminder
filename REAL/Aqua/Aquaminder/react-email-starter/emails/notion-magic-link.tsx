import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Text,
} from '@react-email/components';

interface NotionMagicLinkEmailProps {
  tugasDesc?: string;
  akuariumId?: number;
  formattedDate?: string;
  username?: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : '';

export const NotionMagicLinkEmail = ({
  tugasDesc,
  akuariumId,
  formattedDate,
  username,
}: NotionMagicLinkEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Container style={container}>
        <div style={scheduleBox}>
          <div style={iconBox}>
            <Img
              src="/static/Simplification.png"
              width="64"
              height="64"
              alt="Schedule Icon"
              style={{ borderRadius: 12, background: '#FFE3B3' }}
            />
          </div>
          <div style={contentBox}>
            <Heading style={h1}>{tugasDesc || 'Tugas'}</Heading>
            <Text style={infoText}>⚲ Akuarium {akuariumId || '-'}</Text>
            <Text style={infoText}>{formattedDate}</Text>
            {username && <Text style={infoText}>👤 {username}</Text>}
          </div>
        </div>
        <Text style={footer}>
          Jadwal dikirim oleh Aquaminder  
        </Text>
      </Container>
    </Body>
  </Html>
);

NotionMagicLinkEmail.PreviewProps = {
  tugasDesc: 'Ganti Air',
  akuariumId: 2,
  formattedDate: '31 May 2025, 14:00',
  username: 'Budi',
} as NotionMagicLinkEmailProps;

export default NotionMagicLinkEmail;

const main = {
  backgroundColor: '#26648B',
  padding: '0',
};

const container = {
  padding: '24px',
  margin: '0 auto',
  backgroundColor: '#26648B',
  borderRadius: '12px',
  maxWidth: '420px',
};

const scheduleBox = {
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#4F8FBF',
  borderRadius: '15px',
  padding: '20px',
  marginBottom: '16px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
};

const iconBox = {
  width: '64px',
  height: '64px',
  backgroundColor: '#FFE3B3',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '20px',
};

const contentBox = {
  flex: 1,
  color: '#FFE3B3',
};

const h1 = {
  color: '#FFE3B3',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
  padding: '0',
};

const infoText = {
  color: '#FFE3B3',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '15px',
  margin: '2px 0',
};

const footer = {
  color: '#898989',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '12px',
  lineHeight: '22px',
  marginTop: '18px',
  marginBottom: '8px',
  textAlign: 'center' as const,
};
