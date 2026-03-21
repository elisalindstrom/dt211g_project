"use strict";
const API_KEY = "AIzaSyCSUg9ANLug1QAFQZyyOt81JiDAnsI-ZhY";

const searchForm = document.querySelector("#search-form");
const authorInput = document.querySelector("#author-input");
const loader = document.querySelector("#loader");
const savedBooksSection = document.querySelector("#saved-card");
const authorProfile = document.querySelector("#author-info-card");
const upcomingSection = document.querySelector("#upcoming-books");
const publishedSection = document.querySelector("#published-books");

let upcomingBooks = [];
let publishedBooks = [];

displaySavedBooks();

searchForm.addEventListener("submit", searchAuthor);

/**
 * 
 * @param {*} event 
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
 * 
 * @param {*} authorValue 
 * @returns 
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
 * 
 */
function displayAuthorNotFound() {
    const authorProfile = document.querySelector("#author-info-card");
    authorProfile.classList.remove("hidden");

    const authorNameElement = document.createElement("h2");
    authorNameElement.textContent = `Author not found`;
    authorProfile.appendChild(authorNameElement);
}

/**
 * 
 * @param {*} author 
 */
function displayAuthor(author) {
    authorProfile.classList.remove("hidden");

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

    if (author.top_work) {
        const topWorkElement = document.createElement("p");
        topWorkElement.textContent = `Top Work: ${author.top_work}`;
        authorProfile.appendChild(topWorkElement)
    }
    fetchBooks(authorName);
}

/**
 * Hämtar böcker från Google Books API.
 * @param {*} authorName 
 * @returns 
 */
