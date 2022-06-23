// Safe Links and URL Defense Cleaner for SuperHuman
// Copyright 2021 David Byers <david.byers@liu.se>, 2022 Cody Dunne <c.dunne@northeastern.edu>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// Shared code

/**
 * Regexp that matches safe links and URL Defense links. The original URL must be collected
 * in match group 1. The `<` prefix is to catch plain text urls
 */
const safelinksRegexp = new RegExp(
  '<?https?://[^.]+[.]safelinks[.]protection[.]outlook[.]com/[?]url=([^&]+)&.*',
  'gi'
);

const urlDefenseV1Regexp = new RegExp(
  '<?https?://urldefense.proofpoint.com/v1//url\\?u=(.+?)&k=.*',
  'gi'
);

const urlDefenseV2Regexp = new RegExp(
  '<?https?://urldefense.proofpoint.com/v2/url\\?u=(.+?)&[dc]=.*',
  'gi'
);

const urlDefenseV3Regexp = new RegExp(
  '<?https?://urldefense.com/v3/__(.+?)__;.*',
  'gi'
);

/**
 * Return the original URL for a safe link.
 * Note: This is not clever enough to get through multiple nestings of links. E.g., SafeLinks→URL Defense→SafeLinks
 * Urls you can use for testing:
 * Ex from https://help.proofpoint.com/Threat_Insight_Dashboard/API_Documentation/URL_Decoder_API and personal experience
let urls = [
  {
    encodedUrl: 'https://urldefense.proofpoint.com/v2/url?u=https-3A__media.mnn.com_assets_images_2016_06_jupiter-2Dnasa.jpg.638x0-5Fq80-5Fcrop-2Dsmart.jpg&amp;d=DwMBaQ&amp;c=Vxt5e0Osvvt2gflwSlsJ5DmPGcPvTRKLJyp031rXjhg&amp;r=BTD8MPjq1qSLi0tGKaB5H6aCJZZBjwYkLyorZdRQrnY&amp;m=iKjixvaJuqvmReS78AB0JiActTrR_liSq7lDRjEQ9DE&amp;s=-M8Vz-GV-kqkNVf1BAtv38DdudAHVDAI6_jQQLVmleE&amp;e=',
    decodedUrl: 'https://media.mnn.com/assets/images/2016/06/jupiter-nasa.jpg.638x0_q80_crop-smart.jpg',
  },
  {
    encodedUrl: 'https://urldefense.proofpoint.com/v1/url?u=http://www.bouncycastle.org/&amp;k=oIvRg1%2BdGAgOoM1BIlLLqw%3D%3D%0A&amp;r=IKM5u8%2B%2F%2Fi8EBhWOS%2BqGbTqCC%2BrMqWI%2FVfEAEsQO%2F0Y%3D%0A&amp;m=Ww6iaHO73mDQpPQwOwfLfN8WMapqHyvtu8jM8SjqmVQ%3D%0A&amp;s=d3583cfa53dade97025bc6274c6c8951dc29fe0f38830cf8e5a447723b9f1c9a',
    decodedUrl: 'http://www.bouncycastle.org/',
  },
  {
    encodedUrl: 'https://urldefense.com/v3/__https://google.com:443/search?q=a*test&gs=ps__;Kw!-612Flbf0JvQ3kNJkRi5Jg!Ue6tQudNKaShHg93trcdjqDP8se2ySE65jyCIe2K1D_uNjZ1Lnf6YLQERujngZv9UWf66ujQIQ$',
    decodedUrl: 'https://google.com:443/search?q=a+test&gs=ps',
  },
  {
    encodedURL: 'https://nam12.safelinks.protection.outlook.com/?url=https%3A%2F%2Furldefense.com%2Fv3%2F__http%3A%2F%2Fsites.computer.org%2Fdebull%2Fbull_issues.html__%3B!!OToaGQ!7W9jIklmmV17ZZ9Go5i6foqOOILxtAEH5DD2aBvA2_ghSzJbPIROMONSwOafiqU46w%24&amp;data=05%7C01%7Cw.gatterbauer%40northeastern.edu%7C0f5ccf5e9b494cf4cae408da4244436d%7Ca8eec281aaa34daeac9b9a398b9215e7%7C0%7C0%7C637895158224049425%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C3000%7C%7C%7C&amp;sdata=o6rA5%2BdG5RRCZ%2BqO1zLqsv73Rp%2FqBtOeP3C1fSU3d5Q%3D&amp;reserved=0',
    decodedURL: 'http://sites.computer.org/debull/bull_issues.html'
  },
  {
    encodedURL: 'https://urldefense.com/v3/__https://nam12.safelinks.protection.outlook.com/?url=https*3A*2F*2Furldefense.com*2Fv3*2F__http*3A*2F*2Fsites.computer.org*2Fdebull*2Fbull_issues.html__*3B!!OToaGQ!7W9jIklmmV17ZZ9Go5i6foqOOILxtAEH5DD2aBvA2_ghSzJbPIROMONSwOafiqU46w*24&amp;data=05*7C01*7Cw.gatterbauer*40northeastern.edu*7C0f5ccf5e9b494cf4cae408da4244436d*7Ca8eec281aaa34daeac9b9a398b9215e7*7C0*7C0*7C637895158224049425*7CUnknown*7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0*3D*7C3000*7C*7C*7C&amp;sdata=o6rA5*2BdG5RRCZ*2BqO1zLqsv73Rp*2FqBtOeP3C1fSU3d5Q*3D&amp;reserved=0__;JSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJQ!!OToaGQ!uk5Vyc6J1ziQ4esI7N0LXbMUM2jETogr40DKAR5fr_mZ_IAjCwxAvul4GZ_dhVNx99Pqkx4mpUAymQqBqEHh_AM$',
    decodedURL: 'http://sites.computer.org/debull/bull_issues.html'
  }
]
 * 
 * @param {string} link - The safe link.
 * @returns {string} The original link or the safe link if there was an error.
 */
