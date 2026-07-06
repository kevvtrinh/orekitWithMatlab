function orbitUiWorker(workDir, idleTimeoutSeconds)
%ORBITUIWORKER Warm MATLAB worker loop for the apps/orbit-ui Node bridge.
%
% orbitUiWorker(workDir, idleTimeoutSeconds)
%
% Started once by the bridge via
%   matlab -batch "startupOrekitSuite(); orbitUiWorker('<workDir>', 900)"
% and reused for every subsequent run, so repeat runs skip MATLAB + JVM +
% Orekit startup (the dominant cost of a bridge run). File protocol, all
% inside workDir (mirrored in apps/orbit-ui/server/workerProtocol.js):
%
%   request.json  Node -> worker: {id, kind: ping|demo|scenario, specFile, outputFile}
%   done.json     worker -> Node after each job: {id, ok, error}
%   ready.json    written here once startup is complete (worker is warm)
%   stop          Node asks the loop to exit
%
% Jobs run one at a time (the bridge is single-slot; see
% orbitUiWorkerProcessJob for execution). The worker exits on its own after
% idleTimeoutSeconds without a job so an orphaned MATLAB never lingers.

arguments
    workDir (1, 1) string
    idleTimeoutSeconds (1, 1) double {mustBePositive} = 900
end

if ~isfolder(workDir)
    mkdir(workDir);
end
requestFile = fullfile(workDir, "request.json");
doneFile = fullfile(workDir, "done.json");
readyFile = fullfile(workDir, "ready.json");
stopFile = fullfile(workDir, "stop");

writeJsonAtomic(readyFile, struct( ...
    "pid", feature("getpid"), ...
    "startedUtc", string(datetime("now", "TimeZone", "UTC", ...
        "Format", "uuuu-MM-dd'T'HH:mm:ss'Z'"))), workDir);
fprintf("[worker] ready (idle timeout %gs)\n", idleTimeoutSeconds);

idleClock = tic;
while true
    if isfile(stopFile)
        delete(stopFile);
        fprintf("[worker] stop requested, exiting.\n");
        break
    end
    if toc(idleClock) > idleTimeoutSeconds
        fprintf("[worker] idle for %gs, exiting.\n", idleTimeoutSeconds);
        break
    end
    if ~isfile(requestFile)
        pause(0.2);
        continue
    end
    try
        request = jsondecode(fileread(requestFile));
    catch
        pause(0.05); % Node may still be mid-write; retry next iteration
        continue
    end
    delete(requestFile);
    result = orbitUiWorkerProcessJob(request);
    writeJsonAtomic(doneFile, result, workDir);
    idleClock = tic;
end

if isfile(readyFile)
    delete(readyFile);
end
end

function writeJsonAtomic(target, data, workDir)
% Temp file + move so the Node poller never reads a half-written file.
tmp = tempname(workDir);
fid = fopen(tmp, "w");
fwrite(fid, jsonencode(data), "char");
fclose(fid);
movefile(tmp, target, "f");
end