async function fetchBooks(authorName) {
    loader.classList.remove("hidden");

    try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=inauthor:"${authorName}"&printType=books&maxResults=40&key=${API_KEY}`);
        const books = await response.json();

        if (books.items === false) {
            return;
        }
        filterBooks(books.items);
        console.log(books.items);
    } catch (error) {
        console.error("Något gick fel" + error);
    } finally {
        loader.classList.add("hidden");
    }
}

/**
 * Filtrerar hämtade böcker så endast de med titel, datum och omslag skickas vidare.
 * @param {*} books 
 */
function filterBooks(books) {
    const filteredBooks = books.filter(book => book.volumeInfo?.title && book.volumeInfo?.publishedDate && book.volumeInfo?.imageLinks);

    sortBooks(filteredBooks);
}

/**
 * Sorterar böcker utifrån dagens datum.
 * @param {*} books 
 */
function sortBooks(books) {
    const today = new Date();

    upcomingBooks = [];
    publishedBooks = [];

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
 * Skriver ut kommande böcker
 * @param {*} upcomingBooks 
 */
function displayUpcomingBooks(upcomingBooks) {
    upcomingSection.innerHTML = "";

    if (upcomingBooks.length === 0) {
        return;
    }
    upcomingSection.classList.remove("hidden");

    const sectionHeader = document.createElement("h2");
    upcomingSection.appendChild(sectionHeader);
    sectionHeader.textContent = `Upcoming Releases`;

    upcomingBooks.forEach(book => {
        const card = createBookCard(book)
        upcomingSection.appendChild(card);
    })
}

/**
 * Skriver ut publicerade böcker
 * @param {*} publishedBooks 
 */
function displayPublishedBooks(publishedBooks) {
    publishedSection.innerHTML = "";

    if (publishedBooks.length === 0) {
        return;
    }
    publishedSection.classList.remove("hidden");
    
    const sectionHeader = document.createElement("h2");
    publishedSection.appendChild(sectionHeader);
    sectionHeader.textContent = `Published Books`;

    publishedBooks.forEach(book => {
        const card = createBookCard(book)
        publishedSection.appendChild(card);
    })
}

/**
 * Skapar bokkort
 * @param {*} book 
 * @returns 
 */
function createBookCard(book) {
    let savedBooks = JSON.parse(localStorage.getItem("bookData")) || [];
    const bookExists = savedBooks.some(savedBook => savedBook.title === book.volumeInfo.title);

    const bookCard = document.createElement("div");
    bookCard.classList.add("book-card");

    const bookImg = document.createElement("img")
    bookImg.src = book.volumeInfo.imageLinks?.thumbnail.replace("http://", "https://");

    const bookInfo = document.createElement("div");
    bookInfo.classList.add("book-info");

    const title = document.createElement("h3")
    title.textContent = book.volumeInfo.title;

    const authors = document.createElement("p")
    authors.textContent = book.volumeInfo.authors?.join(", ");

    const date = document.createElement("p");
    const dateOnly = new Date(book.volumeInfo.publishedDate).toLocaleDateString();
    date.textContent = `Published ${dateOnly}`;

    const pageCount = document.createElement("p");
    const pages = book.volumeInfo.pageCount;

    bookCard.append(bookImg, bookInfo);
    bookInfo.append(title, authors, date);

    if (pages > 0) {
        pageCount.textContent = `${pages} pages`;
        bookInfo.appendChild(pageCount);
    }

    const saveBtn = document.createElement("button");
    saveBtn.classList.add("btn", "save-btn");

    bookInfo.appendChild(saveBtn);

    if (bookExists) {
        saveBtn.textContent = "Saved";
        saveBtn.disabled = true;
    } else {
        saveBtn.textContent = "Want to Read";
    }

    const infoLink = document.createElement("a");
    infoLink.textContent = "View details";
    infoLink.href = book.volumeInfo.infoLink;
    infoLink.target = "_blank";
    bookInfo.appendChild(infoLink);

    saveBtn.addEventListener("click", () => {
        saveBookCard(book);

        saveBtn.textContent = "Saved";
        saveBtn.disabled = true;

        displaySavedBooks();
    })
    return bookCard;
}

/**
 * 
 * @param {*} book 
 */
function saveBookCard(book) {
    let savedBooks = JSON.parse(localStorage.getItem("bookData")) || [];

    const bookData = {
        title: book.volumeInfo.title,
        author: book.volumeInfo.authors,
        date: book.volumeInfo.publishedDate,
        link: book.volumeInfo.infoLink
    };

    savedBooks = JSON.parse(localStorage.getItem("bookData")) || [];
    let bookExists = savedBooks.some(savedBook => savedBook.title === bookData.title);

    if (bookExists === false) {
        savedBooks.unshift(bookData);
        localStorage.setItem("bookData", JSON.stringify(savedBooks));
        displaySavedBooks();
    }
}

/**
 * 
 * @returns 
 */
function displaySavedBooks() {
    savedBooksSection.innerHTML = "";

    let savedBooks = JSON.parse(localStorage.getItem("bookData")) || [];

    if (savedBooks.length === 0) {
        savedBooksSection.classList.add("hidden");
        return;
    }
    savedBooksSection.classList.remove("hidden");

    const savedBooksHeader = document.createElement("h2");
    savedBooksHeader.textContent = `Want to Read`;
    savedBooksSection.appendChild(savedBooksHeader);

    savedBooks.forEach(book => {
        const savedCard = createSavedBookCard(book);
        savedBooksSection.appendChild(savedCard);

    })
}

/**
 * Skapar kort för sparade böcker
 * @returns 
 */
function createSavedBookCard(book) {
    const savedCard = document.createElement("div");
    savedCard.classList.add("saved-card-info");

    const savedInfo = document.createElement("div");
    savedInfo.classList.add("book-info");

    const savedCardHeader = document.createElement("div");
    savedCardHeader.classList.add("saved-card-header");

    const title = document.createElement("p")
    title.classList.add("bold");
    title.textContent = book.title;

    const authors = document.createElement("p")
    authors.textContent = book.author.join(", ");

    const publishedDate = document.createElement("p")
    publishedDate.textContent = `Published ${book.date}`;

    const infoLink = document.createElement("a");
    infoLink.textContent = "View details";
    infoLink.href = book.link;
    infoLink.target = "_blank";

    savedCard.append(savedCardHeader, savedInfo)
    savedCardHeader.append(title)
    savedInfo.append(authors, publishedDate, infoLink);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = `Remove`;
    deleteBtn.classList.add("btn", "delete-btn");
    savedCardHeader.appendChild(deleteBtn);

    deleteBtn.addEventListener("click", function () {
        let updatedSavedBooks = JSON.parse(localStorage.getItem("bookData")) || [];
        updatedSavedBooks = updatedSavedBooks.filter(savedBook => savedBook.title !== book.title);
        localStorage.setItem("bookData", JSON.stringify(updatedSavedBooks))

        displaySavedBooks();
        displayUpcomingBooks(upcomingBooks);
        displayPublishedBooks(publishedBooks);
    })
    return savedCard;
}