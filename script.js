dayjs.extend(window.dayjs_plugin_relativeTime);

const container = document.getElementById("task-container");
const liveAnnouncer = document.getElementById("live-announcer");
// Wrap heavy initialization in requestIdleCallback
// This tells the browser: "Do this only when you aren't busy with important stuff"
window.requestIdleCallback(() => {
  setupPriorityIcons();
  updateAllTimestamps();
});

const dateTimes = [
  "2026-04-17T15:00:00",
  "2026-04-21T09:00:00",
  "2026-05-01T17:00:00",
]; // Example due dates

function setupPriorityIcons() {
  const todoTitleWrappers = document.querySelectorAll(".title .title-content");
  // Optimization: Use a DocumentFragment or pre-defined strings to minimize reflow
  todoTitleWrappers.forEach((wrapper) => {
    let svgPath = "";
    let color = "";

    if (wrapper.classList.contains("high-priority")) {
      svgPath =
        "m282-225-42-42 240-240 240 240-42 42-198-198-198 198Zm0-253-42-42 240-240 240 240-42 42-198-198-198 198Z";
      color = "var(--priority-high)";
    } else if (wrapper.classList.contains("medium-priority")) {
      svgPath = "M480-554 283-357l-43-43 240-240 240 240-43 43-197-197Z";
      color = "var(--priority-medium)";
    } else if (wrapper.classList.contains("low-priority")) {
      svgPath = "M480-344 240-584l43-43 197 197 197-197 43 43-240 240Z";
      color = "var(--priority-low)";
    }

    if (svgPath) {
      wrapper.insertAdjacentHTML(
        "afterbegin",
        `<svg data-testid="test-todo-priority" height="48px" viewBox="0 -960 960 960" width="48px" fill="${color}"><path d="${svgPath}"/></svg>`,
      );
    }
  });
}

function updateAllTimestamps() {
  dateTimes.forEach((dueDate) => {
    const timeData = getTimeRemaining(dueDate);
    // Optimization: Target specific cards using ID or data-attribute directly
    const card = document.querySelector(`.card[data-due="${dueDate}"]`);
    if (card) {
      const timeElement = card.querySelector(".time-remaining");
      const timeLeft = timeElement.querySelector("time.time-left");
      const icon = timeElement.querySelector("svg");

      // Batch DOM updates
      timeLeft.textContent = timeData.text;
      timeLeft.style.color = timeData.color;
      icon.style.fill = timeData.color;
    }
  });
}

// Update time data every minute to keep it accurate
setInterval(updateAllTimestamps, 60000); // Update every 60 seconds

container.addEventListener("change", (event) => {
  // 1. Ensure we are only acting on checkboxes
  if (event.target.type === "checkbox") {
    // 2. Scope everything to the specific card that contains this checkbox
    const card = event.target.closest(".card");
    const statusPill = card.querySelector(".badge");

    if (event.target.checked) {
      // Store the current status in a data attribute before changing it
      // so we know what to revert to later
      card.dataset.oldStatus = statusPill.textContent.trim();

      card.classList.add("is-completed");
      statusPill.textContent = "DONE";
      liveAnnouncer.textContent = "Task marked as completed";
    } else {
      card.classList.remove("is-completed");

      // Revert to the status we saved earlier, or default to 'OPEN'
      statusPill.textContent = card.dataset.oldStatus || "OPEN";
      liveAnnouncer.textContent = "Task marked as not completed";
    }
  }
});

// Adds the Enter key functionality to toggle the checkboxes for better keyboard accessibility
container.addEventListener("keydown", (event) => {
  if (event.target.type === "checkbox" && event.key === "Enter") {
    event.preventDefault(); // Prevent form submission or other default actions
    event.target.click(); // Simulate a click to toggle the checkbox and trigger the change event
  }
});

// Adds event delegation for the "toggle-btn" buttons
container.addEventListener("click", (event) => {
  if (event.target.classList.contains("toggle-btn")) {
    const card = event.target.closest(".card");
    const content = card.querySelector(".card-content p");
    const button = event.target;

    if (window.getComputedStyle(content).display === "none") {
      content.style.display = "block";
      button.textContent = "See Less";
      button.setAttribute("aria-expanded", "true");
      content.hidden = false;
    } else {
      content.style.display = "none";
      button.textContent = "See More";
      button.setAttribute("aria-expanded", "false");
      content.hidden = true;
    }
  } else if (
    event.target.classList.contains("edit") ||
    event.target.classList.contains("delete")
  ) {
    // Handle edit and delete button clicks here
    alert(
      `${event.target.classList.contains("edit") ? "Edit" : "Delete"} button clicked.`,
    );
  }
});

// Time Remaining Countdown Logic
function getTimeRemaining(dueDate) {
  const now = dayjs();
  const target = dayjs(dueDate);

  // 1. Calculate the difference in hours
  const hoursDiff = target.diff(now, "hour");

  // 2. Determine the color variable
  let colorVar = "var(--time-safe)"; // Default Slate/Grey

  if (target.isBefore(now)) {
    colorVar = "var(--time-critical)"; // Overdue Red
  } else if (hoursDiff < 24) {
    colorVar = "var(--time-critical)"; // Less than 24hrs Red
  } else if (hoursDiff < 72) {
    colorVar = "var(--time-warning)"; // Less than 3 days Orange
  }

  // 3. Return the "Human" string (e.g., "in 2 hours", "3 days ago")
  return {
    text: target.from(now),
    color: colorVar,
  };
}
