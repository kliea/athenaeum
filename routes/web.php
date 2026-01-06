<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AuthorController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\BookLoanController;
use App\Http\Controllers\UserController;
use App\Models\Transaction;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Attendance Routes - Public
Route::prefix('attendance')->group(function () {
    Route::post('/record', [AttendanceController::class, 'record'])->name('attendance.record');
    Route::get('/summary/{user}', [AttendanceController::class, 'summary'])->name('attendance.summary');
    Route::get('/today/{user}', [AttendanceController::class, 'today'])->name('attendance.today');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    Route::get('usermanagement', [UserController::class, 'index'])->name('usermanagement');

    // Borrow/Return Page
    Route::get('borrowreturn', function () {
        return Inertia::render('borrowreturn', [
            'books' => \App\Models\Book::select('id', 'title', 'isbn', 'status')->get(),
            'users' => \App\Models\User::select('id', 'name')->get(),
            'transactions' => Transaction::with(['book', 'user'])
                ->whereNull('returned_at')
                ->latest('borrowed_at')
                ->take(20)
                ->get(),
        ]);
    })->name('borrowreturn');

    // Borrow/Return Actions
    Route::post('borrowBook', [BookLoanController::class, 'borrow'])->name('loans.borrow');
    Route::post('returnBook', [BookLoanController::class, 'return'])->name('loans.return');
    Route::post('loans/manual', [BookLoanController::class, 'store'])->name('loans.manual');
    Route::get('loans/history', [BookLoanController::class, 'history'])->name('loans.history');
    Route::get('loans/active', [BookLoanController::class, 'active'])->name('loans.active');

    Route::get('bookmanagement', [BookController::class, 'index'])->name('bookmanagement');
    Route::resource('books', BookController::class)->except(['index']);
    Route::resource('authors', AuthorController::class);
    Route::post('/usermanagement', [UserController::class, 'store'])->name('users.store');
    Route::put('/usermanagement/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/usermanagement/{user}', [UserController::class, 'destroy'])->name('users.delete');
});

// API Routes
Route::get('/api/books/{book}/active-loan', function ($bookId) {
    $transaction = Transaction::where('book_id', $bookId)
        ->whereNull('returned_at')
        ->first();

    return response()->json($transaction);
});

Route::post('/authors/check-existing', [BookController::class, 'checkExistingAuthors'])
    ->name('authors.check-existing')
    ->middleware(['web']);

Route::post('/authors/check', [BookController::class, 'checkExistingAuthors'])->name('authors.check');

require __DIR__ . '/settings.php';
