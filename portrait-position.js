(() => {
  const masthead = document.querySelector(".masthead");
  const portrait = document.querySelector(".hero-illustration");
  const lowerRule = document.querySelector(".hero-caption");

  if (!masthead || !portrait || !lowerRule) return;

  let frame = 0;
  const alignPortrait = () => {
    const upperRuleY = masthead.getBoundingClientRect().bottom;
    const lowerRuleY = lowerRule.getBoundingClientRect().top;
    const currentOffset =
      Number.parseFloat(
        portrait.style.getPropertyValue("--hero-portrait-alignment"),
      ) || 0;
    const portraitRect = portrait.getBoundingClientRect();
    const unshiftedCenter =
      portraitRect.top + portraitRect.height / 2 - currentOffset;
    const targetCenter = (upperRuleY + lowerRuleY) / 2;

    portrait.style.setProperty(
      "--hero-portrait-alignment",
      `${targetCenter - unshiftedCenter}px`,
    );
  };
  const scheduleAlignment = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(alignPortrait);
  };

  const observer =
    typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(scheduleAlignment);
  observer?.observe(masthead);
  observer?.observe(portrait);
  observer?.observe(lowerRule);
  window.addEventListener("resize", scheduleAlignment, { passive: true });
  scheduleAlignment();
  document.fonts?.ready.then(scheduleAlignment);
})();
