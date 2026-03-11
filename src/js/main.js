"use strict";

document.addEventListener("DOMContentLoaded", function () {
    const submitBtn = document.querySelector("#submit-btn");
    submitBtn.addEventListener("click", searchbar);
});

function searchbar(event) {
    event.preventDefault();

    const authorInput = document.querySelector("#author-input");
    const author = authorInput.value.trim();

    fetchAuthor(author);
}
async function fetchAuthor(author) {
    try {
        const response = await fetch(`https://openlibrary.org/search/authors.json?q=${author}`);
        const data = await response.json();

        console.table(data);

    } catch (error) {
        console.error("Något gick fel" + error);
    }
}

const authorProfile = document.querySelector("#author-info-card");
