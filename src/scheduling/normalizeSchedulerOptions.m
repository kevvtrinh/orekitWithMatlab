function options = normalizeSchedulerOptions(options)
%NORMALIZESCHEDULEROPTIONS Convert structs/empty values to SchedulerOptions.

if nargin < 1 || isempty(options)
    options = SchedulerOptions();
elseif isstruct(options)
    incoming = options;
    options = SchedulerOptions();
    names = fieldnames(incoming);
    for k = 1:numel(names)
        if isprop(options, names{k})
            options.(names{k}) = incoming.(names{k});
        end
    end
elseif ~isa(options, "SchedulerOptions")
    error("normalizeSchedulerOptions:InvalidOptions", ...
        "Options must be a SchedulerOptions object or struct.");
end
end
