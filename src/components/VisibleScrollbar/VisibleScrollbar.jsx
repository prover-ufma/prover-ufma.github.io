import { useEffect, useId, useRef, useState } from "react";
import "./VisibleScrollbar.css";

function VisibleScrollbar({ children, className = "", label }) {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const viewportId = useId();
  const [measurements, setMeasurements] = useState({
    scrollTop: 0,
    clientHeight: 0,
    scrollHeight: 0,
  });

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const updateMeasurements = () => {
      setMeasurements({
        scrollTop: viewport.scrollTop,
        clientHeight: viewport.clientHeight,
        scrollHeight: viewport.scrollHeight,
      });
    };

    const initialFrame = requestAnimationFrame(updateMeasurements);
    viewport.addEventListener("scroll", updateMeasurements, { passive: true });

    const resizeObserver = new ResizeObserver(updateMeasurements);
    resizeObserver.observe(viewport);

    const observeContentChildren = () => {
      for (const child of viewport.children) {
        resizeObserver.observe(child);
      }
    };
    observeContentChildren();

    const contentObserver = new MutationObserver(() => {
      observeContentChildren();
      updateMeasurements();
    });
    contentObserver.observe(viewport, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(initialFrame);
      viewport.removeEventListener("scroll", updateMeasurements);
      resizeObserver.disconnect();
      contentObserver.disconnect();
    };
  }, []);

  const maxScroll = Math.max(
    0,
    measurements.scrollHeight - measurements.clientHeight
  );
  const containerClassName = `visible-scrollbar-container${
    maxScroll > 0 ? " has-overflow" : ""
  }`;

  if (maxScroll === 0) {
    return (
      <div className={containerClassName}>
        <div
          id={viewportId}
          ref={viewportRef}
          className={`visible-scrollbar-viewport ${className}`}
        >
          {children}
        </div>
      </div>
    );
  }

  const trackHeight = measurements.clientHeight;
  const thumbHeight = Math.min(
    trackHeight,
    Math.max(
      28,
      (measurements.clientHeight / measurements.scrollHeight) * trackHeight
    )
  );
  const thumbOffset =
    (measurements.scrollTop / maxScroll) * (trackHeight - thumbHeight);

  const scrollToPosition = (clientY) => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return;

    const bounds = track.getBoundingClientRect();
    const thumbTravel = trackHeight - thumbHeight;
    if (thumbTravel <= 0) return;

    const thumbPosition = Math.min(
      Math.max(clientY - bounds.top - thumbHeight / 2, 0),
      thumbTravel
    );
    viewport.scrollTop = (thumbPosition / thumbTravel) * maxScroll;
  };

  const handleKeyDown = (event) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const scrollSteps = {
      ArrowDown: 40,
      ArrowUp: -40,
      PageDown: viewport.clientHeight,
      PageUp: -viewport.clientHeight,
      Home: -viewport.scrollTop,
      End: maxScroll - viewport.scrollTop,
    };
    if (!Object.hasOwn(scrollSteps, event.key)) return;

    event.preventDefault();
    viewport.scrollTop += scrollSteps[event.key];
  };

  return (
    <div className={containerClassName}>
      <div
        id={viewportId}
        ref={viewportRef}
        className={`visible-scrollbar-viewport ${className}`}
      >
        {children}
      </div>
      <div
        ref={trackRef}
        className="visible-scrollbar-track"
        role="scrollbar"
        aria-label={label}
        aria-controls={viewportId}
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={Math.round(maxScroll)}
        aria-valuenow={Math.round(measurements.scrollTop)}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          scrollToPosition(event.clientY);
        }}
        onPointerMove={(event) => {
          if (event.buttons === 1) scrollToPosition(event.clientY);
        }}
      >
        <span
          className="visible-scrollbar-thumb"
          style={{
            height: `${thumbHeight}px`,
            transform: `translateY(${thumbOffset}px)`,
          }}
        />
      </div>
    </div>
  );
}

export default VisibleScrollbar;
