<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        \App\Models\User::factory(10)->create();

         \App\Models\User::factory()->create([
            'name' => 'Mohamed Allaoui',
             'email' => 'mohamedallaoui@gmail.com',
             'password'=>'123456789',
             'dateOfBirth'=>'2004-05-05', // Date format corrected
             'city'=>'Tanger',
        ]);
    }
}
