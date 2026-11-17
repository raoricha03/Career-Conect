const API_BASE = "/api";
const SESSION_KEY = "careerconnect-user";

async function apiRequest(route, options = {}) {
    const response = await fetch(`${API_BASE}${route}`, {
        ...options,
        headers: { "Content-Type": "application/json", ...options.headers },
    });
    const payload = await response.json();
    if (!response.ok) {
        throw new Error(payload.error || "Something went wrong. Please try again.");
    }
    return payload;
}

function currentUser() {
    for (const storage of [localStorage, sessionStorage]) {
        try {
            const user = JSON.parse(storage.getItem(SESSION_KEY));
            if (user) return user;
        } catch {
            storage.removeItem(SESSION_KEY);
        }
    }
    return null;
}

function setNotice(message, isError = false) {
    let notice = document.querySelector(".site-notice");
    if (!notice) {
        notice = document.createElement("div");
        notice.className = "site-notice";
        notice.setAttribute("role", "status");
        document.body.append(notice);
    }
    notice.textContent = message;
    notice.classList.toggle("is-error", isError);
    notice.classList.add("is-visible");
    window.clearTimeout(setNotice.timeout);
    setNotice.timeout = window.setTimeout(() => notice.classList.remove("is-visible"), 3600);
}

function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
}

function updateAccountLinks() {
    const user = currentUser();
    document.querySelectorAll(".nav-buttons").forEach((container) => {
        if (!user) return;
        container.replaceChildren();
        const welcome = createElement("span", "account-welcome", `Hi, ${user.name.split(" ")[0]}`);
        const logout = createElement("button", "account-logout", "Log out");
        logout.type = "button";
        logout.dataset.logout = "true";
        container.append(welcome, logout);
    });
}

async function renderJobs() {
    const grid = document.querySelector(".jobs-grid");
    if (!grid) return;
    const jobs = await apiRequest("/jobs");
    const search = document.querySelector("#jobSearch");
    const typeFilter = document.querySelector("#jobType");
    const companyFilter = new URLSearchParams(location.search).get("company") || "";
    const resultsLabel = document.querySelector("#jobResults");

    function update() {
        const query = (search?.value || "").trim().toLowerCase();
        const type = typeFilter?.value || "";
        const filtered = jobs.filter((job) => {
            const searchText = `${job.title} ${job.company} ${job.location} ${job.category}`.toLowerCase();
            return searchText.includes(query) && (!type || job.type === type) && (!companyFilter || job.company.toLowerCase() === companyFilter.toLowerCase());
        });
        grid.replaceChildren();
        if (!filtered.length) {
            grid.append(createElement("p", "empty-state", "No roles match those filters. Try another search."));
        }
        filtered.forEach((job) => {
            const card = createElement("article", "job-card");
            const top = createElement("div", "job-top");
            top.append(createElement("div", "job-company-logo", job.company.charAt(0)), createElement("span", "job-type", job.type));
            card.append(top, createElement("h3", "", job.title), createElement("p", "job-company", job.company));
            const details = createElement("div", "job-details");
            details.append(createElement("span", "", `Location: ${job.location}`), createElement("span", "", job.category));
            card.append(details, createElement("p", "job-description", job.description));
            const apply = createElement("button", "apply-btn", currentUser() ? "Apply now" : "Login to apply");
            apply.type = "button";
            apply.dataset.apply = job.id;
            card.append(apply);
            grid.append(card);
        });
        if (resultsLabel) resultsLabel.textContent = `${filtered.length} ${filtered.length === 1 ? "role" : "roles"} found`;
    }

    search?.addEventListener("input", update);
    typeFilter?.addEventListener("change", update);
    update();
}

async function renderCompanies() {
    const grid = document.querySelector(".companies-grid");
    if (!grid) return;
    const companies = await apiRequest("/companies");
    grid.replaceChildren();
    companies.forEach((company) => {
        const card = createElement("article", "company-card");
        const imageWrap = createElement("div", "company-image");
        const image = document.createElement("img");
        image.src = `https://logo.clearbit.com/${company.domain}`;
        image.alt = `${company.name} logo`;
        image.loading = "lazy";
        image.addEventListener("error", () => {
            image.hidden = true;
            imageWrap.textContent = company.name.charAt(0);
            imageWrap.classList.add("company-image-fallback");
        }, { once: true });
        imageWrap.append(image);
        const category = createElement("span", "company-category", company.category);
        const title = createElement("h3", "", company.name);
        const description = createElement("p", "", company.description);
        const link = createElement("a", "company-btn", "Explore jobs");
        link.href = `jobs.html?company=${encodeURIComponent(company.name)}`;
        card.append(imageWrap, category, title, description, link);
        grid.append(card);
    });
}

