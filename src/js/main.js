"use strict";

const searchForm = document.querySelector("#search-form");
const authorInput = document.querySelector("#author-input");
const loader = document.querySelector("#loader");
const authorProfile = document.querySelector("#author-info-card");
const upcomingSection = document.querySelector("#upcoming-books");
const publishedSection = document.querySelector("#published-books");

// Lyssnar efter submit i formuläret
document.addEventListener("DOMContentLoaded", function () {
    searchForm.addEventListener("submit", searchAuthor);
});

// Läser av sökfältets input
function searchAuthor(event) {
    event.preventDefault();

    // Rensar alla tidigare fält
    authorProfile.innerHTML = "";
    upcomingSection.innerHTML = "";
    publishedSection.innerHTML = "";

    const authorValue = authorInput.value.trim();
    fetchAuthor(authorValue);
}

// Hämta författare
async function fetchAuthor(authorValue) {
    try {
        const response = await fetch(`https://openlibrary.org/search/authors.json?q=${authorValue}`);
        const author = await response.json();

        if (author.docs.length === 0) {
            displayAuthorNotFound();
            return;
        }
        displayAuthor(author.docs[0]);
    } catch (error) {
        console.error("Något gick fel" + error);
    }
}

// Skriv ut om författare ej kan hittas
function displayAuthorNotFound() {
    const authorProfile = document.querySelector("#author-info-card");
    authorProfile.classList.remove("hidden");

    const authorNameElement = document.createElement("h2");
    authorNameElement.textContent = `Author not found`;

    authorProfile.appendChild(authorNameElement);
}

// Skriv ut författare
function displayAuthor(author) {
    authorProfile.classList.remove("hidden");
    authorProfile.innerHTML = "";

    let authorName = author.name;

    const authorProfileHeader = document.createElement("h2");

    authorProfileHeader.textContent = `Author Profile`;
    authorProfile.appendChild(authorProfileHeader);

    const authorNameElement = document.createElement("h3");
    authorNameElement.textContent = authorName;
    authorProfile.appendChild(authorNameElement);

    if (author.birth_date) {
        const birthDateElement = document.createElement("p");
        birthDateElement.textContent = `Born: ${author.birth_date}`;
        authorProfile.appendChild(birthDateElement);
    }

    const topWorkElement = document.createElement("p");
    topWorkElement.textContent = `Top Work: ${author.top_work}`;
    authorProfile.appendChild(topWorkElement)

    fetchBooks(authorName);
}

// Hämta böcker
async function fetchBooks(authorName) {
    loader.classList.remove("hidden");

    try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=inauthor:${authorName}&printType=books&maxResults=20`);
        const books = await response.json();

        if (books.items) {
            filterBooks(books.items);
        }
    } catch (error) {
        console.error("Något gick fel" + error);
    } finally {
        loader.classList.add("hidden");
    }
}

// Filtrera bort böcker utan titel, datum och omslag
function filterBooks(books) {
    const filteredBooks = books.filter(book => book.volumeInfo?.title && book.volumeInfo?.publishedDate && book.volumeInfo?.imageLinks);

    sortBooks(filteredBooks);
}

// Sortering av böcker
function sortBooks(books) {
    const today = new Date();
    let upcomingBooks = [];
    let publishedBooks = [];

    books.forEach(book => {
        const publishedData = book.volumeInfo.publishedDate;
        const bookDate = new Date(publishedData);

        if (bookDate > today) {
            upcomingBooks.push(book);
        } else {
            publishedBooks.push(book);
        }
    });

    // Sortera så senast publicerade böcker visas först
    publishedBooks.sort((a, b) =>
        new Date(b.volumeInfo.publishedDate) - new Date(a.volumeInfo.publishedDate));

    displayUpcomingBooks(upcomingBooks);
    displayPublishedBooks(publishedBooks);

    console.log(publishedBooks);
}

// Kommande böcker
function displayUpcomingBooks(upcomingBooks) {
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

        const bookImg = document.createElement("img")
        bookImg.src = book.volumeInfo.imageLinks?.thumbnail;

        const bookInfo = document.createElement("div");
        bookInfo.classList.add("book-info");

        const title = document.createElement("h3")
        title.textContent = book.volumeInfo.title;

        const authors = document.createElement("p")
        authors.textContent = book.volumeInfo.authors.join(", ");

        const date = document.createElement("p");
        date.textContent = `Release date: ${book.volumeInfo.publishedDate}`;

        const pageCount = document.createElement("p");
        const pages = book.volumeInfo.pageCount;

        upcomingSection.appendChild(bookCard);
        bookCard.append(bookImg, bookInfo);
        bookInfo.append(title, date);

        if (pages > 0) {
            pageCount.textContent = `${pages} pages`;
            bookInfo.appendChild(pageCount);
        }
    });
}


// Publicerade böcker
function displayPublishedBooks(publishedBooks) {
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

        const bookImg = document.createElement("img")
        bookImg.src = book.volumeInfo.imageLinks?.thumbnail;

        const bookInfo = document.createElement("div");
        bookInfo.classList.add("book-info");

        const title = document.createElement("h3")
        title.textContent = book.volumeInfo.title;

        const authors = document.createElement("p")
        authors.textContent = book.volumeInfo.authors.join(", ");

        const date = document.createElement("p");
        date.textContent = `Published: ${book.volumeInfo.publishedDate}`;

        const pageCount = document.createElement("p");
        const pages = book.volumeInfo.pageCount;

        publishedSection.appendChild(bookCard);
        bookCard.append(bookImg, bookInfo);
        bookInfo.append(title, authors, date)

        if (pages > 0) {
            pageCount.textContent = `${pages} pages`;
            bookInfo.appendChild(pageCount);
        }
    });
}