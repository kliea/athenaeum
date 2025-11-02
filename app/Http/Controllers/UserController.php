<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    //
    public function index()
    {
        // Eager load relationships to avoid N+1 queries
        $users = User::with(['position:id,title', 'status:id,title'])
            ->select(['id', 'first_name', 'last_name', 'email', 'position_id', 'status_id', 'created_at'])
            ->latest()
            ->get();


        return Inertia::render('usermanagement', [
            'users' => $users,
        ]);
    }
}
