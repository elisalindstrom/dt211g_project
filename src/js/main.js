"use strict";

document.addEventListener("DOMContentLoaded", function () {
    const submitBtn = document.querySelector("#submit-btn");
    submitBtn.addEventListener("click", searchAuthor);
});

function searchAuthor(event) {
    event.preventDefault();

    const authorInput = document.querySelector("#author-input");
    const authorValue = authorInput.value.trim();

    if (authorValue === "") {
        console.log("Test");
        return;
    }

    fetchAuthor(authorValue);
}

// FÖRFATTARE

async function fetchAuthor(authorValue) {
    try {
        const response = await fetch(`https://openlibrary.org/search/authors.json?q=${authorValue}`);
        const author = await response.json();

        displayAuthor(author);
        console.table(author.docs[0]);

    } catch (error) {
        console.error("Något gick fel" + error);
    }
}

function displayAuthor(author) {
    const authorProfile = document.querySelector("#author-info-card");
    authorProfile.classList.remove("hidden");
    authorProfile.innerHTML = "";

    if (author.docs.length > 0) {
        const authorName = author.docs[0].name;

        const authorNameElement = document.createElement("h2");
        authorNameElement.textContent = authorName

        const birthDateElement = document.createElement("p");
        birthDateElement.textContent = `Born: ${author.docs[0].birth_date}`;

        const topWorkElement = document.createElement("p");
        topWorkElement.textContent = `Top Work: ${author.docs[0].top_work}`;

        authorProfile.append(authorNameElement, birthDateElement, topWorkElement);

        fetchBooks(authorName);
    } else {
        authorProfile.innerHTML = `<h2>Author not found</h2>`;

    }
}

// BÖCKER

async function fetchBooks(authorName) {
    try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=inauthor:${authorName}`);
        const books = await response.json();

        sortBooks(books.items);
    } catch (error) {
        console.error("Något gick fel" + error);
    }
}

function sortBooks(books) {
    const today = new Date();
    const upcomingBooks = [];
    const publishedBooks = [];

    books.forEach(book => {
        const publishedData = book.volumeInfo.publishedDate;

        if (publishedData) {
            const bookDate = new Date(publishedData);

            if (bookDate > today) {
                upcomingBooks.push(book);
            } else {
                publishedBooks.push(book);
            }
        }
    })
    displayUpcomingBooks(upcomingBooks);
    displayPublishedBooks(publishedBooks);

    console.table(upcomingBooks, publishedBooks);
}

function displayUpcomingBooks(upcomingBooks) {
    const upcomingSection = document.querySelector("#upcoming-books");
    upcomingSection.classList.remove("hidden");
    upcomingSection.innerHTML = "";

    const sectionHeader = document.createElement("h2")
    upcomingSection.appendChild(sectionHeader);

    if (upcomingBooks.length === 0) {
        sectionHeader.textContent = `No Upcoming Releases Found`;
    } else {
        sectionHeader.textContent = `Upcoming Releases`;
    }

    upcomingBooks.forEach(book => {
        const bookCard = document.createElement("div");
        bookCard.classList.add("book-card");

        const cover = book.volumeInfo.imageLinks?.thumbnail;
        const bookImg = document.createElement("img")

        const bookInfo = document.createElement("div");
        bookInfo.classList.add("book-info");

        const title = document.createElement("h3")
        title.textContent = book.volumeInfo.title;

        const date = document.createElement("h4");
        date.textContent = `Release date: ${book.volumeInfo.publishedDate}`;

        if (cover) {
            bookImg.src = cover;
        }

        upcomingSection.appendChild(bookCard);
        bookCard.append(bookImg, bookInfo);
        bookInfo.append(title, date);
    });
}

function displayPublishedBooks(publishedBooks) {
    const publishedSection = document.querySelector("#published-books");
    publishedSection.classList.remove("hidden");
    publishedSection.innerHTML = "";

    const sectionHeader = document.createElement("h2")
    publishedSection.appendChild(sectionHeader);

    if (publishedBooks.length === 0) {
        sectionHeader.textContent = `No Published Books Found`;
    } else {
        sectionHeader.textContent = `Published Books`;
    }

    publishedBooks.forEach(book => {
        const bookCard = document.createElement("div");
        bookCard.classList.add("book-card");

        const cover = book.volumeInfo.imageLinks?.thumbnail;
        const bookImg = document.createElement("img")

        const bookInfo = document.createElement("div");
        bookInfo.classList.add("book-info");

        const title = document.createElement("h3")
        title.textContent = book.volumeInfo.title;

        const date = document.createElement("h4");
        date.textContent = `Release date: ${book.volumeInfo.publishedDate}`;

        if (cover) {
            bookImg.src = cover;
        }

        publishedSection.appendChild(bookCard);
        bookCard.append(bookImg, bookInfo);
        bookInfo.append(title, date);
    });
}