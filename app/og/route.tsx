import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: '108px', fontWeight: 900, color: 'white', letterSpacing: '-2px', lineHeight: 1 }}>
          NATION
        </div>
        <div style={{ fontSize: '96px', fontWeight: 900, color: '#3b82f6', letterSpacing: '-2px', lineHeight: 1 }}>
          EXPLORER
        </div>
        <div style={{ width: '120px', height: '2px', background: '#3b82f6', margin: '16px auto' }} />
        <div style={{ fontSize: '24px', color: '#64748b', marginTop: '8px', letterSpacing: '4px', textTransform: 'uppercase' }}>
          Interactive Geopolitical Intelligence
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
