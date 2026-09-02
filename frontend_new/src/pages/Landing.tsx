import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

/**
 * Public marketing landing page — the app's entry point ("/"). Lives outside
 * the authenticated app shell (no sidebar/topbar) so it can be shown to
 * signed-out visitors.
 *
 * There is no authentication route in this codebase yet, so the Sign In
 * links below point at "/dashboard" (the app itself) as a placeholder. Once
 * real auth is added, swap these for the actual login route — the flow is
 * already Landing -> Sign In -> (future) Login -> Dashboard.
 */

const TICKER_ITEMS = [
'REAL-TIME STOCK VISIBILITY',
'EXPIRY MONITORING ACROSS EVERY LAB',
'AUDIT-READY TRANSACTION LOGS',
'LOW-STOCK ALERTS, RAISED EARLY',
'SECURE, ATTRIBUTED USAGE RECORDS',
'ONE REGISTER FOR EVERY LAB'];


const PARTICLE_COUNT = 40;
const BAR_COUNT = 48;

export function Landing() {
  const fieldRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const barRowRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanups: Array<() => void> = [];

    // Cursor glow: eases toward the pointer every frame.
    let gx = window.innerWidth / 2;
    let gy = window.innerHeight / 2;
    let tx = gx;
    let ty = gy;
    let rafId = 0;
    const onMouseMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove);
    function glowLoop() {
      gx += (tx - gx) * 0.08;
      gy += (ty - gy) * 0.08;
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${gx}px,${gy}px)`;
      }
      rafId = requestAnimationFrame(glowLoop);
    }
    glowLoop();
    cleanups.push(() => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafId);
    });

    // Ambient drifting particle field.
    const field = fieldRef.current;
    if (field) {
      const particles: HTMLDivElement[] = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = document.createElement('div');
        p.className = 'p';
        const size = 1.5 + Math.random() * 3.5;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.left = `${Math.random() * 100}vw`;
        p.style.top = `${Math.random() * 100}vh`;
        p.style.setProperty('--dx', `${Math.random() * 100 - 50}px`);
        p.style.animationDuration = `${12 + Math.random() * 16}s`;
        p.style.animationDelay = `${Math.random() * 14}s`;
        field.appendChild(p);
        particles.push(p);
      }
      cleanups.push(() => particles.forEach((p) => p.remove()));
    }

    // 3D tilt of the orbit/molecule illustration, following the pointer.
    const heroEl = heroRef.current;
    const tilt = tiltRef.current;
    if (heroEl && tilt) {
      const onHeroMove = (e: MouseEvent) => {
        const r = heroEl.getBoundingClientRect();
        const mx = (e.clientX - r.left) / r.width - 0.5;
        const my = (e.clientY - r.top) / r.height - 0.5;
        tilt.style.transform = `rotateY(${mx * 16}deg) rotateX(${-my * 16}deg)`;
      };
      const onHeroLeave = () => {
        tilt.style.transform = 'rotateY(0) rotateX(0)';
      };
      heroEl.addEventListener('mousemove', onHeroMove);
      heroEl.addEventListener('mouseleave', onHeroLeave);
      cleanups.push(() => {
        heroEl.removeEventListener('mousemove', onHeroMove);
        heroEl.removeEventListener('mouseleave', onHeroLeave);
      });
    }

    // Decorative equalizer-style bars.
    const barRow = barRowRef.current;
    if (barRow) {
      const bars: HTMLDivElement[] = [];
      for (let i = 0; i < BAR_COUNT; i++) {
        const b = document.createElement('div');
        b.className = 'bar';
        b.style.animationDuration = `${2 + Math.random() * 2}s`;
        barRow.appendChild(b);
        bars.push(b);
      }
      cleanups.push(() => bars.forEach((b) => b.remove()));
    }

    // Feature cards: fade/slide in on scroll, subtle tilt on hover.
    const cardEls = cardsRef.current ?
    Array.from(cardsRef.current.querySelectorAll<HTMLDivElement>('.card')) :
    [];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('in'), i * 90);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    cardEls.forEach((c) => io.observe(c));

    const cardCleanups: Array<() => void> = [];
    cardEls.forEach((card) => {
      const onCardMove = (e: MouseEvent) => {
        const r = card.getBoundingClientRect();
        const mx = (e.clientX - r.left) / r.width - 0.5;
        const my = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `translateY(0) rotateY(${mx * 6}deg) rotateX(${-my * 6}deg)`;
      };
      const onCardLeave = () => {
        card.style.transform = '';
      };
      card.addEventListener('mousemove', onCardMove);
      card.addEventListener('mouseleave', onCardLeave);
      cardCleanups.push(() => {
        card.removeEventListener('mousemove', onCardMove);
        card.removeEventListener('mouseleave', onCardLeave);
      });
    });
    cleanups.push(() => {
      io.disconnect();
      cardCleanups.forEach((fn) => fn());
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <div className="landing">
      <div id="grid" />
      <div id="field" ref={fieldRef} />
      <div id="cursorGlow" ref={glowRef} />

      <nav>
        <div className="mark">Reagentia</div>
        <Link className="btn-pill" to="/dashboard">Sign in</Link>
      </nav>

      <div className="hero" ref={heroRef}>
        <div className="htext">
          <h1>
            Every drop, <span className="i">accounted for.</span>
          </h1>
          <p className="sub">
            Quantity, location and expiry — always current.
          </p>
          <div className="ctas">
            <Link className="btn-solid" to="/dashboard">Sign in</Link>
          </div>
        </div>

        <div className="stage-outer">
          <div className="glow" />
          <div id="tilt" ref={tiltRef}>
            <div className="orbit-ring r3" />
            <div className="orbit-ring r1" />
            <div className="orbit-ring r2" />
            <div className="sat"><i style={{ left: '50%' }} /></div>
            <div className="sat rev"><i style={{ left: '50%' }} /></div>
            <div className="mol">
              <svg viewBox="0 0 300 260">
                <line className="bond" x1="150" y1="40" x2="220" y2="80" />
                <line className="bond c" x1="220" y1="80" x2="220" y2="170" />
                <line className="bond" x1="220" y1="170" x2="150" y2="210" />
                <line className="bond" x1="150" y1="210" x2="80" y2="170" />
                <line className="bond c" x1="80" y1="170" x2="80" y2="80" />
                <line className="bond" x1="80" y1="80" x2="150" y2="40" />
                <line className="bond" x1="220" y1="80" x2="270" y2="55" />
                <line className="bond" x1="80" y1="170" x2="30" y2="195" />

                <circle className="atom" cx="150" cy="40" r="9" />
                <circle className="atom" cx="220" cy="80" r="9" />
                <circle className="atom c" cx="220" cy="170" r="9" />
                <circle className="atom" cx="150" cy="210" r="9" />
                <circle className="atom" cx="80" cy="170" r="9" />
                <circle className="atom c" cx="80" cy="80" r="9" />
                <circle className="atom" cx="270" cy="55" r="7" />
                <circle className="atom" cx="30" cy="195" r="7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="ticker-wrap">
        <div className="ticker">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) =>
          <span key={i}>{item}</span>
          )}
        </div>
      </div>

      <section className="flow-section">
        <div className="wrap">
          <svg viewBox="0 0 1100 140" preserveAspectRatio="xMidYMid meet">
            <path
              className="flow-path"
              d="M 60 70 L 340 70 L 420 30 L 700 30 L 780 100 L 1040 100" />

            <circle className="flow-dot" r="4">
              <animateMotion
                dur="6s"
                repeatCount="indefinite"
                path="M 60 70 L 340 70 L 420 30 L 700 30 L 780 100 L 1040 100" />

            </circle>
            <circle className="flow-node" cx="60" cy="70" r="7" />
            <circle className="flow-node" cx="420" cy="30" r="7" />
            <circle className="flow-node" cx="780" cy="100" r="7" />
            <circle className="flow-node" cx="1040" cy="100" r="7" />
            <text className="flow-label" x="35" y="100">RECEIVED</text>
            <text className="flow-label" x="392" y="15">STORED</text>
            <text className="flow-label" x="735" y="130">EXPIRY VERIFIED</text>
            <text className="flow-label" x="1000" y="130">ISSUED</text>
          </svg>
        </div>
      </section>

      <section className="bars">
        <div className="bar-row" ref={barRowRef} />
      </section>

      <section className="strip" id="features" ref={cardsRef}>
        <div className="wrap">
          <div className="cards">
            <div className="card">
              <h3><span className="dot" />Stock levels</h3>
              <p>Exact quantities, updated the instant they change.</p>
            </div>
            <div className="card">
              <h3><span className="dot" />Storage location</h3>
              <p>Every item's precise location within the facility.</p>
            </div>
            <div className="card">
              <h3><span className="dot" />Expiry tracking</h3>
              <p>Expiring stock flagged well ahead of the deadline.</p>
            </div>
          </div>
        </div>
      </section>

      <footer>© 2026 — Reagentia</footer>
    </div>);

}
