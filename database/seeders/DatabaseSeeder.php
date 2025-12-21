<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->call([
            PositionSeeder::class,
            StatusSeeder::class,
            UserSeeder::class,
            AuthorSeeder::class,
            BookSeeder::class,
            // Add other seeders here
        ]);
    }
}
