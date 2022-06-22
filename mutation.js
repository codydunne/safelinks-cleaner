// Safe Links Cleaner
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

// Mutation observer for web browsers

let mutationObserver = null

/**
 * Handle mutation events. Attempts to detect a composition pane and
 * remove nasty links from it.
 */
function mutationHandler(mutationsList, observer) {
  removeAllTheLinks(document.body, true)
}

/**
 * Enable the mutation observer, creating it is necessary.
 */
function enableMutationObserver() {
  if (!mutationObserver) {
    mutationObserver = new MutationObserver(
      withoutMutationObserver(mutationHandler),
    )
  }
  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
  })
}

/**
 * Disable the mutation observer if it is enabled
 */
function disableMutationObserver() {
  if (mutationObserver) {
    mutationObserver.disconnect()
  }
}

/**
 * Wrap a function in code that disables the mutation observer.
 *
 * @param {function} func - The function to wrap.
 * @returns {function} The wrapped function.
 */
function withoutMutationObserver(func) {
  return (...args) => {
    try {
      disableMutationObserver()
      func(...args)
    } finally {
      enableMutationObserver()
    }
  }
}
