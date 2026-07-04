function slewAngleDeg = computeSlewAngle(pointingVectorA, pointingVectorB)
%COMPUTESLEWANGLE Angular separation between two pointing vectors.

slewAngleDeg = SensorObject.vectorAngleDeg(pointingVectorA, pointingVectorB);
end
