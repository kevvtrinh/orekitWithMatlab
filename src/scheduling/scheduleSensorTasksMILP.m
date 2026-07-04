function model = scheduleSensorTasksMILP(~, candidates, options)
%SCHEDULESENSORTASKSMILP Build a placeholder MILP-ready formulation.

if nargin < 3
    options = SchedulerOptions();
end
options = normalizeSchedulerOptions(options);
conflicts = detectTaskConflicts(candidates, options);
model = struct();
model.Description = "MILP-ready export placeholder; solve externally or in a future optimizer.";
model.DecisionVariable = "x_c = 1 when candidate c is selected";
model.Candidates = candidates;
model.Conflicts = conflicts;
model.Objective = "maximize sum(priority_c * quality_c * x_c) minus penalties";
model.Constraints = ["one task per sensor at a time"; ...
    "select at most one candidate per single-collection task"; ...
    "respect multi-sensor count and simultaneity requirements"; ...
    "respect slew, coverage, availability, data, and power limits when modeled"];
end
