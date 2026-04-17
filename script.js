// Attach this listener to your container (the parent of all cards)
const container = document.getElementById("task-container");
const seeBtn = document.querySelectorAll(".more-less");
const dateTimes = [
  "2026-04-17T15:00:00",
  "2026-04-21T09:00:00",
  "2026-05-01T17:00:00",
]; // Example due dates

dateTimes.forEach((dueDate) => {
  const timeData = getTimeRemaining(dueDate);
  // Find the corresponding card for this due date (you may need to adjust this logic based on your actual HTML structure)
  const card = document.querySelector(`.card[data-due="${dueDate}"]`);
  if (card) {
    const timeElement = card.querySelector(".time-remaining");
    timeElement.querySelector("span.time-left").textContent = timeData.text;
    timeElement.querySelector("svg").style.fill = timeData.color;
  }
});

seeBtn.forEach((btn) => {
  btn.addEventListener("click", (event) => {
    const card = event.target.closest(".card");
    const content = card.querySelector(".card-content p");

    if (content.style.display === "none") {
      content.style.display = "block";
      event.target.textContent = "See Less";
    } else {
      content.style.display = "none";
      event.target.textContent = "See More";
    }
  });
});

container.addEventListener("change", (event) => {
  if (event.target.type === "checkbox") {
    // Find the closest card parent
    const card = event.target.closest(".card");
    const statusPill = card.querySelector(".badge");

    // Get the current status from the status pill
    const currentStatus = statusPill.textContent.trim();

    if (event.target.checked) {
      card.classList.add("is-completed");
      statusPill.textContent = "DONE";
    } else {
      card.classList.remove("is-completed");
      // Logic to revert to the old status (e.g., 'IN PROGRESS')
      statusPill.textContent =
        currentStatus === "DONE" ? "IN PROGRESS" : currentStatus;
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