function untangleLink(link) {
  let ret;
  if (safelinksRegexp.test(link)) {
    ret = link.replaceAll(safelinksRegexp, (match, url) => {
      try {
        return decodeURIComponent(url);
      } catch (e) {
        console.log(e);
        return url;
      }
    });
  } else if (urlDefenseV1Regexp.test(link)) {
    ret = link.replaceAll(urlDefenseV1Regexp, (match, url) => {
      try {
        return decodeURIComponent(url);
      } catch (e) {
        console.log(e);
        return url;
      }
    });
  } else if (urlDefenseV2Regexp.test(link)) {
    ret = link.replaceAll(urlDefenseV2Regexp, (match, url) => {
      try {
        let urlEncodedUrl = url.replace(/-/g, '%');
        let htmlEncodedUrl = urlEncodedUrl.replace(/_/g, '/');
        return decodeURIComponent(htmlEncodedUrl);
      } catch (e) {
        console.log(e);
        return url;
      }
    });
  } else if (urlDefenseV3Regexp.test(link)) {
    // Version 3. Not tested!
    ret = link.replaceAll(urlDefenseV3Regexp, (match, url) => {
      try {
        let urlEncodedUrl = url.replace(/-/g, '%');
        let htmlEncodedUrl = urlEncodedUrl.replace(/_/g, '/');
        return decodeURIComponent(htmlEncodedUrl);
      } catch (e) {
        console.log(e);
        return url;
      }
    });
  } else {
    ret = link;
  }

  return ret;
}

/**
 * Check if a link is a safe link.
 * @param {string} link - The URL to check.
 * @returns {boolean} Returns true if the link is a safe link.
 */
function isTangledLink(link) {
  return (
    link.match(safelinksRegexp) ||
    link.match(urlDefenseV1Regexp) ||
    link.match(urlDefenseV2Regexp) ||
    link.match(urlDefenseV3Regexp)
  );
}

/**
 * Remove all safe links in an element
 * @param {Element} root - DOM element in which to fix links.
 */
function removeAllTheLinks(root) {
  for (const link of getAllLinks(root)) {
    if (isTangledLink(link.href)) {
      link.href = untangleLink(link.href);
    }
  }
  for (const textNode of getTextNodes(root)) {
    textNode.textContent = untangleLink(textNode.textContent);
  }
}

/**
 * Return the link nodes under a DOM element.
 * @param {Element} elem - The element to return link nodes for.
 * @returns {Element[]} The link elements under elem.
 */
