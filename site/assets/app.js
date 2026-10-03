const metadataList = document.querySelector("#metadata-list");
const reloadButton = document.querySelector("#reload");

function displayValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function render(items) {
  metadataList.replaceChildren(
    ...items.map(([label, value]) => {
      const wrapper = document.createElement("div");
      const term = document.createElement("dt");
      const description = document.createElement("dd");
      term.textContent = label;
      description.textContent = displayValue(value);
      description.title = displayValue(value);
      wrapper.append(term, description);
      return wrapper;
    }),
  );
}

async function loadMetadata() {
  reloadButton.disabled = true;
  render([["Status", "Loading…"]]);

  try {
    const url = new URL("./_preview/meta.json", document.baseURI);
    url.searchParams.set("cache", Date.now().toString());
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const metadata = await response.json();
    render([
      ["Repository", metadata.repository],
      ["Mode", metadata.mode],
      ["Base path", metadata.basePath || "/"],
      ["Commit", metadata.sha ? metadata.sha.slice(0, 12) : null],
      ["Files", metadata.filesBeforeMetadata],
      ["Built", metadata.builtAt],
    ]);
  } catch (error) {
    render([
      ["Status", "Metadata unavailable"],
      ["Reason", error.message],
      ["Current URL", window.location.href],
    ]);
  } finally {
    reloadButton.disabled = false;
  }
}

reloadButton.addEventListener("click", loadMetadata);
loadMetadata();
