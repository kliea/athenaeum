<?php

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
    Route::get('usermanagement', function () {
        return Inertia::render('usermanagement');
    })->name('usermanagement');
    Route::get('borrowreturn', function () {
        return Inertia::render('borrowreturn');
    })->name('borrowreturn');
    Route::get('bookmanagement', function () {
        return Inertia::render('bookmanagement');
    })->name('bookmanagement');
});

require __DIR__ . '/settings.php';
