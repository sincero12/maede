gsap.registerPlugin(MotionPathPlugin);

// --- 1. Optimized Particles ---
const particleContainer = document.getElementById('particles');
const items = ['💘', '💝', '💖', '❤️', '✨', 'A', 'L', 'O', 'V', 'E'];
const MAX_PARTICLES = 15;

function spawnParticle() {
  if (particleContainer.childElementCount > MAX_PARTICLES) return;

  const el = document.createElement('div');
  el.innerText = items[Math.floor(Math.random() * items.length)];
  el.className = 'particle';

  const startX = Math.random() * window.innerWidth;
  const startY = window.innerHeight + 50;

  el.style.left = startX + 'px';
  el.style.top = startY + 'px';
  particleContainer.appendChild(el);

  gsap.to(el, {
    y: -window.innerHeight - 100,
    x: (Math.random() - 0.5) * 200,
    rotation: Math.random() * 360,
    duration: Math.random() * 5 + 5,
    ease: "none",
    onComplete: () => el.remove()
  });
}
setInterval(spawnParticle, 600);


// --- 2. Flying Envelope Logic ---
const envelope = document.getElementById('envelope');
const hint = document.querySelector('.click-hint');
const letterCard = document.getElementById('letterCard');
const reasonsCard = document.getElementById('reasonsCard');

const path = [
  { x: window.innerWidth * 0.1, y: window.innerHeight * 0.2 },
  { x: window.innerWidth * 0.8, y: window.innerHeight * 0.3 },
  { x: window.innerWidth * 0.2, y: window.innerHeight * 0.7 },
  { x: window.innerWidth * 0.9, y: window.innerHeight * 0.6 },
  { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 }
];

gsap.to(envelope, {
  motionPath: { path: path, curviness: 1.5, autoRotate: true },
  duration: 5,
  ease: "power2.inOut",
  onComplete: () => {
    gsap.to(envelope, { y: "+=20", rotation: 0, duration: 1, yoyo: true, repeat: -1, ease: "sine.inOut" });
    gsap.to(hint, { opacity: 1, duration: 0.5, delay: 0.5 });
  }
});

// --- 3. Envelope Interaction ---
envelope.addEventListener('click', (e) => {
  e.stopPropagation(); // Stop shooting
  gsap.killTweensOf(envelope);
  gsap.to(envelope, {
    scale: 5, opacity: 0, duration: 0.4, ease: "power2.in",
    onComplete: () => {
      envelope.style.display = 'none';
      revealLetter();
    }
  });
  // Explosion particles
  for (let i = 0; i < 15; i++) {
    const p = document.createElement('div');
    p.innerText = '❤️';
    p.className = 'particle';
    p.style.left = '50%'; p.style.top = '50%'; p.style.fontSize = '3rem';
    particleContainer.appendChild(p);
    const angle = (i / 15) * Math.PI * 2;
    const velocity = Math.random() * 300 + 200;
    gsap.to(p, {
      x: Math.cos(angle) * velocity, y: Math.sin(angle) * velocity,
      opacity: 0, duration: 1, ease: "power2.out", onComplete: () => p.remove()
    });
  }
});

function revealLetter() {
  letterCard.style.display = 'block';
  gsap.fromTo(letterCard,
    { opacity: 0, scale: 0.8, y: 50 },
    { opacity: 1, scale: 1, y: 0, duration: 1, ease: "elastic.out(1, 0.75)" }
  );
  // Stagger content inside
  gsap.from(letterCard.children, {
    y: 20, opacity: 0, duration: 0.8, stagger: 0.1, delay: 0.2, ease: "power2.out"
  });
}

// --- 4. Charge & Shoot Mechanic ---
let isCharging = false;
let chargeStart = 0;
const chargeRing = document.getElementById('chargeRing');

// Track mouse for charge ring
document.addEventListener('mousemove', (e) => {
  if (isCharging) {
    gsap.set(chargeRing, { left: e.clientX, top: e.clientY });
  }
});

document.addEventListener('mousedown', (e) => {
  if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.card') || e.target.closest('#envelope')) return;

  isCharging = true;
  chargeStart = Date.now();

  // Show and animate charge ring
  gsap.set(chargeRing, { left: e.clientX, top: e.clientY, scale: 0, opacity: 1, borderColor: '#fff' });
  gsap.to(chargeRing, { scale: 3, duration: 1.5, ease: "power1.in" }); // Max charge in 1.5s
});

