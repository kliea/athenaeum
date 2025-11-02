<?php
// app/Models/BookLoan.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookLoan extends Model
{
    use HasFactory;

    protected $fillable = [
        'book_id',
        'staff_id',
        'borrower_id',
        'loan_date',
        'due_date',
        'return_date',
        'notes',
    ];

    protected $casts = [
        'loan_date' => 'datetime',
        'due_date' => 'datetime',
        'return_date' => 'datetime',
    ];

    // Relationships
    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    public function staff()
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    public function borrower()
    {
        return $this->belongsTo(User::class, 'borrower_id');
    }

    // Helpers
    public function getIsOverdueAttribute()
    {
        return !$this->return_date && $this->due_date->isPast();
    }

    public function getDaysOverdueAttribute()
    {
        if (!$this->is_overdue) {
            return 0;
        }
        return now()->diffInDays($this->due_date);
    }

    public function markAsReturned()
    {
        $this->update([
            'return_date' => now(),
        ]);

        // Update book status if needed
        $this->book->update([
            'status_id' => Status::where('title', 'Available')->first()->id
        ]);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->whereNull('return_date');
    }

    public function scopeOverdue($query)
    {
        return $query->active()->where('due_date', '<', now());
    }

    public function scopeByBorrower($query, $userId)
    {
        return $query->where('borrower_id', $userId);
    }

    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('loan_date', [$startDate, $endDate]);
    }
}
