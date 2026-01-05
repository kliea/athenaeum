<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use App\Models\User;
use App\Models\Role;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Define user data without position_id
        $userData = [
            [
                'name' => 'John Doe',
                'email' => 'john.doe@admin.com',
                'email_verified_at' => Carbon::now(),
                'password' => Hash::make('password123'),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'name' => 'Jane Smith',
                'email' => 'jane.smith@librarian.com',
                'email_verified_at' => Carbon::now(),
                'password' => Hash::make('password123'),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'name' => 'Michael Johnson',
                'email' => 'michael.johnson@student.com',
                'email_verified_at' => null,
                'password' => Hash::make('password123'),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'name' => 'Sarah Williams',
                'email' => 'sarah.williams@faculty.com',
                'email_verified_at' => Carbon::now(),
                'password' => Hash::make('password123'),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]
        ];

        // Insert users
        DB::table('users')->insert($userData);

        // Assign roles based on email
        $this->assignRoles();
    }

    private function assignRoles()
    {
        $roleMapping = [
            'admin' => Role::where('slug', 'admin')->first(),
            'librarian' => Role::where('slug', 'librarian')->first(),
            'student' => Role::where('slug', 'student')->first(),
            'faculty' => Role::where('slug', 'faculty')->first(),
        ];

        User::where('email', 'like', '%@admin.com')->first()->roles()->attach($roleMapping['admin']);
        User::where('email', 'like', '%@librarian.com')->first()->roles()->attach($roleMapping['librarian']);
        User::where('email', 'like', '%@student.com')->first()->roles()->attach($roleMapping['student']);
        User::where('email', 'like', '%@faculty.com')->first()->roles()->attach($roleMapping['faculty']);
    }
}
