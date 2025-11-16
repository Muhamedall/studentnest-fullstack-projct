<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Etudiant;

class EtudiantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Etudiant::factory()->create([
            'name' => 'Mohamed Allaoui',
            'email' => 'mohamedallaoui@gmail.com',
            'password' => bcrypt('123456789'),
            "dateOfBirth" => '2004-10-10', // Make sure the date format matches the database schema
            "city" => 'Rabat',
       ]);

       Etudiant::factory(9)->create(); // Creating 9 more records using factory
    }
}
