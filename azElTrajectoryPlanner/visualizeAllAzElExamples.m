function results = visualizeAllAzElExamples(options)
%VISUALIZEALLAZELEXAMPLES Plan and animate all 15 frozen examples.
if nargin < 1
    options = struct();
end
results = visualizeAzElExample(1:15, options);
end
