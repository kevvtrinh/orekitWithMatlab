# Country boundaries

`countries.json` contains 242 country and territory boundaries from Natural Earth
Admin 0 Countries, 1:50m, version 5.1.1. Islands and interior polygon holes are
preserved. Names and boundaries follow this dataset's conventions.

- [Dataset](https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-admin-0-countries-2/)
- [Source shapefile archive](https://naturalearth.s3.amazonaws.com/50m_cultural/ne_50m_admin_0_countries.zip)
- [Public-domain terms](https://www.naturalearthdata.com/about/terms-of-use/)

To regenerate from the checked-in archive in `data/geography`, run from the
repository root in MATLAB with Mapping Toolbox:

```matlab
addpath('scripts');
buildCountryCatalog;
```

The picker uses the prebuilt JSON; normal use does not require Mapping Toolbox.
Grid spacing controls analysis sample density, not the displayed boundary.
Sampling represents small islands with at least one point and is not an
area-weighted quadrature rule. Boundaries are cartographic approximations.
