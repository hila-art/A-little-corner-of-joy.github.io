/* =========================================

A LITTLE CORNER OF JOY
script.js
Part 1

This piece includes:
- Login
- Logout
- Page navigation
- Daily quote
- Daily reminder
- Greeting
- Login persistence

========================================= */

/* =========================================
   ELEMENTS
========================================= */

const loginScreen = document.getElementById("login-screen");
const app = document.getElementById("app");

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

const loginButton = document.getElementById("loginBtn");
const logoutButton = document.getElementById("logoutBtn");

const greetingElement = document.getElementById("greeting");
const dailyQuoteElement = document.getElementById("dailyQuote");
const dailyReminderElement = document.getElementById("dailyReminder");

const navigationButtons = document.querySelectorAll(".nav-btn");
const pages = document.querySelectorAll(".page");

/* =========================================
   USER PROFILES
========================================= */

let currentProfileId = null;

/*
Creates a different storage ID for each
username + password combination.

The password itself is NOT placed directly
inside the localStorage key.
*/

function createProfileId(username, password) {

    const text =
        `${username.trim().toLowerCase()}|${password}`;

    let hash = 0;

    for (let i = 0; i < text.length; i++) {

        hash =
            ((hash << 5) - hash) +
            text.charCodeAt(i);

        hash |= 0;
    }

    return Math.abs(hash).toString(36);
}


/* Creates a storage key for the logged-in user */

function profileStorageKey(name) {

    if (!currentProfileId) {
        return null;
    }

    return `joyProfile_${currentProfileId}_${name}`;
}

/* =========================================
   MOVE OLD DATA TO HILA'S PROFILE

   This preserves everything that was saved
   before profiles existed.
========================================= */

function migrateOldDataToHila(
    username,
    password
) {

    if (
        username.trim().toLowerCase() !== "hila" ||
        password !== "1234"
    ) {
        return;
    }


    const oldStorage = {
        happyItems: "joyHappyItems",
        photos: "joyPhotos",
        spotifyPlaylists:
            "joySpotifyPlaylists"
    };


    Object.entries(oldStorage).forEach(
        ([newName, oldKey]) => {

            const newKey =
                profileStorageKey(newName);

            /*
            Only copy the old data if Hila
            does not already have profile data.
            */

            if (
                newKey &&
                localStorage.getItem(newKey) ===
                    null
            ) {

                const oldData =
                    localStorage.getItem(
                        oldKey
                    );

                if (oldData !== null) {

                    localStorage.setItem(
                        newKey,
                        oldData
                    );

                }
            }

        }
    );
}

/* =========================================
   DAILY QUOTES
========================================= */

const dailyQuotes = [
    "The world feels softer with a warm drink and a good book.",
    "Bloom at your own pace.",
    "Small joys can make the loveliest days.",
    "You are allowed to take your time.",
    "A quiet moment can still be a beautiful moment.",
    "Let today be gentle with you.",
    "You do not have to rush your story.",
    "There is something lovely waiting in every ordinary day.",
    "Soft mornings can become beautiful beginnings.",
    "Your presence makes the world a little warmer.",
    "Happiness often hides in the smallest moments.",
    "Take life one cozy moment at a time.",
    "Rest is part of growing too.",
    "You are doing better than you think.",
    "There is no wrong way to move at your own pace.",
    "A little kindness can brighten an entire day.",
    "Today is a lovely day to begin again.",
    "Make room for the things that bring you peace.",
    "You deserve moments that feel soft and safe.",
    "Something small can still be something wonderful.",
    "You are becoming more yourself every day.",
    "It is okay to choose comfort today.",
    "Your life does not have to be perfect to be beautiful.",
    "Notice the little things that make you smile.",
    "Slow days are still meaningful days.",
    "Let yourself enjoy the moment you are in.",
    "The little things matter more than they seem.",
    "You deserve a day filled with gentle moments.",
    "Keep a little space in your day for joy.",
    "There is beauty in beginning slowly.",
    "You are worthy of rest, care and kindness.",
    "Today can be simple and still be special.",
    "You make ordinary moments feel meaningful.",
    "Give yourself permission to breathe.",
    "There is comfort in taking things one step at a time.",
    "A warm drink and a quiet room can fix more than we realize.",
    "You do not need to have everything figured out today.",
    "Your softness is one of your strengths.",
    "Let this day unfold without rushing it.",
    "A peaceful heart makes a lovely home.",
    "Your journey is allowed to look different.",
    "Find joy in something small today.",
    "Every season of your life has something to teach you.",
    "Be proud of every little step forward.",
    "You deserve to feel proud of yourself.",
    "A cozy day is never a wasted day.",
    "The best moments are sometimes the quietest ones.",
    "Your pace is still progress.",
    "Make today feel like a warm hug.",
    "Choose softness whenever you can."
];

/* =========================================
   DAILY REMINDERS
========================================= */

const dailyReminders = [
    "Drink some water and take a little break.",
    "You are allowed to take your time.",
    "Hey, I am proud of you.",
    "Bloom at your own pace.",
    "You are always learning, growing and changing.",
    "Take a deep breath and relax your shoulders.",
    "You do not need to finish everything today.",
    "Eat something that makes you feel cared for.",
    "Put your phone down for a few quiet minutes.",
    "You deserve the same kindness you give to others.",
    "Open your curtains and let a little light in.",
    "Resting does not mean you are falling behind.",
    "Do one small thing that makes your space feel cozy.",
    "Remember to be patient with yourself.",
    "You have already made it through so many difficult days.",
    "It is okay to change your mind.",
    "Your feelings are allowed to take up space.",
    "Take a moment to notice something beautiful.",
    "You are not required to be productive all the time.",
    "Make yourself a warm or refreshing drink.",
    "Do not forget how much progress you have made.",
    "You can start again whenever you need to.",
    "Speak to yourself like you would speak to a friend.",
    "One small step is enough for today.",
    "You deserve a peaceful moment.",
    "Let yourself enjoy something without feeling guilty.",
    "Take a break before you feel completely exhausted.",
    "Your best can look different every day.",
    "You are worthy even on your quietest days.",
    "Remember to unclench your jaw.",
    "You do not have to earn your rest.",
    "Celebrate something small that you accomplished.",
    "Wear something that makes you feel comfortable.",
    "Spend a little time doing something just for fun.",
    "You are allowed to say no when you need to.",
    "Your needs matter too.",
    "Take things one moment at a time.",
    "Do not compare your beginning to someone else's middle.",
    "You are growing even when it does not feel obvious.",
    "Today does not have to be perfect.",
    "Give yourself credit for trying.",
    "You deserve gentleness from yourself.",
    "Pause and take three slow breaths.",
    "It is okay to have a slower day.",
    "Your small efforts still count.",
    "You can handle today one step at a time.",
    "Make room for one little thing you love.",
    "You are more capable than you realize.",
    "Let yourself rest without explaining why.",
    "Something good can still happen today."
];

/* =========================================
   DATE HELPERS

   The website creates one number for each
   calendar day. Refreshing the page on the
   same day will not change the quote.
========================================= */

function getDayNumber() {
    const now = new Date();

    const startOfYear = new Date(
        now.getFullYear(),
        0,
        0
    );

    const difference = now - startOfYear;

    const millisecondsInOneDay =
        1000 * 60 * 60 * 24;

    return Math.floor(
        difference / millisecondsInOneDay
    );
}

function setDailyContent() {
    const dayNumber = getDayNumber();

    const quoteIndex =
        dayNumber % dailyQuotes.length;

    const reminderIndex =
        dayNumber % dailyReminders.length;

    if (dailyQuoteElement) {
        dailyQuoteElement.textContent =
            `“${dailyQuotes[quoteIndex]}”`;
    }

    if (dailyReminderElement) {
        dailyReminderElement.textContent =
            dailyReminders[reminderIndex];
    }
}

/* =========================================
   GREETING
========================================= */

function updateGreeting() {
    if (!greetingElement) {
        return;
    }

    const currentHour = new Date().getHours();

    const savedUsername =
        localStorage.getItem("joyUsername");

    const name = savedUsername || "friend";

    let greetingText;

    if (currentHour >= 5 && currentHour < 12) {
        greetingText = `Good morning, ${name} ☀️`;
    } else if (
        currentHour >= 12 &&
        currentHour < 18
    ) {
        greetingText =
            `Good afternoon, ${name} 🌸`;
    } else {
        greetingText =
            `Good evening, ${name} 🌙`;
    }

    greetingElement.textContent = greetingText;
}

/* =========================================
   SHOW LOGIN
========================================= */

function showLoginScreen() {
    loginScreen.classList.remove("hidden");
    app.classList.add("hidden");

    passwordInput.value = "";
}

/* =========================================
   SHOW APP
========================================= */

function showApp() {
    loginScreen.classList.add("hidden");
    app.classList.remove("hidden");

    updateGreeting();
    setDailyContent();
    openPage("home");
}

/* =========================================
   LOGIN
========================================= */

function logIn() {

    const username =
        usernameInput.value.trim();

    const password =
        passwordInput.value.trim();


    if (username === "") {

        alert(
            "Please enter your username."
        );

        usernameInput.focus();

        return;
    }


    if (password === "") {

        alert(
            "Please enter your password."
        );

        passwordInput.focus();

        return;
    }


    /* Create this person's profile */

    currentProfileId =
        createProfileId(
            username,
            password
        );


    /* Preserve the things you already
       made as hila / 1234 */

    migrateOldDataToHila(
        username,
        password
    );


    /* Used for the greeting */

    localStorage.setItem(
        "joyUsername",
        username
    );


    /* Load THIS user's things */

    loadCurrentProfileData();


    showApp();
}

/* =========================================
   LOGOUT
========================================= */

function logOut() {

    currentProfileId = null;

    usernameInput.value = "";
    passwordInput.value = "";

    showLoginScreen();
}

/* =========================================
   PAGE NAVIGATION
========================================= */

