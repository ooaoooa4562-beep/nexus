(() => {
  const $ = (selector) => document.querySelector(selector);
  const clock = $("#clock");
  const dateLabel = $("#dateLabel");
  const breadcrumb = $("#breadcrumb");
  const sidebar = $("#sidebar");
  const overview = $("#overview");
  const modulePage = $("#modulePage");
  const moduleTitle = $("#moduleTitle");
  const moduleDescription = $("#moduleDescription");
  const moduleIcon = $("#moduleIcon");

  const moduleInfo = {
    flow: ["Flow Studio", "⌘", "Design visual processes and connect actions into reusable workflows."],
    storage: ["Storage", "▤", "Organize local data, inspect collections and manage your workspace."],
    network: ["Network", "⌁", "Explore connection status and inspect network activity."],
    monitor: ["Monitor", "◷", "Review system events, resource metrics and service health."],
    terminal: ["Terminal", "›_", "A command workspace for interacting with the NEXUS environment."],
    extensions: ["Extensions", "⊞", "Discover and manage additional capabilities for NEXUS."]
  };

  function updateTime() {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString([], { hour12: false });
    dateLabel.textContent = now.toLocaleDateString([], { weekday: "short", day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  }

  function navigate(page) {
    const isOverview = page === "overview" || !moduleInfo[page];
    overview.hidden = !isOverview;
    modulePage.hidden = isOverview;
    if (!isOverview) {
      const [title, icon, description] = moduleInfo[page];
      moduleTitle.textContent = title;
      moduleIcon.textContent = icon;
      moduleDescription.textContent = description;
      breadcrumb.textContent = title;
    } else {
      breadcrumb.textContent = "Overview";
    }
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.toggle("active", link.dataset.page === (isOverview ? "overview" : page));
    });
    sidebar.classList.remove("open");
    if (location.hash !== (isOverview ? "#overview" : "#" + page)) {
      history.replaceState(null, "", isOverview ? "#overview" : "#" + page);
    }
  }

  document.querySelectorAll("[data-page]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      navigate(link.dataset.page);
    });
  });

  $("#backButton").addEventListener("click", () => navigate("overview"));
  $("#mobileMenu").addEventListener("click", () => sidebar.classList.toggle("open"));
  $("#themeButton").addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    const light = document.body.classList.contains("light-mode");
    $("#themeButton").textContent = light ? "☀" : "◐";
    addEvent("Visual mode changed", light ? "Light appearance enabled" : "Dark appearance enabled", "info");
  });

  function addEvent(title, detail, type = "success") {
    const list = $("#eventList");
    const item = document.createElement("div");
    item.className = "event-item";
    const symbol = type === "success" ? "✓" : type === "info" ? "↗" : "◇";
    item.innerHTML = '<span class="event-icon ' + type + '">' + symbol + '</span><span><b></b><small></small></span><time>JUST NOW</time>';
    item.querySelector("b").textContent = title;
    item.querySelector("small").textContent = detail;
    list.prepend(item);
    while (list.children.length > 5) list.lastElementChild.remove();
  }

  $("#clearLog").addEventListener("click", () => {
    $("#eventList").replaceChildren();
    addEvent("Activity log cleared", "No previous events are displayed", "info");
  });

  updateTime();
  setInterval(updateTime, 1000);
  const initialPage = location.hash.replace("#", "");
  navigate(moduleInfo[initialPage] ? initialPage : "overview");
})();