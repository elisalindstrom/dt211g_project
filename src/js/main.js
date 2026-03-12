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

// FÖRFATTARE

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
    authorProfile.innerHTML = "";

    const authorName = author.docs[0].name;
    const birthDate = author.docs[0].birth_date;
    const topWork = author.docs[0].top_work;

    fetchBooks(authorName);

    authorProfile.innerHTML = `<h2>${authorName}</h2><p>Birth date: ${birthDate}</p><p>Top work: ${topWork}</p>`;
}

// BÖCKER

async function fetchBooks(authorName) {
    try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=inauthor:${authorName}`);
        const books = await response.json();

        displayBooks(books);
        console.table(books.items);
    } catch (error) {
        console.error("Något gick fel" + error);
    }
}

function displayBooks(books) {
    const publishedBooks = document.querySelector("#published-books");
    publishedBooks.classList.remove("hidden");
    publishedBooks.innerHTML = "";

    const sectionHeader = document.createElement("h2")
    const headerTitle = document.createTextNode("Published books");
    sectionHeader.appendChild(headerTitle);

    publishedBooks.appendChild(sectionHeader);

    books.items.forEach(book => {
        const bookCard = document.createElement("div");
        bookCard.classList.add("book-card");

        const title = document.createElement("h3")
        const titleText = document.createTextNode(book.volumeInfo.title);
        title.appendChild(titleText);

        const date = document.createElement("h4")
        const datePublished = document.createTextNode(book.volumeInfo.publishedDate);
        date.appendChild(datePublished);

        publishedBooks.appendChild(bookCard);
        bookCard.appendChild(title);
        title.appendChild(date);
    });
}