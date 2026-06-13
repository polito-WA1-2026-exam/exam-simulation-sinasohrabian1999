import { useMemo } from 'react';

// Fixed station positions for our fictional network (x, y in 0–100 space)
const STATION_POSITIONS = {
  'Old Market':       { x: 8,  y: 50 },
  'Central':          { x: 30, y: 50 },
  'Lantern Square':   { x: 52, y: 32 },
  'Tower Quarter':    { x: 75, y: 22 },
  'North Gate':       { x: 16, y: 20 },
  'Velaria Gate':     { x: 30, y: 30 },
  'Arch of Light':    { x: 30, y: 70 },
  'Falcon Crossing':  { x: 46, y: 18 },
  'Dark Fountain':    { x: 60, y: 20 },
  'Ash Tower':        { x: 72, y: 36 },
  'Echo Fields':      { x: 82, y: 50 },
  'Serene Borough':   { x: 64, y: 46 },
  'Mosaic Avenue':    { x: 74, y: 62 },
  'Hanging Gardens':  { x: 58, y: 74 },
};

const W = 700;
const H = 420;

function pos(name) {
  const p = STATION_POSITIONS[name];
  if (!p) return { x: 50, y: 50 };
  return { x: (p.x / 100) * W, y: (p.y / 100) * H };
}

const NetworkMap = ({ network, showLines = true, highlightRoute = null }) => {
  const stationById = useMemo(() => {
    if (!network) return {};
    const m = {};
    for (const s of network.stations) m[s.id] = s;
    return m;
  }, [network]);

  if (!network) return (
    <div className="network-map" style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span className="text-dim">Loading map…</span>
    </div>
  );

  const routeSegments = new Set();
  if (highlightRoute && highlightRoute.length > 1) {
    for (let i = 0; i < highlightRoute.length - 1; i++) {
      const a = highlightRoute[i], b = highlightRoute[i + 1];
      routeSegments.add(`${Math.min(a,b)}-${Math.max(a,b)}`);
    }
  }

  return (
    <div className="network-map">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxHeight: 340 }}>
        {/* Lines */}
        {showLines && network.segments.map(seg => {
          const a = pos(seg.station_a_name);
          const b = pos(seg.station_b_name);
          const key = `${Math.min(seg.station_a_id, seg.station_b_id)}-${Math.max(seg.station_a_id, seg.station_b_id)}`;
          const isHighlighted = routeSegments.has(key);
          return (
            <line
              key={seg.id}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={isHighlighted ? '#f0c040' : seg.line_color}
              strokeWidth={isHighlighted ? 4 : 3}
              strokeOpacity={isHighlighted ? 1 : 0.6}
            />
          );
        })}

        {/* Station dots */}
        {network.stations.map(st => {
          const p = pos(st.name);
          const inRoute = highlightRoute?.includes(st.id);
          return (
            <g key={st.id}>
              <circle
                cx={p.x} cy={p.y} r={inRoute ? 7 : 5}
                fill={inRoute ? '#f0c040' : '#1e1e24'}
                stroke={inRoute ? '#f0c040' : '#7a7a8c'}
                strokeWidth={2}
              />
              <text
                x={p.x} y={p.y - 9}
                textAnchor="middle"
                fontSize={10}
                fill={inRoute ? '#f0c040' : '#b0b0c0'}
                fontFamily="DM Sans, sans-serif"
              >
                {st.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  )
}

export default NetworkMap