function openPage(pageName) {
    pages.forEach((page) => {
        page.classList.remove("active-page");
    });

    navigationButtons.forEach((button) => {
        button.classList.remove("active");
    });

    const selectedPage =
        document.getElementById(pageName);

    const selectedButton =
        document.querySelector(
            `[data-page="${pageName}"]`
        );

    if (selectedPage) {
        selectedPage.classList.add(
            "active-page"
        );
    }

    if (selectedButton) {
        selectedButton.classList.add(
            "active"
        );
    }

    localStorage.setItem(
        "joyLastPage",
        pageName
    );

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

/* =========================================
   BUTTON EVENTS
========================================= */

loginButton.addEventListener(
    "click",
    logIn
);

logoutButton.addEventListener(
    "click",
    logOut
);

document.addEventListener("click", (event) => {
    const navigationButton =
        event.target.closest(".nav-btn");

    if (!navigationButton) {
        return;
    }

    const pageName =
        navigationButton.dataset.page;

    if (!pageName) {
        return;
    }

    openPage(pageName);
});

/* =========================================
   PRESS ENTER TO LOG IN
========================================= */

usernameInput.addEventListener(
    "keydown",
    (event) => {
        if (event.key === "Enter") {
            passwordInput.focus();
        }
    }
);

passwordInput.addEventListener(
    "keydown",
    (event) => {
        if (event.key === "Enter") {
            logIn();
        }
    }
);

/* =========================================
   START WEBSITE
========================================= */

function startWebsite() {
    showLoginScreen();

    const isLoggedIn =
        localStorage.getItem("joyLoggedIn");

    if (isLoggedIn === "true") {
        showApp();

        const lastPage =
            localStorage.getItem(
                "joyLastPage"
            );

        if (
            lastPage &&
            document.getElementById(lastPage)
        ) {
            openPage(lastPage);
        }
    } else {
        showLoginScreen();
    }
}

startWebsite();

/* =========================================
   HAPPY LIST
========================================= */

const happyTitleInput =
    document.getElementById("happyTitle");

const happyDescriptionInput =
    document.getElementById("happyDescription");

const happyCategoryInput =
    document.getElementById("happyCategory");

const addHappyButton =
    document.getElementById("addHappyBtn");

const clearHappyButton =
    document.getElementById("clearHappyBtn");

const happySearchInput =
    document.getElementById("happySearch");

const happyFilterInput =
    document.getElementById("happyFilter");

const happyItemsContainer =
    document.getElementById("happyItems");

const emptyHappyState =
    document.getElementById("emptyHappyState");

const happyCountElement =
    document.getElementById("happyCount");

const happyFormMessage =
    document.getElementById("happyFormMessage");

/* =========================================
   HAPPY LIST DATA
========================================= */

let happyItems = [];

let editingHappyItemId = null;

/* =========================================
   CATEGORY ICONS
========================================= */

const happyCategoryIcons = {
    "Little Joy": "🌸",
    "Memory": "📷",
    "Person": "💌",
    "Music": "🎵",
    "Cozy Moment": "☕",
    "Achievement": "✨"
};

/* =========================================
   LOAD SAVED HAPPY ITEMS
========================================= */

function loadHappyItems() {
    const savedItems =
        localStorage.getItem(
    profileStorageKey("happyItems")
);

    if (!savedItems) {
        happyItems = [];
        return;
    }

    try {
        const parsedItems =
            JSON.parse(savedItems);

        if (Array.isArray(parsedItems)) {
            happyItems = parsedItems;
        } else {
            happyItems = [];
        }
    } catch (error) {
        console.error(
            "Could not load the happy list:",
            error
        );

        happyItems = [];
    }
}

/* =========================================
   SAVE HAPPY ITEMS
========================================= */

function saveHappyItems() {
    localStorage.setItem(
    profileStorageKey("happyItems"),
    JSON.stringify(happyItems)
);
}

/* =========================================
   CREATE A UNIQUE ID
========================================= */

function createHappyItemId() {
    return (
        Date.now().toString() +
        Math.random()
            .toString(16)
            .slice(2)
    );
}

/* =========================================
   FORMAT DATE
========================================= */

function formatHappyDate(dateString) {
    const date = new Date(dateString);

    return date.toLocaleDateString(
        undefined,
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}

/* =========================================
   SAFELY DISPLAY TEXT
========================================= */

function escapeHappyText(text) {
    const temporaryElement =
        document.createElement("div");

    temporaryElement.textContent = text;

    return temporaryElement.innerHTML;
}

/* =========================================
   SHOW FORM MESSAGE
========================================= */

function showHappyFormMessage(message) {
    if (!happyFormMessage) {
        return;
    }

    happyFormMessage.textContent = message;

    window.clearTimeout(
        showHappyFormMessage.timeout
    );

    showHappyFormMessage.timeout =
        window.setTimeout(() => {
            happyFormMessage.textContent = "";
        }, 2500);
}

/* =========================================
   RESET FORM
========================================= */

function resetHappyForm() {
    happyTitleInput.value = "";
    happyDescriptionInput.value = "";
    happyCategoryInput.value = "Little Joy";

    editingHappyItemId = null;

    addHappyButton.textContent =
        "Add to My Happy List";
}

/* =========================================
   GET FILTERED ITEMS
========================================= */

function getFilteredHappyItems() {
    const searchText =
        happySearchInput.value
            .trim()
            .toLowerCase();

    const selectedCategory =
        happyFilterInput.value;

    return happyItems.filter((item) => {
        const matchesSearch =
            item.title
                .toLowerCase()
                .includes(searchText) ||
            item.description
                .toLowerCase()
                .includes(searchText) ||
            item.category
                .toLowerCase()
                .includes(searchText);

        const matchesCategory =
            selectedCategory === "All" ||
            item.category === selectedCategory;

        return (
            matchesSearch &&
            matchesCategory
        );
    });
}

/* =========================================
   UPDATE COUNTER
========================================= */

function updateHappyCounter() {
    happyCountElement.textContent =
        happyItems.length;
}

/* =========================================
   RENDER HAPPY LIST
========================================= */

function renderHappyItems() {
    const filteredItems =
        getFilteredHappyItems();

    happyItemsContainer.innerHTML = "";

    updateHappyCounter();

    if (filteredItems.length === 0) {
        emptyHappyState.classList.remove(
            "hidden"
        );

        if (
            happyItems.length > 0 &&
            (
                happySearchInput.value.trim() !== "" ||
                happyFilterInput.value !== "All"
            )
        ) {
            emptyHappyState.innerHTML = `
                <div class="empty-state-icon">🔎</div>
                <h4>No matching happy moments</h4>
                <p>Try another search or category.</p>
            `;
        } else {
            emptyHappyState.innerHTML = `
                <div class="empty-state-icon">🌷</div>
                <h4>Your happy list is waiting</h4>
                <p>Add your first happy moment using the form.</p>
            `;
        }

        return;
    }

    emptyHappyState.classList.add("hidden");

    const sortedItems =
        [...filteredItems].sort(
            (firstItem, secondItem) => {
                return (
                    new Date(secondItem.createdAt) -
                    new Date(firstItem.createdAt)
                );
            }
        );

    sortedItems.forEach((item) => {
        const happyItemElement =
            document.createElement("article");

        happyItemElement.className =
            "happy-item";

        const categoryIcon =
            happyCategoryIcons[item.category] ||
            "🌸";

        happyItemElement.innerHTML = `
            <div class="happy-item-top">

                <div>

                    <h4 class="happy-item-title">
                        ${escapeHappyText(item.title)}
                    </h4>

                    ${
                        item.description
                            ? `
                                <p class="happy-item-description">
                                    ${escapeHappyText(item.description)}
                                </p>
                            `
                            : ""
                    }

                </div>

                <div class="happy-actions">

                    <button
                        class="happy-action-button edit-happy-button"
                        type="button"
                        data-id="${item.id}"
                        title="Edit"
                        aria-label="Edit this happy moment"
                    >
                        ✏️
                    </button>

                    <button
                        class="happy-action-button delete-happy-button"
                        type="button"
                        data-id="${item.id}"
                        title="Delete"
                        aria-label="Delete this happy moment"
                    >
                        🗑️
                    </button>

                </div>

            </div>

            <div class="happy-item-footer">

                <span class="happy-category">
                    ${categoryIcon}
                    ${escapeHappyText(item.category)}
                </span>

                <span class="happy-date">
                    ${formatHappyDate(item.createdAt)}
                </span>

            </div>
        `;

        happyItemsContainer.appendChild(
            happyItemElement
        );
    });
}

/* =========================================
   ADD OR UPDATE HAPPY ITEM
========================================= */

function saveHappyFormItem() {
    const title =
        happyTitleInput.value.trim();

    const description =
        happyDescriptionInput.value.trim();

    const category =
        happyCategoryInput.value;

    if (title === "") {
        showHappyFormMessage(
            "Please write something that made you happy."
        );

        happyTitleInput.focus();
        return;
    }

    if (editingHappyItemId) {
        const itemToEdit =
            happyItems.find(
                (item) =>
                    item.id ===
                    editingHappyItemId
            );

        if (itemToEdit) {
            itemToEdit.title = title;
            itemToEdit.description =
                description;
            itemToEdit.category =
                category;
            itemToEdit.updatedAt =
                new Date().toISOString();

            showHappyFormMessage(
                "Your happy moment was updated 🩷"
            );
        }
    } else {
        const newHappyItem = {
            id: createHappyItemId(),
            title: title,
            description: description,
            category: category,
            createdAt:
                new Date().toISOString()
        };

        happyItems.push(newHappyItem);

        showHappyFormMessage(
            "Added to your happy list ✨"
        );
    }

    saveHappyItems();
    renderHappyItems();
    resetHappyForm();
}

/* =========================================
   EDIT HAPPY ITEM
========================================= */

function editHappyItem(itemId) {
    const itemToEdit =
        happyItems.find(
            (item) => item.id === itemId
        );

    if (!itemToEdit) {
        return;
    }

    editingHappyItemId = itemId;

    happyTitleInput.value =
        itemToEdit.title;

    happyDescriptionInput.value =
        itemToEdit.description;

    happyCategoryInput.value =
        itemToEdit.category;

    addHappyButton.textContent =
        "Save Changes";

    happyTitleInput.focus();

    happyTitleInput.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

/* =========================================
   DELETE HAPPY ITEM
========================================= */

function deleteHappyItem(itemId) {
    const itemToDelete =
        happyItems.find(
            (item) => item.id === itemId
        );

    if (!itemToDelete) {
        return;
    }

    const shouldDelete =
        window.confirm(
            `Delete “${itemToDelete.title}” from your happy list?`
        );

    if (!shouldDelete) {
        return;
    }

    happyItems =
        happyItems.filter(
            (item) => item.id !== itemId
        );

    if (editingHappyItemId === itemId) {
        resetHappyForm();
    }

    saveHappyItems();
    renderHappyItems();

    showHappyFormMessage(
        "The happy moment was deleted."
    );
}

/* =========================================
   CLEAR THE WHOLE LIST
========================================= */

function clearAllHappyItems() {
    if (happyItems.length === 0) {
        showHappyFormMessage(
            "Your happy list is already empty."
        );

        return;
    }

    const shouldClear =
        window.confirm(
            "Are you sure you want to delete every happy moment?"
        );

    if (!shouldClear) {
        return;
    }

    happyItems = [];

    saveHappyItems();
    resetHappyForm();
    renderHappyItems();

    showHappyFormMessage(
        "Your happy list was cleared."
    );
}

/* =========================================
   HAPPY LIST EVENTS
========================================= */

if (addHappyButton) {
    addHappyButton.addEventListener(
        "click",
        saveHappyFormItem
    );
}

if (clearHappyButton) {
    clearHappyButton.addEventListener(
        "click",
        clearAllHappyItems
    );
}

if (happySearchInput) {
    happySearchInput.addEventListener(
        "input",
        renderHappyItems
    );
}

if (happyFilterInput) {
    happyFilterInput.addEventListener(
        "change",
        renderHappyItems
    );
}

if (happyTitleInput) {
    happyTitleInput.addEventListener(
        "keydown",
        (event) => {
            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {
                event.preventDefault();
                saveHappyFormItem();
            }
        }
    );
}

/* =========================================
   EDIT AND DELETE BUTTON EVENTS

   Event delegation lets JavaScript detect
   buttons created later by renderHappyItems.
========================================= */

if (happyItemsContainer) {
    happyItemsContainer.addEventListener(
        "click",
        (event) => {
            const editButton =
                event.target.closest(
                    ".edit-happy-button"
                );

            const deleteButton =
                event.target.closest(
                    ".delete-happy-button"
                );

            if (editButton) {
                editHappyItem(
                    editButton.dataset.id
                );

                return;
            }

            if (deleteButton) {
                deleteHappyItem(
                    deleteButton.dataset.id
                );
            }
        }
    );
}

/* =========================================
   START HAPPY LIST
========================================= */

loadHappyItems();
renderHappyItems();

/* =========================================
   PHOTOS PAGE
========================================= */

const photoUploadInput =
    document.getElementById("photoUpload");

const photoUploadArea =
    document.getElementById("photoUploadArea");

const photoPreviewBox =
    document.getElementById("photoPreviewBox");

const photoPreviewImage =
    document.getElementById("photoPreview");

const removePhotoPreviewButton =
    document.getElementById(
        "removePhotoPreviewBtn"
    );

const photoCaptionInput =
    document.getElementById("photoCaption");

const photoStoryInput =
    document.getElementById("photoStory");

const savePhotoButton =
    document.getElementById("savePhotoBtn");

const clearPhotosButton =
    document.getElementById("clearPhotosBtn");

const photoSearchInput =
    document.getElementById("photoSearch");

const photoFilterInput =
    document.getElementById("photoFilter");

const photoGallery =
    document.getElementById("photoGallery");

const emptyPhotoState =
    document.getElementById("emptyPhotoState");

const photoCountElement =
    document.getElementById("photoCount");

const photoFormMessage =
    document.getElementById("photoFormMessage");

/* =========================================
   PHOTO MODAL ELEMENTS
========================================= */

const photoModal =
    document.getElementById("photoModal");

const closePhotoModalButton =
    document.getElementById(
        "closePhotoModalBtn"
    );

const photoModalBackdrop =
    document.querySelector(
        ".photo-modal-backdrop"
    );

const modalPhoto =
    document.getElementById("modalPhoto");

const modalPhotoCaption =
    document.getElementById(
        "modalPhotoCaption"
    );

const modalPhotoStory =
    document.getElementById("modalPhotoStory");

const modalFavoriteButton =
    document.getElementById(
        "modalFavoriteBtn"
    );

const modalDownloadButton =
    document.getElementById(
        "modalDownloadBtn"
    );

const modalDeleteButton =
    document.getElementById(
        "modalDeleteBtn"
    );

/* =========================================
   PHOTO DATA
========================================= */

let savedPhotos = [];

let selectedPhotoData = "";

let openedPhotoId = null;

/* =========================================
   LOAD SAVED PHOTOS
========================================= */

function loadSavedPhotos() {
    const storedPhotos =
        localStorage.getItem(
    profileStorageKey("photos")
);

    if (!storedPhotos) {
        savedPhotos = [];
        return;
    }

    try {
        const parsedPhotos =
            JSON.parse(storedPhotos);

        if (Array.isArray(parsedPhotos)) {
            savedPhotos = parsedPhotos;
        } else {
            savedPhotos = [];
        }
    } catch (error) {
        console.error(
            "Could not load photos:",
            error
        );

        savedPhotos = [];
    }
}

/* =========================================
   SAVE PHOTOS
========================================= */

function savePhotosToStorage() {
    try {
        localStorage.setItem(
    profileStorageKey("photos"),
    JSON.stringify(savedPhotos)
);

        return true;
    } catch (error) {
        console.error(
            "Could not save photos:",
            error
        );

        showPhotoMessage(
            "This photo may be too large. Try a smaller image."
        );

        return false;
    }
}

/* =========================================
   CREATE PHOTO ID
========================================= */

function createPhotoId() {
    return (
        Date.now().toString() +
        Math.random()
            .toString(16)
            .slice(2)
    );
}

/* =========================================
   SHOW PHOTO MESSAGE
========================================= */

function showPhotoMessage(message) {
    if (!photoFormMessage) {
        return;
    }

    photoFormMessage.textContent = message;

    window.clearTimeout(
        showPhotoMessage.timeout
    );

    showPhotoMessage.timeout =
        window.setTimeout(() => {
            photoFormMessage.textContent = "";
        }, 3000);
}

/* =========================================
   FORMAT PHOTO DATE
========================================= */

function formatPhotoDate(dateString) {
    const date = new Date(dateString);

    return date.toLocaleDateString(
        undefined,
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}

/* =========================================
   SAFE TEXT
========================================= */

function escapePhotoText(text) {
    const temporaryElement =
        document.createElement("div");

    temporaryElement.textContent =
        text || "";

    return temporaryElement.innerHTML;
}

/* =========================================
   READ SELECTED PHOTO
========================================= */

function handlePhotoFile(file) {
    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {
        showPhotoMessage(
            "Please choose an image file."
        );

        return;
    }

    const maximumSize =
        5 * 1024 * 1024;

    if (file.size > maximumSize) {
        showPhotoMessage(
            "Please choose an image smaller than 5 MB."
        );

        photoUploadInput.value = "";
        return;
    }

    const reader = new FileReader();

    reader.addEventListener(
        "load",
        () => {
            selectedPhotoData =
                reader.result;

            photoPreviewImage.src =
                selectedPhotoData;

            photoPreviewBox.classList.remove(
                "hidden"
            );
        }
    );

    reader.addEventListener(
        "error",
        () => {
            showPhotoMessage(
                "The photo could not be opened."
            );
        }
    );

    reader.readAsDataURL(file);
}

/* =========================================
   REMOVE PREVIEW
========================================= */

function removePhotoPreview() {
    selectedPhotoData = "";

    photoUploadInput.value = "";

    photoPreviewImage.src = "";

    photoPreviewBox.classList.add(
        "hidden"
    );
}

/* =========================================
   RESET PHOTO FORM
========================================= */

function resetPhotoForm() {
    removePhotoPreview();

    photoCaptionInput.value = "";
    photoStoryInput.value = "";
}

/* =========================================
   GET FILTERED PHOTOS
========================================= */

function getFilteredPhotos() {
    const searchText =
        photoSearchInput.value
            .trim()
            .toLowerCase();

    const selectedFilter =
        photoFilterInput.value;

    return savedPhotos.filter((photo) => {
        const caption =
            photo.caption || "";

        const story =
            photo.story || "";

        const matchesSearch =
            caption
                .toLowerCase()
                .includes(searchText) ||
            story
                .toLowerCase()
                .includes(searchText);

        const matchesFilter =
            selectedFilter === "all" ||
            (
                selectedFilter ===
                    "favorites" &&
                photo.favorite === true
            );

        return (
            matchesSearch &&
            matchesFilter
        );
    });
}

/* =========================================
   UPDATE PHOTO COUNTER
========================================= */

function updatePhotoCounter() {
    if (!photoCountElement) {
        return;
    }

    photoCountElement.textContent =
        savedPhotos.length;
}

/* =========================================
   RENDER PHOTO GALLERY
========================================= */

function renderPhotoGallery() {
    if (!photoGallery) {
        return;
    }

    const filteredPhotos =
        getFilteredPhotos();

    photoGallery.innerHTML = "";

    updatePhotoCounter();

    if (filteredPhotos.length === 0) {
        emptyPhotoState.classList.remove(
            "hidden"
        );

        if (
            savedPhotos.length > 0 &&
            (
                photoSearchInput.value.trim() !==
                    "" ||
                photoFilterInput.value !==
                    "all"
            )
        ) {
            emptyPhotoState.innerHTML = `
                <div class="empty-state-icon">
                    🔎
                </div>

                <h4>No matching photos</h4>

                <p>
                    Try another search or filter.
                </p>
            `;
        } else {
            emptyPhotoState.innerHTML = `
                <div class="empty-state-icon">
                    📷
                </div>

                <h4>Your gallery is waiting</h4>

                <p>
                    Upload your first cozy memory.
                </p>
            `;
        }

        return;
    }

    emptyPhotoState.classList.add(
        "hidden"
    );

    const sortedPhotos =
        [...filteredPhotos].sort(
            (firstPhoto, secondPhoto) => {
                return (
                    new Date(
                        secondPhoto.createdAt
                    ) -
                    new Date(
                        firstPhoto.createdAt
                    )
                );
            }
        );

    sortedPhotos.forEach((photo) => {
        const photoCard =
            document.createElement("article");

        photoCard.className = "photo-card";

        photoCard.innerHTML = `
            <div
                class="photo-card-image-wrapper"
                data-photo-id="${photo.id}"
                tabindex="0"
                role="button"
                aria-label="Open ${
                    escapePhotoText(
                        photo.caption ||
                            "saved photo"
                    )
                }"
            >

                <img
                    class="photo-card-image"
                    src="${photo.imageData}"
                    alt="${escapePhotoText(
                        photo.caption ||
                            "Saved memory"
                    )}"
                >

                <div class="photo-card-overlay">

                    <span class="photo-view-text">
                        View memory
                    </span>

                    <button
                        class="photo-favorite-button ${
                            photo.favorite
                                ? "is-favorite"
                                : ""
                        }"
                        type="button"
                        data-favorite-id="${photo.id}"
                        aria-label="${
                            photo.favorite
                                ? "Remove from favorites"
                                : "Add to favorites"
                        }"
                    >
                        ${
                            photo.favorite
                                ? "♥"
                                : "♡"
                        }
                    </button>

                </div>

            </div>

            <div class="photo-card-details">

                <h4 class="photo-card-caption">
                    ${escapePhotoText(
                        photo.caption ||
                            "A lovely memory"
                    )}
                </h4>

                ${
                    photo.story
                        ? `
                            <p class="photo-card-story">
                                ${escapePhotoText(
                                    photo.story
                                )}
                            </p>
                        `
                        : ""
                }

                <span class="photo-card-date">
                    ${formatPhotoDate(
                        photo.createdAt
                    )}
                </span>

            </div>
        `;

        photoGallery.appendChild(
            photoCard
        );
    });
}

/* =========================================
   SAVE NEW PHOTO
========================================= */

function saveNewPhoto() {
    if (!selectedPhotoData) {
        showPhotoMessage(
            "Please choose a photo first."
        );

        return;
    }

    const caption =
        photoCaptionInput.value.trim();

    const story =
        photoStoryInput.value.trim();

    const newPhoto = {
        id: createPhotoId(),
        imageData: selectedPhotoData,
        caption:
            caption || "A lovely memory",
        story: story,
        favorite: false,
        createdAt:
            new Date().toISOString()
    };

    savedPhotos.push(newPhoto);

    const savedSuccessfully =
        savePhotosToStorage();

    if (!savedSuccessfully) {
        savedPhotos =
            savedPhotos.filter(
                (photo) =>
                    photo.id !== newPhoto.id
            );

        return;
    }

    resetPhotoForm();
    renderPhotoGallery();

    showPhotoMessage(
        "Your memory was saved 🩷"
    );
}

/* =========================================
   TOGGLE FAVORITE
========================================= */

function togglePhotoFavorite(photoId) {
    const selectedPhoto =
        savedPhotos.find(
            (photo) => photo.id === photoId
        );

    if (!selectedPhoto) {
        return;
    }

    selectedPhoto.favorite =
        !selectedPhoto.favorite;

    savePhotosToStorage();
    renderPhotoGallery();

    if (
        openedPhotoId === photoId &&
        !photoModal.classList.contains(
            "hidden"
        )
    ) {
        updatePhotoModal(
            selectedPhoto
        );
    }
}

/* =========================================
   UPDATE PHOTO MODAL
========================================= */

function updatePhotoModal(photo) {
    modalPhoto.src =
        photo.imageData;

    modalPhoto.alt =
        photo.caption ||
        "Saved memory";

    modalPhotoCaption.textContent =
        photo.caption ||
        "A lovely memory";

    modalPhotoStory.textContent =
        photo.story ||
        "No story was added to this memory.";

    modalFavoriteButton.textContent =
        photo.favorite
            ? "♥ Favorited"
            : "♡ Favorite";

    modalDownloadButton.href =
        photo.imageData;

    const safeFilename =
        (
            photo.caption ||
            "cozy-memory"
        )
            .replace(
                /[^a-z0-9]+/gi,
                "-"
            )
            .replace(
                /^-|-$/g,
                ""
            )
            .toLowerCase();

    modalDownloadButton.download =
        `${safeFilename || "cozy-memory"}.png`;
}

/* =========================================
   OPEN PHOTO MODAL
========================================= */

function openPhotoModal(photoId) {
    const selectedPhoto =
        savedPhotos.find(
            (photo) => photo.id === photoId
        );

    if (!selectedPhoto) {
        return;
    }

    openedPhotoId = photoId;

    updatePhotoModal(selectedPhoto);

    photoModal.classList.remove(
        "hidden"
    );

    document.body.classList.add(
        "modal-open"
    );

    closePhotoModalButton.focus();
}

/* =========================================
   CLOSE PHOTO MODAL
========================================= */

function closePhotoModal() {
    photoModal.classList.add(
        "hidden"
    );

    document.body.classList.remove(
        "modal-open"
    );

    openedPhotoId = null;
}

/* =========================================
   DELETE ONE PHOTO
========================================= */

function deletePhoto(photoId) {
    const photoToDelete =
        savedPhotos.find(
            (photo) => photo.id === photoId
        );

    if (!photoToDelete) {
        return;
    }

    const shouldDelete =
        window.confirm(
            `Delete “${photoToDelete.caption}” from your gallery?`
        );

    if (!shouldDelete) {
        return;
    }

    savedPhotos =
        savedPhotos.filter(
            (photo) => photo.id !== photoId
        );

    savePhotosToStorage();

    if (openedPhotoId === photoId) {
        closePhotoModal();
    }

    renderPhotoGallery();

    showPhotoMessage(
        "The photo was deleted."
    );
}

/* =========================================
   CLEAR ALL PHOTOS
========================================= */

function clearAllPhotos() {
    if (savedPhotos.length === 0) {
        showPhotoMessage(
            "Your gallery is already empty."
        );

        return;
    }

    const shouldClear =
        window.confirm(
            "Are you sure you want to delete every saved photo?"
        );

    if (!shouldClear) {
        return;
    }

    savedPhotos = [];

    savePhotosToStorage();

    closePhotoModal();
    renderPhotoGallery();

    showPhotoMessage(
        "Your gallery was cleared."
    );
}

/* =========================================
   PHOTO INPUT EVENTS
========================================= */

if (photoUploadInput) {
    photoUploadInput.addEventListener(
        "change",
        () => {
            const selectedFile =
                photoUploadInput.files[0];

            handlePhotoFile(
                selectedFile
            );
        }
    );
}

if (removePhotoPreviewButton) {
    removePhotoPreviewButton.addEventListener(
        "click",
        removePhotoPreview
    );
}

if (savePhotoButton) {
    savePhotoButton.addEventListener(
        "click",
        saveNewPhoto
    );
}

if (clearPhotosButton) {
    clearPhotosButton.addEventListener(
        "click",
        clearAllPhotos
    );
}

if (photoSearchInput) {
    photoSearchInput.addEventListener(
        "input",
        renderPhotoGallery
    );
}

if (photoFilterInput) {
    photoFilterInput.addEventListener(
        "change",
        renderPhotoGallery
    );
}

/* =========================================
   DRAG AND DROP
========================================= */

if (photoUploadArea) {
    photoUploadArea.addEventListener(
        "dragover",
        (event) => {
            event.preventDefault();

            photoUploadArea.classList.add(
                "dragging"
            );
        }
    );

    photoUploadArea.addEventListener(
        "dragleave",
        () => {
            photoUploadArea.classList.remove(
                "dragging"
            );
        }
    );

    photoUploadArea.addEventListener(
        "drop",
        (event) => {
            event.preventDefault();

            photoUploadArea.classList.remove(
                "dragging"
            );

            const droppedFile =
                event.dataTransfer.files[0];

            handlePhotoFile(
                droppedFile
            );
        }
    );
}

/* =========================================
   GALLERY BUTTON EVENTS
========================================= */

if (photoGallery) {
    photoGallery.addEventListener(
        "click",
        (event) => {
            const favoriteButton =
                event.target.closest(
                    "[data-favorite-id]"
                );

            if (favoriteButton) {
                event.stopPropagation();

                togglePhotoFavorite(
                    favoriteButton.dataset
                        .favoriteId
                );

                return;
            }

            const imageWrapper =
                event.target.closest(
                    "[data-photo-id]"
                );

            if (imageWrapper) {
                openPhotoModal(
                    imageWrapper.dataset
                        .photoId
                );
            }
        }
    );

    photoGallery.addEventListener(
        "keydown",
        (event) => {
            const imageWrapper =
                event.target.closest(
                    "[data-photo-id]"
                );

            if (
                imageWrapper &&
                (
                    event.key === "Enter" ||
                    event.key === " "
                )
            ) {
                event.preventDefault();

                openPhotoModal(
                    imageWrapper.dataset
                        .photoId
                );
            }
        }
    );
}

/* =========================================
   MODAL EVENTS
========================================= */

if (closePhotoModalButton) {
    closePhotoModalButton.addEventListener(
        "click",
        closePhotoModal
    );
}

if (photoModalBackdrop) {
    photoModalBackdrop.addEventListener(
        "click",
        closePhotoModal
    );
}

if (modalFavoriteButton) {
    modalFavoriteButton.addEventListener(
        "click",
        () => {
            if (!openedPhotoId) {
                return;
            }

            togglePhotoFavorite(
                openedPhotoId
            );
        }
    );
}

if (modalDeleteButton) {
    modalDeleteButton.addEventListener(
        "click",
        () => {
            if (!openedPhotoId) {
                return;
            }

            deletePhoto(
                openedPhotoId
            );
        }
    );
}

document.addEventListener(
    "keydown",
    (event) => {
        if (
            event.key === "Escape" &&
            photoModal &&
            !photoModal.classList.contains(
                "hidden"
            )
        ) {
            closePhotoModal();
        }
    }
);

/* =========================================
   START PHOTOS PAGE
========================================= */

loadSavedPhotos();
renderPhotoGallery();

/* =========================================
   INSPIRATION BOARD
========================================= */

/* =========================================
   INSPIRATION PAGE — VIEW ONLY
   Category filtering
========================================= */

const inspirationCategoryButtons =
    document.querySelectorAll(
        ".inspiration-category-button"
    );

const inspirationPhotoCards =
    document.querySelectorAll(
        ".inspiration-photo-card"
    );

/* =========================================
   FILTER INSPIRATION PHOTOS
========================================= */

function filterInspirationPhotos(category) {

    inspirationPhotoCards.forEach(
        (card) => {

            const cardCategory =
                card.dataset.category;

            const shouldShow =
                category === "All" ||
                cardCategory === category;

            if (shouldShow) {
                card.classList.remove(
                    "inspiration-hidden"
                );
            } else {
                card.classList.add(
                    "inspiration-hidden"
                );
            }
        }
    );
}

/* =========================================
   CATEGORY BUTTONS
========================================= */

inspirationCategoryButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                const selectedCategory =
                    button.dataset
                        .galleryCategory;

                if (!selectedCategory) {
                    return;
                }

                /* Remove active style */

                inspirationCategoryButtons.forEach(
                    (categoryButton) => {

                        categoryButton.classList.remove(
                            "active-inspiration-category"
                        );
                    }
                );

                /* Add active style */

                button.classList.add(
                    "active-inspiration-category"
                );

                /* Filter photos */

                filterInspirationPhotos(
                    selectedCategory
                );
            }
        );
    }
);