async function renderEvents() {
    const grid = document.querySelector("[data-events]");
    if (!grid) return;
    const events = await apiRequest("/events");
    grid.replaceChildren();
    events.forEach((event) => {
        const card = createElement("article", "event-card");
        const date = new Date(`${event.date}T12:00:00`);
        const dateLabel = createElement("div", "event-date", date.toLocaleDateString(undefined, { month: "short", day: "numeric" }));
        const details = createElement("div", "event-content");
        details.append(createElement("span", "company-category", event.company), createElement("h2", "", event.title), createElement("p", "", event.description));
        const meta = createElement("p", "event-meta", `${date.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })} · ${event.time} · ${event.location}`);
        const action = createElement("button", "company-btn", currentUser() ? "Register for event" : "Login to register");
        action.type = "button";
        action.dataset.eventRegister = event.id;
        card.append(dateLabel, details, meta, action);
        grid.append(card);
    });
}

async function handleRegistration(form) {
    const values = new FormData(form);
    const password = form.querySelector("#password").value;
    if (password !== form.querySelector("#confirmPassword").value) {
        throw new Error("The passwords do not match.");
    }
    const payload = await apiRequest("/register", {
        method: "POST",
        body: JSON.stringify({
            name: form.querySelector("#fullName").value.trim(),
            email: form.querySelector("#email").value.trim(),
            password,
            profile: {
                phone: form.querySelector("#phone").value,
                college: form.querySelector("#college").value.trim(),
                course: form.querySelector("#course").value,
                branch: form.querySelector("#branch").value.trim(),
                graduation: form.querySelector("#graduation").value,
                studentId: form.querySelector("#studentId").value.trim(),
                termsAccepted: values.has("terms"),
            },
        }),
    });
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.setItem(SESSION_KEY, JSON.stringify(payload.user));
    setNotice("Account created. You are now signed in.");
    window.setTimeout(() => location.assign("jobs.html"), 700);
}

async function handleLogin(form) {
    const payload = await apiRequest("/login", {
        method: "POST",
        body: JSON.stringify({
            email: form.querySelector("#email").value.trim(),
            password: form.querySelector("#password").value,
            role: form.querySelector("#role").value,
        }),
    });
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    const storage = form.querySelector("[name='remember']")?.checked ? localStorage : sessionStorage;
    storage.setItem(SESSION_KEY, JSON.stringify(payload.user));
    setNotice(`Welcome back, ${payload.user.name.split(" ")[0]}.`);
    const requestedPage = sessionStorage.getItem("careerconnect-return");
    sessionStorage.removeItem("careerconnect-return");
    const returnUrl = requestedPage ? new URL(requestedPage, location.origin) : null;
    const destination = returnUrl?.origin === location.origin ? returnUrl.href : "jobs.html";
    window.setTimeout(() => location.assign(destination), 700);
}

document.addEventListener("submit", async (event) => {
    const form = event.target;
    if (!form.matches(".register-form, .login-form form")) return;
    event.preventDefault();
    const button = form.querySelector("button[type='submit']");
    if (button) button.disabled = true;
    try {
        if (form.matches(".register-form")) await handleRegistration(form);
        else await handleLogin(form);
    } catch (error) {
        setNotice(error.message, true);
    } finally {
        if (button) button.disabled = false;
    }
});

document.addEventListener("click", async (event) => {
    const target = event.target.closest("button, a");
    if (!target) return;
    if (target.matches("[data-logout]")) {
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_KEY);
        location.assign("index.html");
        return;
    }
    if (target.matches("[data-apply]")) {
        const user = currentUser();
        if (!user) {
            sessionStorage.setItem("careerconnect-return", location.href);
            location.assign("login.html");
            return;
        }
        target.disabled = true;
        try {
            await apiRequest("/applications", { method: "POST", body: JSON.stringify({ userId: user.id, jobId: target.dataset.apply }) });
            target.textContent = "Application submitted";
            setNotice("Your application has been saved.");
        } catch (error) {
            setNotice(error.message, true);
            target.disabled = false;
        }
        return;
    }
    if (target.matches("[data-event-register]")) {
        const user = currentUser();
        if (!user) {
            location.assign("login.html");
            return;
        }
        target.disabled = true;
        try {
            const payload = await apiRequest("/event-registrations", { method: "POST", body: JSON.stringify({ userId: user.id, eventId: target.dataset.eventRegister }) });
            target.textContent = "Registered";
            setNotice(payload.message);
        } catch (error) {
            setNotice(error.message, true);
            target.disabled = false;
        }
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    updateAccountLinks();
    document.querySelectorAll("#currentYear").forEach((year) => year.textContent = new Date().getFullYear());
    const menuToggle = document.querySelector(".menu-toggle");
    menuToggle?.addEventListener("click", () => {
        const navigation = document.querySelector(".nav-container nav");
        const expanded = menuToggle.getAttribute("aria-expanded") === "true";
        menuToggle.setAttribute("aria-expanded", String(!expanded));
        navigation?.classList.toggle("show", !expanded);
    });
    try {
        await Promise.all([renderJobs(), renderCompanies(), renderEvents()]);
    } catch (error) {
        if (document.querySelector(".jobs-grid, .companies-grid, [data-events]")) setNotice("Could not load demo data. Start the website with: node server.js", true);
    }
});
