<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Listing>
 */
class ListingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => fake()->sentence(3),
            'location' => fake()->city(),
            'price' => fake()->randomFloat(2, 500, 5000),
            'images' => [],
            'date_debut' => fake()->date(),
            'date_fin' => fake()->date(),
            'people' => fake()->numberBetween(1, 4),
            'rooms' => fake()->numberBetween(1, 3),
        ];
    }
}
