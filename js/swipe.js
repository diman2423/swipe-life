// Свайп карточки: перетаскивание мышью/пальцем, наклон, возврат или улёт за порогом.
(function () {
  const THRESHOLD = 0.3;   // доля ширины карточки, после которой отпускание = выбор
  const TILT = 0.06;       // градусов наклона на пиксель сдвига

  // onMove(progress 0..1, side 'left'|'right'|null) — для подписи варианта
  // onChoose(side) — карточка улетела
  function attachSwipe(el, { onMove, onChoose }) {
    let startX = 0, startY = 0, dx = 0, dy = 0;
    let dragging = false, done = false;

    const limit = () => el.offsetWidth * THRESHOLD;
    const sideOf = (x) => (x > 0 ? "right" : x < 0 ? "left" : null);

    function place(x, y) {
      el.style.transform = `translate(${x}px, ${y}px) rotate(${x * TILT}deg)`;
      onMove(Math.min(1, Math.abs(x) / limit()), sideOf(x));
    }

    el.addEventListener("pointerdown", (e) => {
      if (done) return;
      el.classList.remove("enter"); // анимация появления перебивает transform
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      dx = dy = 0;
      el.setPointerCapture(e.pointerId);
      el.classList.add("dragging");
    });

    el.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      dx = e.clientX - startX;
      dy = (e.clientY - startY) * 0.25;
      place(dx, dy);
    });

    function release() {
      if (!dragging) return;
      dragging = false;
      el.classList.remove("dragging");
      if (Math.abs(dx) > limit()) {
        fly(sideOf(dx));
      } else {
        el.style.transform = "";
        onMove(0, null);
      }
    }
    el.addEventListener("pointerup", release);
    el.addEventListener("pointercancel", release);

    function fly(side) {
      if (done) return;
      done = true;
      el.classList.remove("enter");
      const x = (side === "right" ? 1 : -1) * window.innerWidth;
      el.classList.add("flying");
      onMove(1, side);
      el.style.transform = `translate(${x}px, 60px) rotate(${x * TILT}deg)`;

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        onChoose(side);
      };
      el.addEventListener("transitionend", finish, { once: true });
      setTimeout(finish, 500); // если transitionend не пришёл
    }

    return { fly };
  }

  window.attachSwipe = attachSwipe;
})();
