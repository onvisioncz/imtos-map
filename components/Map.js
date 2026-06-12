'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { salesReps } from '@/lib/data';

function getStyle(feature) {
  const { reps } = feature.properties;
  const primary = salesReps[reps[0]];
  const shared = reps.length > 1;

  return {
    fillColor: primary?.color ?? '#9CA3AF',
    weight: shared ? 2 : 1.5,
    color: '#ffffff',
    fillOpacity: 0.78,
    dashArray: shared ? '8 5' : '',
  };
}

function buildPopup(feature) {
  const { name, psc, reps: repIds } = feature.properties;
  const reps = repIds.map((id) => salesReps[id]).filter(Boolean);
  const shared = reps.length > 1;

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-width:320px;max-width:380px;">
      <div style="padding:10px 14px;background:#3D3935;color:#fff;margin:-1px -1px 0;border-radius:6px 6px 0 0">
        <div style="font-weight:700;font-size:14px">${name}</div>
        <div style="font-size:11px;color:#b8b2ac;margin-top:2px">PSČ: ${psc}</div>
        ${shared ? '<div style="font-size:11px;color:#ff7b8a;margin-top:2px">⚠ Oblast s více obchodníky</div>' : ''}
      </div>
      <div style="padding:4px 14px 14px;background:#fff">
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

    // React StrictMode runs effects twice — cancelled flag stops the stale async run
    let cancelled = false;
    let onHighlight, onReset;

    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !containerRef.current) return;

      if (containerRef.current._leaflet_id) {
        containerRef.current._leaflet_id = null;
      }

      const map = L.map(containerRef.current, {
        center: [49.4, 17.2],
        zoom: 7,
        zoomControl: true,
        zoomSnap: 0.25,
      });

      mapRef.current = map;

      // Base tiles WITHOUT labels — colors stay clean
      const tileLayer = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
        {
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19,
        }
      ).addTo(map);

      // Labels pane ABOVE the colored territories → city names readable on top
      map.createPane('labels');
      map.getPane('labels').style.zIndex = 650;
      map.getPane('labels').style.pointerEvents = 'none';
      const labelLayer = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
        { subdomains: 'abcd', maxZoom: 19, pane: 'labels' }
      ).addTo(map);

      try {
        const res = await fetch('/territories.json');
        if (!res.ok) throw new Error('Data error');
        const geojson = await res.json();
        if (cancelled) return;

        const featureLayers = {};

        const layer = L.geoJSON(geojson, {
          style: getStyle,
          onEachFeature(feature, fl) {
            featureLayers[feature.properties.id] = fl;
            fl.bindPopup(() => buildPopup(feature), { maxWidth: 400, className: 'imtos-popup' });

            const reps = feature.properties.reps.map((id) => salesReps[id]).filter(Boolean);
            fl.bindTooltip(
              `<div style="text-align:center">
                 <div style="font-weight:700;font-size:12px;color:#1e293b">${feature.properties.name}</div>
                 <div style="font-size:11px;color:#64748b;margin-top:1px">${reps.map((r) => r.name).join(' · ')}</div>
               </div>`,
              { sticky: true, direction: 'top', opacity: 0.95, className: 'imtos-tooltip' }
            );

            fl.on('mouseover', (e) => {
              e.target.setStyle({ weight: 3, color: '#3D3935', fillOpacity: 0.9 });
              e.target.bringToFront();
            });
            fl.on('mouseout', () => layer.resetStyle(fl));
          },
        }).addTo(map);

        // ── Sidebar hover highlight (smooth via inline CSS on SVG paths) ──
        onHighlight = (e) => {
          const { repId } = e.detail;
          const rep = salesReps[repId];
          if (!rep) return;

          tileLayer.setOpacity(0.18);
          labelLayer.setOpacity(0.35);

          Object.values(featureLayers).forEach((fl) => {
            const el = fl._path;
            if (!el) return;
            if (fl.feature.properties.reps.includes(repId)) {
              el.style.fill = rep.color;
              el.style.fillOpacity = '0.85';
              el.style.stroke = '#ffffff';
              el.style.strokeWidth = '2';
            } else {
              el.style.fill = '#888888';
              el.style.fillOpacity = '0.05';
              el.style.stroke = '#999';
              el.style.strokeWidth = '0.5';
            }
          });
        };

        onReset = () => {
          tileLayer.setOpacity(1);
          labelLayer.setOpacity(1);
          Object.values(featureLayers).forEach((fl) => {
            const el = fl._path;
            if (!el) return;
            const def = getStyle(fl.feature);
            el.style.fill = def.fillColor;
            el.style.fillOpacity = String(def.fillOpacity);
            el.style.stroke = def.color;
            el.style.strokeWidth = String(def.weight);
          });
        };

        window.addEventListener('imtos:highlight', onHighlight);
        window.addEventListener('imtos:reset', onReset);

        // ── Legend (desktop only, hidden via CSS on mobile) ──
        const legend = L.control({ position: 'bottomleft' });
        legend.onAdd = () => {
          const div = L.DomUtil.create('div', 'imtos-legend');
          div.innerHTML = Object.values(salesReps)
            .map(
              (r) =>
                `<div class="imtos-legend-row"><span class="imtos-legend-dot" style="background:${r.color}"></span>${r.name}</div>`
            )
            .join('');
          return div;
        };
        legend.addTo(map);

        const isMobile = window.innerWidth < 768;
        map.fitBounds(layer.getBounds(), { padding: isMobile ? [4, 4] : [24, 24] });
      } catch (err) {
        console.error('Map data error:', err);
      }
    })();

    return () => {
      cancelled = true;
      if (onHighlight) window.removeEventListener('imtos:highlight', onHighlight);
      if (onReset) window.removeEventListener('imtos:reset', onReset);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} style={{ height: '100%', width: '100%' }} />;
}
