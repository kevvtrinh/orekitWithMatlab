function tests = testCountryAreaTargets
tests = functiontests(localfunctions);
end

function setupOnce(~)
addpath(genpath(fileparts(fileparts(mfilename("fullpath")))));
end

function testMultipartContainsHolesAndDateLine(testCase)
polygons = fixturePolygons();
verifyTrue(testCase, GeographicAreaGeometry.contains(polygons, 1, 1));
verifyFalse(testCase, GeographicAreaGeometry.contains(polygons, 3, 3));
verifyTrue(testCase, GeographicAreaGeometry.contains(polygons, 11, 179.5));
verifyTrue(testCase, GeographicAreaGeometry.contains(polygons, 11, -179.5));
verifyFalse(testCase, GeographicAreaGeometry.contains(polygons, 11, 0));
end

function testPolygonSamplesRemainInside(testCase)
polygons = fixturePolygons();
[latitude, longitude] = GeographicAreaGeometry.sample(polygons, 150);
verifyGreaterThan(testCase, numel(latitude), 0);
verifyTrue(testCase, all(GeographicAreaGeometry.contains(polygons, latitude, longitude)));
verifyTrue(testCase, any(longitude > 179));
verifyTrue(testCase, any(longitude < -179));
end

function testHoleSubtractsArea(testCase)
polygons = fixturePolygons();
withoutHole = polygons{1}; withoutHole.holes = [];
hole = struct("outer", polygons{1}.holes.ring, "holes", []);
verifyEqual(testCase, GeographicAreaGeometry.areaKm2(polygons(1)), ...
    GeographicAreaGeometry.areaKm2(withoutHole) - GeographicAreaGeometry.areaKm2(hole), "AbsTol", 1e-8);
end

function testPolarCapUsesFullLongitudeClosure(testCase)
cap = struct("outer", [-180 -90; -180 -80; 180 -80; 180 -90; -180 -90], "holes", []);
GeographicAreaGeometry.validate(cap);
verifyTrue(testCase, GeographicAreaGeometry.contains(cap, -85, 100));
verifyFalse(testCase, GeographicAreaGeometry.contains(cap, -70, 100));
expectedArea = 2 * pi * 6371^2 * (1 - sind(80));
verifyEqual(testCase, GeographicAreaGeometry.areaKm2(cap), expectedArea, "RelTol", 1e-12);
end

function testBuildAndRoundTripCountryObject(testCase)
polygons = fixturePolygons();
metadata = struct("name", "Country", "type", "country", "countryCode", "TST", ...
    "centerLatDeg", 1, "centerLonDeg", 1, "widthKm", 500, "heightKm", 500, "spacingKm", 150);
[lat, lon] = GeographicAreaGeometry.sample(polygons, 150);
objects = cell(numel(lat), 1);
for k = 1:numel(lat)
    objects{k} = struct("kind", "target", "name", "Country-GP" + k, "group", "Country", ...
        "area", metadata, "latitudeDeg", lat(k), "longitudeDeg", lon(k), "altitudeM", 0, "priority", 5);
end
definition = metadata; definition.boundaryPolygons = polygons;
spec = struct("version", 1, "meta", struct("name", "Country test", "epochUtc", "2026-01-01T00:00:00Z", ...
    "durationSeconds", 60, "stepSeconds", 30), "objects", {objects}, "areas", {{definition}});
scenario = buildScenarioFromSpec(jsondecode(jsonencode(spec)));
area = scenario.getObject("Country");
area.validate();
verifyClass(testCase, area, "AreaTargetObject");
verifyEqual(testCase, height(area.getGridPoints()), numel(lat));
verifyFalse(testCase, area.containsPoint(3, 3));
verifyTrue(testCase, area.containsPoint(11, -179.5));
restored = AreaTargetObject.fromStruct(area.toStruct());
verifyEqual(testCase, restored.getGridPoints(), area.getGridPoints());
verifyEqual(testCase, restored.getAreaKm2(), area.getAreaKm2());
verifyFalse(testCase, restored.containsPoint(3, 3));
end

function polygons = fixturePolygons()
polygons = {struct("outer", [0 0; 0 6; 6 6; 6 0; 0 0], ...
    "holes", struct("ring", [2 2; 4 2; 4 4; 2 4; 2 2])), ...
    struct("outer", [179 10; 179 12; 181 12; 181 10; 179 10], "holes", [])};
end
