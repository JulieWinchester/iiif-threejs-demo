import { loadScene } from "./main.js";

// Non-3D listeners

document
  .querySelector("button#load-manifest-from-url")
  .addEventListener("click", async () => {
    const manifestUrl = document.querySelector("input#manifest-url").value;
    await loadScene(manifestUrl);
  });

document
  .querySelector("button#load-manifest-from-text")
  .addEventListener("click", async () => {
    const manifestText = document.querySelector("textarea#manifest-text").value;
    await loadScene(manifestText);
  });

document
  .querySelector("select#manifest-select")
  .addEventListener("change", (event) => {
    const manifestUrl = event.target.value;
    document.querySelector("input#manifest-url").value = manifestUrl;
    loadScene(manifestUrl);
  });