/* =========================================
   START WITH ALL PHOTOS
========================================= */

filterInspirationPhotos("All");

/* =========================================
   SPOTIFY PLAYLIST PAGE
========================================= */

const spotifyCoverInput =
    document.getElementById("spotifyCoverInput");

const spotifyCoverUploadArea =
    document.getElementById("spotifyCoverUploadArea");

const spotifyCoverPreviewBox =
    document.getElementById("spotifyCoverPreviewBox");

const spotifyCoverPreview =
    document.getElementById("spotifyCoverPreview");

const removeSpotifyCoverButton =
    document.getElementById("removeSpotifyCoverBtn");

const spotifyPlaylistNameInput =
    document.getElementById("spotifyPlaylistName");

const spotifyPlaylistDescriptionInput =
    document.getElementById("spotifyPlaylistDescription");

const spotifyPlaylistMoodInput =
    document.getElementById("spotifyPlaylistMood");

const spotifyPlaylistLinkInput =
    document.getElementById("spotifyPlaylistLink");

const addSpotifyPlaylistButton =
    document.getElementById("addSpotifyPlaylistBtn");

const spotifyPlaylistMessage =
    document.getElementById("spotifyPlaylistMessage");

const spotifyPlaylistCount =
    document.getElementById("spotifyPlaylistCount");

