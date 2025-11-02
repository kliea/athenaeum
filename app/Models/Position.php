<?php
// app/Models/Position.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Position extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
    ];

    // Relationships
    public function users()
    {
        return $this->hasMany(User::class);
    }

    // Helpers
    public function getStaffCountAttribute()
    {
        return $this->users()->whereHas('staff')->count();
    }

    // Scopes
    public function scopeStaffPositions($query)
    {
        return $query->whereIn('title', ['Librarian', 'Assistant Librarian', 'Library Assistant']);
    }
}
