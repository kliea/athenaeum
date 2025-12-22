<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\BookLoan;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function simpleStats()
    {
        try {
            $totalBooks = Book::count();
            $availableBooks = Book::whereHas('status', function ($q) {
                $q->where('title', 'Available');
            })->count();

            $borrowedBooks = Book::whereHas('status', function ($q) {
                $q->where('title', 'Borrowed');
            })->count();

            // Get actual borrowed this week count from BookLoan
            $borrowedThisWeek = BookLoan::where('loan_date', '>=', Carbon::now()->startOfWeek())
                ->whereNull('return_date')
                ->count();

            // Get pending returns (overdue books)
            $pendingReturns = BookLoan::whereNull('return_date')
                ->where('due_date', '<', Carbon::today())
                ->count();

            // Get today's active loans
            $todaysLoans = BookLoan::whereDate('loan_date', Carbon::today())
                ->whereNull('return_date')
                ->count();

            return [
                'borrowed_books_count' => $borrowedBooks,
                'todays_visitors' => User::whereDate('last_login_at', Carbon::today())->count(),
                'total_books' => $totalBooks,
                'available_books' => $availableBooks,
                'borrowed_this_week' => $borrowedThisWeek,
                'visitors_this_month' => User::where('last_login_at', '>=', Carbon::now()->startOfMonth())->count(),
                'new_additions' => Book::where('created_at', '>=', Carbon::now()->subMonth())->count(),
                'availability_percentage' => $totalBooks > 0 ? round(($availableBooks / $totalBooks) * 100) : 0,
                'total_members' => User::count(),
                'pending_returns' => $pendingReturns,
                'todays_loans' => $todaysLoans,
                'success' => true,
            ];
        } catch (\Exception $e) {
            return [
                'borrowed_books_count' => 24,
                'todays_visitors' => 156,
                'total_books' => 2847,
                'available_books' => 1923,
                'borrowed_this_week' => 2,
                'visitors_this_month' => 12,
                'new_additions' => 45,
                'availability_percentage' => 67,
                'total_members' => 125,
                'pending_returns' => 3,
                'todays_loans' => 5,
                'success' => false,
                'message' => 'Using sample data: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Get recent books with status
     */
    public function getRecentBooks(Request $request = null)
    {
        try {
            $limit = 10;
            if ($request) {
                $limit = $request->get('limit', 10);
            }

            // Start with basic query
            $books = Book::orderBy('created_at', 'desc')->limit($limit)->get();

            \Log::info('Books fetched: ' . $books->count());

            // If no books, return empty
            if ($books->isEmpty()) {
                \Log::warning('No books found in database');
                return [
                    'data' => [],
                    'total' => Book::count(),
                    'available_count' => 0,
                    'borrowed_count' => 0,
                ];
            }

            // Map the books
            $mappedBooks = $books->map(function ($book) {
                try {
                    // Safely get relationships
                    $authors = $book->authors ? $book->authors->map(function ($author) {
                        return trim(($author->first_name ?? '') . ' ' . ($author->last_name ?? ''));
                    })->join(', ') : 'Unknown Author';

                    $status = $book->status ? $book->status->title : 'Unknown';

                    // Get latest loan if it exists
                    $latestLoan = null;
                    if ($book->bookLoans) {
                        $latestLoan = $book->bookLoans
                            ->where('return_date', null)
                            ->sortByDesc('loan_date')
                            ->first();
                    }

                    return [
                        'id' => $book->id,
                        'title' => $book->title,
                        'author' => $authors,
                        'status' => $status,
                        'date_borrowed' => $latestLoan ? $latestLoan->loan_date->format('Y-m-d') : null,
                        'borrower_name' => $latestLoan && isset($latestLoan->borrower) ? $latestLoan->borrower->name : null,
                        'isbn' => $book->isbn ?? 'N/A',
                        'cover_url' => $book->cover_url ?? null,
                        'due_date' => $latestLoan ? $latestLoan->due_date->format('Y-m-d') : null,
                    ];
                } catch (\Exception $e) {
                    \Log::error('Error mapping book: ' . $e->getMessage());
                    // Return minimal data for this book
                    return [
                        'id' => $book->id,
                        'title' => $book->title,
                        'author' => 'Unknown',
                        'status' => 'Unknown',
                        'date_borrowed' => null,
                        'borrower_name' => null,
                        'isbn' => $book->isbn ?? 'N/A',
                        'cover_url' => $book->cover_url ?? null,
                        'due_date' => null,
                    ];
                }
            })->values();

            return [
                'data' => $mappedBooks,
                'total' => Book::count(),
                'available_count' => Book::whereHas('status', function ($q) {
                    $q->where('title', 'Available');
                })->count(),
                'borrowed_count' => Book::whereHas('status', function ($q) {
                    $q->where('title', 'Borrowed');
                })->count(),
            ];
        } catch (\Exception $e) {
            \Log::error('getRecentBooks error: ' . $e->getMessage());
            return [
                'data' => [],
                'total' => 0,
                'available_count' => 0,
                'borrowed_count' => 0,
                'error' => $e->getMessage(),
            ];
        }
    }
}
