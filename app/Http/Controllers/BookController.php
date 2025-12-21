<?php

namespace App\Http\Controllers;

use App\Models\Author;
use App\Models\Book;
use App\Models\Log;
use App\Models\Status;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Book::with('authors', 'status');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('isbn', 'like', "%{$search}%")
                    ->orWhereHas('authors', function ($q) use ($search) {
                        $q->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%");
                    });
            });
        }

        $books = $query->paginate(10)->withQueryString();
        $authors = Author::all();

        return Inertia::render('bookmanagement', [
            'books' => $books,
            'authors' => $authors,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'isbn' => 'nullable|string|unique:books,isbn',
            'publication_year' => 'nullable|integer|min:1000|max:' . date('Y'),
            'authors' => 'nullable|array',
            'authors.*' => 'exists:authors,id',
            'new_authors' => 'nullable|array',
            'new_authors.*' => 'string|max:255',
            'publisher' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'cover_url' => 'nullable|url',
        ]);

        $status = Status::where('title', 'Available')->first();
        $statusId = $status ? $status->id : 1;

        $book = Book::create([
            'title' => $request->title,
            'isbn' => $request->isbn,
            'publication_year' => $request->publication_year,
            'status_id' => $statusId,
            'publisher' => $request->publisher,
            'description' => $request->description,
            'cover_url' => $request->cover_url,
        ]);

        $authorIds = [];

        // Attach existing authors
        if ($request->has('authors') && is_array($request->authors)) {
            $authorIds = $request->authors;
        }

        // Create and attach new authors
        if ($request->has('new_authors') && is_array($request->new_authors)) {
            foreach ($request->new_authors as $authorName) {
                $nameParts = explode(' ', trim($authorName), 2);

                $firstName = $nameParts[0] ?? '';
                $lastName = $nameParts[1] ?? '';

                // If no last name provided, use first name as last name
                if (empty($lastName)) {
                    $lastName = $firstName;
                    $firstName = '';
                }

                // Check if author already exists
                $author = Author::where('first_name', $firstName)
                    ->where('last_name', $lastName)
                    ->first();

                if (!$author) {
                    $author = Author::create([
                        'first_name' => $firstName,
                        'last_name' => $lastName,
                    ]);
                }

                $authorIds[] = $author->id;
            }
        }

        // Remove duplicates
        $authorIds = array_unique($authorIds);

        if (empty($authorIds)) {
            return back()->withErrors(['authors' => 'At least one author is required.']);
        }

        $book->authors()->attach($authorIds);

        // FIXED: Changed Log::log() to Log::logAction()
        Log::logAction('book_created', "Book '{$book->title}' created", $book);

        return redirect()->route('bookmanagement')->with('success', 'Book created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Book $book)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'isbn' => 'nullable|string|unique:books,isbn,' . $book->id,
            'publication_year' => 'nullable|integer|min:1000|max:' . date('Y'),
            'authors' => 'nullable|array',
            'authors.*' => 'exists:authors,id',
            'new_authors' => 'nullable|array',
            'new_authors.*' => 'string|max:255',
            'publisher' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'cover_url' => 'nullable|url',
        ]);

        $book->update([
            'title' => $request->title,
            'isbn' => $request->isbn,
            'publication_year' => $request->publication_year,
            'publisher' => $request->publisher,
            'description' => $request->description,
            'cover_url' => $request->cover_url,
        ]);

        $authorIds = [];

        // Attach existing authors
        if ($request->has('authors') && is_array($request->authors)) {
            $authorIds = $request->authors;
        }

        // Create and attach new authors
        if ($request->has('new_authors') && is_array($request->new_authors)) {
            foreach ($request->new_authors as $authorName) {
                $nameParts = explode(' ', trim($authorName), 2);

                $firstName = $nameParts[0] ?? '';
                $lastName = $nameParts[1] ?? '';

                if (empty($lastName)) {
                    $lastName = $firstName;
                    $firstName = '';
                }

                $author = Author::where('first_name', $firstName)
                    ->where('last_name', $lastName)
                    ->first();

                if (!$author) {
                    $author = Author::create([
                        'first_name' => $firstName,
                        'last_name' => $lastName,
                    ]);
                }

                $authorIds[] = $author->id;
            }
        }

        // Remove duplicates
        $authorIds = array_unique($authorIds);

        if (empty($authorIds)) {
            return back()->withErrors(['authors' => 'At least one author is required.']);
        }

        $book->authors()->sync($authorIds);

        // FIXED: Changed Log::log() to Log::logAction()
        Log::logAction('book_updated', "Book '{$book->title}' updated", $book);

        return redirect()->route('bookmanagement')->with('success', 'Book updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Book $book)
    {
        // FIXED: Changed Log::log() to Log::logAction()
        Log::logAction('book_deleted', "Book '{$book->title}' deleted", $book);

        $book->authors()->detach();
        $book->delete();

        return redirect()->route('bookmanagement')->with('success', 'Book deleted successfully.');
    }

    /**
     * Check if authors already exist in the database (Database-agnostic version)
     */
    public function checkExistingAuthors(Request $request)
    {
        $request->validate([
            'authorNames' => 'required|array',
            'authorNames.*' => 'string|max:255',
        ]);

        $authorNames = $request->input('authorNames');
        $results = [];

        // Normalization function
        $normalizeName = function ($name) {
            return strtolower(trim(preg_replace('/\s+/', ' ', $name)));
        };

        // Prepare normalized names and last names
        $searchData = [];
        foreach ($authorNames as $authorName) {
            if (empty(trim($authorName))) {
                continue;
            }
            $normalized = $normalizeName($authorName);
            $parts = explode(' ', $normalized);
            $searchData[] = [
                'original' => $authorName,
                'normalized' => $normalized,
                'last_name' => end($parts),
            ];
        }

        if (empty($searchData)) {
            return response()->json([
                'results' => [],
                'success' => true,
            ]);
        }

        // Build query for all names at once
        $authors = Author::where(function ($query) use ($searchData) {
            foreach ($searchData as $data) {
                $query->orWhere(function ($q) use ($data) {
                    // SQLite concatenation
                    $q->whereRaw("LOWER(TRIM(first_name) || ' ' || TRIM(last_name)) = ?", [$data['normalized']])
                        ->orWhereRaw('LOWER(TRIM(last_name)) = ?', [$data['last_name']]);
                });
            }
        })->get();

        // Match results
        foreach ($searchData as $data) {
            $foundAuthor = $authors->first(function ($author) use ($data, $normalizeName) {
                $dbFullName = $normalizeName(trim($author->first_name . ' ' . $author->last_name));
                $dbLastName = $normalizeName($author->last_name);

                return $dbFullName === $data['normalized'] ||
                    $dbLastName === $data['last_name'];
            });

            if ($foundAuthor) {
                $results[] = [
                    'original_name' => $data['original'],
                    'exists' => true,
                    'author' => [
                        'id' => $foundAuthor->id,
                        'first_name' => $foundAuthor->first_name,
                        'last_name' => $foundAuthor->last_name,
                        'full_name' => trim($foundAuthor->first_name . ' ' . $foundAuthor->last_name),
                    ]
                ];
            } else {
                $results[] = [
                    'original_name' => $data['original'],
                    'exists' => false,
                ];
            }
        }

        return response()->json([
            'results' => $results,
            'success' => true,
        ]);
    }
}
