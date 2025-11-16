<?php
namespace Database\Factories;

use App\Models\Etudiant;
use Illuminate\Database\Eloquent\Factories\Factory;

 use Illuminate\Support\Str;
class EtudiantFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Etudiant::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'name' => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
            'password' => bcrypt('password'), // or you can use $this->faker->password() if you want random passwords
            'dateOfBirth' => $this->faker->date(),
            'city' => $this->faker->city,
            'remember_token' => Str::random(10),
        ];
    }
}
