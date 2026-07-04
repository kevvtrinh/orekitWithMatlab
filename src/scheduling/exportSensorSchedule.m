function outputFile = exportSensorSchedule(schedule, outputFile)
%EXPORTSENSORSCHEDULE Write a scheduled task table to CSV.

if nargin < 2 || strlength(string(outputFile)) == 0
    outputFile = fullfile(pwd, "sensor_schedule.csv");
end
[folder, ~, ~] = fileparts(outputFile);
if strlength(string(folder)) > 0 && ~isfolder(folder)
    mkdir(folder);
end
writetable(schedule, outputFile);
end
