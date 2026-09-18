<?php

namespace Tests\Feature\Api;

use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ListingApiTest extends TestCase
{
    use RefreshDatabase;

    private function listingPayload(array $overrides = []): array
    {
        return array_merge([
            'title' => 'Studio near the university',
            'location' => 'Tangier',
            'price' => 1500,
            'date_debut' => '2026-10-01',
            'date_fin' => '2027-06-30',
            'people' => 2,
            'rooms' => 1,
        ], $overrides);
    }

    public function test_guest_cannot_create_a_listing(): void
    {
        $this->postJson('/api/listings', $this->listingPayload())
            ->assertUnauthorized();
    }

    public function test_authenticated_user_can_create_a_listing(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/listings', $this->listingPayload());

        $response->assertCreated()
            ->assertJsonPath('title', 'Studio near the university')
            ->assertJsonPath('user_id', $user->id)
            ->assertJsonPath('images', []);

        $this->assertDatabaseCount('listings', 1);
    }

    public function test_creating_a_listing_with_images_stores_them(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $payload = $this->listingPayload([
            'images' => [UploadedFile::fake()->image('room1.jpg'), UploadedFile::fake()->image('room2.jpg')],
        ]);

        $response = $this->postJson('/api/listings', $payload);

        $response->assertCreated();
        Storage::disk('public')->assertExists($response->json('images.0'));
        $this->assertCount(2, $response->json('images'));
    }

    public function test_creating_a_listing_validates_input(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/listings', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'location', 'price', 'people', 'rooms']);
    }

    public function test_listings_are_publicly_listed_with_owner(): void
    {
        $listing = Listing::factory()->create();

        $this->getJson('/api/dataListings')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $listing->id)
            ->assertJsonPath('0.user.name', $listing->user->name);
    }

    public function test_listing_can_be_fetched_by_title(): void
    {
        $listing = Listing::factory()->create(['title' => 'Unique Title Here']);

        $this->getJson('/api/dataListings/Unique Title Here')
            ->assertOk()
            ->assertJsonPath('id', $listing->id);
    }

    public function test_listing_owner_can_update_listing(): void
    {
        $user = User::factory()->create();
        $listing = Listing::factory()->create(['user_id' => $user->id]);
        Sanctum::actingAs($user);

        $this->putJson("/api/listings/{$listing->id}", [
            'title' => 'Updated title',
            'price' => 2000,
        ])->assertOk()
            ->assertJsonPath('title', 'Updated title')
            ->assertJsonPath('price', 2000);
    }

    public function test_non_owner_cannot_update_listing(): void
    {
        $listing = Listing::factory()->create();
        $other = User::factory()->create();
        Sanctum::actingAs($other);

        $this->putJson("/api/listings/{$listing->id}", ['title' => 'Hacked'])
            ->assertForbidden();
    }

    public function test_guest_cannot_update_listing(): void
    {
        $listing = Listing::factory()->create();

        $this->putJson("/api/listings/{$listing->id}", ['title' => 'Hacked'])
            ->assertUnauthorized();
    }

    public function test_updating_missing_listing_returns_404(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->putJson('/api/listings/9999', ['title' => 'Whatever'])
            ->assertNotFound();
    }

    public function test_listing_owner_can_delete_listing(): void
    {
        $user = User::factory()->create();
        $listing = Listing::factory()->create(['user_id' => $user->id]);
        Sanctum::actingAs($user);

        $this->deleteJson("/api/listings/{$listing->id}")
            ->assertOk();

        $this->assertDatabaseMissing('listings', ['id' => $listing->id]);
    }

    public function test_non_owner_cannot_delete_listing(): void
    {
        $listing = Listing::factory()->create();
        Sanctum::actingAs(User::factory()->create());

        $this->deleteJson("/api/listings/{$listing->id}")->assertForbidden();

        $this->assertDatabaseHas('listings', ['id' => $listing->id]);
    }

    public function test_guest_cannot_delete_listing(): void
    {
        $listing = Listing::factory()->create();

        $this->deleteJson("/api/listings/{$listing->id}")->assertUnauthorized();
    }

    public function test_my_listings_returns_only_owned_listings(): void
    {
        $user = User::factory()->create();
        Listing::factory()->count(2)->create(['user_id' => $user->id]);
        Listing::factory()->count(3)->create();

        Sanctum::actingAs($user);

        $this->getJson('/api/my-listings')
            ->assertOk()
            ->assertJsonCount(2);
    }
}
