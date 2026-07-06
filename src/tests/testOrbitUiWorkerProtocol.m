function tests = testOrbitUiWorkerProtocol
%TESTORBITUIWORKERPROTOCOL Warm-worker job processing for the orbit-ui bridge.
% Covers orbitUiWorkerProcessJob (the per-job dispatcher the persistent
% worker loop calls): ping round-trip, error capture for bad jobs, and the
% done-payload contract with apps/orbit-ui/server/workerProtocol.js. The
% heavyweight scenario path itself is covered by testOrbitUiSpec.
tests = functiontests(localfunctions);
end

function setupOnce(~)
startupOrekitSuite();
end

function testPingJobSucceeds(testCase)
request = struct("id", "job-1", "kind", "ping", ...
    "specFile", [], "outputFile", []);
result = orbitUiWorkerProcessJob(request);
verifyEqual(testCase, result.id, "job-1");
verifyTrue(testCase, result.ok);
verifyEqual(testCase, strlength(result.error), 0);
end

function testDonePayloadRoundTripsThroughJson(testCase)
% The Node bridge matches done.json to its request by id and reads ok/error;
% jsonencode of the result struct must produce exactly those fields.
result = orbitUiWorkerProcessJob(struct("id", "job-2", "kind", "ping"));
decoded = jsondecode(jsonencode(result));
verifyEqual(testCase, decoded.id, 'job-2');
verifyTrue(testCase, islogical(decoded.ok) && decoded.ok);
verifyTrue(testCase, isfield(decoded, "error"));
end

function testUnknownKindFailsWithoutThrowing(testCase)
result = orbitUiWorkerProcessJob(struct("id", "job-3", "kind", "reboot"));
verifyFalse(testCase, result.ok);
verifySubstring(testCase, result.error, "Unknown job kind");
end

function testMalformedRequestFailsWithoutThrowing(testCase)
result = orbitUiWorkerProcessJob(struct("noise", 1));
verifyFalse(testCase, result.ok);
verifyTrue(testCase, strlength(result.error) > 0);
end

function testScenarioJobWithMissingSpecReportsError(testCase)
request = struct("id", "job-4", "kind", "scenario", ...
    "specFile", fullfile(tempdir, "does-not-exist-orbit-ui-spec.json"), ...
    "outputFile", fullfile(tempdir, "orbit-ui-worker-test-out.json"));
result = orbitUiWorkerProcessJob(request);
verifyFalse(testCase, result.ok);
verifyTrue(testCase, strlength(result.error) > 0);
end
