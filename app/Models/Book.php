<?php
// app/Models/Book.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'isbn',
        'publication_year',
        'status_id',
    ];

    protected $casts = [
        'publication_year' => 'integer',
    ];

    // Relationships
    public function status()
    {
        return $this->belongsTo(Status::class);
    }

    public function authors()
    {
        return $this->belongsToMany(Author::class, 'book_authors')
            ->withTimestamps();
    }

    public function loans()
    {
        return $this->hasMany(BookLoan::class);
    }

    // Helpers
    public function getCurrentLoanAttribute()
    {
        return $this->loans()->whereNull('return_date')->first();
    }

    public function getIsAvailableAttribute()
    {
        return $this->status->title === 'Available' && !$this->currentLoan;
    }

    // Scopes
    public function scopeAvailable($query)
    {
        return $query->whereHas('status', function ($q) {
            $q->where('title', 'Available');
        })->whereDoesntHave('loans', function ($q) {
            $q->whereNull('return_date');
        });
    }

    public function scopeBorrowed($query)
    {
        return $query->whereHas('loans', function ($q) {
            $q->whereNull('return_date');
        });
    }

    public function scopeByAuthor($query, $authorName)
    {
        return $query->whereHas('authors', function ($q) use ($authorName) {
            $q->where('first_name', 'like', "%{$authorName}%")
                ->orWhere('last_name', 'like', "%{$authorName}%");
        });
    }

    public function scopeSearch($query, $search)
    {
        return $query->where('title', 'like', "%{$search}%")
            ->orWhere('isbn', 'like', "%{$search}%")
            ->orWhereHas('authors', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%");
            });
    }
}
