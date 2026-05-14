'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { salesReps, nutsMapping } from '@/lib/data';

function getStyle(feature) {
  const mapping = nutsMapping[feature.properties.NUTS_ID];
  if (!mapping) return { fillColor: '#9CA3AF', weight: 1, color: '#fff', fillOpacity: 0.3 };

  const primary = salesReps[mapping.reps[0]];
  const shared = mapping.reps.length > 1;

  return {
    fillColor: primary?.color ?? '#9CA3AF',
    weight: 1.5,
    color: '#ffffff',
    fillOpacity: 0.72,
    dashArray: shared ? '8 4' : '',
  };
}

function buildPopup(feature) {
  const mapping = nutsMapping[feature.properties.NUTS_ID];
  const name = feature.properties.NUTS_NAME || feature.properties.NAME_LATN || '';

  if (!mapping) {
    return `<div style="padding:10px;font-family:sans-serif"><strong>${name}</strong><br/><span style="color:#888">Neobsazeno</span></div>`;
  }

  const reps = mapping.reps.map((id) => salesReps[id]).filter(Boolean);
  const shared = reps.length > 1;

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-width:320px;max-width:380px;">
      <div style="padding:10px 14px;background:#3D3935;color:#fff;margin:-1px -1px 0;border-radius:6px 6px 0 0">
        <div style="font-weight:700;font-size:14px">${name}</div>
        ${shared ? '<div style="font-size:11px;color:#D41029;margin-top:2px">⚠ Oblast s více obchodníky</div>' : ''}
      </div>
      <div style="padding:10px 14px 14px;background:#fff">
        ${reps
          .map(
            (rep) => `
          <div style="margin-top:10px;padding:10px;background:#f8fafc;border-radius:6px;border-left:4px solid ${rep.color}">
            <div style="display:flex;align-items:center;gap:10px">
              ${rep.avatar
                ? `<img src="${rep.avatar}" alt="${rep.name}" style="width:72px;height:72px;border-radius:8px;object-fit:cover;border:2px solid ${rep.color};flex-shrink:0"/>`
                : `<div style="width:72px;height:72px;border-radius:8px;background:${rep.color};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:18px;flex-shrink:0">${rep.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}</div>`
              }
              <div>
                <div style="font-weight:700;font-size:13px;color:#1e293b">${rep.name}</div>
                <div style="margin-top:4px;font-size:12px;color:#475569;line-height:1.7">
                  <div>📞 <a href="tel:${rep.phone.replace(/\s/g, '')}" style="color:#D41029;text-decoration:none">${rep.phone}</a></div>
                  <div>✉️ <a href="mailto:${rep.email}" style="color:#D41029;text-decoration:none">${rep.email}</a></div>
                </div>
              </div>
            </div>
            <div style="margin-top:6px;color:#94a3b8;font-size:11px;padding-top:6px;border-top:1px solid #e2e8f0">PSČ: ${rep.pscLabel}</div>
          </div>`
          )
          .join('')}
      </div>
    </div>`;
}

export default function MapComponent() {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup any leftover Leaflet instance (React StrictMode runs effects twice)
    if (containerRef.current._leaflet_id) {
      containerRef.current._leaflet_id = null;
    }
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    (async () => {
      const L = (await import('leaflet')).default;

      const map = L.map(containerRef.current, {
        center: [49.4, 17.2],
        zoom: 7,
        zoomControl: true,
      });

      mapRef.current = map;

      const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      try {
        const res = await fetch('/api/geodata');
        if (!res.ok) throw new Error('API error');
        const geojson = await res.json();

        // Store all sublayers by NUTS_ID for highlight control
        const featureLayers = {};

        const layer = L.geoJSON(geojson, {
          style: getStyle,
          onEachFeature(feature, fl) {
            featureLayers[feature.properties.NUTS_ID] = fl;
            fl.bindPopup(() => buildPopup(feature), { maxWidth: 400, className: 'imtos-popup' });

            fl.on('mouseover', (e) => {
              e.target.setStyle({ weight: 3, color: '#3D3935', fillOpacity: 0.9 });
              e.target.bringToFront();
            });
            fl.on('mouseout', () => layer.resetStyle(fl));
          },
        }).addTo(map);

        function applyStyleCss(fl, styles) {
          fl.eachLayer ? fl.eachLayer((sub) => applyStyleCss(sub, styles)) : null;
          const el = fl._path;
          if (!el) return;
          if (styles.fill) el.style.fill = styles.fill;
          if (styles.fillOpacity !== undefined) el.style.fillOpacity = styles.fillOpacity;
          if (styles.stroke) el.style.stroke = styles.stroke;
          if (styles.strokeWidth !== undefined) el.style.strokeWidth = styles.strokeWidth;
        }

        // Sidebar hover highlight
        function onHighlight(e) {
          const { repId } = e.detail;
          const rep = salesReps[repId];
          const activeNuts = Object.keys(nutsMapping).filter((id) =>
            nutsMapping[id].reps.includes(repId)
          );

          tileLayer.setOpacity(0.18);

          Object.entries(featureLayers).forEach(([nutsId, fl]) => {
            const el = fl._path;
            if (!el) return;
            if (activeNuts.includes(nutsId)) {
              el.style.fill = rep.color;
              el.style.fillOpacity = '0.82';
              el.style.stroke = '#ffffff';
              el.style.strokeWidth = '2';
            } else {
              el.style.fill = '#888888';
              el.style.fillOpacity = '0.04';
              el.style.stroke = '#888';
              el.style.strokeWidth = '0.5';
            }
          });
        }

        function onReset() {
          tileLayer.setOpacity(1);
          Object.entries(featureLayers).forEach(([, fl]) => {
            const el = fl._path;
            if (!el) return;
            const def = getStyle(fl.feature);
            el.style.fill = def.fillColor;
            el.style.fillOpacity = String(def.fillOpacity);
            el.style.stroke = def.color;
            el.style.strokeWidth = String(def.weight);
          });
        }

        window.addEventListener('imtos:highlight', onHighlight);
        window.addEventListener('imtos:reset', onReset);

        const isMobile = window.innerWidth < 768;
        map.fitBounds(layer.getBounds(), { padding: isMobile ? [4, 4] : [20, 20], animate: false });
        if (isMobile) map.setZoom(map.getZoom() + 0.25, { animate: false });
      } catch (err) {
        console.error('Map data error:', err);
      }
    })();

    return () => {
      window.removeEventListener('imtos:highlight', () => {});
      window.removeEventListener('imtos:reset', () => {});
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} style={{ height: '100%', width: '100%' }} />;
}
