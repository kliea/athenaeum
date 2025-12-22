<?php

use App\Http\Controllers\AuthorController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\BookLoanController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use App\Models\BookLoan;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        $controller = new DashboardController();

        // Get stats - these methods now return arrays directly
        $stats = $controller->simpleStats();

        // Get recent books
        $booksData = $controller->getRecentBooks(new \Illuminate\Http\Request());

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentBooks' => $booksData['data'] ?? [],
            'totalBooks' => $booksData['total'] ?? 0,
        ]);
    })->name('dashboard');

    Route::get('usermanagement', [UserController::class, 'index'])->name('usermanagement');
    // Borrow/Return Page
    Route::get('borrowreturn', function () {
        return Inertia::render('borrowreturn', [
            'books' => \App\Models\Book::select('id', 'title', 'isbn', 'status_id')->with('status')->get(),
            'users' => \App\Models\User::select('id', 'first_name', 'last_name')->get(),
            'loans' => \App\Models\BookLoan::with(['book', 'borrower', 'staff'])
                ->whereNull('return_date')
                ->latest()
                ->take(20)
                ->get(), // Add recent active loans for reference
        ]);
    })->name('borrowreturn');

    // Borrow/Return Actions
    Route::post('borrowBook', [BookLoanController::class, 'borrow'])->name('loans.borrow');
    Route::post('returnBook', [BookLoanController::class, 'return'])->name('loans.return');
    Route::post('loans/manual', [BookLoanController::class, 'store'])->name('loans.manual');
    Route::get('loans/history', [BookLoanController::class, 'history'])->name('loans.history');
    Route::get('loans/active', [BookLoanController::class, 'active'])->name('loans.active');

    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);
    Route::get('/dashboard/recent-books', [DashboardController::class, 'getRecentBooks']);
    Route::get('/dashboard/recent-activity', [DashboardController::class, 'getRecentActivity']);
    Route::get('/dashboard/borrowing-trends', [DashboardController::class, 'getBorrowingTrends']);
    Route::get('/dashboard/top-books', [DashboardController::class, 'getTopBooks']);
    Route::get('/dashboard/overdue-books', [DashboardController::class, 'getOverdueBooks']);


    Route::get('bookmanagement', [BookController::class, 'index'])->name('bookmanagement');
    Route::resource('books', BookController::class)->except(['index']);
    Route::resource('authors', AuthorController::class);
    Route::post('/usermanagement', [UserController::class, 'store'])->name('users.store');
    Route::put('/usermanagement/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/usermanagement/{user}', [UserController::class, 'destroy'])->name('users.delete');
    Route::post('/loans/manual', [BookLoanController::class, 'store'])->name('loans.manual');
});
Route::get('/api/books/{book}/active-loan', function ($bookId) {
    $loan = BookLoan::where('book_id', $bookId)
        ->whereNull('return_date') // or your condition for active loans
        ->first();

    return response()->json($loan);
});
Route::post('/authors/check-existing', [BookController::class, 'checkExistingAuthors'])
    ->name('authors.check-existing')
    ->middleware(['web']);
Route::post('/authors/check', [BookController::class, 'checkExistingAuthors'])->name('authors.check');
require __DIR__ . '/settings.php';
