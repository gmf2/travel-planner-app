# Curated catalog regression tests

Set `PLAYWRIGHT_MODULE` to an installed Playwright module if it is not on the default path. Chrome must be available at `/usr/bin/google-chrome`. Run `node tests/curated-state-regression.cjs` and `node tests/curated-ui-matrix.cjs`.

The tests intercept local assets and never deploy. The UI matrix checks exact search resolution for 38 EU and 5 Polish destinations at widths 320, 390, 768, 1280 and 1440. All 38 EU catalogs are checked for 1/2/3 days in all four seasons, with nonempty plans, horizontal overflow and JavaScript errors checked. State regression covers day replacement, custom order/removal on other days, reload, multiple cities, food saves, legacy migration and seasonal excursion warnings. These tests do not prove ticket availability, current future opening, accessibility or pixel layout. Manual screenshots cover those visual checks.
