function linkResult = computeLinkBudget(accessResult, params)
%COMPUTELINKBUDGET RF link budget over an access result (STK Comms lite).
%
% linkResult = computeLinkBudget(accessResult, struct( ...
%     "FrequencyHz", 8.2e9, "TransmitPowerW", 5, "TransmitGainDb", 6, ...
%     "ReceiveGainDb", 42, "SystemNoiseTemperatureK", 220, ...
%     "DataRateBps", 50e6, "LossesDb", 3, "RequiredEbN0Db", 4.5))
%
% Uses the range history in accessResult (km). Values are computed at every
% time step; samples without access are reported but flagged. Summary gives
% the worst-case margin over access intervals.
%
% linkResult fields: Params, Table (per-step dB quantities), Summary.

arguments
    accessResult struct
    params struct
end

defaults = struct( ...
    "FrequencyHz", 2.2e9, ...
    "TransmitPowerW", 5, ...
    "TransmitGainDb", 0, ...
    "ReceiveGainDb", 30, ...
    "SystemNoiseTemperatureK", 290, ...
    "DataRateBps", 1e6, ...
    "LossesDb", 2, ...
    "RequiredEbN0Db", 9.6);
names = fieldnames(defaults);
for k = 1:numel(names)
    if ~isfield(params, names{k}) || isempty(params.(names{k}))
        params.(names{k}) = defaults.(names{k});
    end
end

boltzmannDbwPerHzK = -228.6;
c = 299792458.0;

rangeM = accessResult.Range * 1000.0;
fsplDb = 20 * log10(max(4 * pi * rangeM * params.FrequencyHz / c, 1));
eirpDbw = 10 * log10(params.TransmitPowerW) + params.TransmitGainDb;
receivedPowerDbw = eirpDbw - fsplDb - params.LossesDb + params.ReceiveGainDb;
noiseDensityDbwPerHz = boltzmannDbwPerHzK + ...
    10 * log10(params.SystemNoiseTemperatureK);
cn0DbHz = receivedPowerDbw - noiseDensityDbwPerHz;
ebN0Db = cn0DbHz - 10 * log10(params.DataRateBps);
marginDb = ebN0Db - params.RequiredEbN0Db;

linkResult = struct();
linkResult.Params = params;
linkResult.Table = table(accessResult.TimeVector, accessResult.AccessLogical, ...
    accessResult.Range, fsplDb, cn0DbHz, ebN0Db, marginDb, ...
    'VariableNames', {'Time', 'HasAccess', 'RangeKm', 'FSPLdB', ...
    'CN0dBHz', 'EbN0dB', 'MarginDb'});

summary = struct();
summary.SourceName = accessResult.SourceName;
summary.TargetName = accessResult.TargetName;
summary.EIRPdBW = eirpDbw;
if any(accessResult.AccessLogical)
    inAccess = accessResult.AccessLogical;
    summary.WorstMarginDb = min(marginDb(inAccess));
    summary.BestMarginDb = max(marginDb(inAccess));
    summary.LinkClosesPercent = 100.0 * sum(marginDb(inAccess) > 0) / sum(inAccess);
else
    summary.WorstMarginDb = NaN;
    summary.BestMarginDb = NaN;
    summary.LinkClosesPercent = NaN;
end
linkResult.Summary = summary;
end
