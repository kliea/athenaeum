<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AuthorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $authors = [
            ['first_name' => 'F. Scott', 'last_name' => 'Fitzgerald', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['first_name' => 'George', 'last_name' => 'Orwell', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['first_name' => 'J.K.', 'last_name' => 'Rowling', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['first_name' => 'Harper', 'last_name' => 'Lee', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['first_name' => 'J.R.R.', 'last_name' => 'Tolkien', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
        ];

        DB::table('authors')->insert($authors);
    }
}
