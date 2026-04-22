dayjs.extend(window.dayjs_plugin_relativeTime);

// Attach this listener to your container (the parent of all cards)
const container = document.getElementById("task-container");
const seeBtn = document.querySelectorAll(".more-less");
// const todoTitleWrappers = document.querySelectorAll(".title .title-content");
const liveAnnouncer = document.getElementById("live-announcer");
// Select all buttons with the toggle class
const toggleButtons = document.querySelectorAll(".toggle-btn");

// Wrap heavy initialization in requestIdleCallback
// This tells the browser: "Do this only when you aren't busy with important stuff"
window.requestIdleCallback(() => {
  setupPriorityIcons();
  updateAllTimestamps();
});

toggleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // 1. Find the specific content this button controls
    const targetId = button.getAttribute("aria-controls");
    const content = document.getElementById(targetId);

    // 2. Determine and toggle the state
    const isExpanded = button.getAttribute("aria-expanded") === "true";
    const newState = !isExpanded;

    // 3. Update the specific button and its content
    button.setAttribute("aria-expanded", newState);
    content.hidden = isExpanded; // If it was expanded, hide it; if not, show it
    button.textContent = newState ? "See Less" : "See More";
  });
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
    // ... add your other conditions here ...

    if (svgPath) {
      wrapper.insertAdjacentHTML(
        "afterbegin",
        `<svg data-testid="test-todo-priority" height="48px" viewBox="0 -960 960 960" width="48px" fill="${color}"><path d="${svgPath}"/></svg>`,
      );
    }
  });
}

// todoTitleWrappers.forEach((wrapper, index) => {
//   if (wrapper.classList.contains("high-priority")) {
//     wrapper.insertAdjacentHTML(
//       "afterbegin",
//       `<svg data-testid="test-todo-priority" xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="var(--priority-high)"><path d="m282-225-42-42 240-240 240 240-42 42-198-198-198 198Zm0-253-42-42 240-240 240 240-42 42-198-198-198 198Z"/></svg>`,
//     );
//   } else if (wrapper.classList.contains("medium-priority")) {
//     wrapper.insertAdjacentHTML(
//       "afterbegin",
//       `<svg data-testid="test-todo-priority" xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="var(--priority-medium)"><path d="M480-554 283-357l-43-43 240-240 240 240-43 43-197-197Z"/></svg>`,
//     );
//   } else if (wrapper.classList.contains("low-priority")) {
//     wrapper.insertAdjacentHTML(
//       "afterbegin",
//       `<svg data-testid="test-todo-priority" xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="var(--priority-low)"><path d="M480-344 240-584l43-43 197 197 197-197 43 43-240 240Z"/></svg>`,
//     );
//   }
// });

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

seeBtn.forEach((btn) => {
  btn.addEventListener("click", (event) => {
    console.log("Button clicked:", event.target);
    const card = event.target.closest(".card");
    const content = card.querySelector(".card-content p");

    if (window.getComputedStyle(content).display === "none") {
      content.style.display = "block";
      event.target.textContent = "See Less";
    } else {
      content.style.display = "none";
      event.target.textContent = "See More";
    }
  });
});

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

// Adds the Enter key functionality to toggle the checkbox
container.addEventListener("keydown", (event) => {
  if (event.target.type === "checkbox" && event.key === "Enter") {
    event.preventDefault(); // Prevent form submission or other default actions
    // event.target.checked = !event.target.checked;
    // event.target.dispatchEvent(new Event("change"));
    event.target.click(); // Simulate a click to toggle the checkbox and trigger the change event
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
