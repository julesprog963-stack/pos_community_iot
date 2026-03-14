# POS Community IoT

`pos_community_iot` is an Odoo 17 Community addon developed by JDA Solutions.

It extends Point of Sale so POS receipt and preparation print flows can be routed to devices managed by `community_iot_box`.

## Repository layout

- `pos_community_iot/`

## Requirements

- Odoo 17 Community
- `community_iot_box`
- external Community IoT Agent deployed separately

## Features

- assign a Community IoT Box to a POS configuration
- choose a default receipt printer device
- choose Community IoT devices for preparation printers
- create Community IoT jobs from POS receipt and preparation flows

## Installation

1. Copy `pos_community_iot` into your Odoo custom addons path.
2. Update the apps list.
3. Install `POS Community IoT`.
4. Configure a POS with:
   - Community IoT enabled
   - IoT Box
   - receipt printer device
5. Open a new POS session and test printing.

## License

LGPL-3