function getAllLinks(elem) {
  var result = [];
  // Don't mess with SuperHuman compose editors to avoid text selection & cursor movement bugs
  if (
    elem
    // !(elem.classList && elem.classList.contains("ComposeFormEditor"))
  ) {
    // Recurse through, adding <a> nodes to the result
    for (var nodes = elem.childNodes, i = nodes.length; i--; ) {
      let node = nodes[i];
      let nodeType = node.nodeType;

      if (node.tagName == 'A') {
        // Don't mess with SuperHuman compose editors user-editable portion to avoid text selection & cursor movement bugs
        if (isntSuperHumanUnquotedComposeField(node)) {
          result.push(node);
        }
      } else if (
        nodeType == Node.ELEMENT_NODE ||
        nodeType == Node.DOCUMENT_NODE ||
        nodeType == Node.DOCUMENT_FRAGMENT_NODE
      ) {
        result = result.concat(getAllLinks(node));
      }
    }

    // Also search through included shadow roots, like Superhuman uses for each email
    if (elem.shadowRoot) {
      let node = elem.shadowRoot;
      result = result.concat(getAllLinks(node));
    }
  }
  return result;
}

/**
 * Return the text nodes under a DOM element.
 * @param {Element} elem - The element to return text nodes for.
 * @returns {Element[]} The text elements under elem.
 */
function getTextNodes(elem) {
  var result = [];
  if (elem) {
    // Remove <wbr> tags separating text nodes inside <a> tags. Superhuman inserts
    // these for links and it makes it hard to find and rewrite them.
    if (
      elem.tagName == 'A' &&
      elem.hasChildNodes &&
      isntSuperHumanUnquotedComposeField(elem) // Don't mess with SuperHuman compose editors user-editable portion to avoid text selection & cursor movement bugs
    ) {
      // Remove the <wbr> tags
      let wbrs = Array.from(elem.getElementsByTagName('wbr'));
      if (wbrs.length > 0) {
        wbrs.forEach((aWBR) => aWBR.remove());

        // Combine adjacent <text> tags and remove blank ones
        elem.normalize();
      }
    }

    // Recurse through, adding <text> nodes to the result
    for (let nodes = elem.childNodes, i = nodes.length; i--; ) {
      let node = nodes[i];
      let nodeType = node.nodeType;
      if (nodeType == Node.TEXT_NODE) {
        // Don't mess with SuperHuman compose editors user-editable portion to avoid text selection & cursor movement bugs
        if (isntSuperHumanUnquotedComposeField(node)) {
          result.push(node);
        }
      } else if (
        nodeType == Node.ELEMENT_NODE ||
        nodeType == Node.DOCUMENT_NODE ||
        nodeType == Node.DOCUMENT_FRAGMENT_NODE
      ) {
        result = result.concat(getTextNodes(node));
      }
    }

    // Also search through included shadow roots, like Superhuman uses for each email
    if (elem.shadowRoot) {
      let node = elem.shadowRoot;
      result = result.concat(getTextNodes(node));
    }
  }
  return result;
}

/**
 * Determines whether we should affect this part of the SuperHuman compose field. If we affect the
 * user-editable part, it creates interaction issues with using arrow keys to select text,
 * double-click on text. Specifically,to see whether a parent with class `sh-quoted-content` is closer
 * than a parent with class `sh-unquoted-content`.
 * @param {Element} elem - The element to look at the parents of.
 */
function isntSuperHumanUnquotedComposeField(elem) {
  const superHumanContentSelector = '.sh-quoted-content, .sh-unquoted-content';
  let parent =
    elem.parentElement && elem.parentElement.closest(superHumanContentSelector);
  if (!parent) {
    // neither class is in the hierarchy above this
    return true;
  } else {
    while (parent) {
      if (parent.classList.contains('sh-quoted-content')) {
        return true;
      } else if (parent.classList.contains('sh-unquoted-content')) {
        return false;
      }
      parent =
        parent.parentElement &&
        parent.parentElement.closest(superHumanContentSelector);
    }

    throw (
      'Illegal state exception! If we got here one of the parents should have been classed sh-quoted-content or sh-unquoted-content. Element: ' +
      elem
    );
  }
}
