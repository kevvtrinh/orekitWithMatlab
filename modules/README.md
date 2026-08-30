# Modules

Each child directory is an independently installable MATLAB module with explicit
dependencies. Modules share the `scenario` namespace but may not access another
module's internals. See `docs/ARCHITECTURE.md` for the module contract.
