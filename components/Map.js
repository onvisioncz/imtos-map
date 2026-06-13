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

const PHONE_SVG = (c) =>
  `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.1 1.18 2 2 0 012.06 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>`;

const MAIL_SVG = (c) =>
  `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;

function repCardHtml(rep, isLast) {
  return `
    <div style="display:flex;align-items:flex-start;gap:12px;padding:14px 0 ${isLast ? '2px' : '14px'};${isLast ? '' : 'border-bottom:1px solid #f0efee'}">
      ${rep.avatar
        ? `<img src="${rep.avatar}" alt="${rep.name}" style="width:52px;height:52px;border-radius:50%;object-fit:cover;box-shadow:0 0 0 1px #e7e5e4;flex-shrink:0"/>`
        : `<div style="width:52px;height:52px;border-radius:50%;background:#f5f5f4;display:flex;align-items:center;justify-content:center;color:#78716c;font-weight:650;font-size:15px;flex-shrink:0">${rep.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}</div>`
      }
      <div style="min-width:0;flex:1">
        <div style="display:flex;align-items:center;gap:7px">
          <span style="width:8px;height:8px;border-radius:3px;background:${rep.color};flex-shrink:0"></span>
          <span style="font-weight:650;font-size:13.5px;letter-spacing:-0.01em;color:#1c1917">${rep.name}</span>
        </div>
        <div style="margin-top:7px;display:flex;flex-direction:column;gap:5px">
          <a href="tel:${rep.phone.replace(/\s/g, '')}" style="display:flex;align-items:center;gap:8px;color:#44403c;font-size:12.5px;font-variant-numeric:tabular-nums;text-decoration:none">${PHONE_SVG('#a8a29e')}${rep.phone}</a>
          <a href="mailto:${rep.email}" style="display:flex;align-items:center;gap:8px;color:#44403c;font-size:12.5px;text-decoration:none">${MAIL_SVG('#a8a29e')}${rep.email}</a>
        </div>
        <div style="margin-top:8px;color:#a8a29e;font-size:11px;font-variant-numeric:tabular-nums">PSČ ${rep.pscLabel}</div>
      </div>
    </div>`;
}

function buildPanelHtml(feature) {
  const { name, psc, reps: repIds } = feature.properties;
  const reps = repIds.map((id) => salesReps[id]).filter(Boolean);
  const shared = reps.length > 1;

  return `
    <div style="padding:16px 16px 13px 20px;display:flex;align-items:flex-start;justify-content:space-between;gap:10px;border-bottom:1px solid #e7e5e4">
      <div style="min-width:0">
        <div style="font-weight:700;font-size:15px;letter-spacing:-0.015em;color:#1c1917">${name}</div>
        <div style="font-size:11.5px;color:#78716c;margin-top:3px;font-variant-numeric:tabular-nums">PSČ ${psc}</div>
        ${shared ? '<div style="display:inline-block;margin-top:7px;font-size:10.5px;font-weight:650;letter-spacing:0.02em;color:#92400e;background:#fef3c7;border-radius:6px;padding:3px 8px">Oblast s více obchodníky</div>' : ''}
      </div>
      <button class="imtos-panel-close" aria-label="Zavřít">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>
    <div style="padding:0 20px 8px">
      ${reps.map((r, i) => repCardHtml(r, i === reps.length - 1)).join('')}
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

      // Štítek oblasti (tooltip) nad popisky měst → box je čistě překryje
      if (map.getPane('tooltipPane')) {
        map.getPane('tooltipPane').style.zIndex = 690;
      }

      // Města nad 100 000 obyvatel (CZ + SK)
      const CITIES = [
        { name: 'Praha', lat: 50.0755, lng: 14.4378 },
        { name: 'Brno', lat: 49.1951, lng: 16.6068 },
        { name: 'Ostrava', lat: 49.8209, lng: 18.2625 },
        { name: 'Plzeň', lat: 49.7384, lng: 13.3736 },
        { name: 'Karlovy Vary', lat: 50.2310, lng: 12.8716 },
        { name: 'Liberec', lat: 50.7663, lng: 15.0543 },
        { name: 'Olomouc', lat: 49.5938, lng: 17.2509 },
        { name: 'Jihlava', lat: 49.3961, lng: 15.5912 },
        { name: 'České Budějovice', lat: 48.9745, lng: 14.4744 },
        { name: 'Ústí nad Labem', lat: 50.6607, lng: 14.0323 },
        { name: 'Hradec Králové', lat: 50.2092, lng: 15.8328 },
        { name: 'Zlín', lat: 49.2264, lng: 17.6707 },
        { name: 'Bratislava', lat: 48.1486, lng: 17.1077 },
        { name: 'Košice', lat: 48.7164, lng: 21.2611 },
        { name: 'Trnava', lat: 48.3774, lng: 17.5877 },
        { name: 'Žilina', lat: 49.2231, lng: 18.7394 },
        { name: 'Banská Bystrica', lat: 48.7395, lng: 19.1453 },
        { name: 'Prešov', lat: 48.9985, lng: 21.2339 },
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
        let zoomDebounce = null;

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
        let focusedFeature = null;

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

        // Clip the town-labels pane to the focused territory — no labels outside
        function updateLabelsClip() {
          const pane = map.getPane('labels');
          if (!focusedFeature) {
            pane.style.clipPath = '';
            return;
          }
          const geom = focusedFeature.geometry;
          const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
          const d = polys
            .map((poly) => {
              const pts = poly[0].map(([lng, lat]) => {
                const p = map.latLngToLayerPoint([lat, lng]);
                return `${Math.round(p.x)} ${Math.round(p.y)}`;
              });
              return `M${pts.join('L')}Z`;
            })
            .join('');
          pane.style.clipPath = `path("${d}")`;
        }

        // Heavy visuals run AFTER the flight — the zoom animation stays smooth
        let pendingEffects = null;

        function cancelPendingEffects() {
          if (pendingEffects) {
            map.off('moveend', pendingEffects.run);
            clearTimeout(pendingEffects.timer);
            pendingEffects = null;
          }
        }

        function clearFocusVisuals() {
          cancelPendingEffects();
          map.getPane('tilePane').style.filter = '';
          map.getPane('cities').style.display = '';
          tileLayer.setOpacity(1);
          if (maskLayer) {
            map.removeLayer(maskLayer);
            maskLayer = null;
          }
          focusedFeature = null;
          map.off('zoomend viewreset moveend', updateLabelsClip);
          updateLabelsClip();
          if (map.hasLayer(labelsLayer)) map.removeLayer(labelsLayer);
          Object.values(featureLayers).forEach(applyDefault);
        }

        function focusTerritory(feature, fl) {
          if (focusedId) clearFocusVisuals();
          focusedId = feature.properties.id;
          focusedFeature = feature;

          // Panel with rep contact(s)
          panel.innerHTML = buildPanelHtml(feature);
          panel.style.display = 'block';
          panel.querySelector('.imtos-panel-close')?.addEventListener('click', closeFocus);

          // Smooth zoom to territory — INTEGER zoom so label tiles render crisp.
          // Minimum 9 so town labels stay dense even for large territories.
          const pad = isMobile() ? L.point(12, 12) : L.point(50, 50);
          const computed = Math.floor(map.getBoundsZoom(fl.getBounds(), false, pad));
          const targetZoom = isMobile()
            ? Math.min(Math.max(computed, 8), 10)
            : Math.min(Math.max(computed, 9), 10);

          // Hide our big-city markers — tile labels take over in detail view
          map.getPane('cities').style.display = 'none';

          const expectedId = focusedId;
          const applyEffects = () => {
            if (focusedId !== expectedId) return;
            cancelPendingEffects();

            // Blur the basemap, dim surrounding territories
            map.getPane('tilePane').style.filter = 'blur(3px) saturate(0.55)';
            tileLayer.setOpacity(0.55);

            const rep = salesReps[feature.properties.reps[0]];
            Object.values(featureLayers).forEach((other) => {
              if (other.feature.properties.id === expectedId) {
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

            // Reveal smaller towns — clipped to the territory only
            if (!map.hasLayer(labelsLayer)) labelsLayer.addTo(map);
            updateLabelsClip();
            map.on('zoomend viewreset moveend', updateLabelsClip);
          };

          // Run effects when the flight lands (fallback timer if no moveend fires)
          cancelPendingEffects();
          pendingEffects = {
            run: applyEffects,
            timer: setTimeout(applyEffects, 1400),
          };
          map.once('moveend', pendingEffects.run);

          map.flyTo(fl.getBounds().getCenter(), targetZoom, { duration: 1.1 });
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
              `<div style="text-align:left">
                 <div style="font-weight:650;font-size:12.5px;letter-spacing:-0.01em;color:#1c1917">${feature.properties.name}</div>
                 <div style="display:flex;align-items:center;gap:6px;font-size:11.5px;color:#78716c;margin-top:3px">
                   <span style="width:7px;height:7px;border-radius:2.5px;background:${salesReps[feature.properties.reps[0]]?.color};flex-shrink:0"></span>
                   ${reps.map((r) => r.name).join(' · ')}
                 </div>
               </div>`,
              { sticky: true, direction: 'top', opacity: 1, className: 'imtos-tooltip' }
            );

            fl.on('click', (e) => {
              L.DomEvent.stopPropagation(e);
              if (isMobile()) {
                // Mobile: pick the rep in the bottom strip — no covering panel
                window.dispatchEvent(
                  new CustomEvent('imtos:selectRep', {
                    detail: { repId: feature.properties.reps[0] },
                  })
                );
                return;
              }
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
          const { repId, zoom } = e.detail;
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

          // Mobile: zoom + show the region label consistently (swipe i tap)
          if (zoom && isMobile()) {
            const finite = (b) =>
              b && [b.getWest(), b.getEast(), b.getSouth(), b.getNorth()].every(Number.isFinite);

            const bounds = L.latLngBounds([]);
            let mainFl = null;
            let maxArea = 0;
            Object.values(featureLayers).forEach((fl) => {
              if (!fl.feature.properties.reps.includes(repId)) return;
              const b = fl.getBounds();
              if (!finite(b)) return;
              bounds.extend(b);
              // Hlavní (největší) plocha obchodníka pro umístění štítku
              if (fl.feature.properties.reps[0] === repId) {
                const a = (b.getEast() - b.getWest()) * (b.getNorth() - b.getSouth());
                if (a > maxArea) { maxArea = a; mainFl = fl; }
              }
            });

            // Zavřít předchozí štítky a otevřít štítek vybrané oblasti nad jejím středem
            Object.values(featureLayers).forEach((fl) => fl.closeTooltip());
            const openLabel = () => {
              if (mainFl && finite(mainFl.getBounds())) {
                mainFl.openTooltip(mainFl.getBounds().getCenter());
              }
            };
            openLabel();

            if (bounds.isValid() && finite(bounds)) {
              clearTimeout(zoomDebounce);
              zoomDebounce = setTimeout(() => {
                map.flyToBounds(bounds, { padding: [26, 26], maxZoom: 9, duration: 0.8 });
                openLabel();
              }, 200);
            }
          }
        };

        onReset = () => {
          if (focusedId) return;
          clearTimeout(zoomDebounce);
          tileLayer.setOpacity(1);
          Object.values(featureLayers).forEach((fl) => {
            fl.closeTooltip();
            applyDefault(fl);
          });
        };

        window.addEventListener('imtos:highlight', onHighlight);
        window.addEventListener('imtos:reset', onReset);

        // ── Legend (desktop only, hidden via CSS on mobile) ──
        const legend = L.control({ position: 'bottomleft' });
        legend.onAdd = () => {
          const div = L.DomUtil.create('div', 'imtos-legend');
          div.innerHTML =
            '<div class="imtos-legend-title">Obchodní zastoupení</div>' +
            Object.values(salesReps)
              .map(
                (r) =>
                  `<div class="imtos-legend-row"><span class="imtos-legend-dot" style="background:${r.color}"></span>${r.name}</div>`
              )
              .join('');
          return div;
        };
        legend.addTo(map);

        // ── Zoom-out / celá mapa (jen mobil, přes CSS) ──
        const zoomOut = L.control({ position: 'topright' });
        zoomOut.onAdd = () => {
          const btn = L.DomUtil.create('button', 'imtos-zoomout');
          btn.type = 'button';
          btn.setAttribute('aria-label', 'Oddálit na celou mapu');
          btn.innerHTML =
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="8" y1="11" x2="14" y2="11"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
          L.DomEvent.disableClickPropagation(btn);
          L.DomEvent.on(btn, 'click', () => {
            clearTimeout(zoomDebounce);
            map.flyToBounds(layer.getBounds(), { padding: [12, 12], duration: 0.9 });
          });
          return btn;
        };
        zoomOut.addTo(map);

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
