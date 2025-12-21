import React, { useEffect, useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Book, Author } from '@/types';
import booksRoutes from '@/routes/books';
import { X, Plus, Search, ChevronDown, BookOpen } from 'lucide-react';
import axios from 'axios';

interface BookFormProps {
    book?: Book;
    authors: Author[];
    onClose: () => void;
}

interface OpenLibraryBook {
    title: string;
    authors: string[];
    first_publish_year?: number;
    publisher?: string[];
    cover_i?: number;
    isbn?: string[];
}

const BookForm: React.FC<BookFormProps> = ({ book, authors, onClose }) => {
    const isEditMode = !!book;
    const isCreateMode = !isEditMode;
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<OpenLibraryBook[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [authorInput, setAuthorInput] = useState('');
    const [selectedAuthorIds, setSelectedAuthorIds] = useState<number[]>([]);
    const [newAuthorNames, setNewAuthorNames] = useState<string[]>([]);
    const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);
    const [activeTab, setActiveTab] = useState<'search' | 'manual'>(isCreateMode ? 'search' : 'manual');

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        title: '',
        isbn: '',
        publication_year: '',
        authors: [] as number[],
        new_authors: [] as string[],
        publisher: '',
        description: '',
        cover_url: '',
    });

    // Initialize form data when book prop changes
    useEffect(() => {
        clearErrors();
        if (book) {
            setData({
                title: book.title || '',
                isbn: book.isbn || '',
                publication_year: book.publication_year?.toString() || '',
                authors: book.authors?.map((author) => author.id) || [],
                new_authors: [],
                publisher: book.publisher || '',
                description: book.description || '',
                cover_url: book.cover_url || '',
            });
            setSelectedAuthorIds(book.authors?.map(author => author.id) || []);
        } else {
            reset();
            setSelectedAuthorIds([]);
            setNewAuthorNames([]);
        }
    }, [book]);

    // Handle adding a new author
    const handleAddNewAuthor = () => {
        const trimmedName = authorInput.trim();
        if (!trimmedName) return;

        // Check if author already exists
        const existingAuthor = authors.find(author =>
            `${author.first_name} ${author.last_name}`.toLowerCase() === trimmedName.toLowerCase()
        );

        if (existingAuthor) {
            // Add existing author if not already selected
            if (!selectedAuthorIds.includes(existingAuthor.id)) {
                const newIds = [...selectedAuthorIds, existingAuthor.id];
                setSelectedAuthorIds(newIds);
                setData('authors', newIds);
            }
        } else if (!newAuthorNames.includes(trimmedName)) {
            // Add new author
            setNewAuthorNames(prev => [...prev, trimmedName]);
            setData('new_authors', [...data.new_authors, trimmedName]);
        }

        setAuthorInput('');
        setShowAuthorDropdown(false);
    };

    // Handle removing an author
    const handleRemoveAuthor = (type: 'existing' | 'new', idOrName: number | string) => {
        if (type === 'existing') {
            const newIds = selectedAuthorIds.filter(id => id !== idOrName);
            setSelectedAuthorIds(newIds);
            setData('authors', newIds);
        } else {
            setNewAuthorNames(prev => prev.filter(name => name !== idOrName));
            setData('new_authors', data.new_authors.filter(name => name !== idOrName));
        }
    };

    // Search book by title using Open Library API
    const searchBookByTitle = async (title: string) => {
        if (!title.trim() || title.length < 2) return;

        setIsLoadingSearch(true);
        setSearchError(null);
        setSearchResults([]);

        try {
            const response = await fetch(
                `https://openlibrary.org/search.json?q=${encodeURIComponent(title)}&limit=5&fields=title,author_name,first_publish_year,publisher,cover_i,isbn`
            );

            if (!response.ok) throw new Error('Failed to search for books');

            const result = await response.json();

            if (result.docs?.length > 0) {
                const formattedResults = result.docs.slice(0, 5).map((doc: any) => ({
                    title: doc.title,
                    authors: doc.author_name || [],
                    first_publish_year: doc.first_publish_year,
                    publisher: doc.publisher?.[0] || '',
                    cover_i: doc.cover_i,
                    isbn: doc.isbn?.[0] || '',
                }));
                setSearchResults(formattedResults);
                setShowSearchResults(true);
            } else {
                setSearchError('No books found');
            }
        } catch (error) {
            console.error('Search error:', error);
            setSearchError('Search failed. Please try again.');
        } finally {
            setIsLoadingSearch(false);
        }
    };

    // Handle selecting a book from search results
    const handleSelectBook = async (bookData: OpenLibraryBook) => {
        setIsLoadingSearch(true);

        // Set basic fields
        setData(prev => ({
            ...prev,
            title: bookData.title || prev.title,
            publication_year: bookData.first_publish_year?.toString() || prev.publication_year,
            publisher: bookData.publisher || prev.publisher,
            cover_url: bookData.cover_i ? `https://covers.openlibrary.org/b/id/${bookData.cover_i}-M.jpg` : prev.cover_url,
            isbn: bookData.isbn || prev.isbn,
        }));

        setActiveTab('manual');

        // Add authors
        if (bookData.authors?.length > 0) {
            const validAuthors = bookData.authors
                .filter((authorName: string) => authorName?.trim())
                .map((authorName: string) => authorName.trim());

            if (validAuthors.length > 0) {
                try {
                    // Use regular axios instead of Inertia router
                    const response = await axios.post('/authors/check-existing', {
                        authorNames: validAuthors
                    }, {
                        headers: {
                            'X-Inertia': false, // Disable Inertia
                            'Accept': 'application/json', // Request JSON
                            'X-Requested-With': 'XMLHttpRequest',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                        }
                    });

                    const result = response.data;
                    let existingAuthorsToAdd: number[] = [];
                    let newAuthorsToAdd: string[] = [];

                    // Process the response based on your controller output
                    if (result.results) {
                        // Your controller returns results array with {exists: true/false, author: {...}}
                        result.results.forEach((r: any) => {
                            if (r.exists && r.author) {
                                // Add existing author ID
                                if (!selectedAuthorIds.includes(r.author.id)) {
                                    existingAuthorsToAdd.push(r.author.id);
                                }
                            } else if (!r.exists) {
                                // Add new author name
                                if (!newAuthorNames.includes(r.original_name)) {
                                    newAuthorsToAdd.push(r.original_name);
                                }
                            }
                        });
                    } else {
                        // Fallback logic
                        validAuthors.forEach((authorName: string) => {
                            // Check if author exists in the props
                            const existingAuthor = authors.find(author =>
                                `${author.first_name || ''} ${author.last_name || ''}`.trim().toLowerCase() ===
                                authorName.toLowerCase().trim()
                            );

                            if (existingAuthor) {
                                if (!selectedAuthorIds.includes(existingAuthor.id)) {
                                    existingAuthorsToAdd.push(existingAuthor.id);
                                }
                            } else {
                                if (!newAuthorNames.includes(authorName)) {
                                    newAuthorsToAdd.push(authorName);
                                }
                            }
                        });
                    }

                    // Update selected author IDs
                    if (existingAuthorsToAdd.length > 0) {
                        const updatedSelectedIds = [...selectedAuthorIds, ...existingAuthorsToAdd];
                        setSelectedAuthorIds(updatedSelectedIds);
                        setData('authors', updatedSelectedIds);
                    }

                    // Update new author names
                    if (newAuthorsToAdd.length > 0) {
                        const updatedNewAuthors = [...newAuthorNames, ...newAuthorsToAdd];
                        setNewAuthorNames(updatedNewAuthors);
                        setData('new_authors', updatedNewAuthors);
                    }

                } catch (error) {
                    console.error('Error checking authors:', error);
                    // Fallback: Check locally
                    validAuthors.forEach((authorName: string) => {
                        const existingAuthor = authors.find(author =>
                            `${author.first_name || ''} ${author.last_name || ''}`.trim().toLowerCase() ===
                            authorName.toLowerCase().trim()
                        );

                        if (existingAuthor) {
                            if (!selectedAuthorIds.includes(existingAuthor.id)) {
                                setSelectedAuthorIds(prev => [...prev, existingAuthor.id]);
                                setData('authors', [...data.authors, existingAuthor.id]);
                            }
                        } else {
                            if (!newAuthorNames.includes(authorName)) {
                                setNewAuthorNames(prev => [...prev, authorName]);
                                setData('new_authors', [...data.new_authors, authorName]);
                            }
                        }
                    });
                }
            }
        }

        setShowSearchResults(false);
        setIsLoadingSearch(false);
    };

    // Helper function for fallback
    const fallbackToLocalCheck = (authorList: string[]) => {
        const authorsToAdd: string[] = [];

        authorList.forEach((authorName: string) => {
            if (!authorName?.trim()) return;

            const exists = authors.some(author =>
                `${author.first_name || ''} ${author.last_name || ''}`.trim().toLowerCase() ===
                authorName.toLowerCase().trim()
            );

            if (!exists && !newAuthorNames.includes(authorName) && !authorsToAdd.includes(authorName)) {
                authorsToAdd.push(authorName);
            }
        });

        if (authorsToAdd.length > 0) {
            const updatedNewAuthors = [...newAuthorNames, ...authorsToAdd];
            setNewAuthorNames(updatedNewAuthors);
            setData('new_authors', updatedNewAuthors);
        }
    };

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (data.title.trim().length >= 2 && isCreateMode && activeTab === 'search') {
                searchBookByTitle(data.title);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [data.title, activeTab]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.title.trim() || !data.isbn.trim() ||
            (selectedAuthorIds.length === 0 && newAuthorNames.length === 0)) {
            return;
        }

        const submitData = {
            ...data,
            publication_year: data.publication_year ? parseInt(data.publication_year) : '',
        };

        const submitAction = isEditMode && book
            ? (booksRoutes?.update?.url
                ? put(booksRoutes.update.url({ book: book.id }), { data: submitData })
                : put(`/books/${book.id}`, { data: submitData }))
            : (booksRoutes?.store?.url
                ? post(booksRoutes.store.url(), { data: submitData })
                : post('/books', { data: submitData }));

        submitAction?.onSuccess(() => {
            router.reload({ only: ['books'] });
            onClose();
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose} >
            <div className="bg-gray-800 rounded-xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            {isEditMode ? 'Edit Book' : 'Add New Book'}
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                            {isEditMode ? 'Update book details' : 'Add a new book to the library'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Tab Navigation for Create Mode */}
                    {isCreateMode && (
                        <div className="flex gap-2 mb-6 bg-gray-900/50 p-1 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setActiveTab('search')}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'search'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-400 hover:text-white'}`}
                            >
                                <Search className="w-4 h-4 inline mr-2" />
                                Search
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('manual')}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'manual'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-400 hover:text-white'}`}
                            >
                                <BookOpen className="w-4 h-4 inline mr-2" />
                                Manual Entry
                            </button>
                        </div>
                    )}

                    {/* Search Tab */}
                    {isCreateMode && activeTab === 'search' && (
                        <div className="mb-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="w-full pl-10 pr-10 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Search for book by title..."
                                    disabled={isLoadingSearch}
                                />
                                {data.title && !isLoadingSearch && (
                                    <button
                                        type="button"
                                        onClick={() => setData('title', '')}
                                        className="absolute right-3 top-3.5 text-gray-400 hover:text-white"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {isLoadingSearch && (
                                <div className="mt-3 text-center py-3">
                                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                                    <span className="ml-2 text-sm text-gray-400">Searching...</span>
                                </div>
                            )}

                            {searchError && (
                                <div className="mt-3 p-3 bg-amber-900/20 border border-amber-800 rounded-lg">
                                    <p className="text-amber-500 text-sm">{searchError}</p>
                                </div>
                            )}

                            {/* Search Results */}
                            {showSearchResults && searchResults.length > 0 && (
                                <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                                    {searchResults.map((result, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => handleSelectBook(result)}
                                            className="w-full p-3 text-left bg-gray-900/50 hover:bg-gray-900 rounded-lg border border-gray-700 transition-colors"
                                        >
                                            <div className="flex items-start gap-3">
                                                {result.cover_i ? (
                                                    <img
                                                        src={`https://covers.openlibrary.org/b/id/${result.cover_i}-S.jpg`}
                                                        alt={result.title}
                                                        className="w-10 h-14 object-cover rounded"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-14 bg-gray-700 rounded flex items-center justify-center">
                                                        <BookOpen className="w-5 h-5 text-gray-500" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-white font-medium text-sm truncate">
                                                        {result.title}
                                                    </h4>
                                                    <p className="text-gray-400 text-xs mt-1 truncate">
                                                        {result.authors?.slice(0, 2).join(', ')}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        {result.first_publish_year && (
                                                            <span className="text-xs text-gray-500">
                                                                {result.first_publish_year}
                                                            </span>
                                                        )}
                                                        {result.isbn && (
                                                            <span className="text-xs text-gray-500">
                                                                ISBN: {result.isbn}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Manual Entry Form */}
                    <form onSubmit={handleSubmit}>
                        {(activeTab === 'manual' || isEditMode) && (
                            <>
                                {/* Basic Information */}
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="block text-gray-300 text-sm font-medium mb-2">
                                            Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                            required
                                        />
                                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                                ISBN <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.isbn}
                                                onChange={(e) => setData('isbn', e.target.value)}
                                                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                required
                                            />
                                            {errors.isbn && <p className="text-red-500 text-xs mt-1">{errors.isbn}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                                Year
                                            </label>
                                            <input
                                                type="number"
                                                value={data.publication_year}
                                                onChange={(e) => setData('publication_year', e.target.value)}
                                                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                min="1000"
                                                max={new Date().getFullYear()}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-gray-300 text-sm font-medium mb-2">
                                            Publisher
                                        </label>
                                        <input
                                            type="text"
                                            value={data.publisher}
                                            onChange={(e) => setData('publisher', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Authors Section - More Compact */}
                                <div className="mb-6">
                                    <label className="block text-gray-300 text-sm font-medium mb-2">
                                        Authors <span className="text-red-500">*</span>
                                    </label>

                                    {/* Author Input */}
                                    <div className="relative mb-3">
                                        <input
                                            type="text"
                                            value={authorInput}
                                            onChange={(e) => setAuthorInput(e.target.value)}
                                            onFocus={() => setShowAuthorDropdown(true)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNewAuthor())}
                                            className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm pr-10"
                                            placeholder="Type author name and press Enter"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddNewAuthor}
                                            className="absolute right-2 top-2 p-1.5 bg-blue-600 hover:bg-blue-500 rounded text-white"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Author Suggestions Dropdown */}
                                    {showAuthorDropdown && authorInput && (
                                        <div className="absolute z-10 mt-1 w-full max-w-md bg-gray-900 border border-gray-700 rounded-lg shadow-lg">
                                            <div className="py-2 max-h-48 overflow-y-auto">
                                                {authors
                                                    .filter(author =>
                                                        `${author.first_name} ${author.last_name}`
                                                            .toLowerCase()
                                                            .includes(authorInput.toLowerCase())
                                                    )
                                                    .slice(0, 5)
                                                    .map(author => (
                                                        <button
                                                            key={author.id}
                                                            type="button"
                                                            onClick={() => {
                                                                if (!selectedAuthorIds.includes(author.id)) {
                                                                    const newIds = [...selectedAuthorIds, author.id];
                                                                    setSelectedAuthorIds(newIds);
                                                                    setData('authors', newIds);
                                                                }
                                                                setAuthorInput('');
                                                                setShowAuthorDropdown(false);
                                                            }}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800"
                                                        >
                                                            {author.first_name} {author.last_name}
                                                        </button>
                                                    ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Selected Authors Display - More Compact */}
                                    {(selectedAuthorIds.length > 0 || newAuthorNames.length > 0) && (
                                        <div className="space-y-2 mt-3">
                                            {selectedAuthorIds.map(authorId => {
                                                const author = authors.find(a => a.id === authorId);
                                                return author ? (
                                                    <div key={authorId} className="flex items-center justify-between bg-gray-900/50 px-3 py-2 rounded-lg">
                                                        <span className="text-sm text-gray-300">
                                                            {author.first_name} {author.last_name}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveAuthor('existing', authorId)}
                                                            className="text-gray-400 hover:text-red-400"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : null;
                                            })}

                                            {newAuthorNames.map((authorName, index) => (
                                                <div key={index} className="flex items-center justify-between bg-green-900/20 px-3 py-2 rounded-lg border border-green-800">
                                                    <span className="text-sm text-green-300">
                                                        {authorName} <span className="text-green-500 text-xs">(new)</span>
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveAuthor('new', authorName)}
                                                        className="text-green-400 hover:text-red-400"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {(errors.authors || errors.new_authors) && (
                                        <p className="text-red-500 text-xs mt-2">
                                            {errors.authors || errors.new_authors}
                                        </p>
                                    )}
                                </div>

                                {/* Cover Image */}
                                {data.cover_url && (
                                    <div className="mb-6">
                                        <label className="block text-gray-300 text-sm font-medium mb-2">
                                            Cover Image
                                        </label>
                                        <div className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={data.cover_url}
                                                    alt="Book cover"
                                                    className="w-12 h-16 object-cover rounded"
                                                />
                                                <span className="text-sm text-gray-400">Cover loaded</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setData('cover_url', '')}
                                                className="text-gray-400 hover:text-white text-sm"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Description */}
                                <div className="mb-6">
                                    <label className="block text-gray-300 text-sm font-medium mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-h-[80px]"
                                        rows={3}
                                    />
                                </div>
                            </>
                        )}

                        {/* Form Actions */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                                disabled={processing}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing || !data.title.trim() || !data.isbn.trim() ||
                                    (selectedAuthorIds.length === 0 && newAuthorNames.length === 0)}
                                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <span className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Saving...
                                    </span>
                                ) : isEditMode ? 'Update Book' : 'Add Book'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookForm;