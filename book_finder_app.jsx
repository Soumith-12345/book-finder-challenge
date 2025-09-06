import React, { useState, useEffect, useCallback } from 'react';

// --- SVG Icon Components ---

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const BookOpenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
);

// --- UI Components ---

/**
 * A loading spinner component to indicate data fetching.
 */
const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-sky-500"></div>
    </div>
);

/**
 * A component to display error messages or information.
 * @param {{ message: string }} props - The message to display.
 */
const MessageDisplay = ({ message }) => (
    <div className="text-center p-8 bg-slate-800 rounded-lg shadow-md">
        <p className="text-slate-400 text-lg">{message}</p>
    </div>
);

/**
 * A card component to display individual book information.
 * @param {{ book: object }} props - The book object from the API.
 */
const BookCard = ({ book }) => {
    // Construct the cover image URL. Use a placeholder if no cover ID is available.
    const coverUrl = book.cover_i
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
        : 'https://placehold.co/300x450/334155/e2e8f0?text=No+Cover+Available';

    // Format author names, handling cases where it might be an array or undefined.
    const authors = book.author_name ? book.author_name.join(', ') : 'Unknown Author';

    return (
        <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl flex flex-col">
            <img 
                src={coverUrl} 
                alt={`Cover of ${book.title}`} 
                className="w-full h-72 object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/300x450/334155/e2e8f0?text=No+Cover+Available'; }}
            />
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-white truncate" title={book.title}>
                    {book.title}
                </h3>
                <p className="text-sm text-slate-400 mt-1 flex-grow truncate" title={authors}>
                    {authors}
                </p>
                 <a
                    href={`https://openlibrary.org${book.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 text-center bg-sky-600 text-white py-2 px-4 rounded-md text-sm font-semibold hover:bg-sky-700 transition-colors duration-200"
                >
                    View Details
                </a>
            </div>
        </div>
    );
};


// --- Main App Component ---

function App() {
    // --- State Management ---
    const [searchTerm, setSearchTerm] = useState(''); // Input field value
    const [query, setQuery] = useState(''); // The actual term submitted for search
    const [searchType, setSearchType] = useState('title'); // 'title', 'author', or 'subject'
    const [books, setBooks] = useState([]); // Array of book results
    const [loading, setLoading] = useState(false); // Loading state for API calls
    const [error, setError] = useState(null); // Error message state
    const [hasSearched, setHasSearched] = useState(false); // Track if a search has been performed

    // --- Data Fetching Effect ---
    // This effect runs whenever the `query` or `searchType` state changes.
    const fetchBooks = useCallback(async () => {
        if (!query) {
            setBooks([]);
            return;
        }

        setLoading(true);
        setError(null);
        setHasSearched(true);

        // The Open Library API base URL
        const API_URL = 'https://openlibrary.org/search.json';
        const searchParam = searchType === 'subject' ? 'subject' : searchType;
        const encodedQuery = encodeURIComponent(query);
        const url = `${API_URL}?${searchParam}=${encodedQuery}&limit=24`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Something went wrong with the network request.');
            }
            const data = await response.json();

            if (data.docs.length === 0) {
                setError('No books found. Try a different search!');
            } else {
                setBooks(data.docs);
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch books. Please try again later.');
            setBooks([]);
        } finally {
            setLoading(false);
        }
    }, [query, searchType]);

    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

    // --- Event Handlers ---
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            setQuery(searchTerm.trim());
        }
    };

    // --- Render Logic ---
    const renderContent = () => {
        if (loading) {
            return <LoadingSpinner />;
        }
        if (error) {
            return <MessageDisplay message={error} />;
        }
        if (hasSearched && books.length > 0) {
            return (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {books.map((book) => (
                        <BookCard key={book.key} book={book} />
                    ))}
                </div>
            );
        }
        if (!hasSearched) {
            // Display a welcome message before the first search
            return (
                <div className="text-center p-8 bg-slate-800 rounded-lg shadow-md flex flex-col items-center gap-4">
                    <BookOpenIcon />
                    <p className="text-slate-400 text-lg">Welcome, Alex! Search for a book to get started.</p>
                </div>
            );
        }
        // This case is handled by the error state ("No books found...")
        return null;
    };

    return (
        <div className="bg-slate-900 text-white min-h-screen font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* --- Header --- */}
                <header className="text-center mb-8">
                    <div className="flex justify-center items-center gap-4">
                        <BookOpenIcon />
                        <h1 className="text-4xl sm:text-5xl font-bold text-sky-400">Book Finder</h1>
                    </div>
                    <p className="text-slate-400 mt-2">Your personal guide to the Open Library</p>
                </header>

                {/* --- Search Form --- */}
                <form onSubmit={handleSearchSubmit} className="mb-8 p-6 bg-slate-800 rounded-lg shadow-lg">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-grow">
                             <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={`Search by ${searchType}...`}
                                className="w-full pl-4 pr-12 py-3 bg-slate-700 text-white rounded-md border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                            />
                             <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white transition-colors" aria-label="Search">
                                <SearchIcon />
                            </button>
                        </div>
                    </div>

                    {/* --- Search Type Radio Buttons --- */}
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="searchType"
                                value="title"
                                checked={searchType === 'title'}
                                onChange={(e) => setSearchType(e.target.value)}
                                className="form-radio text-sky-500 bg-slate-600 border-slate-500 focus:ring-sky-500"
                            />
                            <span className="text-slate-300">Title</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="searchType"
                                value="author"
                                checked={searchType === 'author'}
                                onChange={(e) => setSearchType(e.target.value)}
                                className="form-radio text-sky-500 bg-slate-600 border-slate-500 focus:ring-sky-500"
                            />
                            <span className="text-slate-300">Author</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="searchType"
                                value="subject"
                                checked={searchType === 'subject'}
                                onChange={(e) => setSearchType(e.target.value)}
                                className="form-radio text-sky-500 bg-slate-600 border-slate-500 focus:ring-sky-500"
                            />
                            <span className="text-slate-300">Subject</span>
                        </label>
                    </div>
                </form>

                {/* --- Results Section --- */}
                <main>
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}

export default App;

