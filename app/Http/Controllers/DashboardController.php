<?php

namespace App\Http\Controllers;

use App\Models\AttendanceLog;
use App\Models\Book;
use App\Models\Transaction; // Changed from BookLoan
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the dashboard.
     */
    public function index(Request $request)
    {
        $recentAttendance = [];

        // This data should only be fetched for authorized roles.
        if ($request->user()->hasAnyRole(['admin', 'librarian'])) {
            $recentAttendance = AttendanceLog::with('user.roles')
                ->latest()
                ->limit(10)
                ->get()
                ->map(function ($log) {
                    return [
                        'id' => $log->id,
                        'user_name' => $log->user->name ?? 'Unknown User',
                        'role_name' => $log->user->roles->first()->name ?? 'No Role',
                        'time_in' => $log->time_in ? Carbon::parse($log->time_in)->format('h:i A') : null,
                        'time_out' => $log->time_out ? Carbon::parse($log->time_out)->format('h:i A') : 'Active',
                        'date' => Carbon::parse($log->date)->format('M d, Y'),
                    ];
                });
        }

        return Inertia::render('dashboard', [
            'stats' => $this->simpleStats(),
            'recentBooks' => $this->getRecentBooks($request),
            'recentAttendance' => $recentAttendance,
        ]);
    }

    /**
     * Get dashboard statistics
     */
    public function simpleStats()
    {
        try {
            $totalBooks = Book::count();
            $availableBooks = Book::where('status', 'Available')->count();
            $borrowedBooks = Book::where('status', 'Borrowed')->count();
            $borrowedThisWeek = Transaction::where('borrowed_at', '>=', Carbon::now()->startOfWeek())->count();
            $pendingReturns = Transaction::whereNull('returned_at')->where('due_at', '<', Carbon::today())->count();
            $todaysLoans = Transaction::whereDate('borrowed_at', Carbon::today())->count();

            return [
                'borrowed_books_count' => $borrowedBooks,
                'total_books' => $totalBooks,
                'available_books' => $availableBooks,
                'borrowed_this_week' => $borrowedThisWeek,
                'pending_returns' => $pendingReturns,
                'todays_loans' => $todaysLoans,
                'success' => true,
            ];
        } catch (\Exception $e) {
            // Return empty stats on error
            return [
                'success' => false,
                'message' => 'Could not fetch stats: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Get recent books with status
     */
    public function getRecentBooks(Request $request = null)
    {
        try {
            $limit = $request ? $request->get('limit', 10) : 10;
            $books = Book::with('authors')->latest()->limit($limit)->get();

            $mappedBooks = $books->map(function ($book) {
                return [
                    'id' => $book->id,
                    'title' => $book->title,
                    'author' => $book->authors->pluck('name')->join(', ') ?: 'Unknown Author',
                    'date_added' => $book->created_at->format('M d, Y'),
                ];
            });

            return [
                'data' => $mappedBooks,
                'total' => Book::count(),
            ];
        } catch (\Exception $e) {
            \Log::error('getRecentBooks error: ' . $e->getMessage());
            return [
                'data' => [],
                'total' => 0,
                'error' => $e->getMessage(),
            ];
        }
    }
}
