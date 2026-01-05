<?php

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
        'status',
        'author', // Assuming author is a string as per ERD
    ];

    /**
     * Get all of the transactions for the Book.
     */
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
