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
    sectionHeader.textContent = `Published books`;

    publishedBooks.appendChild(sectionHeader);

    books.items.forEach(book => {
        const bookCard = document.createElement("div");
        bookCard.classList.add("book-card");

        const cover = book.volumeInfo.imageLinks?.thumbnail;
        const bookImg = document.createElement("img")

        const bookInfo = document.createElement("div");
        bookInfo.classList.add("book-info");

        const title = document.createElement("h3")
        title.textContent = book.volumeInfo.title;

        const date = document.createElement("h4");
        date.textContent = `Published: ${book.volumeInfo.publishedDate}`;

        if (cover) {
            bookImg.src = cover;
        }

        sectionHeader.appendChild(bookCard);
        bookCard.append(bookImg, bookInfo);
        bookInfo.append(title, date);
    });
}