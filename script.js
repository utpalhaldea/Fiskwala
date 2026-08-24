(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);

  const filePicker = $("#filePicker");
  const selectedFiles = $("#selectedFiles");
  const clearFiles = $("#clearFiles");
  const diskLink = $("#diskLink");
  const openLink = $("#openLink");
  const linkStatus = $("#linkStatus");
  const toast = $("#toast");

  const settingsDialog = $("#settingsDialog");
  const previewDialog = $("#previewDialog");

  let selected = [];

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      toast.classList.remove("show");
    }, 2400);
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  }

  function iconFor(file) {
    if (file.type.startsWith("video/")) return "▶";
    if (file.type.startsWith("image/")) return "▧";
    if (file.type.startsWith("audio/")) return "♫";
    return "▤";
  }

  function renderFiles() {
    selectedFiles.innerHTML = "";

    selected.forEach((file, index) => {
      const row = document.createElement("div");
      row.className = "file-row";

      const icon = document.createElement("div");
      icon.className = "file-icon";
      icon.textContent = iconFor(file);

      const info = document.createElement("div");
      info.className = "file-info";

      const name = document.createElement("div");
      name.className = "file-name";
      name.textContent = file.name;

      const size = document.createElement("div");
      size.className = "file-size";
      size.textContent = formatBytes(file.size);

      info.append(name, size);
      row.append(icon, info);

      if (
        file.type.startsWith("image/") ||
        file.type.startsWith("video/") ||
        file.type.startsWith("audio/")
      ) {
        const preview = document.createElement("button");
        preview.type = "button";
        preview.className = "preview-button";
        preview.textContent = "Preview";
        preview.addEventListener("click", () => previewFile(index));
        row.append(preview);
      }

      selectedFiles.appendChild(row);
    });

    clearFiles.classList.toggle("hidden", selected.length === 0);
  }

  filePicker.addEventListener("change", () => {
    selected = [...filePicker.files];
    renderFiles();

    if (selected.length) {
      showToast(`${selected.length} file${selected.length > 1 ? "s" : ""} selected`);
    }
  });

  clearFiles.addEventListener("click", () => {
    selected = [];
    filePicker.value = "";
    renderFiles();
  });

  function previewFile(index) {
    const file = selected[index];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const body = $("#previewBody");
    const title = $("#previewTitle");

    title.textContent = file.name;
    body.innerHTML = "";

    let element;

    if (file.type.startsWith("image/")) {
      element = document.createElement("img");
      element.className = "preview-media";
      element.src = url;
    } else if (file.type.startsWith("video/")) {
      element = document.createElement("video");
      element.className = "preview-media";
      element.controls = true;
      element.autoplay = true;
      element.src = url;
    } else if (file.type.startsWith("audio/")) {
      element = document.createElement("audio");
      element.controls = true;
      element.autoplay = true;
      element.src = url;
      element.style.width = "100%";
    }

    if (element) {
      body.appendChild(element);
      previewDialog.addEventListener("close", () => URL.revokeObjectURL(url), { once: true });
      previewDialog.showModal();
    }
  }

  diskLink.addEventListener("input", () => {
    const hasValue = diskLink.value.trim().length > 0;
    openLink.classList.toggle("ready", hasValue);
    linkStatus.textContent = "";
  });

  openLink.addEventListener("click", () => {
    const value = diskLink.value.trim();

    if (!value) {
      showToast("Please paste a DiskWala URL.");
      diskLink.focus();
      return;
    }

    let url;

    try {
      url = new URL(value);
    } catch {
      linkStatus.textContent = "Please enter a valid URL.";
      return;
    }

    if (!["http:", "https:"].includes(url.protocol)) {
      linkStatus.textContent = "Only HTTP/HTTPS links are allowed.";
      return;
    }

    linkStatus.textContent = "Opening link...";
    window.open(url.href, "_blank", "noopener,noreferrer");
  });

  // No cookies and no localStorage are used.
  $("#settingsButton").addEventListener("click", () => {
    settingsDialog.showModal();
  });

  $("#closeSettings").addEventListener("click", () => settingsDialog.close());
  $("#doneSettings").addEventListener("click", () => settingsDialog.close());
  $("#closePreview").addEventListener("click", () => previewDialog.close());

  document.querySelectorAll(".socials a, #privacyLink").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showToast("Add your official social/privacy URL here.");
    });
  });

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach((x) => x.classList.remove("active"));
      item.classList.add("active");
    });
  });
})();