const spotifyPlaylistCollection =
    document.getElementById("spotifyPlaylistCollection");

const spotifyEmptyState =
    document.getElementById("spotifyEmptyState");

const spotifyPlaylistSearch =
    document.getElementById("spotifyPlaylistSearch");

const spotifyPlaylistSort =
    document.getElementById("spotifyPlaylistSort");

const clearSpotifyPlaylistsButton =
    document.getElementById("clearSpotifyPlaylistsBtn");

const spotifyMoodButtons =
    document.querySelectorAll(".spotify-mood-button");

/* Modal */

const spotifyPlaylistModal =
    document.getElementById("spotifyPlaylistModal");

const spotifyModalBackdrop =
    document.querySelector(".spotify-modal-backdrop");

const closeSpotifyModalButton =
    document.getElementById("closeSpotifyModalBtn");

const spotifyModalCover =
    document.getElementById("spotifyModalCover");

const spotifyModalMood =
    document.getElementById("spotifyModalMood");

const spotifyModalName =
    document.getElementById("spotifyModalName");

const spotifyModalDescription =
    document.getElementById("spotifyModalDescription");

const spotifyEmbedContainer =
    document.getElementById("spotifyEmbedContainer");

const openSpotifyPlaylistButton =
    document.getElementById("openSpotifyPlaylistBtn");

const favoriteSpotifyPlaylistButton =
    document.getElementById("favoriteSpotifyPlaylistBtn");

const deleteSpotifyPlaylistButton =
    document.getElementById("deleteSpotifyPlaylistBtn");

/* =========================================
   PLAYLIST DATA
========================================= */

let spotifyPlaylists = [];

let selectedSpotifyCover = "";

let activeSpotifyMood = "All";

let openedSpotifyPlaylistId = null;

/* =========================================
   STORAGE
========================================= */

function loadSpotifyPlaylists() {
    const savedData =
        localStorage.getItem(
    profileStorageKey(
        "spotifyPlaylists"
    )
);

    if (!savedData) {
        spotifyPlaylists = [];
        return;
    }

    try {
        const parsedData =
            JSON.parse(savedData);

        spotifyPlaylists =
            Array.isArray(parsedData)
                ? parsedData
                : [];
    } catch (error) {
        console.error(
            "Could not load Spotify playlists:",
            error
        );

        spotifyPlaylists = [];
    }
}

function saveSpotifyPlaylists() {
    try {
        localStorage.setItem(
    profileStorageKey(
        "spotifyPlaylists"
    ),
    JSON.stringify(
        spotifyPlaylists
    )
);

        return true;
    } catch (error) {
        console.error(
            "Could not save Spotify playlists:",
            error
        );

        showSpotifyMessage(
            "The playlist could not be saved. Try a smaller cover image."
        );

        return false;
    }
}

/* =========================================
   HELPERS
========================================= */

function createSpotifyPlaylistId() {
    if (
        window.crypto &&
        typeof window.crypto.randomUUID === "function"
    ) {
        return window.crypto.randomUUID();
    }

    return (
        Date.now().toString() +
        Math.random().toString(16).slice(2)
    );
}

function escapeSpotifyText(value) {
    const temporaryElement =
        document.createElement("div");

    temporaryElement.textContent =
        value || "";

    return temporaryElement.innerHTML;
}

function showSpotifyMessage(message) {
    if (!spotifyPlaylistMessage) {
        return;
    }

    spotifyPlaylistMessage.textContent =
        message;

    clearTimeout(
        showSpotifyMessage.timeout
    );

    showSpotifyMessage.timeout =
        setTimeout(() => {
            spotifyPlaylistMessage.textContent = "";
        }, 3500);
}

function getSpotifyMoodEmoji(mood) {
    const emojis = {
        Cozy: "☕",
        Calm: "☁️",
        Happy: "🌸",
        Dreamy: "🌙",
        Study: "📚",
        Comfort: "💌"
    };

    return emojis[mood] || "🎵";
}

/* =========================================
   SPOTIFY LINK CONVERSION
========================================= */

function getSpotifyPlaylistId(link) {
    if (!link) {
        return null;
    }

    const trimmedLink =
        link.trim();

    /* Standard Spotify URL */

    const urlMatch =
        trimmedLink.match(
            /open\.spotify\.com\/(?:embed\/)?playlist\/([a-zA-Z0-9]+)/
        );

    if (urlMatch) {
        return urlMatch[1];
    }

    /* Spotify URI */

    const uriMatch =
        trimmedLink.match(
            /^spotify:playlist:([a-zA-Z0-9]+)$/
        );

    if (uriMatch) {
        return uriMatch[1];
    }

    return null;
}

function getSpotifyNormalUrl(playlistId) {
    return (
        "https://open.spotify.com/playlist/" +
        encodeURIComponent(playlistId)
    );
}

function getSpotifyEmbedUrl(playlistId) {
    return (
        "https://open.spotify.com/embed/playlist/" +
        encodeURIComponent(playlistId) +
        "?utm_source=generator"
    );
}

/* =========================================
   DEFAULT COVER
========================================= */

function createDefaultSpotifyCover(mood) {
    const emoji =
        getSpotifyMoodEmoji(mood);

    const svg = `
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="700"
            height="700"
            viewBox="0 0 700 700">

            <defs>
                <linearGradient
                    id="spotifyCoverGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1">

                    <stop
                        offset="0%"
                        stop-color="#ffe5f0">
                    </stop>

                    <stop
                        offset="100%"
                        stop-color="#dfcff2">
                    </stop>

                </linearGradient>
            </defs>

            <rect
                width="700"
                height="700"
                fill="url(#spotifyCoverGradient)">
            </rect>

            <circle
                cx="145"
                cy="130"
                r="150"
                fill="rgba(255,255,255,0.32)">
            </circle>

            <text
                x="350"
                y="405"
                text-anchor="middle"
                font-size="190"
                font-family="Arial, sans-serif">
                ${emoji}
            </text>

        </svg>
    `;

    return (
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(svg)
    );
}

/* =========================================
   COVER UPLOAD
========================================= */

function handleSpotifyCoverFile(file) {
    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {
        showSpotifyMessage(
            "Please choose an image file."
        );

        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        showSpotifyMessage(
            "Please choose an image smaller than 5 MB."
        );

        return;
    }

    const reader =
        new FileReader();

    reader.addEventListener(
        "load",
        () => {
            selectedSpotifyCover =
                reader.result;

            if (spotifyCoverPreview) {
                spotifyCoverPreview.src =
                    selectedSpotifyCover;
            }

            if (spotifyCoverPreviewBox) {
                spotifyCoverPreviewBox.classList.remove(
                    "hidden"
                );
            }
        }
    );

    reader.addEventListener(
        "error",
        () => {
            showSpotifyMessage(
                "The cover image could not be opened."
            );
        }
    );

    reader.readAsDataURL(file);
}

