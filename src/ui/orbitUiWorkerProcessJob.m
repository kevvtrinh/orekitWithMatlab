function result = orbitUiWorkerProcessJob(request)
%ORBITUIWORKERPROCESSJOB Execute one warm-worker bridge request.
%
% result = orbitUiWorkerProcessJob(request)
%
% request is the decoded request.json struct sent by the Node bridge (see
% orbitUiWorker): fields id, kind ("ping" | "demo" | "scenario"), specFile,
% outputFile. Returns the done.json payload struct with fields id, ok,
% error. Never throws: failures are reported through result.error so the
% worker loop survives a bad job and stays warm for the next one.

id = "";
if isstruct(request) && isfield(request, "id")
    id = string(request.id);
end
result = struct("id", id, "ok", false, "error", "");

try
    kind = "";
    if isstruct(request) && isfield(request, "kind")
        kind = string(request.kind);
    end
    fprintf("[worker] job %s start (%s)\n", id, kind);
    switch kind
        case "ping"
            % No work: lets the bridge confirm the worker is alive and warm.
        case "demo"
            orbitUiDemoScenario(string(request.outputFile));
        case "scenario"
            orbitUiRunScenario(string(request.specFile), string(request.outputFile));
        otherwise
            error("orbitUiWorker:UnknownJobKind", "Unknown job kind '%s'.", kind);
    end
    result.ok = true;
    fprintf("[worker] job %s done\n", id);
catch ME
    result.error = ME.getReport("extended", "hyperlinks", "off");
    fprintf(2, "[worker] job %s FAILED: %s\n", id, ME.message);
end
end
