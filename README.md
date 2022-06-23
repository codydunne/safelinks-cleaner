# Safe Links and URL Defense Cleaner for Superhuman & Edge

This Edge extension for use with SuperHuman removes the link rewriting added by Microsoft Defender for Office 365 Advanced Threat Protection and Proofpoint Essentials URL Defense.

Links on the page are changed to the original link.

It currently works with Proofpoint Essentials URL Defense v1, v2, and partial support for v3.

## Installation instructions

Clone the repo and sideload the extension into Edge following [these instructions](https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/getting-started/extension-sideloading)

## Known issues

* This is a janky proof-of-concept extension!
* Proofpoint Essentials URL Defense v3 regex is incomplete.
* It generally would work with Outlook and Gmail, but the message compose field needs to be treated differently (just like the SuperHuman compose fields). This wouldn't be hard to do. If you want to try it, just add the sites you want it to work on in [manifest.json](./manifest.json). E.g.,

    ```js
    "matches": [
        "*://outlook.office.com/*",
        "*://outlook.office365.com/*",
        "*://outlook.office365.us/*",
        "*://mail.superhuman.com/*",
        "*://mail.google.com/*"
    ],
    ```

* If you copy and paste a SafeLink or URL Defense link into a compose window, it will not be cleaned. Continuously cleaning the compose window creates UI issues with text selection and cursor movement.
* This does not handle nested use of both SafeLinks and URL Defense in the same link.

## Attribution

The original code is from David Byers and is available at <https://gitlab.liu.se/safelinks/safelinks-cleaner/>
