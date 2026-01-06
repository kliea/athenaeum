<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\BookLoan;
use App\Models\Log;
use App\Models\Status;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class BookLoanController extends Controller
{
    public function borrow(Request $request)
    {
        $validated = $request->validate([
            'book_id' => 'required|exists:books,id',
            'borrower_id' => 'required|exists:users,id',
            'loan_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:loan_date',
            'notes' => 'nullable|string',
        ]);

        $book = Book::find($validated['book_id']);
        $availableStatus = Status::where('title', 'Available')->first();

        // Check if book is available
        if ($book->status_id !== $availableStatus->id) {
            return back()->withErrors(['book_id' => 'Book is not available for borrowing.']);
        }

        // Check if user has reached borrowing limit (optional)
        $activeLoansCount = BookLoan::where('borrower_id', $validated['borrower_id'])
            ->whereNull('return_date')
            ->count();

        if ($activeLoansCount >= 5) { // Adjust limit as needed
            return back()->withErrors(['borrower_id' => 'User has reached the maximum number of active loans.']);
        }

        DB::beginTransaction();
        try {
            // Create loan record
            $loan = BookLoan::create([
                'book_id' => $book->id,
                'borrower_id' => $validated['borrower_id'],
                'staff_id' => auth()->id(),
                'loan_date' => $validated['loan_date'],
                'due_date' => $validated['due_date'],
                'notes' => $validated['notes'],
            ]);

            // Update book status
            $borrowedStatus = Status::where('title', 'Borrowed')->first();
            $book->update(['status_id' => $borrowedStatus->id]);

            DB::commit();

            return back()->with('success', 'Book borrowed successfully! Loan ID: ' . $loan->id);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to process borrowing: ' . $e->getMessage()]);
        }
    }

    public function return(Request $request)
    {
        $validated = $request->validate([
            'book_id' => 'required|exists:books,id',
            'return_date' => 'required|date',
            'condition_notes' => 'nullable|string',
            'loan_id' => 'nullable|exists:book_loans,id',
        ]);

        $book = Book::find($validated['book_id']);
        $borrowedStatus = Status::where('title', 'Borrowed')->first();

        // Check if book is currently borrowed
        if ($book->status_id !== $borrowedStatus->id) {
            return back()->withErrors(['book_id' => 'Book is not currently borrowed.']);
        }

        // Find the active loan
        if (isset($validated['loan_id'])) {
            $loan = BookLoan::find($validated['loan_id']);

            if (!$loan || $loan->book_id !== $book->id) {
                return back()->withErrors(['loan_id' => 'Invalid loan ID for this book.']);
            }

            if ($loan->return_date !== null) {
                return back()->withErrors(['loan_id' => 'This loan has already been returned.']);
            }
        } else {
            // Find the most recent active loan for this book
            $loan = BookLoan::where('book_id', $validated['book_id'])
                ->whereNull('return_date')
                ->orderBy('loan_date', 'desc')
                ->first();

            if (!$loan) {
                return back()->withErrors(['book_id' => 'No active loan found for this book.']);
            }
        }

        DB::beginTransaction();
        try {
            // Prepare update data
            $updateData = [
                'return_date' => $validated['return_date'],
            ];

            // Only add condition_notes if it exists and is not empty
            if (!empty($validated['condition_notes'])) {
                $updateData['condition_notes'] = $validated['condition_notes'];
            }

            // Only add staff_id if user is authenticated and column exists
            if (auth()->check()) {
                $updateData['returned_to_staff_id'] = auth()->id();
            }

            // Update loan record with return information
            $loan->update($updateData);

            // Calculate if book was returned late
            $dueDate = Carbon::parse($loan->due_date);
            $returnDate = Carbon::parse($validated['return_date']);
            $daysLate = 0;

            if ($returnDate->gt($dueDate)) {
                $daysLate = $returnDate->diffInDays($dueDate);
                $loan->update(['days_overdue' => $daysLate]);
            }

            // Update book status back to Available
            $availableStatus = Status::where('title', 'Available')->first();
            $book->update(['status_id' => $availableStatus->id]);

            DB::commit();

            $message = 'Book returned successfully!';
            if ($daysLate > 0) {
                $message .= " Note: Book was {$daysLate} day(s) overdue.";
            }

            // Return Inertia response
            return back()->with('success', $message);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to process return: ' . $e->getMessage()]);
        }
    }

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

        if ($validated['action'] === 'borrow') {
            // Delegate to borrow method
            $borrowRequest = new Request([
                'book_id' => $validated['book_id'],
                'borrower_id' => $validated['borrower_id'],
                'loan_date' => $validated['loan_date'],
                'due_date' => $validated['due_date'],
                'notes' => $validated['notes'],
            ]);

            return $this->borrow($borrowRequest);
        } else {
            // For return, we need to find or specify the loan
            $book = Book::find($validated['book_id']);
            $borrowedStatus = Status::where('title', 'Borrowed')->first();

            if ($book->status_id !== $borrowedStatus->id) {
                return back()->withErrors(['book_id' => 'Book is not currently marked as borrowed.']);
            }

            $activeLoan = BookLoan::where('book_id', $validated['book_id'])
                ->where('borrower_id', $validated['borrower_id'])
                ->whereNull('return_date')
                ->first();

            $returnRequest = new Request([
                'book_id' => $validated['book_id'],
                'return_date' => $validated['return_date'],
                'condition_notes' => $validated['notes'],
                'loan_id' => $activeLoan ? $activeLoan->id : null,
            ]);

            return $this->return($returnRequest);
        }
    }

    public function history(Request $request)
    {
        $query = BookLoan::with(['book', 'borrower', 'staff'])
            ->orderBy('created_at', 'desc');

        if ($request->has('book_id')) {
            $query->where('book_id', $request->book_id);
        }

        if ($request->has('borrower_id')) {
            $query->where('borrower_id', $request->borrower_id);
        }

        if ($request->has('status') && $request->status === 'active') {
            $query->whereNull('return_date');
        }

        $loans = $query->paginate(20);

        return response()->json($loans);
    }

    public function active()
    {
        $activeLoans = BookLoan::with(['book', 'borrower', 'staff'])
            ->whereNull('return_date')
            ->orderBy('due_date', 'asc')
            ->paginate(20);

        return response()->json($activeLoans);
    }
}