document.addEventListener('mouseup', (e) => {
  if (!isCharging) return;
  isCharging = false;

  // Calculate power (0 to 1)
  const duration = Math.min(Date.now() - chargeStart, 1500);
  const power = duration / 1500; // 0.0 to 1.0

  // Hide ring
  gsap.to(chargeRing, { scale: 4, opacity: 0, duration: 0.2 });

  shootArrow(e.clientX, e.clientY, power);
});

// Mobile touch support
document.addEventListener('touchstart', (e) => {
  if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.card') || e.target.closest('#envelope')) return;
  isCharging = true;
  chargeStart = Date.now();
  const touch = e.touches[0];
  gsap.set(chargeRing, { left: touch.clientX, top: touch.clientY, scale: 0, opacity: 1 });
  gsap.to(chargeRing, { scale: 3, duration: 1.5 });
});

document.addEventListener('touchend', (e) => {
  if (!isCharging) return;
  isCharging = false;
  const touch = e.changedTouches[0];
  const duration = Math.min(Date.now() - chargeStart, 1500);
  const power = duration / 1500;
  gsap.to(chargeRing, { scale: 4, opacity: 0, duration: 0.2 });
  shootArrow(touch.clientX, touch.clientY, power);
});


function shootArrow(targetX, targetY, power) {
  // Create Arrow (SVG or Character)
  const arrow = document.createElement('div');
  arrow.innerHTML = '➳'; // Sticking arrow character
  arrow.className = 'arrow-projectile';

  // Start from random off-screen position (bottom-leftish)
  const startX = -100;
  const startY = window.innerHeight + 100;

  arrow.style.left = startX + 'px';
  arrow.style.top = startY + 'px';

  // Color based on power (White -> Red)
  const color = gsap.utils.interpolate("#ffffff", "#ff0000", power);
  arrow.style.color = color;
  arrow.style.fontSize = (2 + power * 2) + 'rem'; // Size based on power

  document.body.appendChild(arrow);

  // Calculate angle to target
  const dx = targetX - startX;
  const dy = targetY - startY;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  // Speed based on power
  const flightTime = 0.6 - (power * 0.3); // 0.6s to 0.3s

  // Animate Flight
  gsap.to(arrow, {
    left: targetX,
    top: targetY,
    rotation: angle, // Rotate to face target
    duration: flightTime,
    ease: "power2.out",
    onComplete: () => {
      // Stick!
      stickArrow(arrow, targetX, targetY, angle, power);
    }
  });
}

function stickArrow(arrow, x, y, angle, power) {
  // Shake screen if high power
  if (power > 0.5) {
    gsap.to(document.body, { x: 5, y: 5, yoyo: true, repeat: 3, duration: 0.05 });
  }

  // Elastic wobble
  gsap.to(arrow, {
    scaleX: 0.8, scaleY: 1.2, duration: 0.1, yoyo: true, repeat: 1,
    onComplete: () => {
      gsap.to(arrow, {
        rotation: angle + (Math.random() * 10 - 5),
        duration: 2,
        ease: "elastic.out(1, 0.3)"
      });
    }
  });

  // Bleed from the tip
  // Tip position calculation (approximate based on rotation)
  // For simple emoji arrow, center is roughly the impact point
  startBleeding(x, y, power);

  // Fade out arrow after a long time
  gsap.to(arrow, { opacity: 0, delay: 4, duration: 1, onComplete: () => arrow.remove() });
}

function startBleeding(x, y, power) {
  const bleedCount = Math.floor(power * 20) + 5; // More power = more blood

  for (let i = 0; i < bleedCount; i++) {
    setTimeout(() => {
      const drop = document.createElement('div');
      drop.className = 'blood-drip';
      drop.style.left = x + 'px';
      drop.style.top = y + 'px';
      document.body.appendChild(drop);

      gsap.to(drop, {
        y: Math.random() * 150 + 50,
        x: (Math.random() - 0.5) * 20,
        opacity: 0,
        scale: Math.random() * 0.5 + 0.5,
        duration: Math.random() * 2 + 1,
        ease: "power1.in",
        onComplete: () => drop.remove()
      });
    }, i * 100);
  }
}

// --- 5. Parallax Effect ---
document.addEventListener('mousemove', (e) => {
  const x = (e.clientX - window.innerWidth / 2) / 50;
  const y = (e.clientY - window.innerHeight / 2) / 50;
  gsap.to(particleContainer, { x: x, y: y, duration: 1, ease: "power1.out" });
});

