function exportAccessReport(accessResult, filename)
%EXPORTACCESSREPORT Export access windows to CSV.

writetable(accessResult.AccessWindows, filename);
end

