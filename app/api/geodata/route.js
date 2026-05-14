const EUROSTAT_URL =
  'https://gisco-services.ec.europa.eu/distribution/v2/nuts/geojson/NUTS_RG_20M_2021_4326_LEVL_3.geojson';

export async function GET() {
  try {
    const res = await fetch(EUROSTAT_URL, {
      next: { revalidate: 604800 }, // cache 1 week
    });

    if (!res.ok) throw new Error(`Eurostat ${res.status}`);

    const data = await res.json();

    const filtered = {
      type: 'FeatureCollection',
      features: data.features.filter(
        (f) => f.properties.CNTR_CODE === 'CZ' || f.properties.CNTR_CODE === 'SK'
      ),
    };

    return Response.json(filtered, {
      headers: {
        'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
      },
    });
  } catch (err) {
    console.error('Geodata error:', err);
    return Response.json({ error: 'Nelze načíst geografická data' }, { status: 500 });
  }
}