// --- 6. Advanced Features (Tilt & Trail) ---

// A. 3D Tilt Effect for Cards
const cards = document.querySelectorAll('.card');
cards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10; // Max 10deg rotation
    const rotateY = ((x - centerX) / centerX) * 10;

    gsap.to(card, {
      perspective: 1000,
      rotateX: rotateX,
      rotateY: rotateY,
      scale: 1.02,
      duration: 0.5,
      ease: "power2.out"
    });
  });

  card.addEventListener('mouseleave', () => {
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 0.5,
      ease: "elastic.out(1, 0.5)"
    });
  });
});

// B. Cursor Trail
document.addEventListener('mousemove', (e) => {
  if (Math.random() > 0.8) { // Don't spawn on every frame
    const heart = document.createElement('div');
    heart.innerText = '💖';
    heart.style.position = 'fixed';
    heart.style.left = e.clientX + 'px';
    heart.style.top = e.clientY + 'px';
    heart.style.fontSize = '1rem';
    heart.style.pointerEvents = 'none';
    heart.style.zIndex = '9999';
    document.body.appendChild(heart);

    gsap.to(heart, {
      y: -50,
      x: (Math.random() - 0.5) * 20,
      opacity: 0,
      scale: 0,
      duration: 1,
      ease: "power1.out",
      onComplete: () => heart.remove()
    });
  }
});

// C. Text Scramble Effect (Simple Version)
function scrambleText(element, finalText) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  let iterations = 0;

  const interval = setInterval(() => {
    element.innerText = finalText
      .split("")
      .map((letter, index) => {
        if (index < iterations) {
          return finalText[index];
        }
        return chars[Math.floor(Math.random() * chars.length)];
      })
      .join("");

    if (iterations >= finalText.length) {
      clearInterval(interval);
    }

    iterations += 1 / 3;
  }, 30);
}

// Hook scramble into reveal
window.showReasons = function () {
  gsap.to(letterCard, {
    opacity: 0, scale: 0.8, duration: 0.5, ease: "power2.in",
    onComplete: () => {
      letterCard.style.display = 'none';
      reasonsCard.style.display = 'block';

      // Tilt reset just in case
      gsap.set(reasonsCard, { rotateX: 0, rotateY: 0 });

      gsap.fromTo(reasonsCard,
        { opacity: 0, scale: 0.8, y: 50 },
        { opacity: 1, scale: 1, y: 0, duration: 1, ease: "elastic.out(1, 0.75)" }
      );

      // Scramble Header
      const h1 = reasonsCard.querySelector('h1');
      const originalText = h1.innerText;
      scrambleText(h1, originalText);

      gsap.from("li", { x: 50, opacity: 0, duration: 0.5, stagger: 0.1, delay: 0.5, ease: "power2.out" });
    }
  });
}

// --- 7. New Features Logic ---

window.closeLetter = function () {
  const letterCard = document.getElementById('letterCard');
  const reasonsCard = document.getElementById('reasonsCard');
  const envelope = document.getElementById('envelope');
  const hint = document.querySelector('.click-hint');

  gsap.to([letterCard, reasonsCard], {
    opacity: 0,
    scale: 0.8,
    duration: 0.3,
    onComplete: () => {
      letterCard.style.display = 'none';
      reasonsCard.style.display = 'none';

      // Reset Envelope
      envelope.style.display = 'block';
      // Center it
      gsap.set(envelope, {
        x: 0,
        y: 0,
        scale: 0,
        rotation: 0,
        left: '50%',
        top: '50%',
        xPercent: -50,
        yPercent: -50
      });

      // Pop in
      gsap.to(envelope, {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: "back.out(1.7)",
        onComplete: () => {
          // Restart floating
          gsap.to(envelope, { y: "+=20", rotation: 0, duration: 1, yoyo: true, repeat: -1, ease: "sine.inOut" });
          gsap.to(hint, { opacity: 1, duration: 0.5 });
        }
      });
    }
  });
}

window.showError = function () {
  const toast = document.getElementById('errorToast');
  const btn = document.querySelector('.cta--danger');

  // Show Toast
  toast.classList.add('show');

  // Shake Button
  gsap.to(btn, { x: 10, duration: 0.1, yoyo: true, repeat: 5 });

  // Hide after 3s
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}