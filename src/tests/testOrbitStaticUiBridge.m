function tests = testOrbitStaticUiBridge
%TESTORBITSTATICUIBRIDGE Route-level checks for the no-Node UI bridge.
% These tests avoid long propagation runs; they validate static serving,
% sample scenario fallback, and spec persistence through the pure request
% router used by orbitStaticUiServe.
tests = functiontests(localfunctions);
end

function config = localConfig(testCase)
repoRoot = fileparts(fileparts(fileparts(mfilename("fullpath"))));
root = fullfile(repoRoot, "apps", "orbit-static-ui");
liveDir = fullfile(tempdir, "orbit-static-ui-test", char(java.util.UUID.randomUUID()));
mkdir(liveDir);
testCase.addTeardown(@() removeDirIfExists(liveDir));
config = struct( ...
    "Root", string(root), ...
    "LiveDir", string(liveDir), ...
    "SampleFile", string(fullfile(root, "data", "sample-scenario.json")));
end

function testHealthReportsBridgeReady(testCase)
response = orbitStaticUiRequest( ...
    struct("Method", "GET", "Path", "/api/health", "Body", ""), ...
    localConfig(testCase));
verifyEqual(testCase, response.Status, 200);
body = jsondecode(native2unicode(response.Body, "UTF-8"));
verifyTrue(testCase, body.ok);
verifyEqual(testCase, string(body.server), "orbit-static-ui-matlab-bridge");
verifyTrue(testCase, body.jvm);
end

function testStaticIndexServed(testCase)
response = orbitStaticUiRequest( ...
    struct("Method", "GET", "Path", "/", "Body", ""), ...
    localConfig(testCase));
verifyEqual(testCase, response.Status, 200);
verifySubstring(testCase, string(response.ContentType), "text/html");
verifySubstring(testCase, native2unicode(response.Body, "UTF-8"), "ORBIT CONSOLE");
end

function testScenarioFallsBackToBundledSample(testCase)
response = orbitStaticUiRequest( ...
    struct("Method", "GET", "Path", "/api/scenario", "Body", ""), ...
    localConfig(testCase));
verifyEqual(testCase, response.Status, 200);
body = jsondecode(native2unicode(response.Body, "UTF-8"));
verifyEqual(testCase, string(body.source), "sample");
verifyTrue(testCase, isfield(body.scenario, "satellites"));
verifyGreaterThanOrEqual(testCase, numel(body.scenario.satellites), 1);
end

function testSpecCanBeStoredAndFetched(testCase)
config = localConfig(testCase);
specJson = '{"version":1,"meta":{"name":"Static Test"},"objects":[]}';

putResponse = orbitStaticUiRequest( ...
    struct("Method", "PUT", "Path", "/api/spec", "Body", specJson), config);
verifyEqual(testCase, putResponse.Status, 200);

getResponse = orbitStaticUiRequest( ...
    struct("Method", "GET", "Path", "/api/spec", "Body", ""), config);
verifyEqual(testCase, getResponse.Status, 200);
body = jsondecode(native2unicode(getResponse.Body, "UTF-8"));
verifyEqual(testCase, string(body.spec.meta.name), "Static Test");
end

function testPathTraversalIsRejected(testCase)
response = orbitStaticUiRequest( ...
    struct("Method", "GET", "Path", "/../README.md", "Body", ""), ...
    localConfig(testCase));
verifyEqual(testCase, response.Status, 403);
end

function removeDirIfExists(pathName)
if isfolder(pathName)
    rmdir(pathName, "s");
end
end
