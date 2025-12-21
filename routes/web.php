<?php

use App\Http\Controllers\AuthorController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\BookLoanController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    Route::get('usermanagement', [UserController::class, 'index'])->name('usermanagement');
    Route::get('borrowreturn', function () {
        return Inertia::render('borrowreturn', [
            'books' => \App\Models\Book::select('id', 'title', 'isbn', 'status_id')->with('status')->get(),
            'users' => \App\Models\User::select('id', 'first_name', 'last_name')->get(),
        ]);
    })->name('borrowreturn');
    Route::get('bookmanagement', [BookController::class, 'index'])->name('bookmanagement');
    Route::resource('books', BookController::class)->except(['index']);
    Route::resource('authors', AuthorController::class);
    Route::post('/usermanagement', [UserController::class, 'store'])->name('users.store');
    Route::put('/usermanagement/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/usermanagement/{user}', [UserController::class, 'destroy'])->name('users.delete');
    Route::post('/loans/manual', [BookLoanController::class, 'store'])->name('loans.manual');
});

Route::post('/authors/check-existing', [BookController::class, 'checkExistingAuthors'])
    ->name('authors.check-existing')
    ->middleware(['web']);
Route::post('/authors/check', [BookController::class, 'checkExistingAuthors'])->name('authors.check');
require __DIR__ . '/settings.php';
