classdef OrekitTime
    %OREKITTIME Conversion helpers between MATLAB datetime and Orekit dates.

    methods (Static)
        function utc = utc()
            utc = javaMethod("getUTC", "org.orekit.time.TimeScalesFactory");
        end

        function date = toAbsoluteDate(time)
            time = OrekitTime.ensureUtc(time);
            if ~isscalar(time)
                error("OrekitTime:NonScalarTime", "Expected a scalar datetime.");
            end
            date = javaObject("org.orekit.time.AbsoluteDate", ...
                int32(year(time)), int32(month(time)), int32(day(time)), ...
                int32(hour(time)), int32(minute(time)), double(second(time)), ...
                OrekitTime.utc());
        end

        function times = ensureUtc(times)
            if ~isdatetime(times)
                error("OrekitTime:InvalidTime", "Expected MATLAB datetime values.");
            end
            times.TimeZone = "UTC";
        end
    end
end
