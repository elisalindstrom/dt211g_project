"use strict";

document.addEventListener("DOMContentLoaded", function () {
    const submitBtn = document.querySelector("#submit-btn");
    submitBtn.addEventListener("click", searchAuthor);
});

function searchAuthor(event) {
    event.preventDefault();

    const authorInput = document.querySelector("#author-input");
    const authorValue = authorInput.value.trim();

    fetchAuthor(authorValue);
}

async function fetchAuthor(authorValue) {
    try {
        const response = await fetch(`https://openlibrary.org/search/authors.json?q=${authorValue}`);
        const author = await response.json();

        if (author.docs.length > 0) {
            displayAuthor(author);
            console.table(author.docs[0]);
        }
    } catch (error) {
        console.error("Något gick fel" + error);
    }
}

function displayAuthor(author) {
    const authorProfile = document.querySelector("#author-info-card");
    authorProfile.classList.remove("hidden");

    const authorName = author.docs[0].name;
    const birthDate = author.docs[0].birth_date;
    const topWork = author.docs[0].top_work;

    authorProfile.innerHTML = "";

    authorProfile.innerHTML = `<h2>${authorName}</h2><p>Birth date: ${birthDate}</p><p>Top work: ${topWork}</p>`;
}