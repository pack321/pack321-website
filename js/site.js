document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.getElementById('primary-nav') || document.querySelector('.nav-links');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  document.querySelectorAll('img[data-fallback]').forEach((image) => {
    image.addEventListener('error', () => {
      const fallback = image.getAttribute('data-fallback');
      if (fallback && image.getAttribute('src') !== fallback) {
        image.setAttribute('src', fallback);
      }
    });
  });
});

(() => {
  const adventuresUrl = 'adventures.html';
  const learnMoreLabel = 'Learn More →';

  const image = (name, large, small) => ({
    src: `assets/optimized/adventures/${name}-640.${large}.webp`,
    srcset: `assets/optimized/adventures/${name}-360.${small}.webp 360w, assets/optimized/adventures/${name}-640.${large}.webp 640w`,
  });

  const point = (x, y) => ({ x, y });
  const responsivePoint = (desktop, tablet, mobile) => ({ desktop, tablet, mobile });
  const focus = (card, modal) => ({ card, modal });

  const adventureData = [
    {
      id: 'camping',
      title: 'Camping',
      ...image('camping', 'f8beed81', 'abc85275'),
      summary: 'Camp under the stars, learn outdoor skills, and make lifelong memories.',
      description: 'Pack 321 camping brings Scouts and their families together for outdoor adventures, shared meals, games, and time around camp.',
      expectations: 'Families can expect age-appropriate activities, opportunities to learn outdoor skills, and plenty of time to build friendships. Parents, siblings, and grandparents are encouraged to participate whenever the event allows.',
      highlights: ['Family-centered overnight experiences', 'Outdoor skills and exploration', 'Camp activities and shared meals', 'Memories made together'],
      focalPoint: focus(
        responsivePoint(point('42%', '50%'), point('42%', '50%'), point('36%', '52%')),
        responsivePoint(point('42%', '50%'), point('42%', '50%'), point('35%', '52%')),
      ),
      adventuresPageUrl: adventuresUrl,
    },
    {
      id: 'fishing',
      title: 'Fishing',
      ...image('fishing', '3ea43d80', '9d49e4dd'),
      summary: 'Learn patience, conservation, and the excitement of catching your first fish.',
      description: 'Fishing activities introduce Scouts to patience, conservation, outdoor responsibility, and the excitement of catching their first fish.',
      expectations: 'Events may include basic casting instruction, safe use of fishing equipment, local fishing opportunities, and guidance from experienced adults. Activities are designed to be welcoming for beginners, with plenty of guidance and encouragement along the way.',
      highlights: ['Beginner-friendly instruction', 'Safety and equipment basics', 'Conservation and respect for nature', 'Time outdoors with family and friends'],
      focalPoint: focus(
        responsivePoint(point('34%', '46%'), point('32%', '46%'), point('30%', '44%')),
        responsivePoint(point('30%', '45%'), point('30%', '45%'), point('28%', '43%')),
      ),
      adventuresPageUrl: adventuresUrl,
    },
    {
      id: 'pinewood-derby',
      title: 'Pinewood Derby',
      ...image('pinewood-derby', '135545b4', 'de0d4105'),
      summary: 'Design it. Build it. Race it. Cheer each other on.',
      description: 'The Pinewood Derby combines creativity, craftsmanship, friendly competition, and one of Cub Scouting’s most recognized traditions.',
      expectations: 'Scouts design and build their cars with help from an adult, then race them during a Pack event. The focus should remain on participation, sportsmanship, creativity, and having fun.',
      highlights: ['Design and building experience', 'Family participation', 'Race-day excitement', 'Sportsmanship and creativity'],
      focalPoint: focus(
        responsivePoint(point('52%', '48%'), point('52%', '48%'), point('56%', '48%')),
        responsivePoint(point('52%', '45%'), point('52%', '45%'), point('56%', '46%')),
      ),
      adventuresPageUrl: adventuresUrl,
    },
    {
      id: 'raingutter-regatta',
      title: 'Raingutter Regatta',
      ...image('raingutter-regatta', 'a2d3d1b6', 'ba627008'),
      summary: 'Friendly competition and lots of laughs for every Scout.',
      description: 'The Raingutter Regatta gives Scouts the opportunity to build and race small boats in a fun, hands-on competition.',
      expectations: 'Scouts prepare their boats before race day and participate in short races during the Pack event. The activity encourages creativity, preparation, and friendly competition.',
      highlights: ['Simple boat-building project', 'Fast-paced races', 'Family-friendly competition', 'Encouragement and good sportsmanship'],
      focalPoint: focus(
        responsivePoint(point('54%', '38%'), point('54%', '38%'), point('54%', '34%')),
        responsivePoint(point('54%', '35%'), point('54%', '35%'), point('54%', '32%')),
      ),
      adventuresPageUrl: adventuresUrl,
    },
    {
      id: 'hiking',
      title: 'Hiking',
      ...image('hiking', '70833d18', '3d740c5b'),
      summary: 'Discover nature while building confidence and teamwork.',
      description: 'Pack 321 hikes help Scouts explore local trails, observe nature, stay active, and practice outdoor awareness.',
      expectations: 'Hikes are selected with Cub Scout ages and family participation in mind. Leaders provide event-specific guidance regarding clothing, water, trail conditions, and supplies.',
      highlights: ['Local outdoor exploration', 'Physical activity', 'Nature observation', 'Trail safety and preparation'],
      focalPoint: focus(
        responsivePoint(point('50%', '68%'), point('50%', '68%'), point('50%', '70%')),
        responsivePoint(point('50%', '66%'), point('50%', '66%'), point('50%', '68%')),
      ),
      adventuresPageUrl: adventuresUrl,
    },
    {
      id: 'service',
      title: 'Service',
      ...image('service', 'd16e9200', 'eb5cbdfa'),
      summary: 'We believe in giving back to our community.',
      description: 'Service projects help Scouts learn that small actions can make a meaningful difference in their community.',
      expectations: 'Projects may support schools, veterans, community organizations, local events, or families in need. Activities are selected to be age appropriate and meaningful for Scouts and their families.',
      highlights: ['Giving back to the community', 'Learning responsibility', 'Helping others', 'Building Pack pride'],
      focalPoint: focus(
        responsivePoint(point('58%', '48%'), point('58%', '48%'), point('58%', '48%')),
        responsivePoint(point('58%', '48%'), point('58%', '48%'), point('58%', '48%')),
      ),
      adventuresPageUrl: adventuresUrl,
    },
    {
      id: 'blue-gold',
      title: 'Blue & Gold',
      ...image('blue-gold', 'e4046dc9', '69ebe23d'),
      summary: 'Celebrate achievements and milestones with the entire Pack.',
      description: 'The Blue & Gold celebration recognizes Cub Scouting, Pack achievements, volunteer contributions, and the friendships built throughout the year.',
      expectations: 'The event may include dinner, awards, recognitions, entertainment, ceremonies, and time for Pack families to celebrate together.',
      highlights: ['Pack-wide celebration', 'Awards and recognition', 'Family fellowship', 'Cub Scout traditions'],
      focalPoint: focus(
        responsivePoint(point('55%', '48%'), point('55%', '48%'), point('56%', '48%')),
        responsivePoint(point('55%', '45%'), point('55%', '45%'), point('56%', '45%')),
      ),
      adventuresPageUrl: adventuresUrl,
    },
    {
      id: 'graduation',
      title: 'Graduation',
      ...image('graduation', 'c975276f', '6be58028'),
      summary: 'Every adventure leads to the next step in their journey.',
      description: 'Graduation celebrates Scouts advancing to their next rank and recognizes the work, growth, and adventures completed during the year.',
      expectations: 'The ceremony may include rank advancement, awards, leader recognition, family participation, and special recognition for Arrow of Light Scouts moving forward in Scouting.',
      highlights: ['Rank advancement', 'Scout recognition', 'Family celebration', 'Transition to the next adventure'],
      focalPoint: focus(
        responsivePoint(point('50%', '48%'), point('50%', '48%'), point('50%', '46%')),
        responsivePoint(point('50%', '44%'), point('50%', '44%'), point('50%', '43%')),
      ),
      adventuresPageUrl: adventuresUrl,
    },
  ];

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function applyFocalPoint(element, focalPoint) {
    element.style.setProperty('--focal-x', focalPoint.desktop.x);
    element.style.setProperty('--focal-y', focalPoint.desktop.y);
    element.style.setProperty('--focal-tablet-x', focalPoint.tablet.x);
    element.style.setProperty('--focal-tablet-y', focalPoint.tablet.y);
    element.style.setProperty('--focal-mobile-x', focalPoint.mobile.x);
    element.style.setProperty('--focal-mobile-y', focalPoint.mobile.y);
  }

  function renderAdventureCard(adventure) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'adventure-card';
    card.dataset.adventureId = adventure.id;
    card.setAttribute('aria-haspopup', 'dialog');
    card.setAttribute('aria-controls', 'adventure-detail-modal');
    card.setAttribute('aria-label', `Learn more about Pack 321 ${adventure.title} adventures`);
    applyFocalPoint(card, adventure.focalPoint.card);
    card.innerHTML = `
      <img class="adventure-photo" src="${adventure.src}" srcset="${adventure.srcset}" sizes="(max-width: 520px) calc(100vw - 28px), (max-width: 820px) calc((100vw - 46px) / 2), 170px" width="640" height="480" alt="" loading="lazy" decoding="async" data-fallback="assets/images/placeholders/card-placeholder.jpg">
      <span class="adventure-fallback"></span>
      <span class="adventure-overlay">
        <span class="adventure-card-title">${escapeHtml(adventure.title)}</span>
        <strong>${learnMoreLabel}</strong>
      </span>`;
    return card;
  }

  class AdventureModal {
    constructor() {
      this.returnFocus = null;
      this.root = document.createElement('div');
      this.root.className = 'home-adventure-modal';
      this.root.id = 'adventure-detail-modal';
      this.root.hidden = true;
      this.root.innerHTML = `
        <div class="home-adventure-backdrop" data-modal-backdrop></div>
        <section class="home-adventure-dialog" role="dialog" aria-modal="true" aria-labelledby="home-adventure-title">
          <button class="home-adventure-x" type="button" aria-label="Close activity details" data-modal-close>×</button>
          <img class="home-adventure-hero" alt="">
          <div class="home-adventure-content">
            <h2 id="home-adventure-title"></h2>
            <span class="home-adventure-rule"></span>
            <p class="home-adventure-summary"></p>
            <h3>What Families Can Expect</h3>
            <p class="home-adventure-expectation"></p>
            <ul class="home-adventure-highlights"></ul>
            <div class="home-adventure-actions"><a class="button gold" href="${adventuresUrl}">Explore All Adventures</a></div>
          </div>
        </section>`;
      document.body.append(this.root);
      this.dialog = this.root.querySelector('.home-adventure-dialog');
      this.hero = this.root.querySelector('.home-adventure-hero');
      this.closeButton = this.root.querySelector('.home-adventure-x');
      this.root.addEventListener('click', (event) => {
        if (event.target.matches('[data-modal-backdrop]') || event.target.closest('[data-modal-close]')) this.close();
      });
      document.addEventListener('keydown', (event) => this.onKeydown(event));
    }

    open(adventure, origin) {
      this.returnFocus = origin;
      this.hero.src = adventure.src;
      this.hero.srcset = adventure.srcset;
      this.hero.sizes = '(max-width: 560px) calc(100vw - 20px), 790px';
      this.hero.alt = `${adventure.title} with Pack 321`;
      applyFocalPoint(this.hero, adventure.focalPoint.modal);
      this.root.querySelector('#home-adventure-title').textContent = adventure.title;
      this.root.querySelector('.home-adventure-summary').textContent = adventure.description;
      this.root.querySelector('.home-adventure-expectation').textContent = adventure.expectations;
      this.root.querySelector('.home-adventure-highlights').innerHTML = adventure.highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
      this.root.hidden = false;
      document.body.classList.add('modal-open');
      this.dialog.scrollTop = 0;
      this.closeButton.focus();
    }

    close() {
      if (this.root.hidden) return;
      this.root.hidden = true;
      document.body.classList.remove('modal-open');
      this.returnFocus?.focus();
    }

    onKeydown(event) {
      if (this.root.hidden) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        this.close();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = [...this.dialog.querySelectorAll('a[href], button:not([disabled])')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const grids = document.querySelectorAll('[data-home-adventure-grid], [data-adventure-card-grid]');
    if (!grids.length) return;
    const modal = new AdventureModal();
    grids.forEach((grid) => {
      grid.replaceChildren();
      adventureData.forEach((adventure) => {
        const card = renderAdventureCard(adventure);
        card.addEventListener('click', () => modal.open(adventure, card));
        card.addEventListener('keydown', (event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          modal.open(adventure, card);
        });
        grid.append(card);
      });
    });
  });
})();
