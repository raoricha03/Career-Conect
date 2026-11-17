document.addEventListener("DOMContentLoaded", function () {

    // 1. Update footer year
    const yearElement = document.getElementById("currentYear");
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // 2. Mobile navigation menu
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", function () {
            const isOpen = navLinks.classList.toggle("show");
            menuToggle.setAttribute("aria-expanded", isOpen);
        });
    }

    // 3. Job search and filters
    const jobSearch = document.getElementById("jobSearch");
    const jobType = document.getElementById("jobType");
    const jobsGrid = document.querySelector(".jobs-grid");

    function filterJobs() {
        if (!jobsGrid) return;

        const searchText = jobSearch
            ? jobSearch.value.toLowerCase().trim()
            : "";

        const selectedType = jobType
            ? jobType.value.toLowerCase().trim()
            : "";

        const jobCards = jobsGrid.querySelectorAll(
            ".job-card, .job-listing, article"
        );

        jobCards.forEach(function (card) {
            const cardText = card.textContent.toLowerCase();

            const matchesSearch = cardText.includes(searchText);

            const matchesType =
                !selectedType ||
                selectedType === "all" ||
                cardText.includes(selectedType);

            card.style.display =
                matchesSearch && matchesType ? "" : "none";
        });
    }

    if (jobSearch) {
        jobSearch.addEventListener("input", filterJobs);
    }

    if (jobType) {
        jobType.addEventListener("change", filterJobs);
    }

    // 4. Demo career events for the Schedule page
    const eventsContainer = document.querySelector("[data-events]");

    const events = [
        {
            title: "CareerConnect Job Fair 2026",
            date: "December 05, 2026",
            type: "Job Fair",
            location: "University Campus",
            description:
                "Meet recruiters from leading companies and explore exciting career opportunities."
        },
        {
            title: "Web Development Workshop",
            date: "December 12, 2026",
            type: "Workshop",
            location: "Computer Lab",
            description:
                "Learn the fundamentals of modern web development and improve your practical skills."
        },
        {
            title: "Technical Interview Preparation",
            date: "December 18, 2026",
            type: "Training Session",
            location: "Seminar Hall",
            description:
                "Prepare for technical interviews with useful tips, practice questions and guidance."
        }
    ];

    if (eventsContainer) {
        eventsContainer.innerHTML = events.map(function (event) {
            return `
                <article class="event-card">
                    <span class="event-category">${event.type}</span>
                    <h3>${event.title}</h3>
                    <p>${event.description}</p>
                    <div class="event-details">
                        <p><strong>Date:</strong> ${event.date}</p>
                        <p><strong>Location:</strong> ${event.location}</p>
                    </div>
                    <button class="event-register-btn" type="button">
                        Register Interest
                    </button>
                </article>
            `;
        }).join("");
    }

    // 5. Demo event registration
    document.addEventListener("click", function (event) {
        if (event.target.closest(".event-register-btn")) {
            alert(
                "Thank you for your interest! " +
                "This is a demo website, so event registration is not saved."
            );
        }
    });

    // 6. Demo job application buttons
    document.addEventListener("click", function (event) {
        const button = event.target.closest(
            ".apply-btn, .apply-button"
        );

        if (button) {
            event.preventDefault();
            alert(
                "Thank you for your interest! " +
                "This is a demo website. Applications are not submitted to a real company."
            );
        }
    });

    // 7. Demo login and registration
    // These are local browser-only demo features, not secure accounts.

    const registerForm = document.querySelector(
        ".register-form, #registerForm"
    );

    if (registerForm) {
        registerForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const formData = new FormData(registerForm);
            const user = {};

            formData.forEach(function (value, key) {
                user[key] = value;
            });

            const emailInput = registerForm.querySelector(
                'input[type="email"]'
            );
            const passwordInput = registerForm.querySelector(
                'input[type="password"]'
            );

            if (!emailInput || !passwordInput) {
                alert("Please check the registration form fields.");
                return;
            }

            localStorage.setItem(
                "careerconnect-demo-user",
                JSON.stringify({
                    email: emailInput.value,
                    password: passwordInput.value
                })
            );

            alert("Demo registration successful! You can now log in.");
            window.location.href = "login.html";
        });
    }

    const loginForm = document.querySelector(
        ".login-form form, .login-form, #loginForm"
    );

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const emailInput = loginForm.querySelector(
                'input[type="email"]'
            );
            const passwordInput = loginForm.querySelector(
                'input[type="password"]'
            );

            if (!emailInput || !passwordInput) {
                alert("Please check the login form fields.");
                return;
            }

            const savedUser = localStorage.getItem(
                "careerconnect-demo-user"
            );

            if (!savedUser) {
                alert("No demo account found. Please register first.");
                return;
            }

            const user = JSON.parse(savedUser);

            if (
                emailInput.value === user.email &&
                passwordInput.value === user.password
            ) {
                alert("Demo login successful! Welcome to CareerConnect.");
                window.location.href = "jobs.html";
            } else {
                alert("Incorrect email or password. Please try again.");
            }
        });
    }

});
