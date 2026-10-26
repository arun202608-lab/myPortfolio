import { useEffect, useRef } from "react";
import "./CursorEffects.css";

function CursorEffects() {
  const cursorRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const page = document.querySelector(".portfolio");
    const finePointer = window.matchMedia("(pointer: fine)");

    if (!cursor || !page || !finePointer.matches) return undefined;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let animationFrame = 0;

    const headings = page.querySelectorAll("h1, h2, h3, h4, h5, h6");
    const restoreHeadingContent = [];

    headings.forEach((heading) => {
      const originalLabel = heading.getAttribute("aria-label");
      const textNodes = [];
      const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);

      while (walker.nextNode()) {
        if (walker.currentNode.textContent.trim()) {
          textNodes.push(walker.currentNode);
        }
      }

      textNodes.forEach((textNode) => {
        const textWrapper = document.createElement("span");
        textWrapper.className = "cursor-type-text";

        Array.from(textNode.textContent).forEach((character, index) => {
          const characterWrapper = document.createElement("span");
          characterWrapper.className = "cursor-type-char";
          characterWrapper.style.setProperty("--char-index", index);
          characterWrapper.textContent = character;
          textWrapper.append(characterWrapper);
        });

        textNode.replaceWith(textWrapper);
        restoreHeadingContent.push(() => textWrapper.replaceWith(textNode));
      });

      if (!originalLabel) {
        heading.setAttribute("aria-label", heading.textContent);
        restoreHeadingContent.push(() => heading.removeAttribute("aria-label"));
      }

      const startTyping = () => {
        heading.classList.add("cursor-heading-typing");
        cursor.classList.add("cursor-3d--typing");
      };

      const stopTyping = () => {
        heading.classList.remove("cursor-heading-typing");
        cursor.classList.remove("cursor-3d--typing");
      };

      heading.addEventListener("pointerenter", startTyping);
      heading.addEventListener("pointerleave", stopTyping);
      restoreHeadingContent.push(() => {
        heading.removeEventListener("pointerenter", startTyping);
        heading.removeEventListener("pointerleave", stopTyping);
        stopTyping();
      });
    });

    const animateCursor = () => {
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;
      cursor.style.setProperty("--cursor-x", `${currentX}px`);
      cursor.style.setProperty("--cursor-y", `${currentY}px`);

      if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
        animationFrame = window.requestAnimationFrame(animateCursor);
      } else {
        animationFrame = 0;
      }
    };

    const showCursor = () => cursor.classList.add("cursor-3d--visible");
    const moveCursor = (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      cursor.style.setProperty(
        "--cursor-tilt-x",
        `${Math.max(-18, Math.min(18, event.movementY * 1.5))}deg`
      );
      cursor.style.setProperty(
        "--cursor-tilt-y",
        `${Math.max(-18, Math.min(18, event.movementX * 1.5))}deg`
      );
      showCursor();
      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(animateCursor);
      }
    };
    const updateCursorTarget = (event) => {
      cursor.classList.toggle(
        "cursor-3d--interactive",
        Boolean(event.target.closest("a, button, [role='button']"))
      );
    };
    const hideCursor = () => {
      cursor.classList.remove("cursor-3d--visible", "cursor-3d--interactive");
    };

    page.addEventListener("pointerenter", showCursor);
    page.addEventListener("pointermove", moveCursor);
    page.addEventListener("pointerover", updateCursorTarget);
    page.addEventListener("pointerleave", hideCursor);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      page.removeEventListener("pointerenter", showCursor);
      page.removeEventListener("pointermove", moveCursor);
      page.removeEventListener("pointerover", updateCursorTarget);
      page.removeEventListener("pointerleave", hideCursor);
      restoreHeadingContent.reverse().forEach((restore) => restore());
    };
  }, []);

  return (
    <div className="cursor-3d" ref={cursorRef} aria-hidden="true">
      <span className="cursor-3d__halo"></span>
      <span className="cursor-3d__ring"></span>
      <span className="cursor-3d__orbit"></span>
      <span className="cursor-3d__core"></span>
      <span className="cursor-3d__caret"></span>
    </div>
  );
}

export default CursorEffects;
