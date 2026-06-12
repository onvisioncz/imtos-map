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

function repCardHtml(rep) {
  return `
    <div style="margin-top:10px;padding:10px;background:#f8fafc;border-radius:6px;border-left:4px solid ${rep.color}">
      <div style="display:flex;align-items:center;gap:10px">
        ${rep.avatar
          ? `<img src="${rep.avatar}" alt="${rep.name}" style="width:64px;height:64px;border-radius:8px;object-fit:cover;border:2px solid ${rep.color};flex-shrink:0"/>`
          : `<div style="width:64px;height:64px;border-radius:8px;background:${rep.color};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:18px;flex-shrink:0">${rep.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}</div>`
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
    </div>`;
}

function buildPanelHtml(feature) {
  const { name, psc, reps: repIds } = feature.properties;
  const reps = repIds.map((id) => salesReps[id]).filter(Boolean);
  const shared = reps.length > 1;

  return `
    <div style="padding:12px 16px;background:#3D3935;color:#fff;display:flex;align-items:flex-start;justify-content:space-between;gap:10px">
      <div>
        <div style="font-weight:700;font-size:15px">${name}</div>
        <div style="font-size:11px;color:#b8b2ac;margin-top:2px">PSČ: ${psc}</div>
        ${shared ? '<div style="font-size:11px;color:#ff7b8a;margin-top:2px">⚠ Oblast s více obchodníky</div>' : ''}
      </div>
      <button class="imtos-panel-close" aria-label="Zavřít" style="background:none;border:none;color:#fff;font-size:22px;line-height:1;cursor:pointer;padding:0 2px">×</button>
    </div>
    <div style="padding:2px 14px 14px;background:#fff">
      ${reps.map(repCardHtml).join('')}
    </div>`;
}

