<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = ['Admin', 'Librarian', 'Student', 'Faculty'];

        foreach ($roles as $role) {
            DB::table('roles')->insert([
                'name' => $role,
                'slug' => Str::slug($role),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}