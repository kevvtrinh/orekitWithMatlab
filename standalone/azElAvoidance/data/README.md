# Bundled Country Boundaries

The Vietnam and China CSV files contain ADM0 exterior boundaries from the
version-pinned geoBoundaries `gbOpen` release:

- Vietnam: `VNM-ADM0-46766057`, represented year 2016, CC BY 4.0
- China: `CHN-ADM0-351020`, represented year 2019, Public Domain

Source GeoJSON:

- <https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/VNM/ADM0/geoBoundaries-VNM-ADM0.geojson>
- <https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/CHN/ADM0/geoBoundaries-CHN-ADM0.geojson>

The API metadata and licensing are available from:

- <https://www.geoboundaries.org/api/current/gbOpen/VNM/ADM0/>
- <https://www.geoboundaries.org/api/current/gbOpen/CHN/ADM0/>

`generate_country_boundaries.js` uses closed-ring Douglas-Peucker
simplification with a shared tolerance per country. Every exterior polygon
part is retained and closed. Each output contains exactly 500 finite
latitude/longitude vertices, with `NaN` rows separating polygon parts.

The files store latitude and longitude, not sensor azimuth and elevation.
`exampleVietnamChinaAzElAvoidance` applies a translation-only visualization
map:

```text
azimuth_deg = longitude_deg - 110
elevation_deg = latitude_deg
```

That mapping preserves the recognizable outlines and their relative scale,
but it is not a physical satellite-to-target projection. Operational use
should pass time-varying sensor-frame `azElData`.
