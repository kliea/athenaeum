<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $statuses = [
            // User statuses
            [
                'title' => 'Active',
                'type' => 'user',
                'description' => 'User is active and can access the system',
            ],
            [
                'title' => 'Inactive',
                'type' => 'user',
                'description' => 'User is inactive and cannot access the system',
            ],
            [
                'title' => 'Pending',
                'type' => 'user',
                'description' => 'User account is pending approval',
            ],

            // Book statuses
            [
                'title' => 'Available',
                'type' => 'book',
                'description' => 'Book is available for borrowing',
            ],
            [
                'title' => 'Borrowed',
                'type' => 'book',
                'description' => 'Book is currently borrowed',
            ],
            // [
            //     'title' => 'Lost',
            //     'type' => 'book',
            //     'description' => 'Book has been reported as lost',
            // ],
            // [
            //     'title' => 'Damaged',
            //     'type' => 'book',
            //     'description' => 'Book is damaged and unavailable',
            // ],
            // [
            //     'title' => 'Under Maintenance',
            //     'type' => 'book',
            //     'description' => 'Book is undergoing maintenance',
            // ],

            // General statuses
            // [
            //     'title' => 'Active',
            //     'type' => 'general',
            //     'description' => 'General active status',
            // ],
            // [
            //     'title' => 'Inactive',
            //     'type' => 'general',
            //     'description' => 'General inactive status',
            // ],
            // [
            //     'title' => 'Pending',
            //     'type' => 'general',
            //     'description' => 'General pending status',
            // ],
            // [
            //     'title' => 'Completed',
            //     'type' => 'general',
            //     'description' => 'General completed status',
            // ],
            // [
            //     'title' => 'Cancelled',
            //     'type' => 'general',
            //     'description' => 'General cancelled status',
            // ],
        ];

        DB::table('statuses')->insert($statuses);
    }
}
