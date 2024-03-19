const manifesto = require("manifesto.js/dist-commonjs/");

export class IIIFManifest {
  constructor(manifest) {
    // Is manifest JSON or URL?
    if (isJsonString(manifest)) {
      this.manifestJson = manifest;
      this.manifestUrl = null;
      this.manifest = manifesto.parseManifest(manifest);
    } else {
      this.manifestJson = null;
      this.manifestUrl = manifest;
    }
  }

  async loadManifest() {
    if (this.manifestUrl)
      this.manifestJson = await manifesto.loadManifest(this.manifestUrl);

    if (this.manifestJson)
      this.manifest = await manifesto.parseManifest(this.manifestJson);

    if (this.manifest)
      this.scenes = this.manifest?.getSequences()[0]?.getScenes() || [];
  }

  annotationsFromScene(scene) {
    return scene?.getContent() || [];
  }
}

function isJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}
