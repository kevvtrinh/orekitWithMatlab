"use strict";

const fs = require("fs");
const path = require("path");

const [vietnamPath, chinaPath, outputDirectory, maximumText = "500"] =
  process.argv.slice(2);
if (!vietnamPath || !chinaPath || !outputDirectory) {
  throw new Error(
    "Usage: node generate_country_boundaries.js VNM.geojson " +
      "CHN.geojson output-directory [maximum-vertices]",
  );
}
const maximumVertices = Number(maximumText);
if (!Number.isInteger(maximumVertices) || maximumVertices < 4) {
  throw new Error("maximum-vertices must be an integer of at least 4.");
}

fs.mkdirSync(outputDirectory, { recursive: true });
const sources = [
  {
    code: "VNM",
    name: "Vietnam",
    boundaryID: "VNM-ADM0-46766057",
    boundaryYearRepresented: "2016",
    license: "CC BY 4.0",
    sourceUrl:
      "https://github.com/wmgeolab/geoBoundaries/raw/9469f09/" +
      "releaseData/gbOpen/VNM/ADM0/geoBoundaries-VNM-ADM0.geojson",
    inputPath: vietnamPath,
    outputName: "vietnam_adm0_latlon.csv",
  },
  {
    code: "CHN",
    name: "China",
    boundaryID: "CHN-ADM0-351020",
    boundaryYearRepresented: "2019",
    license: "Public Domain",
    sourceUrl:
      "https://github.com/wmgeolab/geoBoundaries/raw/9469f09/" +
      "releaseData/gbOpen/CHN/ADM0/geoBoundaries-CHN-ADM0.geojson",
    inputPath: chinaPath,
    outputName: "china_adm0_latlon.csv",
  },
];

const manifest = sources.map((source) => {
  const geojson = JSON.parse(fs.readFileSync(source.inputPath, "utf8"));
  const feature = geojson.features[0];
  const rings = exteriorRings(feature.geometry);
  const originalVertexCount = finiteVertexCount(rings);
  const simplified = simplifyToCap(rings, maximumVertices);
  const retainedVertexCount = finiteVertexCount(simplified);
  const outputPath = path.join(outputDirectory, source.outputName);
  writeCsv(outputPath, simplified);
  return {
    country: source.name,
    iso3: source.code,
    boundaryID: source.boundaryID,
    boundaryYearRepresented: source.boundaryYearRepresented,
    license: source.license,
    sourceUrl: source.sourceUrl,
    polygonParts: simplified.length,
    originalVertexCount,
    retainedVertexCount,
    maximumVertices,
    outputFile: source.outputName,
  };
});

fs.writeFileSync(
  path.join(outputDirectory, "boundary_manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);

function exteriorRings(geometry) {
  const polygons =
    geometry.type === "Polygon"
      ? [geometry.coordinates]
      : geometry.type === "MultiPolygon"
        ? geometry.coordinates
        : null;
  if (!polygons) {
    throw new Error(`Unsupported geometry type: ${geometry.type}`);
  }
  return polygons
    .map((polygon) => polygon[0])
    .filter((ring) => Array.isArray(ring) && ring.length >= 4);
}

function simplifyToCap(rings, maximum) {
  const minimum = 4 * rings.length;
  if (minimum > maximum) {
    throw new Error(
      `${rings.length} polygon parts require at least ${minimum} vertices.`,
    );
  }
  if (finiteVertexCount(rings) <= maximum) {
    return rings;
  }

  let lower = 0;
  let upper = 0.01;
  while (finiteVertexCount(simplifyRings(rings, upper)) > maximum) {
    upper *= 2;
  }
  for (let iteration = 0; iteration < 64; iteration += 1) {
    const middle = 0.5 * (lower + upper);
    if (finiteVertexCount(simplifyRings(rings, middle)) > maximum) {
      lower = middle;
    } else {
      upper = middle;
    }
  }
  return simplifyRings(rings, upper);
}

function simplifyRings(rings, tolerance) {
  return rings.map((ring) => simplifyClosedRing(ring, tolerance));
}

function simplifyClosedRing(input, tolerance) {
  const unique = input
    .slice(
      0,
      pointsEqual(input[0], input[input.length - 1])
        ? input.length - 1
        : input.length,
    )
    .map((point) => [Number(point[0]), Number(point[1])]);
  if (unique.length <= 3) {
    return closeRing(unique);
  }

  let opposite = 1;
  let farthest = -1;
  for (let index = 1; index < unique.length; index += 1) {
    const distance = squaredDistance(unique[0], unique[index]);
    if (distance > farthest) {
      farthest = distance;
      opposite = index;
    }
  }
  const firstArc = unique.slice(0, opposite + 1);
  const secondArc = unique.slice(opposite).concat([unique[0]]);
  const firstSimplified = simplifyOpenLine(firstArc, tolerance);
  const secondSimplified = simplifyOpenLine(secondArc, tolerance);
  let simplified = firstSimplified
    .slice(0, -1)
    .concat(secondSimplified.slice(0, -1));
  if (simplified.length < 3) {
    simplified = threeRepresentativePoints(unique);
  }
  return closeRing(simplified);
}

function simplifyOpenLine(points, tolerance) {
  if (points.length <= 2) {
    return points.slice();
  }
  const toleranceSquared = tolerance * tolerance;
  const retained = new Uint8Array(points.length);
  retained[0] = 1;
  retained[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length > 0) {
    const [first, last] = stack.pop();
    let maximumDistance = toleranceSquared;
    let maximumIndex = -1;
    for (let index = first + 1; index < last; index += 1) {
      const distance = pointSegmentDistanceSquared(
        points[index],
        points[first],
        points[last],
      );
      if (distance > maximumDistance) {
        maximumDistance = distance;
        maximumIndex = index;
      }
    }
    if (maximumIndex >= 0) {
      retained[maximumIndex] = 1;
      stack.push([first, maximumIndex], [maximumIndex, last]);
    }
  }
  return points.filter((_, index) => retained[index] === 1);
}

function threeRepresentativePoints(points) {
  return [points[0], points[Math.floor(points.length / 3)], points[Math.floor(
    (2 * points.length) / 3,
  )]];
}

function closeRing(points) {
  return points.concat([[points[0][0], points[0][1]]]);
}

function pointSegmentDistanceSquared(point, start, stop) {
  const dx = stop[0] - start[0];
  const dy = stop[1] - start[1];
  if (dx === 0 && dy === 0) {
    return squaredDistance(point, start);
  }
  const fraction = Math.max(
    0,
    Math.min(
      1,
      ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) /
        (dx * dx + dy * dy),
    ),
  );
  const nearest = [start[0] + fraction * dx, start[1] + fraction * dy];
  return squaredDistance(point, nearest);
}

function squaredDistance(first, second) {
  const dx = first[0] - second[0];
  const dy = first[1] - second[1];
  return dx * dx + dy * dy;
}

function pointsEqual(first, second) {
  return first[0] === second[0] && first[1] === second[1];
}

function finiteVertexCount(rings) {
  return rings.reduce((sum, ring) => sum + ring.length, 0);
}

function writeCsv(outputPath, rings) {
  const lines = ["latitude_deg,longitude_deg,part_index"];
  rings.forEach((ring, partIndex) => {
    ring.forEach(([longitude, latitude]) => {
      lines.push(
        `${latitude.toFixed(8)},${longitude.toFixed(8)},${partIndex + 1}`,
      );
    });
    if (partIndex + 1 < rings.length) {
      lines.push("NaN,NaN,NaN");
    }
  });
  fs.writeFileSync(outputPath, `${lines.join("\n")}\n`);
}
