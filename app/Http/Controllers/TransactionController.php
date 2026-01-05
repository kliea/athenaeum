<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class TransactionController extends Controller
{
    /**
     * Borrow a book for a user.
     */
    public function borrow(Request $request)
    {
        $validated = $request->validate([
            'book_id' => 'required|exists:books,id',
            'user_id' => 'required|exists:users,id',
        ]);

        $book = Book::findOrFail($validated['book_id']);
        $user = User::findOrFail($validated['user_id']);

        // 1. Check if book is available
        if ($book->status !== 'Available') {
            return back()->withErrors(['book_id' => 'Book is not available for borrowing.']);
        }

        // 2. Check user's borrowing limits
        $activeCount = Transaction::where('user_id', $user->id)->active()->count();

        if ($user->hasRole('student') && $activeCount >= 3) {
            return back()->withErrors(['user_id' => 'Students have a borrowing limit of 3 books.']);
        }

        if ($user->hasRole('faculty') && $activeCount >= 10) {
            return back()->withErrors(['user_id' => 'Faculty have a borrowing limit of 10 books.']);
        }

        DB::beginTransaction();
        try {
            // Create transaction record
            Transaction::create([
                'book_id' => $book->id,
                'user_id' => $user->id,
                'borrowed_at' => now(),
                'due_at' => now()->addWeeks(2), // Default 2-week loan
            ]);

            // Update book status
            $book->update(['status' => 'Borrowed']);

            DB::commit();

            return back()->with('success', 'Book borrowed successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to process borrowing: ' . $e->getMessage()]);
        }
    }

    /**
     * Return a borrowed book.
     */
    public function return(Request $request)
    {
        $validated = $request->validate([
            'book_id' => 'required|exists:books,id',
        ]);

        $book = Book::findOrFail($validated['book_id']);

        // 1. Check if book is currently borrowed
        if ($book->status !== 'Borrowed') {
            return back()->withErrors(['book_id' => 'This book is not currently marked as borrowed.']);
        }

        // 2. Find the active transaction
        $transaction = Transaction::where('book_id', $book->id)->active()->first();

        if (!$transaction) {
            return back()->withErrors(['book_id' => 'No active loan found for this book. The book status might be out of sync.']);
        }

        DB::beginTransaction();
        try {
            // Update transaction record
            $transaction->update(['returned_at' => now()]);

            // Update book status
            $book->update(['status' => 'Available']);

            DB::commit();

            return back()->with('success', 'Book returned successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to process return: ' . $e->getMessage()]);
        }
    }
}