function removeSpotifyCover() {
    selectedSpotifyCover = "";

    if (spotifyCoverInput) {
        spotifyCoverInput.value = "";
    }

    if (spotifyCoverPreview) {
        spotifyCoverPreview.src = "";
    }

    if (spotifyCoverPreviewBox) {
        spotifyCoverPreviewBox.classList.add(
            "hidden"
        );
    }
}

/* =========================================
   RESET FORM
========================================= */

function resetSpotifyPlaylistForm() {
    removeSpotifyCover();

    if (spotifyPlaylistNameInput) {
        spotifyPlaylistNameInput.value = "";
    }

    if (spotifyPlaylistDescriptionInput) {
        spotifyPlaylistDescriptionInput.value = "";
    }

    if (spotifyPlaylistMoodInput) {
        spotifyPlaylistMoodInput.value = "Cozy";
    }

    if (spotifyPlaylistLinkInput) {
        spotifyPlaylistLinkInput.value = "";
    }
}

/* =========================================
   ADD PLAYLIST
========================================= */

function addSpotifyPlaylist() {
    const name =
        spotifyPlaylistNameInput
            ? spotifyPlaylistNameInput.value.trim()
            : "";

    const description =
        spotifyPlaylistDescriptionInput
            ? spotifyPlaylistDescriptionInput.value.trim()
            : "";

    const mood =
        spotifyPlaylistMoodInput
            ? spotifyPlaylistMoodInput.value
            : "Cozy";

    const pastedLink =
        spotifyPlaylistLinkInput
            ? spotifyPlaylistLinkInput.value.trim()
            : "";

    if (!name) {
        showSpotifyMessage(
            "Please give the playlist a name."
        );

        spotifyPlaylistNameInput?.focus();
        return;
    }

    if (!pastedLink) {
        showSpotifyMessage(
            "Please paste the Spotify playlist link."
        );

        spotifyPlaylistLinkInput?.focus();
        return;
    }

    const spotifyId =
        getSpotifyPlaylistId(pastedLink);

    if (!spotifyId) {
        showSpotifyMessage(
            "That does not look like a Spotify playlist link."
        );

        spotifyPlaylistLinkInput?.focus();
        return;
    }

    const duplicatePlaylist =
        spotifyPlaylists.some(
            (playlist) =>
                playlist.spotifyId === spotifyId
        );

    if (duplicatePlaylist) {
        showSpotifyMessage(
            "This Spotify playlist is already in your collection."
        );

        return;
    }

    const newPlaylist = {
        id: createSpotifyPlaylistId(),
        name,
        description,
        mood,
        coverImage: selectedSpotifyCover,
        spotifyId,
        spotifyUrl:
            getSpotifyNormalUrl(spotifyId),
        favorite: false,
        createdAt:
            new Date().toISOString()
    };

    spotifyPlaylists.unshift(
        newPlaylist
    );

    if (!saveSpotifyPlaylists()) {
        spotifyPlaylists =
            spotifyPlaylists.filter(
                (playlist) =>
                    playlist.id !==
                    newPlaylist.id
            );

        return;
    }

    resetSpotifyPlaylistForm();

    renderSpotifyPlaylists();

    showSpotifyMessage(
        `“${newPlaylist.name}” was added 🎵`
    );
}

/* =========================================
   FILTER AND SORT
========================================= */

function getFilteredSpotifyPlaylists() {
    const searchText =
        spotifyPlaylistSearch
            ? spotifyPlaylistSearch.value
                .trim()
                .toLowerCase()
            : "";

    return spotifyPlaylists.filter(
        (playlist) => {
            const matchesSearch =
                (playlist.name || "")
                    .toLowerCase()
                    .includes(searchText) ||
                (playlist.description || "")
                    .toLowerCase()
                    .includes(searchText) ||
                (playlist.mood || "")
                    .toLowerCase()
                    .includes(searchText);

            const matchesMood =
                activeSpotifyMood === "All" ||
                playlist.mood === activeSpotifyMood;

            return (
                matchesSearch &&
                matchesMood
            );
        }
    );
}

function sortSpotifyPlaylists(playlists) {
    const sortType =
        spotifyPlaylistSort
            ? spotifyPlaylistSort.value
            : "newest";

    const sorted =
        [...playlists];

    if (sortType === "oldest") {
        sorted.sort(
            (first, second) =>
                new Date(first.createdAt) -
                new Date(second.createdAt)
        );
    } else if (sortType === "name") {
        sorted.sort(
            (first, second) =>
                (first.name || "")
                    .localeCompare(second.name || "")
        );
    } else if (sortType === "favorites") {
        sorted.sort(
            (first, second) => {
                if (
                    first.favorite ===
                    second.favorite
                ) {
                    return (
                        new Date(second.createdAt) -
                        new Date(first.createdAt)
                    );
                }

                return first.favorite ? -1 : 1;
            }
        );
    } else {
        sorted.sort(
            (first, second) =>
                new Date(second.createdAt) -
                new Date(first.createdAt)
        );
    }

    return sorted;
}

/* =========================================
   RENDER PLAYLIST CARDS
========================================= */

function renderSpotifyPlaylists() {
    if (!spotifyPlaylistCollection) {
        return;
    }

    const filtered =
        getFilteredSpotifyPlaylists();

    const sorted =
        sortSpotifyPlaylists(filtered);

    spotifyPlaylistCollection.innerHTML = "";

    if (spotifyPlaylistCount) {
        spotifyPlaylistCount.textContent =
            spotifyPlaylists.length;
    }

    if (sorted.length === 0) {
        if (spotifyEmptyState) {
            spotifyEmptyState.classList.remove(
                "hidden"
            );

            const filtersActive =
                activeSpotifyMood !== "All" ||
                (
                    spotifyPlaylistSearch &&
                    spotifyPlaylistSearch.value.trim()
                );

            if (
                spotifyPlaylists.length > 0 &&
                filtersActive
            ) {
                spotifyEmptyState.innerHTML = `
                    <div class="spotify-empty-icon">
                        🔎
                    </div>

                    <h4>No matching playlists</h4>

                    <p>
                        Try another search or mood.
                    </p>
                `;
            } else {
                spotifyEmptyState.innerHTML = `
                    <div class="spotify-empty-icon">
                        🎧
                    </div>

                    <h4>Your collection is waiting</h4>

                    <p>
                        Add your first Spotify playlist.
                    </p>
                `;
            }
        }

        return;
    }

    spotifyEmptyState?.classList.add(
        "hidden"
    );

    sorted.forEach(
        (playlist) => {
            const card =
                document.createElement("article");

            card.className =
                "spotify-playlist-card";

            card.dataset.spotifyPlaylistId =
                playlist.id;

            card.tabIndex = 0;

            card.setAttribute(
                "role",
                "button"
            );

            card.setAttribute(
                "aria-label",
                `Open ${playlist.name}`
            );

            const cover =
                playlist.coverImage ||
                createDefaultSpotifyCover(
                    playlist.mood
                );

            card.innerHTML = `
                <div class="spotify-card-cover-wrapper">

                    <img
                        class="spotify-card-cover"
                        src="${cover}"
                        alt="${escapeSpotifyText(
                            playlist.name
                        )} cover"
                    >

                    <button
                        class="spotify-card-favorite ${
                            playlist.favorite
                                ? "is-favorite"
                                : ""
                        }"
                        type="button"
                        data-favorite-spotify-playlist="${
                            playlist.id
                        }"
                        aria-label="${
                            playlist.favorite
                                ? "Remove from favorites"
                                : "Add to favorites"
                        }">

                        ${
                            playlist.favorite
                                ? "♥"
                                : "♡"
                        }

                    </button>

                </div>

                <div class="spotify-card-content">

                    <h4>
                        ${escapeSpotifyText(
                            playlist.name
                        )}
                    </h4>

                    ${
                        playlist.description
                            ? `
                                <p class="spotify-card-description">
                                    ${escapeSpotifyText(
                                        playlist.description
                                    )}
                                </p>
                            `
                            : ""
                    }

                    <div class="spotify-card-footer">

                        <span class="spotify-card-mood">
                            ${getSpotifyMoodEmoji(
                                playlist.mood
                            )}
                            ${escapeSpotifyText(
                                playlist.mood
                            )}
                        </span>

                        <span class="spotify-card-play">
                            Listen ▶
                        </span>

                    </div>

                </div>
            `;

            spotifyPlaylistCollection.appendChild(
                card
            );
        }
    );
}

/* =========================================
   OPEN MODAL
========================================= */

function getOpenedSpotifyPlaylist() {
    return (
        spotifyPlaylists.find(
            (playlist) =>
                playlist.id ===
                openedSpotifyPlaylistId
        ) || null
    );
}

function updateSpotifyModal(playlist) {
    if (!playlist) {
        return;
    }

    const cover =
        playlist.coverImage ||
        createDefaultSpotifyCover(
            playlist.mood
        );

    if (spotifyModalCover) {
        spotifyModalCover.src = cover;
        spotifyModalCover.alt =
            `${playlist.name} cover`;
    }

    if (spotifyModalMood) {
        spotifyModalMood.textContent =
            `${getSpotifyMoodEmoji(
                playlist.mood
            )} ${playlist.mood}`;
    }

    if (spotifyModalName) {
        spotifyModalName.textContent =
            playlist.name;
    }

    if (spotifyModalDescription) {
        spotifyModalDescription.textContent =
            playlist.description ||
            "A playlist for your little corner of joy.";
    }

    if (openSpotifyPlaylistButton) {
        openSpotifyPlaylistButton.href =
            playlist.spotifyUrl;
    }

    if (favoriteSpotifyPlaylistButton) {
        favoriteSpotifyPlaylistButton.textContent =
            playlist.favorite
                ? "♥ Favorited"
                : "♡ Favorite";
    }

    if (spotifyEmbedContainer) {
        spotifyEmbedContainer.innerHTML = "";

        const iframe =
            document.createElement("iframe");

        iframe.src =
            getSpotifyEmbedUrl(
                playlist.spotifyId
            );

        iframe.title =
            `${playlist.name} Spotify player`;

        iframe.width = "100%";
        iframe.height = "352";

        iframe.setAttribute(
            "frameborder",
            "0"
        );

        iframe.setAttribute(
            "allowfullscreen",
            ""
        );

        iframe.setAttribute(
            "allow",
            "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        );

        iframe.loading = "lazy";

        spotifyEmbedContainer.appendChild(
            iframe
        );
    }
}

function openSpotifyModal(playlistId) {
    const playlist =
        spotifyPlaylists.find(
            (item) =>
                item.id === playlistId
        );

    if (
        !playlist ||
        !spotifyPlaylistModal
    ) {
        return;
    }

    openedSpotifyPlaylistId =
        playlist.id;

    updateSpotifyModal(playlist);

    spotifyPlaylistModal.classList.remove(
        "hidden"
    );

    document.body.classList.add(
        "modal-open"
    );

    closeSpotifyModalButton?.focus();
}

function closeSpotifyModal() {
    if (!spotifyPlaylistModal) {
        return;
    }

    spotifyPlaylistModal.classList.add(
        "hidden"
    );

    document.body.classList.remove(
        "modal-open"
    );

    openedSpotifyPlaylistId = null;

    if (spotifyEmbedContainer) {
        spotifyEmbedContainer.innerHTML = "";
    }
}

/* =========================================
   FAVORITES
========================================= */

function toggleSpotifyFavorite(
    playlistId
) {
    const playlist =
        spotifyPlaylists.find(
            (item) =>
                item.id === playlistId
        );

    if (!playlist) {
        return;
    }

    playlist.favorite =
        !playlist.favorite;

    saveSpotifyPlaylists();

    renderSpotifyPlaylists();

    if (
        openedSpotifyPlaylistId ===
        playlist.id
    ) {
        updateSpotifyModal(playlist);
    }
}

/* =========================================
   DELETE PLAYLISTS
========================================= */

function deleteOpenedSpotifyPlaylist() {
    const playlist =
        getOpenedSpotifyPlaylist();

    if (!playlist) {
        return;
    }

    const shouldDelete =
        window.confirm(
            `Delete “${playlist.name}” from your collection?`
        );

    if (!shouldDelete) {
        return;
    }

    spotifyPlaylists =
        spotifyPlaylists.filter(
            (item) =>
                item.id !== playlist.id
        );

    saveSpotifyPlaylists();

    closeSpotifyModal();

    renderSpotifyPlaylists();

    showSpotifyMessage(
        `“${playlist.name}” was deleted.`
    );
}

function clearAllSpotifyPlaylists() {
    if (spotifyPlaylists.length === 0) {
        showSpotifyMessage(
            "Your playlist collection is already empty."
        );

        return;
    }

    const shouldClear =
        window.confirm(
            "Delete every playlist from this page?"
        );

    if (!shouldClear) {
        return;
    }

    spotifyPlaylists = [];

    saveSpotifyPlaylists();

    closeSpotifyModal();

    renderSpotifyPlaylists();

    showSpotifyMessage(
        "Your playlist collection was cleared."
    );
}

/* =========================================
   EVENTS
========================================= */

spotifyCoverInput?.addEventListener(
    "change",
    () => {
        handleSpotifyCoverFile(
            spotifyCoverInput.files[0]
        );
    }
);

removeSpotifyCoverButton?.addEventListener(
    "click",
    removeSpotifyCover
);

spotifyCoverUploadArea?.addEventListener(
    "dragover",
    (event) => {
        event.preventDefault();

        spotifyCoverUploadArea.classList.add(
            "dragging"
        );
    }
);

spotifyCoverUploadArea?.addEventListener(
    "dragleave",
    () => {
        spotifyCoverUploadArea.classList.remove(
            "dragging"
        );
    }
);

spotifyCoverUploadArea?.addEventListener(
    "drop",
    (event) => {
        event.preventDefault();

        spotifyCoverUploadArea.classList.remove(
            "dragging"
        );

        handleSpotifyCoverFile(
            event.dataTransfer.files[0]
        );
    }
);

addSpotifyPlaylistButton?.addEventListener(
    "click",
    addSpotifyPlaylist
);

spotifyPlaylistLinkInput?.addEventListener(
    "keydown",
    (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            addSpotifyPlaylist();
        }
    }
);

