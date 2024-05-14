    const carousel = document.querySelector(".carousel");
    const buttons = document.querySelectorAll(".carousel-button");
    const buttonPading = parseInt(window.getComputedStyle(buttons[0]).paddingLeft) * 2
    console.log(buttonPading)
    // Add event listener for scroll event on carousel container
    carousel.addEventListener("scroll", () => {
        const carouselRect = carousel.getBoundingClientRect();

        buttons.forEach(button => {
            const buttonRect = button.getBoundingClientRect();
            // Calculate the horizontal center of each button relative to the carousel container
            const buttonCenter = buttonRect.left + (buttonRect.width / 2) - carouselRect.left + buttonPading;
            // Check if the button is in the middle of the carousel
            if (buttonCenter >= carouselRect.width / 2 && buttonCenter <= carouselRect.width / 2 + buttonRect.width) {
                // Remove 'active' class from all buttons
                buttons.forEach(btn => btn.classList.remove("active"));

                // Add 'active' class to the button in the middle
                button.classList.add("active");
            }
        });
    });

    // Add click event listener to each button
    buttons.forEach(button => {
        button.addEventListener("click", () => {
            // Remove 'active' class from all buttons
            buttons.forEach(btn => btn.classList.remove("active"));

            // Add 'active' class to the clicked button
            button.classList.add("active");

            // Scroll the carousel to the clicked button
            const scrollLeft = button.offsetLeft - (carousel.offsetWidth - button.offsetWidth) / 2;
            carousel.scrollTo({
                left: scrollLeft,
                behavior: "smooth"
            });
        });
    });
