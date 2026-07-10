function text = formatStkUtc(time)
%FORMATSTKUTC Format a scalar datetime for documented STK text files.

if ~isdatetime(time) || ~isscalar(time) || isnat(time)
    error("formatStkUtc:InvalidTime", "Expected one valid datetime value.");
end
time.TimeZone = "UTC";
[yearValue, monthValue, dayValue] = ymd(time);
[hourValue, minuteValue, secondValue] = hms(time);
monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", ...
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
text = string(sprintf("%d %s %04d %02d:%02d:%012.9f", ...
    dayValue, monthNames(monthValue), yearValue, ...
    hourValue, minuteValue, secondValue));
end
