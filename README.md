# POS Community IoT

`pos_community_iot` is a free Odoo Community addon developed by JDA SOLUTIONS.
It routes Point of Sale receipts, manual reprints, folios and preparation
changes to devices managed by `community_iot_box`, while keeping the standard
POS printer as a controlled fallback.

## Repository layout

- `pos_community_iot/`

## Compatibility and requirements

- Odoo 17, 18 or 19 Community, using the matching branch.
- The matching `community_iot_box` branch and release:
  - Odoo 17: `17.0.5.0.0` — https://apps.odoo.com/apps/modules/17.0/community_iot_box
  - Odoo 18: `18.0.2.0.0` — https://apps.odoo.com/apps/modules/18.0/community_iot_box
  - Odoo 19: `19.0.2.0.0` — https://apps.odoo.com/apps/modules/19.0/community_iot_box
- Community IoT Agent deployed separately.

## Features

- assign a Community IoT Box to a POS configuration
- choose a default receipt printer device
- choose Community IoT devices for preparation printers
- create bounded, validated Community IoT jobs from POS receipt and
  preparation flows
- automatic receipts after payment, manual printing and reprinting
- folio output and configurable copies from 1 to 10
- new, changed and cancelled preparation tickets
- controlled fallback to the standard POS printer when IoT printing is
  unavailable

## Installation

1. Copy `pos_community_iot` into your Odoo custom addons path.
2. Update the apps list.
3. Install `POS Community IoT` from the branch matching your Odoo version.
4. Configure a POS with:
   - Community IoT enabled
   - IoT Box
   - receipt printer device
5. Open a new POS session and test printing.

Administrative PDF reports are handled by the separate
`community_iot_printing` addon. The core queue also remains compatible with
ticket, ZPL and cash-drawer jobs.

## License

LGPL-3
