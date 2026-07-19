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

+(() => {
  const adventuresUrl = 'adventures.html';
  const image = (name, large, small) => ({
    src: `assets/optimized/adventures/${name}-640.${large}.webp`,
    srcset: `assets/optimized/adventures/${name}-360.${small}.webp 360w, assets/optimized/adventures/${name}-640.${large}.webp 640w`
  });
  const homeAdventures = [
    ['camping', 'Camping', image('camping', 'f8beed81', 'abc85275'), 'Pack 321 camping brings Scouts and their families together for outdoor adventures, shared meals, games, and time around camp.', 'Families can expect age-appropriate activities, opportunities to learn outdoor skills, and plenty of time to build friendships. Parents, siblings, and grandparents are encouraged to participate whenever the event allows.', ['Family-centered overnight experiences', 'Outdoor skills and exploration', 'Camp activities and shared meals', 'Memories made together']],
    ['fishing', 'Fishing', image('fishing', '3ea43d80', '9d49e4dd'), 'Fishing activities introduce Scouts to patience, conservation, outdoor responsibility, and the excitement of catching their first fish.', 'Events may include basic casting instruction, safe use of fishing equipment, local fishing opportunities, and guidance from experienced adults. Activities should remain welcoming for beginners.', ['Beginner-friendly instruction', 'Safety and equipment basics', 'Conservation and respect for nature', 'Time outdoors with family and friends']],
    ['pinewood-derby', 'Pinewood Derby', image('pinewood-derby', '135545b4', 'de0d4105'), 'The Pinewood Derby combines creativity, craftsmanship, friendly competition, and one of Cub Scoutingâ€™s most recognized traditions.', 'Scouts design and build their cars with help from an adult, then race them during a Pack event. The focus should remain on participation, sportsmanship, creativity, and having fun.', ['Design and building experience', 'Family participation', 'Race-day excitement', 'Sportsmanship and creativity']],
    ['raingutter-regatta', 'Raingutter Regatta', image('raingutter-regatta', 'a2d3d1b6', 'ba627008'), 'The Raingutter Regatta gives Scouts the opportunity to build and race small boats in a fun, hands-on competition.', 'Scouts prepare their boats before race day and participate in short races during the Pack event. The activity encourages creativity, preparation, and friendly competition.', ['Simple boat-building project', 'Fast-paced races', 'Family-friendly competition', 'Encouragement and good sportsmanship']],
    ['hiking', 'Hiking', image('hiking', '70833d18', '3d740c5b'), 'Pack 321 hikes help Scouts explore local trails, observe nature, stay active, and practice outdoor awareness.', 'Hikes are selected with Cub Scout ages and family participation in mind. Leaders provide event-specific guidance regarding clothing, water, trail conditions, and supplies.', ['Local outdoor exploration', 'Physical activity', 'Nature observation', 'Trail safety and preparation']],
    ['service', 'Service', image('service', 'd16e9200', 'eb5cbdfa'), 'Service projects help Scouts learn that small actions can make a meaningful difference in their community.', 'Projects may support schools, veterans, community organizations, local events, or families in need. Activities are selected to be age appropriate and meaningful for Scouts and their families.', ['Giving back to the community', 'Learning responsibility', 'Helping others', 'Building Pack pride']],
    ['blue-gold', 'Blue & Gold', image('blue-gold', 'e4046dc9', '69ebe23d'), 'The Blue & Gold celebration recognizes Cub Scouting, Pack achievements, volunteer contributions, and the friendships built throughout the year.', 'The event may include dinner, awards, recognitions, entertainment, ceremonies, and time for Pack families to celebrate together.', ['Pack-wide celebration', 'Awards and recognition', 'Family fellowship', 'Cub Scout traditions']],
    ['graduation', 'Graduation', image('graduation', 'c975276f', '6be58028'), 'Graduation celebrates Scouts advancing to their next rank and recognizes the work, growth, and adventures completed during the year.', 'The ceremony may include rank advancement, awards, leader recognition, family participation, and special recognition for Arrow of Light Scouts moving forward in Scouting.', ['Rank advancement', 'Scout recognition', 'Family celebration', 'Transition to the next adventure']]
  ].map(([id, title, photos, summary, expectation, highlights]) => ({ id, title, ...photos, summary, expectation, highlights, adventuresUrl }));

  class HomeAdventureCard {
    static render(adventure) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'adventure-card';
      card.dataset.adventureId = adventure.id;
      card.setAttribute('aria-haspopup', 'dialog');
      card.setAttribute('aria-label', `Learn more about Pack 321 ${adventure.title} adventures`);
      card.innerHTML = `<img class="adventure-photo" src="${adventure.src}" srcset="${adventure.srcset}" sizes="(max-width: 520px) calc(100vw - 28px), (max-width: 820px) calc((100vw - 46px) / 2), 170px" width="640" height="480" alt="" loading="lazy" decoding="async" data-fallback="assets/images/placeholders/card-placeholder.jpg"><span class="adventure-fallback"></span><span class="adventure-overlay"><span class="adventure-card-title">${adventure.title}</span><strong>Learn More <span aria-hidden="true">â†’</span></strong></span>`;
      return card;
    }
  }

  class HomeAdventureModal {
    constructor() {
      this.returnFocus = null;
      this.root = document.createElement('div');
      this.root.className = 'home-adventure-modal';
      this.root.hidden = true;
      this.root.innerHTML = `<div class="home-adventure-backdrop" data-modal-close></div><section class="home-adventure-dialog" role="dialog" aria-modal="true" aria-labelledby="home-adventure-title"><button class="home-adventure-x" type="button" aria-label="Close activity details" data-modal-close>Ã—</button><img class="home-adventure-hero" alt=""><div class="home-adventure-content"><h2 id="home-adventure-title"></h2><span class="home-adventure-rule"></span><p class="home-adventure-summary"></p><h3>What Families Can Expect</h3><p class="home-adventure-expectation"></p><ul class="home-adventure-highlights"></ul><div class="home-adventure-actions"><a class="button gold" href="${adventuresUrl}">Explore All Adventures</a><button class="home-adventure-close" type="button" data-modal-close>Close</button></div></div></section>`;
      document.body.append(this.root);
      this.dialog = this.root.querySelector('.home-adventure-dialog');
      this.root.addEventListener('click', (event) => { if (event.target.closest('[data-modal-close]')) this.close(); });
      document.addEventListener('keydown', (event) => this.onKeydown(event));
    }
    open(adventure, origin) {
      this.returnFocus = origin;
      const hero = this.root.querySelector('.home-adventure-hero');
      hero.src = adventure.src;
      hero.alt = `${adventure.title} with Pack 321`;
      this.root.querySelector('#home-adventure-title').textContent = adventure.title;
      this.root.querySelector('.home-adventure-summary').textContent = adventure.summary;
      this.root.querySelector('.home-adventure-expectation').textContent = adventure.expectation;
      this.root.querySelector('.home-adventure-highlights').innerHTML = adventure.highlights.map((item) => `<li>${item}</li>`).join('');
      this.root.hidden = false;
      document.body.classList.add('modal-open');
      this.dialog.scrollTop = 0;
      this.root.querySelector('.home-adventure-x').focus();
    }
    close() {
      if (this.root.hidden) return;
      this.root.hidden = true;
      document.body.classList.remove('modal-open');
      this.returnFocus?.focus();
    }
    onKeydown(event) {
      if (this.root.hidden) return;
      if (event.key === 'Escape') { event.preventDefault(); this.close(); return; }
      if (event.key !== 'Tab') return;
      const focusable = [...this.dialog.querySelectorAll('a[href], button:not([disabled])')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('[data-home-adventure-grid]');
    if (!grid) return;
    const modal = new HomeAdventureModal();
    grid.replaceChildren();
    homeAdventures.forEach((adventure) => {
      const card = HomeAdventureCard.render(adventure);
      card.addEventListener('click', () => modal.open(adventure, card));
      grid.append(card);
    });
  });
})();
