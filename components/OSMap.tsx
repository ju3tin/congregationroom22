"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

interface OSMapProps {
  geoJsonUrl?: string;
  height?: string;
}

export default function OSMap({
  geoJsonUrl = "/data/boundary.geojson",
  height = "100vh",
}: OSMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      if (!mapContainerRef.current) return;
      if (mapRef.current) return;

      /*
       * Import Leaflet ONLY in the browser.
       */
      const L = await import("leaflet");

      if (cancelled || !mapContainerRef.current) {
        return;
      }

      /*
       * Leaflet CSS
       */
      await import("leaflet/dist/leaflet.css");

      const apiKey = process.env.NEXT_PUBLIC_OS_API_KEY;

      if (!apiKey) {
        console.error(
          "Missing NEXT_PUBLIC_OS_API_KEY in .env.local"
        );
        return;
      }

      /*
       * Create map
       */
      const map = L.map(mapContainerRef.current, {
        minZoom: 7,
        maxZoom: 16,

        center: [54.425, -2.968],

        zoom: 7,

        maxBounds: [
          [49.528423, -10.76418],
          [61.331151, 1.9134116],
        ],

        attributionControl: false,
      });

      mapRef.current = map;

      /*
       * Ordnance Survey basemap
       */
      L.tileLayer(
        `https://api.os.uk/maps/raster/v1/zxy/Light_3857/{z}/{x}/{y}.png?key=${apiKey}`,
        {
          maxZoom: 20,
          attribution:
            '&copy; <a href="https://www.ordnancesurvey.co.uk/">Ordnance Survey</a>',
        }
      ).addTo(map);

      /*
       * Load GeoJSON
       */
      try {
        const response = await fetch(geoJsonUrl);

        if (!response.ok) {
          throw new Error(
            `Unable to load GeoJSON: ${response.status}`
          );
        }

        const data = await response.json();

        if (cancelled) return;

        /*
         * Create GeoJSON layer
         */
        const geojsonLayer = L.geoJSON(data, {
          style: {
            color: "#2563eb",
            weight: 2,
            opacity: 1,
            fillColor: "#3b82f6",
            fillOpacity: 0.2,
          },

          onEachFeature: (
            feature: any,
            layer: any
          ) => {
            const properties =
              feature.properties || {};

            const name =
              properties.name ||
              properties.NAME ||
              properties.Name ||
              properties.BUA24NM ||
              properties.BUA24NMW ||
              properties.city ||
              properties.town ||
              "Boundary";

            /*
             * Tooltip
             */
            layer.bindTooltip(
              String(name),
              {
                sticky: true,
                direction: "top",
              }
            );

            /*
             * Popup
             */
            layer.bindPopup(`
              <div style="
                min-width:180px;
                font-family:Arial,sans-serif;
              ">
                <strong style="
                  font-size:16px;
                  display:block;
                  margin-bottom:6px;
                ">
                  ${escapeHtml(String(name))}
                </strong>

                ${
                  properties.BUA24CD
                    ? `
                    <div style="
                      font-size:12px;
                      color:#666;
                    ">
                      Code: ${escapeHtml(
                        String(properties.BUA24CD)
                      )}
                    </div>
                    `
                    : ""
                }
              </div>
            `);

            /*
             * Hover
             */
            layer.on({
              mouseover: (event: any) => {
                const target = event.target;

                target.setStyle({
                  weight: 4,
                  fillOpacity: 0.45,
                });

                if (
                  target.bringToFront
                ) {
                  target.bringToFront();
                }
              },

              mouseout: (event: any) => {
                const target = event.target;

                target.setStyle({
                  weight: 2,
                  fillOpacity: 0.2,
                });
              },

              click: () => {
                console.log(
                  "Clicked boundary:",
                  {
                    name,
                    properties,
                    feature,
                  }
                );
              },
            });
          },
        });

        geojsonLayer.addTo(map);

        /*
         * Fit map to GeoJSON
         */
        const bounds =
          geojsonLayer.getBounds();

        if (bounds.isValid()) {
          map.fitBounds(bounds, {
            padding: [20, 20],
          });
        }
      } catch (error) {
        console.error(
          "Failed to load GeoJSON:",
          error
        );
      }
    }

    initMap();

    /*
     * Cleanup
     */
    return () => {
      cancelled = true;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [geoJsonUrl]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: "100%",
        height,
        minHeight: "500px",
      }}
    />
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}