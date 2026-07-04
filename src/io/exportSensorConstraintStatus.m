function exportSensorConstraintStatus(sensorAccessResult, filename)
%EXPORTSENSORCONSTRAINTSTATUS Export per-sample sensor constraint status.

writetable(sensorAccessResult.ConstraintStatus, filename);
end
