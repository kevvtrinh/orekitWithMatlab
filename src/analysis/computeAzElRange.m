function aer = computeAzElRange(satellite, groundStation, timeVector)
%COMPUTEAZELRANGE Compute azimuth/elevation/range from a ground station.

if ~isa(satellite, "SatelliteObject")
    error("computeAzElRange:InvalidSatellite", "First input must be a SatelliteObject.");
end
if ~isa(groundStation, "GroundStationObject")
    error("computeAzElRange:InvalidGroundStation", "Second input must be a GroundStationObject.");
end
aer = OrekitAccessEngine.azElRange(satellite, groundStation, timeVector);
end

