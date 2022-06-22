# Safe Links and URL Defense Cleaner

This Edge extension removes the link rewriting added by Microsoft Defender for Office 365 Advanced Threat Protection and Proofpoint Essentials URL Defense.

It is designed to work on outlook.office.com, outlook.office365.com, outlook.office365.us, mail.superhuman.com, and mail.google.com. (See [manifest.json](./manifest.json).)

Links on the page are changed to the original link.

It currently works with Proofpoint Essentials URL Defense v1, v2, and partial support for v3.

## Installation instructions

Clone the repo and sideload the extention into Edge following [these instructions](https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/getting-started/extension-sideloading)


## Known issues

* This uses manifest v2 which will be going away come 2023!
* Proofpoint Essentials URL Defense v3 regex is incomplete.
* This does not handle nested use of both SafeLinks and URL Defense in the same link.

## Attribution

The original code is from David Byers and is available at <https://gitlab.liu.se/safelinks/safelinks-cleaner/>