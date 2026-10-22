import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const menuToggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const navigation = document.querySelector<HTMLElement>('[data-navigation]');
const heroVideo = document.querySelector<HTMLVideoElement>('.hero__video');
const storySection = document.querySelector<HTMLElement>('.story-section');
const storyImage = document.querySelector<HTMLImageElement>('.story-section__image');
const storyWash = document.querySelector<HTMLElement>('.story-section__wash');
const storyCopy = gsap.utils.toArray<HTMLElement>('[data-story-copy]');

if (prefersReducedMotion) heroVideo?.pause();

if (menuToggle && navigation) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    navigation.classList.toggle('is-open', !isOpen);
    document.body.classList.toggle('menu-open', !isOpen);
  });

  navigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      navigation.classList.remove('is-open');
      document.body.classList.remove('menu-open');
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') {
      menuToggle.setAttribute('aria-expanded', 'false');
      navigation.classList.remove('is-open');
      document.body.classList.remove('menu-open');
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

  gsap.to('.hero__video', {
    scale: 1.12,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 },
  });

  if (storySection && storyImage && storyWash) {
    const storyMotion = gsap.matchMedia();

    storyMotion.add('(min-width: 681px)', () => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: storySection,
          start: 'top top',
          end: () => `+=${Math.round(window.innerHeight * 1.65)}`,
          pin: true,
          pinSpacing: true,
          scrub: 1.15,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      timeline
        .fromTo(storyImage, { scale: 1.08, xPercent: -2, yPercent: 5 }, {
          scale: 1.34,
          xPercent: 7,
          yPercent: -11,
          ease: 'none',
        }, 0)
        .fromTo(storyWash, { '--story-drift': '-120px' }, {
          '--story-drift': '180px',
          ease: 'none',
        }, 0)
        .fromTo(storyCopy, { autoAlpha: 0, y: 48 }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.24,
          stagger: 0.13,
          ease: 'none',
        }, 0.06);

      return () => timeline.kill();
    });

    storyMotion.add('(max-width: 680px)', () => {
      gsap.fromTo(storyImage, { scale: 1.08, xPercent: -2, yPercent: 4 }, {
        scale: 1.24,
        xPercent: 5,
        yPercent: -7,
        ease: 'none',
        scrollTrigger: {
          trigger: storySection,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.9,
        },
      });

      gsap.fromTo(storyWash, { '--story-drift': '-80px' }, {
        '--story-drift': '100px',
        ease: 'none',
        scrollTrigger: {
          trigger: storySection,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.9,
        },
      });

      gsap.fromTo(storyCopy, { autoAlpha: 0, y: 24 }, {
        autoAlpha: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.12,
        scrollTrigger: {
          trigger: storySection,
          start: 'top 75%',
          once: true,
        },
      });
    });
  }
}
