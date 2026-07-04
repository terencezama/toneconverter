"use client";

import gsap from "gsap";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

const HEADLINE_LINE_1 = ["Your", "words", "have", "a"];
const HEADLINE_ACCENT = "feeling.";
const HEADLINE_LINE_2 = ["We", "can", "see", "it."];

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function HeroSection({ children }: { children: ReactNode }) {
  const heroRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLParagraphElement>(null);
  const wordsRef = useRef<HTMLSpanElement[]>([]);
  const accentRef = useRef<HTMLSpanElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const sub2Ref = useRef<HTMLParagraphElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const hoverRef = useRef(false);

  useEffect(() => {
    const hero = heroRef.current;
    const badge = badgeRef.current;
    const accent = accentRef.current;
    const sub = subRef.current;
    const sub2 = sub2Ref.current;
    const tagline = taglineRef.current;
    const words = wordsRef.current.filter(Boolean);

    if (!hero || !badge) return;

    if (prefersReducedMotion()) {
      gsap.set([badge, ...words, accent, sub, sub2, tagline], { opacity: 1, y: 0 });
      return;
    }

    gsap.set(words, { yPercent: 110, opacity: 0, rotateX: -28 });
    gsap.set(accent, { yPercent: 120, opacity: 0, scale: 0.88 });
    gsap.set([badge, sub, sub2, tagline], { opacity: 0, y: 24 });

    const line1Words = words.slice(0, HEADLINE_LINE_1.length);
    const line2Words = words.slice(HEADLINE_LINE_1.length);

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.to(badge, { opacity: 1, y: 0, duration: 0.9 })
      .to(
        line1Words,
        {
          yPercent: 0,
          opacity: 1,
          rotateX: 0,
          duration: 1.05,
          stagger: 0.055,
          ease: "power4.out",
        },
        "-=0.55"
      )
      .to(
        accent,
        {
          yPercent: 0,
          opacity: 1,
          scale: 1,
          duration: 1.1,
          ease: "elastic.out(1, 0.65)",
        },
        "-=0.55"
      )
      .to(
        line2Words,
        {
          yPercent: 0,
          opacity: 1,
          rotateX: 0,
          duration: 0.95,
          stagger: 0.05,
          ease: "power4.out",
        },
        "-=0.7"
      )
      .to(sub, { opacity: 1, y: 0, duration: 0.85 }, "-=0.5")
      .to(sub2, { opacity: 1, y: 0, duration: 0.75 }, "-=0.6")
      .to(tagline, { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" }, "-=0.45");

    return () => {
      tl.kill();
    };
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const getFillEls = () =>
      Array.from(hero.querySelectorAll<HTMLElement>(".hero-text-fill"));

    const rippleText = (mx: number, my: number) => {
      const rect = hero.getBoundingClientRect();
      for (const el of getFillEls()) {
        const er = el.getBoundingClientRect();
        const ex = ((er.left + er.width * 0.5 - rect.left) / rect.width) * 100;
        const ey = ((er.top + er.height * 0.5 - rect.top) / rect.height) * 100;
        const rippleX = (mx - ex) * 2.2;
        const rippleY = (my - ey) * 0.6;
        gsap.to(el, {
          backgroundPosition: `${mx + rippleX}% ${my + rippleY}%`,
          duration: 0.42,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    };

    const resetText = () => {
      gsap.to(getFillEls(), {
        backgroundPosition: "50% 50%",
        duration: 1,
        ease: "power2.inOut",
        overwrite: "auto",
      });
    };

    const onMove = (e: MouseEvent) => {
      if (!hoverRef.current) return;
      const rect = hero.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * 100;
      const my = ((e.clientY - rect.top) / rect.height) * 100;
      rippleText(mx, my);
    };

    const onEnter = () => {
      hoverRef.current = true;
      hero.classList.add("hero-section--active");
    };

    const onLeave = () => {
      hoverRef.current = false;
      hero.classList.remove("hero-section--active");
      resetText();
    };

    hero.addEventListener("mousemove", onMove);
    hero.addEventListener("mouseenter", onEnter);
    hero.addEventListener("mouseleave", onLeave);

    return () => {
      hero.removeEventListener("mousemove", onMove);
      hero.removeEventListener("mouseenter", onEnter);
      hero.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  let wordIndex = 0;

  return (
    <section
      id="converter"
      ref={heroRef}
      className="hero-section relative"
      style={{ "--hero-mx": "50%", "--hero-my": "50%" } as CSSProperties}
    >
      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
        <div className="hero-copy mx-auto max-w-3xl text-center">
          <p
            ref={badgeRef}
            className="glass mx-auto mb-5 inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-300"
          >
            The emotion-aware writing assistant
          </p>

          <h1 className="hero-headline text-4xl font-extrabold tracking-normal sm:text-6xl">
            <span className="hero-line block">
              {HEADLINE_LINE_1.map((word) => {
                const idx = wordIndex++;
                return (
                  <span key={word} className="hero-word-mask inline-block">
                    <span
                      ref={(el) => {
                        if (el) wordsRef.current[idx] = el;
                      }}
                      className="hero-text-fill hero-word inline-block"
                    >
                      {word}
                    </span>
                  </span>
                );
              })}
              <span className="hero-word-mask inline-block">
                <span
                  ref={accentRef}
                  className="hero-text-fill hero-text-fill--accent hero-word inline-block"
                >
                  {HEADLINE_ACCENT}
                </span>
              </span>
            </span>
            <span className="hero-line mt-1 block sm:mt-2">
              {HEADLINE_LINE_2.map((word) => {
                const idx = wordIndex++;
                return (
                  <span key={word} className="hero-word-mask inline-block">
                    <span
                      ref={(el) => {
                        if (el) wordsRef.current[idx] = el;
                      }}
                      className="hero-text-fill hero-word inline-block"
                    >
                      {word}
                    </span>
                  </span>
                );
              })}
            </span>
          </h1>

          <p ref={subRef} className="hero-sub mt-5 text-lg text-zinc-300">
            Paste anything. The page reads the emotion in your writing and the
            world around it reacts. Then convert angry, casual, or messy text
            into clear, professional messages.
          </p>

          <p ref={sub2Ref} className="hero-sub mt-2 text-sm font-medium text-zinc-400">
            <span className="hero-text-fill hero-text-fill--brand">
              Tone Convert
            </span>
            : rewrite before you regret send.
          </p>

          <p
            ref={taglineRef}
            className="hero-text-fill hero-text-fill--tagline hero-tagline mt-3 text-sm font-semibold tracking-wide"
          >
            Write it badly. Send it professionally.
          </p>
        </div>

        <div className="relative z-10 mt-10">{children}</div>
      </div>
    </section>
  );
}