export default function MapComponent() {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // React StrictMode runs effects twice — cancelled flag stops the stale async run
    let cancelled = false;
    let onHighlight, onReset, onKeyDown;

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

      // Detailed place labels — shown only in focus mode
      map.createPane('labels');
      map.getPane('labels').style.zIndex = 640;
      map.getPane('labels').style.pointerEvents = 'none';
      const labelsLayer = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
        { subdomains: 'abcd', maxZoom: 19, pane: 'labels' }
      );

      // Cities pane ABOVE the colored territories
      map.createPane('cities');
      map.getPane('cities').style.zIndex = 650;
      map.getPane('cities').style.pointerEvents = 'none';

      // Města nad 100 000 obyvatel (CZ + SK)
      const CITIES = [
        { name: 'Praha', lat: 50.0755, lng: 14.4378 },
        { name: 'Brno', lat: 49.1951, lng: 16.6068 },
        { name: 'Ostrava', lat: 49.8209, lng: 18.2625 },
        { name: 'Plzeň', lat: 49.7384, lng: 13.3736 },
        { name: 'Liberec', lat: 50.7663, lng: 15.0543 },
        { name: 'Olomouc', lat: 49.5938, lng: 17.2509 },
        { name: 'Bratislava', lat: 48.1486, lng: 17.1077 },
        { name: 'Košice', lat: 48.7164, lng: 21.2611 },
      ];

      const cityMarkers = [];
      CITIES.forEach((c) => {
        const m = L.circleMarker([c.lat, c.lng], {
          pane: 'cities',
          radius: 4.5,
          fillColor: '#1f2937',
          fillOpacity: 1,
          color: '#ffffff',
          weight: 2,
          interactive: false,
        }).bindTooltip(c.name, {
          permanent: true,
          direction: 'right',
          offset: [7, 0],
          className: 'imtos-city-label',
          pane: 'cities',
        });
        m.addTo(map);
        cityMarkers.push(m);
      });

      try {
        const res = await fetch('/territories.json');
        if (!res.ok) throw new Error('Data error');
        const geojson = await res.json();
        if (cancelled) return;

        const featureLayers = {};
        let focusedId = null;

        // Floating info panel (top-right corner of the map)
        const panel = L.DomUtil.create('div', 'imtos-info-panel', map.getContainer());
        panel.style.display = 'none';
        L.DomEvent.disableClickPropagation(panel);
        L.DomEvent.disableScrollPropagation(panel);

        const isMobile = () => window.innerWidth < 768;

        function setFillStyles(fl, styles) {
          const el = fl._path;
          if (!el) return;
          Object.assign(el.style, styles);
        }

        function applyDefault(fl) {
          const def = getStyle(fl.feature);
          setFillStyles(fl, {
            fill: def.fillColor,
            fillOpacity: String(def.fillOpacity),
            stroke: def.color,
            strokeWidth: String(def.weight),
            filter: '',
          });
        }

        // Dark mask covering the whole world EXCEPT the focused territory
        let maskLayer = null;

        function buildMaskRings(feature) {
          const world = [
            [-89, -179],
            [89, -179],
            [89, 179],
            [-89, 179],
          ];
          const geom = feature.geometry;
          const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
          // Outer ring of each polygon becomes a hole in the world mask
          const holes = polys.map((poly) => poly[0].map(([lng, lat]) => [lat, lng]));
          return [world, ...holes];
        }

        function clearFocusVisuals() {
          map.getPane('tilePane').style.filter = '';
          tileLayer.setOpacity(1);
          if (maskLayer) {
            map.removeLayer(maskLayer);
            maskLayer = null;
          }
          if (map.hasLayer(labelsLayer)) map.removeLayer(labelsLayer);
          Object.values(featureLayers).forEach(applyDefault);
        }

        function focusTerritory(feature, fl) {
          if (focusedId) clearFocusVisuals();
          focusedId = feature.properties.id;

          // Panel with rep contact(s)
          panel.innerHTML = buildPanelHtml(feature);
          panel.style.display = 'block';
          panel.querySelector('.imtos-panel-close')?.addEventListener('click', closeFocus);

          // Smooth zoom to territory
          map.flyToBounds(fl.getBounds(), {
            padding: isMobile() ? [12, 12] : [50, 50],
            maxZoom: 9.5,
            duration: 1.1,
          });

          // Blur the basemap, dim surrounding territories
          map.getPane('tilePane').style.filter = 'blur(2.5px) saturate(0.6)';
          tileLayer.setOpacity(0.55);

          const rep = salesReps[feature.properties.reps[0]];
          Object.values(featureLayers).forEach((other) => {
            if (other.feature.properties.id === focusedId) {
              // Lighter fill → town labels stay readable
              setFillStyles(other, {
                fill: rep.color,
                fillOpacity: '0.42',
                stroke: '#ffffff',
                strokeWidth: '2.5',
                filter: '',
              });
            } else {
              setFillStyles(other, {
                fill: '#475569',
                fillOpacity: '0.4',
                stroke: '#94a3b8',
                strokeWidth: '0.5',
                filter: 'blur(2.5px)',
              });
            }
          });

          // Dark veil over everything outside the focused territory
          maskLayer = L.polygon(buildMaskRings(feature), {
            fillColor: '#0f172a',
            fillOpacity: 0.45,
            fillRule: 'evenodd',
            stroke: false,
            className: 'imtos-mask',
          }).addTo(map);
          maskLayer.on('click', closeFocus);

          // Focused territory above the mask
          fl.bringToFront();

          // Reveal smaller towns
          if (!map.hasLayer(labelsLayer)) labelsLayer.addTo(map);
        }

        function closeFocus() {
          if (!focusedId) return;
          focusedId = null;
          panel.style.display = 'none';
          clearFocusVisuals();
          map.flyToBounds(layer.getBounds(), {
            padding: isMobile() ? [4, 4] : [24, 24],
            duration: 1.0,
          });
        }

        const layer = L.geoJSON(geojson, {
          style: getStyle,
          onEachFeature(feature, fl) {
            featureLayers[feature.properties.id] = fl;

            const reps = feature.properties.reps.map((id) => salesReps[id]).filter(Boolean);
            fl.bindTooltip(
              `<div style="text-align:center">
                 <div style="font-weight:700;font-size:12px;color:#1e293b">${feature.properties.name}</div>
                 <div style="font-size:11px;color:#64748b;margin-top:1px">${reps.map((r) => r.name).join(' · ')}</div>
               </div>`,
              { sticky: true, direction: 'top', opacity: 0.95, className: 'imtos-tooltip' }
            );

            fl.on('click', (e) => {
              L.DomEvent.stopPropagation(e);
              if (focusedId === feature.properties.id) {
                closeFocus();
              } else {
                if (focusedId) {
                  // Switching focus — clear previous panel listener state
                  panel.style.display = 'none';
                }
                focusTerritory(feature, fl);
              }
            });

            fl.on('mouseover', (e) => {
              if (focusedId) return;
              e.target.setStyle({ weight: 3, color: '#3D3935', fillOpacity: 0.9 });
              e.target.bringToFront();
            });
            fl.on('mouseout', () => {
              if (focusedId) return;
              layer.resetStyle(fl);
            });
          },
        }).addTo(map);

        map.on('click', closeFocus);
        onKeyDown = (e) => {
          if (e.key === 'Escape') closeFocus();
        };
        window.addEventListener('keydown', onKeyDown);

        // ── Sidebar hover highlight (smooth via inline CSS on SVG paths) ──
        onHighlight = (e) => {
          if (focusedId) return;
          const { repId } = e.detail;
          const rep = salesReps[repId];
          if (!rep) return;

          tileLayer.setOpacity(0.18);

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
          if (focusedId) return;
          tileLayer.setOpacity(1);
          Object.values(featureLayers).forEach(applyDefault);
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

        map.fitBounds(layer.getBounds(), { padding: isMobile() ? [4, 4] : [24, 24] });
      } catch (err) {
        console.error('Map data error:', err);
      }
    })();

    return () => {
      cancelled = true;
      if (onHighlight) window.removeEventListener('imtos:highlight', onHighlight);
      if (onReset) window.removeEventListener('imtos:reset', onReset);
      if (onKeyDown) window.removeEventListener('keydown', onKeyDown);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} style={{ height: '100%', width: '100%' }} />;
}
