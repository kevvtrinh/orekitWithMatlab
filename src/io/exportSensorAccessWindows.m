function exportSensorAccessWindows(sensorAccessResult, filename)
%EXPORTSENSORACCESSWINDOWS Export only sensor access windows.

writetable(sensorAccessResult.AccessWindows, filename);
end
