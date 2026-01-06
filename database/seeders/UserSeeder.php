<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $users = [
            [
                'first_name' => 'John',
                'last_name' => 'Doe',
                'email' => 'john.doe@admin.com',
                'email_verified_at' => Carbon::now(),
                'password' => Hash::make('password123'),
                'position_id' => 1, // Make sure this position exists in positions table
                'status_id' => 1, // Make sure this status exists in status table
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'first_name' => 'Jane',
                'last_name' => 'Smith',
                'email' => 'jane.smith@librarian.com',
                'email_verified_at' => Carbon::now(),
                'password' => Hash::make('password123'),
                'position_id' => 2,
                'status_id' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'first_name' => 'Michael',
                'last_name' => 'Johnson',
                'email' => 'michael.johnson@student.com',
                'email_verified_at' => null,
                'password' => Hash::make('password123'),
                'position_id' => 3,
                'status_id' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'first_name' => 'Sarah',
                'last_name' => 'Williams',
                'email' => 'sarah.williams@faculty.com',
                'email_verified_at' => Carbon::now(),
                'password' => Hash::make('password123'),
                'position_id' => 4,
                'status_id' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]
        ];

        // Insert users
        DB::table('users')->insert($users);
    }
}
