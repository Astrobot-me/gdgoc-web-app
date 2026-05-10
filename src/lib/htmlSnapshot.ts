import { toPng } from "html-to-image";

export async function snapshotDiv(
  element: HTMLElement,
  filename = "snapshot.png"
): Promise<void> {
  await document.fonts.ready;

  const dataUrl = await toPng(element, {
    pixelRatio: 2,
    backgroundColor: "#ffffff",
    // tell html-to-image the full element size, not the viewport clip
    width: element.scrollWidth,
    height: element.scrollHeight,
    style: {
      // temporarily undo any overflow clipping
      overflow: "visible",
      // reset any transform that might offset the snapshot
      transform: "none",
      transformOrigin: "top left",
    },
  });

  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}