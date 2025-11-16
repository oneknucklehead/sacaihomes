class CartDrawer extends HTMLElement {
  constructor() {
    super();

    this.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());
    const overlay = this.querySelector('#CartDrawer-Overlay');
    if (overlay) overlay.addEventListener('click', this.close.bind(this));
    this.setHeaderCartIconAccessibility();
  }

  setHeaderCartIconAccessibility() {
    const cartLink = document.querySelector('#cart-icon-bubble');
    if (!cartLink) return;

    cartLink.setAttribute('role', 'button');
    cartLink.setAttribute('aria-haspopup', 'dialog');
    cartLink.addEventListener('click', (event) => {
      event.preventDefault();
      this.open(cartLink);
    });
    cartLink.addEventListener('keydown', (event) => {
      if (event.code.toUpperCase() === 'SPACE') {
        event.preventDefault();
        this.open(cartLink);
      }
    });
  }

  open(triggeredBy) {
    if (triggeredBy) this.setActiveElement(triggeredBy);
    const cartDrawerNote = this.querySelector('[id^="Details-"] summary');
    if (cartDrawerNote && !cartDrawerNote.hasAttribute('role')) this.setSummaryAccessibility(cartDrawerNote);
    // here the animation doesn't seem to always get triggered. A timeout seem to help
    setTimeout(() => {
      this.classList.add('animate', 'active');
    });

    this.addEventListener(
      'transitionend',
      () => {
        const containerToTrapFocusOn = this.classList.contains('is-empty')
          ? this.querySelector('.drawer__inner-empty')
          : document.getElementById('CartDrawer');
        const focusElement = this.querySelector('.drawer__inner') || this.querySelector('.drawer__close');
        trapFocus(containerToTrapFocusOn, focusElement);
      },
      { once: true }
    );

    document.body.classList.add('overflow-hidden');
  }

  close() {
    this.classList.remove('active');
    removeTrapFocus(this.activeElement);
    document.body.classList.remove('overflow-hidden');
  }

  setSummaryAccessibility(cartDrawerNote) {
    cartDrawerNote.setAttribute('role', 'button');
    cartDrawerNote.setAttribute('aria-expanded', 'false');

    if (cartDrawerNote.nextElementSibling && cartDrawerNote.nextElementSibling.getAttribute('id')) {
      cartDrawerNote.setAttribute('aria-controls', cartDrawerNote.nextElementSibling.id);
    }

    cartDrawerNote.addEventListener('click', (event) => {
      event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
    });

    cartDrawerNote.parentElement.addEventListener('keyup', onKeyUpEscape);
  }

  /**
   * parsedState shape expected:
   * {
   *   id: <some id>,
   *   sections: {
   *     "cart-drawer": "<html string>",
   *     "cart-icon-bubble": "<html string>"
   *   }
   * }
   */
  renderContents(parsedState) {
    try {
      // Defensive: ensure parsedState and sections exist
      if (!parsedState) {
        console.warn('cart-drawer.renderContents called without parsedState');
        return;
      }
      const sections = parsedState.sections || {};

      // Remove empty-state fragment if present (server will provide new HTML)
      const emptyStateEl = this.querySelector('.drawer__inner-empty');
      if (emptyStateEl) {
        emptyStateEl.remove();
      }

      // Ensure .drawer__inner doesn't keep stale is-empty class
      const inner = this.querySelector('.drawer__inner');
      if (inner && inner.classList.contains('is-empty')) {
        inner.classList.remove('is-empty');
      }

      this.productId = parsedState.id;

      // Render each section returned by server into the matching selector on the page.
      this.getSectionsToRender().forEach((section) => {
        try {
          const html = sections[section.id];
          if (!html) return;

          // Parse the returned HTML and find the requested selector within it
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const selector = section.selector || '.shopify-section';
          const fragment = doc.querySelector(selector);

          if (!fragment) {
            // nothing to put
            console.warn(`cart-drawer: section "${section.id}" did not contain selector "${selector}"`);
            return;
          }

          // Find the destination element in the current page DOM
          const sectionElement = section.selector
            ? document.querySelector(section.selector)
            : document.getElementById(section.id);
          if (!sectionElement) {
            console.warn(`cart-drawer: destination for section "${section.id}" not found (selector/id)`);
            return;
          }

          // Replace inner HTML safely
          sectionElement.innerHTML = fragment.innerHTML;
        } catch (errSection) {
          console.error('cart-drawer: error rendering section', section, errSection);
        }
      });

      // Rebind overlay click and open drawer after the DOM is updated
      setTimeout(() => {
        const overlay = this.querySelector('#CartDrawer-Overlay');
        if (overlay) {
          // remove previous listener if any, then add
          overlay.removeEventListener('click', this.close.bind(this));
          overlay.addEventListener('click', this.close.bind(this));
        }
        // If the server returned an "empty" cart markup, make sure drawer reflects it:
        const nowInner = this.querySelector('.drawer__inner');
        const nowEmpty = this.querySelector('.drawer__inner-empty');
        if (nowEmpty) {
          // ensure drawer knows it's empty
          if (nowInner && !nowInner.classList.contains('is-empty')) nowInner.classList.add('is-empty');
        } else {
          // ensure not marked empty
          if (nowInner && nowInner.classList.contains('is-empty')) nowInner.classList.remove('is-empty');
        }

        // Open — the open() method includes focus trap logic
        this.open();
      });
    } catch (err) {
      console.error('cart-drawer renderContents error', err);
    }
  }

  getSectionInnerHTML(html, selector = '.shopify-section') {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const el = doc.querySelector(selector);
    return el ? el.innerHTML : '';
  }

  getSectionsToRender() {
    return [
      {
        id: 'cart-drawer',
        selector: '#CartDrawer',
      },
      {
        id: 'cart-icon-bubble',
      },
    ];
  }

  getSectionDOM(html, selector = '.shopify-section') {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector);
  }

  setActiveElement(element) {
    this.activeElement = element;
  }
}

customElements.define('cart-drawer', CartDrawer);

class CartDrawerItems extends CartItems {
  getSectionsToRender() {
    return [
      {
        id: 'CartDrawer',
        section: 'cart-drawer',
        selector: '.drawer__inner',
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section',
      },
    ];
  }
}

customElements.define('cart-drawer-items', CartDrawerItems);
