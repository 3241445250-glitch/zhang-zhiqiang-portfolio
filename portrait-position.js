(() => {
  const masthead = document.querySelector(".masthead");
  const portrait = document.querySelector(".hero-illustration");
  const lowerRule = document.querySelector(".hero-caption");
  const heading = document.querySelector(".hero-heading");
  const title = document.querySelector("#hero-title");

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

    if (heading && title) {
      // Use layout widths so the portrait's floating/rotation and title's
      // hover effects do not move the horizontal alignment target.
      const headingRect = heading.getBoundingClientRect();
      const portraitLeft = headingRect.right - portrait.offsetWidth;
      const titleCenter = headingRect.left + title.offsetWidth / 2;
      title.style.setProperty(
        "--hero-name-horizontal-alignment",
        `${portraitLeft / 2 - titleCenter}px`,
      );
    }
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
  if (heading) observer?.observe(heading);
  if (title) observer?.observe(title);
  window.addEventListener("resize", scheduleAlignment, { passive: true });
  scheduleAlignment();
  document.fonts?.ready.then(scheduleAlignment);
})();
