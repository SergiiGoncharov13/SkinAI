document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".accordion-item");

  items.forEach((item) => {
    const header = item.querySelector(".accordion-header");

    header.addEventListener("click", () => {
      const isOpen = item.classList.contains("active");

      // Close all items
      items.forEach((i) => i.classList.remove("active"));

      // Open curent item
      if (!isOpen) {
        item.classList.add("active");
      }
    });
  });
});