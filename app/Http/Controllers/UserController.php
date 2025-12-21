<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Actions\Fortify\CreateNewUser;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Hash;
use App\Models\Position; // Import Position model
use App\Models\Status;   // Import Status model
use Illuminate\Support\Facades\Request as FacadesRequest;


class UserController extends Controller
{
    //
    public function index()
    {
        $usersQuery = User::with(['position:id,title', 'status:id,title'])
            ->select(['id', 'first_name', 'last_name', 'email', 'position_id', 'status_id', 'created_at']);

        // Search functionality
        $search = FacadesRequest::input('search');
        if ($search) {
            $usersQuery->where(function ($query) use ($search) {
                $query->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $usersQuery->latest()->paginate(10)->withQueryString();

        $positions = Position::select('id', 'title')->get();
        $statuses = Status::select('id', 'title')->get();

        // Statistics
        $totalUsers = User::count();
        $activeUsers = User::whereHas('status', function ($query) {
            $query->where('title', 'Active');
        })->count();
        $inactiveUsers = $totalUsers - $activeUsers;

        return Inertia::render('usermanagement', [
            'users' => $users,
            'positions' => $positions,
            'statuses' => $statuses,
            'stats' => [
                'total' => $totalUsers,
                'active' => $activeUsers,
                'inactive' => $inactiveUsers,
            ],
            'filters' => FacadesRequest::only(['search']),
        ]);
    }

    public function store(Request $request, CreateNewUser $creator)
    {
        // Validation is handled by CreateNewUser action

        $creator->create($request->all());

        return redirect()->route('usermanagement')->with('success', 'User created successfully.');
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'position_id' => ['required', 'exists:positions,id'],
            'status_id' => ['required', 'exists:statuses,id'],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);

        $user->forceFill([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'position_id' => $validated['position_id'],
            'status_id' => $validated['status_id'],
        ]);

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return redirect()->route('usermanagement')->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return redirect()->route('usermanagement')->with('success', 'User deleted successfully.');
    }
}
