function accessOptions = taskAccessOptions(scenario, options)
%TASKACCESSOPTIONS Build computeSensorAccess options for task opportunity search.
%
% Tasking assumes a slewable sensor, so opportunities are gated on the
% field of regard (the target only needs to be reachable, not already in
% the fixed beam) and sampled densely so short overpasses are not missed
% between coarse scenario time steps. The scheduler models the slew cost of
% actually pointing at the target separately (SlewTimeSeconds / off-nadir
% quality penalty), so FOR gating here is the correct visibility test.

accessOptions = struct();
accessOptions.UseFieldOfRegard = options.UseFieldOfRegardForTasking;

stepSeconds = options.AccessTimeStepSeconds;
if isfinite(stepSeconds) && stepSeconds > 0
    accessOptions.TimeStepSeconds = min(stepSeconds, ...
        seconds(scenario.Config.TimeStep));
end
end
