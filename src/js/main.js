"use strict";
const API_KEY = "AIzaSyCSUg9ANLug1QAFQZyyOt81JiDAnsI-ZhY";

const searchForm = document.querySelector("#search-form");
const authorInput = document.querySelector("#author-input");
const loader = document.querySelector("#loader");
const savedBooksSection = document.querySelector("#saved-card");
const authorProfile = document.querySelector("#author-info-card");
const upcomingSection = document.querySelector("#upcoming-books");
const publishedSection = document.querySelector("#published-books");
let currentBooks = [];

displaySavedBooks();

searchForm.addEventListener("submit", searchAuthor);

/**
 * Läser av inputvärde efter submit i formulär.
 * @param {SubmitEvent} event - submit
 */
function searchAuthor(event) {
    event.preventDefault();

    // Rensar alla tidigare fält
    authorProfile.innerHTML = "";
    upcomingSection.innerHTML = "";
    publishedSection.innerHTML = "";

    const authorValue = authorInput.value.trim();
    fetchAuthor(authorValue);
}

/**
 * Hämtar författare från Open Library API utifrån sökfältets input.
 * @param {string} authorValue - författare från sökfält
 */
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

/**
 * Visar meddelande om ingen författare kunnat hittas.
 */
function displayAuthorNotFound() {
    authorProfile.classList.remove("hidden");

    const authorNameElement = document.createElement("h2");
    authorNameElement.textContent = `Author not found`;
    authorProfile.appendChild(authorNameElement);
}

/**
 * Skriver ut information om författare från Open Library API.
 * @param {Object} author - Objekt med författarinformation
 * @param {string} author.name - Författarnamn
 * @param {string} author.key - Författar-ID
 * @param {string} author.birth_date - Födelsedatum
 * @param {string} author.top_work - Mest kända bok
 */
function displayAuthor(author) {
    authorProfile.classList.remove("hidden");

    const authorWrapperEl = document.createElement("div");
    authorWrapperEl.classList.add("author-wrapper");

    const key = author.key;
    const authorImgEl = document.createElement("img");
    authorImgEl.src = `https://covers.openlibrary.org/a/olid/${key}-L.jpg?default=false`;
    authorImgEl.alt = author.name;
    // Vid error ta bort bild
    authorImgEl.onerror = function () {
        authorImgEl.remove();
    }

    const authorInfoEl = document.createElement("div");
    authorInfoEl.classList.add("author-info");

    const authorProfileHeaderEl = document.createElement("h2");
    authorProfileHeaderEl.textContent = `Author Profile`;
    authorProfile.appendChild(authorProfileHeaderEl);

    const authorNameEl = document.createElement("h3");
    authorNameEl.textContent = author.name;
    authorInfoEl.appendChild(authorNameEl);

    authorWrapperEl.append(authorImgEl, authorInfoEl);
    authorProfile.appendChild(authorWrapperEl);

    if (author.birth_date) {
        const birthDateEl = document.createElement("p");
        birthDateEl.textContent = `Born: ${author.birth_date}`;
        authorInfoEl.appendChild(birthDateEl);
    }

    if (author.top_work) {
        const topWorkEl = document.createElement("p");
        topWorkEl.textContent = `Top Work: ${author.top_work}`;
        authorInfoEl.appendChild(topWorkEl)
    }

    fetchBooks(author.name);
}

/**
 * Hämtar böcker från Google Books API utifrån författarnamn.
 * @param {string} authorName - Författarnamn
 */