spotifyPlaylistSearch?.addEventListener(
    "input",
    renderSpotifyPlaylists
);

spotifyPlaylistSort?.addEventListener(
    "change",
    renderSpotifyPlaylists
);

spotifyMoodButtons.forEach(
    (button) => {
        button.addEventListener(
            "click",
            () => {
                activeSpotifyMood =
                    button.dataset.spotifyMood ||
                    "All";

                spotifyMoodButtons.forEach(
                    (moodButton) => {
                        moodButton.classList.remove(
                            "active-spotify-mood"
                        );
                    }
                );

                button.classList.add(
                    "active-spotify-mood"
                );

                renderSpotifyPlaylists();
            }
        );
    }
);

spotifyPlaylistCollection?.addEventListener(
    "click",
    (event) => {
        const favoriteButton =
            event.target.closest(
                "[data-favorite-spotify-playlist]"
            );

        if (favoriteButton) {
            event.stopPropagation();

            toggleSpotifyFavorite(
                favoriteButton.dataset
                    .favoriteSpotifyPlaylist
            );

            return;
        }

        const card =
            event.target.closest(
                "[data-spotify-playlist-id]"
            );

        if (!card) {
            return;
        }

        openSpotifyModal(
            card.dataset.spotifyPlaylistId
        );
    }
);

spotifyPlaylistCollection?.addEventListener(
    "keydown",
    (event) => {
        if (
            event.key !== "Enter" &&
            event.key !== " "
        ) {
            return;
        }

        const card =
            event.target.closest(
                "[data-spotify-playlist-id]"
            );

        if (!card) {
            return;
        }

        event.preventDefault();

        openSpotifyModal(
            card.dataset.spotifyPlaylistId
        );
    }
);

closeSpotifyModalButton?.addEventListener(
    "click",
    closeSpotifyModal
);

spotifyModalBackdrop?.addEventListener(
    "click",
    closeSpotifyModal
);

favoriteSpotifyPlaylistButton?.addEventListener(
    "click",
    () => {
        if (!openedSpotifyPlaylistId) {
            return;
        }

        toggleSpotifyFavorite(
            openedSpotifyPlaylistId
        );
    }
);

deleteSpotifyPlaylistButton?.addEventListener(
    "click",
    deleteOpenedSpotifyPlaylist
);

clearSpotifyPlaylistsButton?.addEventListener(
    "click",
    clearAllSpotifyPlaylists
);

document.addEventListener(
    "keydown",
    (event) => {
        if (
            event.key === "Escape" &&
            spotifyPlaylistModal &&
            !spotifyPlaylistModal.classList.contains(
                "hidden"
            )
        ) {
            closeSpotifyModal();
        }
    }
);

/* =========================================
   START
========================================= */

loadSpotifyPlaylists();

renderSpotifyPlaylists();

/* =========================================
   LOAD LOGGED-IN USER'S DATA
========================================= */

function loadCurrentProfileData() {

    /* HAPPY LIST */

    happyItems = [];

    loadHappyItems();

    renderHappyItems();


    /* PHOTOS */

    savedPhotos = [];

    loadSavedPhotos();

    renderPhotoGallery();


    /* PLAYLISTS */

    spotifyPlaylists = [];

    loadSpotifyPlaylists();

    renderSpotifyPlaylists();
}

/* =========================================
   DAILY REMINDER
   Changes automatically every calendar day
========================================= */



/* =========================================
   REMINDERS
========================================= */

const dailyReminderMessages = [
    "You don't need to have everything figured out today.",
    "A slow day can still be a good day.",
    "Small progress is still progress.",
    "You deserve little moments that make you smile.",
    "Rest is part of a productive life too.",
    "You are allowed to take things one step at a time.",
    "There is something lovely about an ordinary day.",
    "You don't have to rush just because everyone else seems busy.",
    "Make some room today for something you genuinely enjoy.",
    "You can start again without waiting for a new week.",
    "Not everything needs to be perfect to be meaningful.",
    "Your day doesn't have to be exciting to be special.",
    "Notice one tiny thing that makes today feel nice.",
    "You are allowed to change your mind and try something different.",
    "A little kindness toward yourself can change the whole mood of a day.",
    "Take your time. There is no prize for doing everything the fastest.",
    "You don't need a special occasion to make an ordinary day feel lovely.",
    "Doing one thing is better than worrying about doing everything.",
    "Leave a little space in your day for doing absolutely nothing.",
    "Today can be soft, simple, and still wonderful.",
    "You can be proud of things that seem small.",
    "Put on a song you love and let that be enough for a moment.",
    "You are allowed to enjoy things just because they make you happy.",
    "Some days are for accomplishing things. Some days are for recharging.",
    "A cozy moment counts as a good moment.",
    "You don't need to compare the pace of your day to anyone else's.",
    "Something doesn't have to last forever to be worth enjoying.",
    "You can make today nicer in one tiny way.",
    "There is no wrong way to have a quiet day.",
    "Your little routines can become some of your favorite memories.",
    "You are allowed to celebrate ordinary happiness."
];

/* =========================================
   GET A NUMBER FOR TODAY

   The same date always creates the same
   number, so refreshing the page will NOT
   change the reminder.
========================================= */

function getReminderDayNumber() {
    const today = new Date();

    const startOfYear =
        new Date(
            today.getFullYear(),
            0,
            0
        );

    const millisecondsPassed =
        today - startOfYear;

    const millisecondsPerDay =
        1000 * 60 * 60 * 24;

    return Math.floor(
        millisecondsPassed /
        millisecondsPerDay
    );
}

/* =========================================
   DISPLAY TODAY'S REMINDER
========================================= */

function setDailyReminder() {
    if (!dailyReminderElement) {
        return;
    }

    const dayNumber =
        getReminderDayNumber();

    const reminderIndex =
        dayNumber %
        dailyReminderMessages.length;

    dailyReminderElement.textContent =
        dailyReminderMessages[
            reminderIndex
        ];
}

/* =========================================
   START DAILY REMINDER
========================================= */

setDailyReminder();

/* =========================================
   COZY DAY — PART 1
   DATA FOR ALL 15 IDEAS
========================================= */

