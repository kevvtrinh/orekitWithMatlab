function files = exportMILPInputs(candidates, conflicts, taskList, outputFolder)
%EXPORTMILPINPUTS Export candidate, conflict, and task tables for optimization.

if nargin < 4 || strlength(string(outputFolder)) == 0
    outputFolder = fullfile(pwd, "milp_inputs");
end
if ~isfolder(outputFolder)
    mkdir(outputFolder);
end
tasks = taskToTable(taskList);
files = struct();
files.Candidates = fullfile(outputFolder, "sensor_task_candidates.csv");
files.Conflicts = fullfile(outputFolder, "sensor_task_conflicts.csv");
files.Tasks = fullfile(outputFolder, "sensor_task_requirements.csv");
writetable(candidates, files.Candidates);
writetable(conflicts, files.Conflicts);
writetable(tasks, files.Tasks);
end