async function fetchBooks(authorName) {
    loader.classList.remove("hidden");

    try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=inauthor:${authorName}&printType=books&maxResults=20&key=${API_KEY}`);
        const books = await response.json();

        if (!books.items) {
            return;
        }
        filterBooks(books.items);
    } catch (error) {
        console.error("Något gick fel" + error);
    } finally {
        loader.classList.add("hidden");
    }
}

/**
 * Filtrerar bort böcker som saknar titel, datum och omslag.
 * @param {Object[]} books - Array av bokobjekt från Google Books API
 */
function filterBooks(books) {
    const filteredBooks = books.filter(book =>
        book.volumeInfo?.title && book.volumeInfo?.publishedDate && book.volumeInfo?.imageLinks);

    currentBooks = filteredBooks;
    sortBooks(filteredBooks);
}

/**
 * Delar upp böcker i kommande och publicerade utifrån datum.
 * @param {Object[]} books - Filtrerade bokobjekt
 */
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
}

/**
 * Renderar sektion med kommande böcker.
 * @param {Object[]} upcomingBooks - Array med kommande böcker
 */
function displayUpcomingBooks(upcomingBooks) {
    upcomingSection.innerHTML = "";

    if (upcomingBooks.length === 0) {
        return;
    }
    upcomingSection.classList.remove("hidden");

    const sectionHeaderEl = document.createElement("h2");
    sectionHeaderEl.textContent = `Upcoming Releases`;
    upcomingSection.appendChild(sectionHeaderEl);

    upcomingBooks.forEach(book => {
        const bookCard = createBookCard(book)
        upcomingSection.appendChild(bookCard);
    })
}

/**
 * Renderar sektion med publicerade böcker.
 * @param {Object[]} publishedBooks - Array med redan publicerade böcker 
 */
function displayPublishedBooks(publishedBooks) {
    publishedSection.innerHTML = "";

    if (publishedBooks.length === 0) {
        return;
    }
    publishedSection.classList.remove("hidden");

    const sectionHeaderEl = document.createElement("h2");
    sectionHeaderEl.textContent = `Published Books`;
    publishedSection.appendChild(sectionHeaderEl);

    publishedBooks.forEach(book => {
        const bookCard = createBookCard(book)
        publishedSection.appendChild(bookCard);
    })
}

/**
 * Skapar ett bokkort för varje bok.
 * @param {Object} book - Ett bokobjekt
 * @param {Object} book.volumeInfo - Information om bok
 * @param {string} book.volumeInfo.title - Titel
 * @param {string[]} book.volumeInfo.authors - Författare
 * @param {string} book.volumeInfo.publishedDate - Publiceringsdatum
 * @param {string} book.volumeInfo.infoLink - Länk till bok
 * @returns {HTMLDivElement} - Ett bokkort
 */
function createBookCard(book) {
    let savedBooks = JSON.parse(localStorage.getItem("bookData")) || [];
    const bookExists = savedBooks.some(savedBook => savedBook.title === book.volumeInfo.title);

    const bookCard = document.createElement("div");
    bookCard.classList.add("book-card");

    const bookImgEl = document.createElement("img")
    bookImgEl.src = book.volumeInfo.imageLinks?.thumbnail.replace("http://", "https://");

    const bookInfoEl = document.createElement("div");
    bookInfoEl.classList.add("book-info");

    const titleEl = document.createElement("h3")
    titleEl.textContent = book.volumeInfo.title;

    const authorsEl = document.createElement("p")
    authorsEl.textContent = book.volumeInfo.authors?.join(", ");

    const dateEl = document.createElement("p");
    const dateOnly = new Date(book.volumeInfo.publishedDate).toLocaleDateString();
    dateEl.textContent = `Published ${dateOnly}`;

    const pageCountEl = document.createElement("p");
    const pages = book.volumeInfo.pageCount;

    bookCard.append(bookImgEl, bookInfoEl);
    bookInfoEl.append(titleEl, authorsEl, dateEl);

    if (pages && pages > 0) {
        pageCountEl.textContent = `${pages} pages`;
        bookInfoEl.appendChild(pageCountEl);
    }

    const saveBtnEl = document.createElement("button");
    saveBtnEl.classList.add("btn", "save-btn");
    bookInfoEl.appendChild(saveBtnEl);

    if (bookExists) {
        saveBtnEl.textContent = "Saved";
        saveBtnEl.disabled = true;
    } else {
        saveBtnEl.textContent = "Want to Read";
    }

    const infoLinkEl = document.createElement("a");
    infoLinkEl.textContent = "View details";
    infoLinkEl.href = book.volumeInfo.infoLink;
    infoLinkEl.target = "_blank";
    bookInfoEl.appendChild(infoLinkEl);

    saveBtnEl.addEventListener("click", () => {
        saveBookCard(book);

        saveBtnEl.textContent = "Saved";
        saveBtnEl.disabled = true;

        displaySavedBooks();
    })
    return bookCard;
}

/**
 * Sparar en bok i localStorage om den inte redan finns där.
 * @param {Object} book - Ett bokobjekt från Google Books API
 */
function saveBookCard(book) {
    let savedBooks = JSON.parse(localStorage.getItem("bookData")) || [];

    const bookData = {
        title: book.volumeInfo.title,
        author: book.volumeInfo.authors,
        date: book.volumeInfo.publishedDate,
        link: book.volumeInfo.infoLink
    };

    let bookExists = savedBooks.some(savedBook => savedBook.title === bookData.title);

    if (bookExists === false) {
        savedBooks.unshift(bookData);
        localStorage.setItem("bookData", JSON.stringify(savedBooks));
        displaySavedBooks();
    }
}

/**
 * Hämtar sparade böcker från localStorage och skriver ut dem.
 */
function displaySavedBooks() {
    savedBooksSection.innerHTML = "";

    let savedBooks = JSON.parse(localStorage.getItem("bookData")) || [];

    if (savedBooks.length === 0) {
        savedBooksSection.classList.add("hidden");
        return;
    }
    savedBooksSection.classList.remove("hidden");

    const savedBooksHeaderEl = document.createElement("h2");
    savedBooksHeaderEl.textContent = `Want to Read`;
    savedBooksSection.appendChild(savedBooksHeaderEl);

    savedBooks.forEach(book => {
        const savedCard = createSavedBookCard(book);
        savedBooksSection.appendChild(savedCard);
    })
}

/**
 * Skapar bokkort för en sparad bok.
 * @param {Object} book - Ett sparat bokobjekt från localStorage
 * @param {string} book.title - Titel
 * @param {string[]} book.author - Författare
 * @param {string} book.date - Datum
 * @param {string} book.link - Länk till bok
 * @returns {HTMLDivElement} - Ett bokkort
 */
function createSavedBookCard(book) {
    const savedCard = document.createElement("div");
    savedCard.classList.add("saved-card-info");

    const savedInfoEl = document.createElement("div");
    savedInfoEl.classList.add("book-info");

    const savedCardHeaderEl = document.createElement("div");
    savedCardHeaderEl.classList.add("saved-card-header");

    const titleEl = document.createElement("p")
    titleEl.classList.add("bold");
    titleEl.textContent = book.title;

    const authorsEl = document.createElement("p")
    authorsEl.textContent = book.author.join(", ");

    const publishedDateEl = document.createElement("p")
    publishedDateEl.textContent = `Published ${book.date}`;

    const infoLinkEl = document.createElement("a");
    infoLinkEl.textContent = "View details";
    infoLinkEl.href = book.link;
    infoLinkEl.target = "_blank";

    savedCard.append(savedCardHeaderEl, savedInfoEl)
    savedCardHeaderEl.append(titleEl)
    savedInfoEl.append(authorsEl, publishedDateEl, infoLinkEl);

    const deleteBtnEl = document.createElement("button");
    deleteBtnEl.textContent = `Remove`;
    deleteBtnEl.classList.add("btn", "delete-btn");
    savedCardHeaderEl.appendChild(deleteBtnEl);

    deleteBtnEl.addEventListener("click", function () {
        let updatedSavedBooks = JSON.parse(localStorage.getItem("bookData")) || [];
        updatedSavedBooks = updatedSavedBooks.filter(savedBook => savedBook.title !== book.title);
        localStorage.setItem("bookData", JSON.stringify(updatedSavedBooks))

        displaySavedBooks();
        sortBooks(currentBooks);
    })
    return savedCard;
}