const cozyIdeasData = {

    "cozy-drink": {
        title: "Make a Cozy Drink",
        icon: "☕",
        category: "Relax",
        intro: "Turn an ordinary drink into a tiny cozy ritual.",
        description:
            "Choose a drink you really like, use your favorite mug or glass, and make the moment feel a little special. Sit somewhere comfortable, put on soft music or a comfort show, and let yourself slow down for a while.",

        watch: [
            "Gilmore Girls",
            "Paddington",
            "The Princess Diaries"
        ],

        books: [
            "Anne of Green Gables",
            "Little Women",
            "The Very Secret Society of Irregular Witches"
        ],

        food: [
            "Cinnamon toast",
            "Cookies",
            "Mini pancakes",
            "Strawberries"
        ],

        drinks: [
            "Hot chocolate",
            "Vanilla milk",
            "Iced strawberry milk",
            "Tea with honey"
        ],

        extras: [
            "Use your favorite mug",
            "Put on a cozy playlist",
            "Grab a soft blanket",
            "Dim the lights",
            "Sit by a window",
            "Put your phone away for a few minutes"
        ],

        photos: [
            "images/cozy-day/cozy-drink-1.jpeg",
            "images/cozy-day/cozy-drink-2.jpeg",
            "images/cozy-day/cozy-drink-3.jpeg"
        ]
    },


    "rainy-window": {
        title: "Rainy Window Moment",
        icon: "🌧️",
        category: "Relax",
        intro: "Create the feeling of a rainy afternoon, even when it is sunny outside.",
        description:
            "Put on rain sounds, lower the lights, get comfortable near a window or in bed, and choose something quiet to do. You can read, journal, listen to music, or simply enjoy doing nothing for a while.",

        watch: [
            "Gilmore Girls",
            "You've Got Mail",
            "Paddington 2"
        ],

        books: [
            "The Little Prince",
            "Anne of Green Gables",
            "The Secret Garden"
        ],

        food: [
            "Warm cookies",
            "Banana bread",
            "Toast with jam",
            "Popcorn"
        ],

        drinks: [
            "Hot chocolate",
            "Chai",
            "Tea",
            "Warm apple juice"
        ],

        extras: [
            "Play rain sounds",
            "Turn on a small lamp",
            "Wear cozy socks",
            "Use a blanket",
            "Read by the window",
            "Write in a journal"
        ],

        photos: [
            "images/cozy-day/rainy-window-1.jpeg",
            "images/cozy-day/rainy-window-2.jpeg",
            "images/cozy-day/rainy-window-3.jpeg"
        ]
    },


    "reading": {
        title: "Read Somewhere Comfy",
        icon: "📖",
        category: "Relax",
        intro: "Make reading feel like a tiny event instead of just another activity.",
        description:
            "Choose a book you are excited about, build yourself a comfortable reading spot, and make everything around you feel calm. You can add a snack, a drink, soft lighting, and instrumental music.",

        watch: [
            "Little Women",
            "Matilda",
            "The Guernsey Literary and Potato Peel Pie Society"
        ],

        books: [
            "Anne of Green Gables",
            "The Secret Garden",
            "Little Women",
            "A Good Girl's Guide to Murder"
        ],

        food: [
            "Croissant",
            "Fruit",
            "Cookies",
            "Toast with chocolate spread"
        ],

        drinks: [
            "Tea",
            "Iced chocolate",
            "Hot chocolate",
            "Lemon water"
        ],

        extras: [
            "Build a reading nest",
            "Use a book light",
            "Put on instrumental music",
            "Make a reading snack",
            "Choose a cute bookmark",
            "Turn off notifications"
        ],

        photos: [
            "images/cozy-day/reading-1.jpeg",
            "images/cozy-day/reading-2.jpeg",
            "images/cozy-day/reading-3.jpeg"
        ]
    },


    "mood-board": {
        title: "Make a Mood Board",
        icon: "🎨",
        category: "Creative",
        intro: "Collect little things that match the mood you want to create.",
        description:
            "Pick a theme, color palette, season, room, outfit style, or feeling. Collect photos that match and arrange them together digitally or on paper until the whole board feels like one little world.",

        watch: [
            "The Princess Diaries",
            "Clueless",
            "13 Going on 30"
        ],

        books: [
            "The Selection",
            "Little Women",
            "Emma"
        ],

        food: [
            "Fruit bowl",
            "Cookies",
            "Mini sandwiches",
            "Chocolate"
        ],

        drinks: [
            "Iced strawberry milk",
            "Lemonade",
            "Hot chocolate",
            "Iced tea"
        ],

        extras: [
            "Choose three main colors",
            "Add outfit inspiration",
            "Add room inspiration",
            "Include quotes",
            "Add flowers or nature",
            "Create a matching playlist"
        ],

        photos: [
            "images/cozy-day/mood-board-1.jpeg",
            "images/cozy-day/mood-board-2.jpeg",
            "images/cozy-day/mood-board-3.jpeg"
        ]
    },


    "journal": {
        title: "Decorate a Journal Page",
        icon: "📓",
        category: "Creative",
        intro: "Turn one journal page into a tiny scrapbook of your day.",
        description:
            "Write a little about your day or choose a theme, then decorate around it. Use doodles, stickers, little lists, colors, printed photos, or anything else you enjoy.",

        watch: [
            "Gilmore Girls",
            "The Princess Diaries",
            "Legally Blonde"
        ],

        books: [
            "Anne of Green Gables",
            "Little Women",
            "The Little Prince"
        ],

        food: [
            "Strawberries",
            "Cookies",
            "Popcorn",
            "Mini muffins"
        ],

        drinks: [
            "Iced tea",
            "Hot chocolate",
            "Lemonade",
            "Vanilla milk"
        ],

        extras: [
            "Use pastel pens",
            "Add stickers",
            "Write a tiny gratitude list",
            "Add today's song",
            "Draw little flowers",
            "Print a favorite photo"
        ],

        photos: [
            "images/cozy-day/journal-1.jpeg",
            "images/cozy-day/journal-2.jpeg",
            "images/cozy-day/journal-3.jpeg"
        ]
    },


    "playlist": {
        title: "Create a New Playlist",
        icon: "🎧",
        category: "Creative",
        intro: "Build a soundtrack for one very specific mood.",
        description:
            "Choose an aesthetic or feeling and create a playlist around it. Give it a cute name, choose a cover, and add songs that make the playlist feel like its own little story.",

        watch: [
            "Mamma Mia!",
            "Pitch Perfect",
            "The Princess Diaries"
        ],

        books: [
            "Better Than the Movies",
            "The Summer I Turned Pretty",
            "To All the Boys I've Loved Before"
        ],

        food: [
            "Popcorn",
            "Cookies",
            "Fruit",
            "Pretzels"
        ],

        drinks: [
            "Iced lemonade",
            "Strawberry milk",
            "Hot chocolate",
            "Iced tea"
        ],

        extras: [
            "Choose an aesthetic name",
            "Make a matching cover",
            "Pick one main mood",
            "Add songs slowly",
            "Reorder the track list",
            "Listen while decorating your room"
        ],

        photos: [
            "images/cozy-day/playlist-1.jpeg",
            "images/cozy-day/playlist-2.jpeg",
            "images/cozy-day/playlist-3.jpeg"
        ]
    },


    "comfort-show": {
        title: "Have a Comfort-Show Afternoon",
        icon: "🎬",
        category: "Entertainment",
        intro: "Spend an afternoon with a show that already feels familiar.",
        description:
            "Choose something you know you enjoy, make a snack, get comfortable, and watch a few episodes without turning it into a big event. The goal is simply to relax.",

        watch: [
            "Gilmore Girls",
            "Brooklyn Nine-Nine",
            "Alexa & Katie",
            "Modern Family"
        ],

        books: [
            "Better Than the Movies",
            "Anne of Green Gables",
            "To All the Boys I've Loved Before"
        ],

        food: [
            "Popcorn",
            "Nachos",
            "Cookies",
            "Fruit plate"
        ],

        drinks: [
            "Iced chocolate",
            "Lemonade",
            "Hot chocolate",
            "Tea"
        ],

        extras: [
            "Choose favorite episodes",
            "Wear pajamas",
            "Get a blanket",
            "Make a snack tray",
            "Turn off the big light",
            "Put your phone aside"
        ],

        photos: [
            "images/cozy-day/comfort-show-1.jpeg",
            "images/cozy-day/comfort-show-2.jpeg",
            "images/cozy-day/comfort-show-3.jpeg"
        ]
    },


    "movie-night": {
        title: "Make Your Room a Cinema",
        icon: "🍿",
        category: "Entertainment",
        intro: "Turn your room into a tiny movie theater for the evening.",
        description:
            "Close the curtains, make the lighting soft, choose a movie, and prepare snacks before you start. Make it feel like a real movie night instead of casually watching something.",

        watch: [
            "The Princess Diaries",
            "Mamma Mia!",
            "13 Going on 30",
            "Enola Holmes"
        ],

        books: [
            "Better Than the Movies",
            "The Selection",
            "Little Women"
        ],

        food: [
            "Popcorn",
            "Nachos",
            "Chocolate",
            "Mini pizza"
        ],

        drinks: [
            "Lemonade",
            "Iced chocolate",
            "Hot chocolate",
            "Fruit smoothie"
        ],

        extras: [
            "Make pretend movie tickets",
            "Close the curtains",
            "Create a snack tray",
            "Turn off notifications",
            "Use blankets and pillows",
            "Pick a movie before getting comfortable"
        ],

        photos: [
            "images/cozy-day/movie-night-1.jpeg",
            "images/cozy-day/movie-night-2.jpeg",
            "images/cozy-day/movie-night-3.jpeg"
        ]
    },


    "relaxing-game": {
        title: "Play Something Relaxing",
        icon: "🎮",
        category: "Entertainment",
        intro: "Choose a game that feels fun without feeling stressful.",
        description:
            "Make yourself comfortable, put on music in the background if you like, and play something just because you enjoy it. There is no goal other than having a nice time.",

        watch: [
            "Wreck-It Ralph",
            "The Super Mario Bros. Movie",
            "Paddington"
        ],

        books: [
            "The Little Prince",
            "Anne of Green Gables",
            "The Secret Garden"
        ],

        food: [
            "Pretzels",
            "Popcorn",
            "Fruit",
            "Cookies"
        ],

        drinks: [
            "Iced lemonade",
            "Water with fruit",
            "Hot chocolate",
            "Iced tea"
        ],

        extras: [
            "Play your favorite game",
            "Put on background music",
            "Get comfortable",
            "Make a snack",
            "Try a cozy game mode",
            "Take breaks when you want"
        ],

        photos: [
            "images/cozy-day/relaxing-game-1.jpeg",
            "images/cozy-day/relaxing-game-2.jpeg",
            "images/cozy-day/relaxing-game-3.jpeg"
        ]
    },


    "pretty-snack": {
        title: "Make a Pretty Snack",
        icon: "🍓",
        category: "Little Joys",
        intro: "Make an ordinary snack feel a little more special.",
        description:
            "Choose something you already like and arrange it nicely on a plate or tray. Add a drink, use your favorite dish, and enjoy it somewhere comfortable.",

        watch: [
            "The Princess Diaries",
            "Gilmore Girls",
            "Paddington"
        ],

        books: [
            "Little Women",
            "Anne of Green Gables",
            "Better Than the Movies"
        ],

        food: [
            "Strawberries and chocolate",
            "Mini pancakes",
            "Toast with fruit",
            "Cookies",
            "Fruit bowl"
        ],

        drinks: [
            "Strawberry milk",
            "Lemonade",
            "Iced tea",
            "Hot chocolate"
        ],

        extras: [
            "Use your favorite plate",
            "Add fruit",
            "Make a tiny snack tray",
            "Put on music",
            "Sit somewhere different",
            "Take a cute photo"
        ],

        photos: [
            "images/cozy-day/pretty-snack-1.jpeg",
            "images/cozy-day/pretty-snack-2.jpeg",
            "images/cozy-day/pretty-snack-3.jpeg"
        ]
    },


    "happy-list": {
        title: "Write a Happy Little List",
        icon: "💌",
        category: "Little Joys",
        intro: "Collect tiny things that have made your days nicer.",
        description:
            "Write down small moments, people, songs, foods, places, or anything else that made you smile recently. The list does not need to be serious or impressive.",

        watch: [
            "Paddington",
            "The Princess Diaries",
            "Gilmore Girls"
        ],

        books: [
            "The Little Prince",
            "Anne of Green Gables",
            "Little Women"
        ],

        food: [
            "Cookies",
            "Fruit",
            "Toast",
            "Mini muffins"
        ],

        drinks: [
            "Tea",
            "Lemonade",
            "Hot chocolate",
            "Vanilla milk"
        ],

        extras: [
            "Write five little joys",
            "Add today's favorite song",
            "Write one good memory",
            "Decorate the list",
            "Add something you're excited for",
            "Save it to reread later"
        ],

        photos: [
            "images/cozy-day/happy-list-1.jpeg",
            "images/cozy-day/happy-list-2.jpeg",
            "images/cozy-day/happy-list-3.jpeg"
        ]
    },


    "romanticize-day": {
        title: "Romanticize an Ordinary Moment",
        icon: "🌸",
        category: "Little Joys",
        intro: "Make something ordinary feel a tiny bit more intentional.",
        description:
            "Pick a normal part of your day and add something you enjoy to it. Play music while getting ready, make your snack look pretty, use a favorite cup, or tidy your desk before sitting down.",

        watch: [
            "The Princess Diaries",
            "Mamma Mia!",
            "13 Going on 30"
        ],

        books: [
            "Anne of Green Gables",
            "Little Women",
            "Emma"
        ],

        food: [
            "Croissant",
            "Fruit and chocolate",
            "Mini pancakes",
            "Cookies"
        ],

        drinks: [
            "Iced coffee-style drink",
            "Strawberry milk",
            "Lemonade",
            "Tea"
        ],

        extras: [
            "Put on your favorite song",
            "Use a cute glass",
            "Open the curtains",
            "Wear something comfortable",
            "Take a few photos",
            "Make your room smell fresh"
        ],

        photos: [
            "images/cozy-day/romanticize-day-1.jpeg",
            "images/cozy-day/romanticize-day-2.jpeg",
            "images/cozy-day/romanticize-day-3.jpeg"
        ]
    },


    "room-reset": {
        title: "Do a Tiny Room Reset",
        icon: "🫧",
        category: "Reset",
        intro: "Refresh your space without turning it into a huge cleaning project.",
        description:
            "Choose a few easy things to fix: make the bed, clear one surface, put clothes away, open the curtains, or rearrange your pillows. Stop when the room feels nicer.",

        watch: [
            "Gilmore Girls",
            "Modern Family",
            "The Princess Diaries"
        ],

        books: [
            "The Little Prince",
            "The Secret Garden",
            "Anne of Green Gables"
        ],

        food: [
            "Fruit",
            "Cookies",
            "Toast",
            "Popcorn"
        ],

        drinks: [
            "Cold water",
            "Lemonade",
            "Tea",
            "Iced chocolate"
        ],

        extras: [
            "Make your bed",
            "Clear your desk",
            "Open the curtains",
            "Put clothes away",
            "Change your pillow arrangement",
            "Put on a cleaning playlist"
        ],

        photos: [
            "images/cozy-day/room-reset-1.jpeg",
            "images/cozy-day/room-reset-2.jpeg",
            "images/cozy-day/room-reset-3.jpeg"
        ]
    },


    "cozy-corner": {
        title: "Refresh Your Cozy Corner",
        icon: "🧺",
        category: "Reset",
        intro: "Create one small place that feels extra comfortable.",
        description:
            "Choose a corner of your room, chair, bed, or desk and make it feel cozy. You only need a few things: pillows, a blanket, good lighting, a book, or anything that makes the space feel nice.",

        watch: [
            "Gilmore Girls",
            "Paddington",
            "The Princess Diaries"
        ],

        books: [
            "Anne of Green Gables",
            "Little Women",
            "The Secret Garden"
        ],

        food: [
            "Cookies",
            "Fruit plate",
            "Toast",
            "Mini muffins"
        ],

        drinks: [
            "Hot chocolate",
            "Tea",
            "Vanilla milk",
            "Lemonade"
        ],

        extras: [
            "Add a blanket",
            "Arrange pillows",
            "Add a small lamp",
            "Bring a book",
            "Add a little tray",
            "Keep your favorite things nearby"
        ],

        photos: [
            "images/cozy-day/cozy-corner-1.jpeg",
            "images/cozy-day/cozy-corner-2.jpeg",
            "images/cozy-day/cozy-corner-3.jpeg"
        ]
    },


    "slow-evening": {
        title: "Have a Slow Evening",
        icon: "🌙",
        category: "Reset",
        intro: "Let the end of the day feel calm instead of rushed.",
        description:
            "Change into comfortable clothes, lower the lights, prepare something nice to drink, and choose one quiet activity. You can read, watch something familiar, journal, or simply relax.",

        watch: [
            "Gilmore Girls",
            "Paddington",
            "You've Got Mail"
        ],

        books: [
            "Little Women",
            "Anne of Green Gables",
            "The Secret Garden"
        ],

        food: [
            "Toast",
            "Cookies",
            "Fruit",
            "Popcorn"
        ],

        drinks: [
            "Tea",
            "Hot chocolate",
            "Warm milk",
            "Water with lemon"
        ],

        extras: [
            "Change into pajamas",
            "Lower the lights",
            "Put your phone aside",
            "Use a blanket",
            "Read for a little while",
            "Make tomorrow's space feel tidy"
        ],

        photos: [
            "images/cozy-day/slow-evening-1.jpeg",
            "images/cozy-day/slow-evening-2.jpeg",
            "images/cozy-day/slow-evening-3.jpeg"
        ]
    }
};

