# Safe Links and URL Defense Cleaner for Edge

This Edge extension removes the link rewriting added by Microsoft Defender for Office 365 Advanced Threat Protection and Proofpoint Essentials URL Defense.

It is designed to work for Superhuman, Gmail, and (though somewhat buggy) Outlook. (See [manifest.json](./manifest.json).)

Links on the page are changed to the original link.

It currently works with Proofpoint Essentials URL Defense v1, v2, and partial support for v3.

## Installation instructions

Clone the repo and sideload the extension into Edge following [these instructions](https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/getting-started/extension-sideloading)

## Known issues

* Proofpoint Essentials URL Defense v3 regex is incomplete.
* It does not always work with Outlook.
* This does not handle nested use of both SafeLinks and URL Defense in the same link.

## Attribution

The original code is from David Byers and is available at <https://gitlab.liu.se/safelinks/safelinks-cleaner/>
