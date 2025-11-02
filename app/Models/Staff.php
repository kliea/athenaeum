<?php
// app/Models/Staff.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'employee_id',
        'hire_date',
        'department',
        'salary',
    ];

    protected $casts = [
        'hire_date' => 'date',
        'salary' => 'decimal:2',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function processedLoans()
    {
        return $this->hasMany(BookLoan::class, 'staff_id');
    }

    // Helpers
    public function getFullNameAttribute()
    {
        return $this->user->full_name;
    }

    public function getEmailAttribute()
    {
        return $this->user->email;
    }

    // Scopes
    public function scopeByDepartment($query, $department)
    {
        return $query->where('department', $department);
    }

    public function scopeHiredAfter($query, $date)
    {
        return $query->where('hire_date', '>=', $date);
    }
}