/* =========================================
   COZY DAY — PART 2
   OPEN DETAIL VIEW
========================================= */

const cozyIdeaCards =
    document.querySelectorAll(
        ".cozy-idea-card[data-cozy-idea]"
    );

const cozyIdeasGrid =
    document.querySelector(
        ".cozy-ideas-grid"
    );

const cozyCategories =
    document.querySelector(
        ".cozy-categories"
    );

const cozyPageHeading =
    document.querySelector(
        "#cozy .page-heading"
    );

const cozyDetailView =
    document.getElementById(
        "cozyDetailView"
    );

const backToCozyIdeasButton =
    document.getElementById(
        "backToCozyIdeasBtn"
    );

const bottomBackToCozyIdeasButton =
    document.getElementById(
        "bottomBackToCozyIdeasBtn"
    );

/* DETAIL ELEMENTS */

const cozyDetailIcon =
    document.getElementById(
        "cozyDetailIcon"
    );

const cozyDetailCategory =
    document.getElementById(
        "cozyDetailCategory"
    );

const cozyDetailTitle =
    document.getElementById(
        "cozyDetailTitle"
    );

const cozyDetailIntro =
    document.getElementById(
        "cozyDetailIntro"
    );

const cozyDetailDescription =
    document.getElementById(
        "cozyDetailDescription"
    );

const cozyWatchRecommendations =
    document.getElementById(
        "cozyWatchRecommendations"
    );

const cozyBookRecommendations =
    document.getElementById(
        "cozyBookRecommendations"
    );

const cozyFoodRecommendations =
    document.getElementById(
        "cozyFoodRecommendations"
    );

const cozyDrinkRecommendations =
    document.getElementById(
        "cozyDrinkRecommendations"
    );

const cozyExtraRecommendations =
    document.getElementById(
        "cozyExtraRecommendations"
    );

const cozyDetailPhoto1 =
    document.getElementById(
        "cozyDetailPhoto1"
    );

const cozyDetailPhoto2 =
    document.getElementById(
        "cozyDetailPhoto2"
    );

const cozyDetailPhoto3 =
    document.getElementById(
        "cozyDetailPhoto3"
    );


/* =========================================
   CREATE RECOMMENDATION ITEMS
========================================= */

function fillCozyRecommendationList(
    container,
    items
) {
    if (!container) {
        return;
    }

    container.innerHTML = "";

    items.forEach(
        (item) => {
            const recommendation =
                document.createElement("div");

            recommendation.className =
                "cozy-recommendation-item";

            recommendation.textContent =
                item;

            container.appendChild(
                recommendation
            );
        }
    );
}


/* =========================================
   CREATE LITTLE EXTRAS
========================================= */

function fillCozyExtras(items) {
    if (!cozyExtraRecommendations) {
        return;
    }

    cozyExtraRecommendations.innerHTML =
        "";

    items.forEach(
        (item) => {
            const extra =
                document.createElement("div");

            extra.className =
                "cozy-extra-item";

            extra.textContent =
                item;

            cozyExtraRecommendations.appendChild(
                extra
            );
        }
    );
}


/* =========================================
   OPEN ONE IDEA
========================================= */
/* =========================================
   LOAD COZY PHOTO
   Tries JPEG, JPG, PNG and WEBP
========================================= */

function loadCozyPhoto(
    imageElement,
    originalPath,
    title
) {
    if (!imageElement || !originalPath) {
        return;
    }

    const pathWithoutExtension =
        originalPath.replace(
            /\.(jpeg|jpg|png|webp)$/i,
            ""
        );

    const possibleFiles = [
        `${pathWithoutExtension}.jpeg`,
        `${pathWithoutExtension}.jpg`,
        `${pathWithoutExtension}.png`,
        `${pathWithoutExtension}.webp`
    ];

    let currentFile = 0;

    imageElement.alt =
        `${title} inspiration`;

    function tryNextFile() {

        if (
            currentFile >=
            possibleFiles.length
        ) {
            imageElement.removeAttribute(
                "src"
            );

            imageElement.alt =
                `${title} photo could not be found`;

            imageElement.classList.add(
                "cozy-photo-error"
            );

            return;
        }

        imageElement.src =
            possibleFiles[currentFile];

        currentFile++;
    }

    imageElement.onload = () => {
        imageElement.classList.remove(
            "cozy-photo-error"
        );
    };

    imageElement.onerror = () => {
        tryNextFile();
    };

    tryNextFile();
}


function openCozyIdea(ideaName) {
    const idea =
        cozyIdeasData[ideaName];

    if (!idea || !cozyDetailView) {
        return;
    }

    /* TEXT */

    cozyDetailIcon.textContent =
        idea.icon;

    cozyDetailCategory.textContent =
        idea.category;

    cozyDetailTitle.textContent =
        idea.title;

    cozyDetailIntro.textContent =
        idea.intro;

    cozyDetailDescription.textContent =
        idea.description;


    /* RECOMMENDATIONS */

    fillCozyRecommendationList(
        cozyWatchRecommendations,
        idea.watch
    );

    fillCozyRecommendationList(
        cozyBookRecommendations,
        idea.books
    );

    fillCozyRecommendationList(
        cozyFoodRecommendations,
        idea.food
    );

    fillCozyRecommendationList(
        cozyDrinkRecommendations,
        idea.drinks
    );

    fillCozyExtras(
        idea.extras
    );


/* =========================================
   PHOTOS
========================================= */

loadCozyPhoto(
    cozyDetailPhoto1,
    idea.photos[0],
    idea.title
);

loadCozyPhoto(
    cozyDetailPhoto2,
    idea.photos[1],
    idea.title
);

loadCozyPhoto(
    cozyDetailPhoto3,
    idea.photos[2],
    idea.title
);

    /* HIDE MAIN COZY PAGE CONTENT */

    if (cozyPageHeading) {
        cozyPageHeading.classList.add(
            "hidden"
        );
    }

    if (cozyCategories) {
        cozyCategories.classList.add(
            "hidden"
        );
    }

    if (cozyIdeasGrid) {
        cozyIdeasGrid.classList.add(
            "hidden"
        );
    }


    /* SHOW DETAIL VIEW */

    cozyDetailView.classList.remove(
        "hidden"
    );

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================
   GO BACK TO IDEAS
========================================= */

function closeCozyIdea() {
    if (!cozyDetailView) {
        return;
    }

    cozyDetailView.classList.add(
        "hidden"
    );

    if (cozyPageHeading) {
        cozyPageHeading.classList.remove(
            "hidden"
        );
    }

    if (cozyCategories) {
        cozyCategories.classList.remove(
            "hidden"
        );
    }

    if (cozyIdeasGrid) {
        cozyIdeasGrid.classList.remove(
            "hidden"
        );
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================
   CLICK IDEA CARDS
========================================= */

cozyIdeaCards.forEach(
    (card) => {

        card.setAttribute(
            "tabindex",
            "0"
        );

        card.setAttribute(
            "role",
            "button"
        );


        /* CLICK */

        card.addEventListener(
            "click",
            () => {
                const ideaName =
                    card.dataset.cozyIdea;

                openCozyIdea(
                    ideaName
                );
            }
        );


        /* ENTER / SPACE */

        card.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key !== "Enter" &&
                    event.key !== " "
                ) {
                    return;
                }

                event.preventDefault();

                const ideaName =
                    card.dataset.cozyIdea;

                openCozyIdea(
                    ideaName
                );
            }
        );
    }
);


/* =========================================
   BACK BUTTONS
========================================= */

if (backToCozyIdeasButton) {
    backToCozyIdeasButton.addEventListener(
        "click",
        closeCozyIdea
    );
}

if (bottomBackToCozyIdeasButton) {
    bottomBackToCozyIdeasButton.addEventListener(
        "click",
        closeCozyIdea
    );
}

/* =========================================
   COZY DAY — PART 3
   CATEGORY FILTERING
========================================= */

const cozyCategoryButtons =
    document.querySelectorAll(
        ".cozy-category-button"
    );

/* =========================================
   FILTER COZY IDEAS
========================================= */

function filterCozyIdeas(category) {

    cozyIdeaCards.forEach(
        (card) => {

            const cardCategory =
                card.dataset.category;

            const shouldShow =
                category === "All" ||
                cardCategory === category;

            if (shouldShow) {
                card.classList.remove(
                    "cozy-hidden"
                );
            } else {
                card.classList.add(
                    "cozy-hidden"
                );
            }
        }
    );
}


/* =========================================
   CATEGORY BUTTON CLICKS
========================================= */

cozyCategoryButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                const selectedCategory =
                    button.dataset
                        .cozyCategory;

                if (!selectedCategory) {
                    return;
                }


                /* REMOVE ACTIVE STYLE
                   FROM ALL BUTTONS */

                cozyCategoryButtons.forEach(
                    (categoryButton) => {

                        categoryButton.classList.remove(
                            "active-cozy-category"
                        );
                    }
                );


                /* ACTIVE STYLE ON
                   SELECTED BUTTON */

                button.classList.add(
                    "active-cozy-category"
                );


                /* FILTER CARDS */

                filterCozyIdeas(
                    selectedCategory
                );
            }
        );
    }
);


/* =========================================
   START WITH ALL IDEAS
========================================= */

filterCozyIdeas("All");

/* =========================================
   COZY DAY — PART 4
   PAGE RESET + NAVIGATION
========================================= */

/* =========================================
   RESET COZY DAY PAGE
========================================= */

function resetCozyDayPage() {

    /* Hide detail page */

    if (cozyDetailView) {
        cozyDetailView.classList.add(
            "hidden"
        );
    }


    /* Show main page */

    if (cozyPageHeading) {
        cozyPageHeading.classList.remove(
            "hidden"
        );
    }

    if (cozyCategories) {
        cozyCategories.classList.remove(
            "hidden"
        );
    }

    if (cozyIdeasGrid) {
        cozyIdeasGrid.classList.remove(
            "hidden"
        );
    }


    /* Reset category to All */

    cozyCategoryButtons.forEach(
        (button) => {

            const isAllButton =
                button.dataset.cozyCategory ===
                "All";

            button.classList.toggle(
                "active-cozy-category",
                isAllButton
            );
        }
    );

    filterCozyIdeas("All");
}


/* =========================================
   WHEN COZY DAY NAV BUTTON IS CLICKED
========================================= */

const cozyNavigationButton =
    document.querySelector(
        '.nav-btn[data-page="cozy"]'
    );

if (cozyNavigationButton) {

    cozyNavigationButton.addEventListener(
        "click",
        () => {

            resetCozyDayPage();

        }
    );
}


/* =========================================
   RESET PHOTO ERRORS
========================================= */

const cozyDetailPhotos = [
    cozyDetailPhoto1,
    cozyDetailPhoto2,
    cozyDetailPhoto3
];

cozyDetailPhotos.forEach(
    (photo) => {

        if (!photo) {
            return;
        }

        photo.addEventListener(
            "error",
            () => {

                photo.alt =
                    "This cozy inspiration photo could not be loaded.";

                photo.classList.add(
                    "cozy-photo-error"
                );

            }
        );

        photo.addEventListener(
            "load",
            () => {

                photo.classList.remove(
                    "cozy-photo-error"
                );

            }
        );

    }
);