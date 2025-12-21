<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\BookLoan;
use App\Models\Status;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class BookLoanController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'book_id' => 'required|exists:books,id',
            'borrower_id' => 'required|exists:users,id',
            'action' => ['required', Rule::in(['borrow', 'return'])],
            'loan_date' => 'required|date',
            'due_date' => 'required_if:action,borrow|nullable|date|after_or_equal:loan_date',
            'return_date' => 'required_if:action,return|nullable|date|after_or_equal:loan_date',
            'notes' => 'nullable|string',
        ]);

        $book = Book::find($validated['book_id']);
        $borrower = User::find($validated['borrower_id']);

        if ($validated['action'] === 'borrow') {
            // Check if book is available
            if (!$book->is_available) { // Assuming is_available accessor exists and works
                 // Double check status manually to be safe
                 $availableStatus = Status::where('title', 'Available')->first();
                 if ($book->status_id !== $availableStatus->id) {
                     return back()->withErrors(['book_id' => 'Book is not available for borrowing.']);
                 }
            }

            // Create Loan
            BookLoan::create([
                'book_id' => $book->id,
                'borrower_id' => $borrower->id,
                'staff_id' => auth()->id(), // Assuming logged in user is staff
                'loan_date' => $validated['loan_date'],
                'due_date' => $validated['due_date'],
                'notes' => $validated['notes'],
            ]);

            // Update Book Status
            $borrowedStatus = Status::where('title', 'Borrowed')->first();
            $book->update(['status_id' => $borrowedStatus->id]);

            return back()->with('success', 'Book borrowed successfully.');

        } else { // Return
            // Find active loan
            $loan = BookLoan::where('book_id', $book->id)
                ->where('borrower_id', $borrower->id)
                ->whereNull('return_date')
                ->first();

            if (!$loan) {
                 // Option: Allow creating a "return" record even if no loan exists (fixes data inconsistency)
                 // Or strict mode: Error.
                 // User request says "Manual Entry", implying flexibility.
                 
                 // Let's support closing an existing loan if found, otherwise enforce that we can't return what's not borrowed?
                 // Or maybe we just create a record with return date?
                 // If we create a new record with return_date set immediately, it's just history.
                 
                 // Better implementation: Try to close active loan. If none, verify book is currently "Borrowed" before allowing "Return".
                 // If book is available, can't return it.
                 
                 $borrowedStatus = Status::where('title', 'Borrowed')->first();
                 if ($book->status_id !== $borrowedStatus->id) {
                     return back()->withErrors(['book_id' => 'Book is already available.']);
                 }
                 
                 // If book is borrowed but we can't find the specific loan for this user?
                 // Maybe the user is wrong.
                 // Let's generic find active loan for the book.
                 $loan = BookLoan::where('book_id', $book->id)->whereNull('return_date')->first();
            }

            if ($loan) {
                $loan->update([
                    'return_date' => $validated['return_date'],
                    'notes' => $validated['notes'] ? $loan->notes . "\n" . $validated['notes'] : $loan->notes,
                ]);
            } else {
                // Book is marked borrowed, but no active loan record found (Data inconsistency).
                // Or maybe the user is just returning it and we want to log it.
                // For now, let's just force update the status and create a "closed" loan record for history if needed, 
                // OR just error out saying "No active loan found for this book".
                // Erroring is safer.
                return back()->withErrors(['book_id' => 'No active loan found for this book.']);
            }

            // Update Book Status
            $availableStatus = Status::where('title', 'Available')->first();
            $book->update(['status_id' => $availableStatus->id]);

            return back()->with('success', 'Book returned successfully.');
        }
    }
}
