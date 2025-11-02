<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PositionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $positions = [
            ['title' => 'Administrator'],
            ['title' => 'Librarian'],
            ['title' => 'Student'],
            ['title' => 'Faculty'],
        ];

        DB::table('positions')->insert($positions);
    }
}
