import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { initRollingList } from './rolling-list';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const menuToggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const navigation = document.querySelector<HTMLElement>('[data-navigation]');
const menuClose = document.querySelector<HTMLButtonElement>('[data-menu-close]');
const header = document.querySelector<HTMLElement>('[data-header]');
const heroVideo = document.querySelector<HTMLVideoElement>('.hero__video');
const filmVideo = document.querySelector<HTMLVideoElement>('.film-section__video');
const homeScene = document.querySelector<HTMLElement>('[data-home-scene]');
const hero = document.querySelector<HTMLElement>('.hero');
const heroScroll = document.querySelector<HTMLAnchorElement>('[data-scroll-story]');
const storySection = document.querySelector<HTMLElement>('.story-section');
const storyImage = document.querySelector<HTMLImageElement>('.story-section__image');
const lenis = prefersReducedMotion ? null : new Lenis({
  anchors: { duration: 1.6 },
  lerp: 0.055,
  smoothWheel: true,
  syncTouch: true,
  syncTouchLerp: 0.065,
  touchMultiplier: 1,
  wheelMultiplier: 0.75,
});

let previousScroll = window.scrollY;
let headerDirectionTravel = 0;

if (header && previousScroll > 32) {
  header.classList.add('is-hidden', 'is-scrolled');
}

const updateHeader = (scroll: number) => {
  const delta = scroll - previousScroll;
  previousScroll = scroll;

  if (!header || document.body.classList.contains('menu-open')) return;

  if (scroll <= 32) {
    header.classList.remove('is-hidden', 'is-scrolled');
    headerDirectionTravel = 0;
    return;
  }

  if (delta === 0) return;

  headerDirectionTravel = Math.sign(delta) === Math.sign(headerDirectionTravel)
    ? headerDirectionTravel + delta
    : delta;

  if (headerDirectionTravel > 8) {
    header.classList.add('is-hidden', 'is-scrolled');
    headerDirectionTravel = 0;
  } else if (headerDirectionTravel < -8) {
    header.classList.remove('is-hidden');
    header.classList.add('is-scrolled');
    headerDirectionTravel = 0;
  }
};

if (lenis) {
  lenis.on('scroll', ({ scroll }) => {
    ScrollTrigger.update();
    updateHeader(scroll);
  });
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
} else {
  window.addEventListener('scroll', () => updateHeader(window.scrollY), { passive: true });
}

if (prefersReducedMotion) {
  heroVideo?.pause();
  filmVideo?.pause();
}

if (menuToggle && navigation) {
  const menuList = navigation.querySelector<HTMLElement>('[data-menu-roll-list]');
  if (menuList) initRollingList(menuList, { reducedMotion: prefersReducedMotion });

  const setMenuOpen = (isOpen: boolean) => {
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    navigation.setAttribute('aria-hidden', String(!isOpen));
    navigation.inert = !isOpen;
    navigation.classList.toggle('is-open', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
    previousScroll = lenis?.scroll ?? window.scrollY;
    headerDirectionTravel = 0;

    if (isOpen) {
      header?.classList.remove('is-hidden');
      header?.classList.toggle('is-scrolled', previousScroll > 32);
      lenis?.stop();
      menuClose?.focus({ preventScroll: true });
    } else {
      lenis?.start();
      requestAnimationFrame(() => {
        lenis?.resize();
        ScrollTrigger.refresh();
      });
    }
  };

  menuToggle.addEventListener('click', () => {
    setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  menuClose?.addEventListener('click', () => {
    setMenuOpen(false);
    menuToggle.focus({ preventScroll: true });
  });

  navigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      setMenuOpen(false);
    });
  });

  document.querySelector<HTMLAnchorElement>('.booking-pill')?.addEventListener('click', () => {
    if (menuToggle.getAttribute('aria-expanded') === 'true') setMenuOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });
}

if (!prefersReducedMotion) {
  const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
  heroTimeline
    .from('.hero__video', { scale: 1.08, duration: 1.8, ease: 'power2.out' })
    .from('.hero__eyebrow', { y: 18, opacity: 0, duration: 0.65 }, '-=0.95')
    .from('[data-hero-title]', { y: 22, opacity: 0, duration: 0.9 }, '-=0.45')
    .from('.hero__scroll', { y: 12, opacity: 0, duration: 0.6 }, '-=0.3');

  document.querySelectorAll('[data-reveal]').forEach((element) => {
    gsap.fromTo(element, { y: 28, opacity: 0 }, {
      y: 0,
      opacity: 1,
      duration: 0.85,
      ease: 'power2.out',
      scrollTrigger: { trigger: element, start: 'top 88%', once: true },
    });
  });

  if (homeScene && hero && storySection && storyImage) {
    const storyMotion = gsap.matchMedia();

    storyMotion.add('(min-width: 681px)', () => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          id: 'home-scene-reveal',
          trigger: homeScene,
          start: 'top top',
          end: () => `+=${Math.round(window.innerHeight * 3)}`,
          pin: true,
          pinSpacing: true,
          scrub: 0.65,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      timeline
        .to(hero, {
          clipPath: 'inset(0% 0% 100% 0%)',
          duration: 1,
          ease: 'none',
        }, 0)
        .fromTo(storyImage, { yPercent: 20, scale: 1 }, {
          yPercent: -20,
          scale: 1,
          duration: 2,
          ease: 'none',
        }, 1);

      if (heroScroll) {
        const onScrollToStory = (event: MouseEvent) => {
          const trigger = ScrollTrigger.getById('home-scene-reveal');
          if (!trigger) return;
          event.preventDefault();
          lenis?.scrollTo(trigger.start + window.innerHeight * 0.98, { duration: 1.6 });
        };
        heroScroll.addEventListener('click', onScrollToStory);
        return () => {
          heroScroll.removeEventListener('click', onScrollToStory);
          timeline.kill();
        };
      }

      return () => timeline.kill();
    });

    storyMotion.add('(max-width: 680px)', () => {
      const imageParallax = gsap.fromTo(storyImage, { yPercent: 14, scale: 1 }, {
        yPercent: -14,
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: storySection,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });

      return () => imageParallax.scrollTrigger?.kill();
    });

  }
}
