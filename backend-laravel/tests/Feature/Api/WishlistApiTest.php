<?php

namespace Tests\Feature\Api;

use App\Models\Listing;
use App\Models\User;
use App\Models\Wishlist;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class WishlistApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_wishlist(): void
    {
        $this->getJson('/api/wishlist')->assertUnauthorized();
        $this->postJson('/api/wishlist', ['listing_id' => 1])->assertUnauthorized();
        $this->deleteJson('/api/wishlist/1')->assertUnauthorized();
    }

    public function test_user_can_add_a_listing_to_wishlist(): void
    {
        $user = User::factory()->create();
        $listing = Listing::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/wishlist', ['listing_id' => $listing->id])
            ->assertCreated()
            ->assertJsonPath('user_id', $user->id)
            ->assertJsonPath('listing_id', $listing->id);

        $this->assertDatabaseCount('wishlists', 1);
    }

    public function test_adding_a_listing_twice_does_not_create_duplicates(): void
    {
        $user = User::factory()->create();
        $listing = Listing::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/wishlist', ['listing_id' => $listing->id])->assertCreated();
        $this->postJson('/api/wishlist', ['listing_id' => $listing->id])->assertCreated();

        $this->assertDatabaseCount('wishlists', 1);
    }

    public function test_adding_missing_listing_fails_validation(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/wishlist', ['listing_id' => 9999])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['listing_id']);
    }

    public function test_user_can_remove_favorite(): void
    {
        $user = User::factory()->create();
        $listing = Listing::factory()->create();
        Wishlist::create(['user_id' => $user->id, 'listing_id' => $listing->id]);
        Sanctum::actingAs($user);

        $this->deleteJson("/api/wishlist/{$listing->id}")->assertOk();

        $this->assertDatabaseCount('wishlists', 0);
    }

    public function test_user_sees_only_own_favorites_with_listing(): void
    {
        $user = User::factory()->create();
        Wishlist::create(['user_id' => $user->id, 'listing_id' => Listing::factory()->create()->id]);
        $other = User::factory()->create();
        Wishlist::create(['user_id' => $other->id, 'listing_id' => Listing::factory()->create()->id]);

        Sanctum::actingAs($user);

        $this->getJson('/api/wishlist')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonStructure(['0' => ['id', 'listing' => ['id', 'title']]]);
    }

    public function test_deleting_a_user_cascades_wishlist_rows(): void
    {
        $user = User::factory()->create();
        Wishlist::create(['user_id' => $user->id, 'listing_id' => Listing::factory()->create()->id]);

        $user->delete();

        $this->assertDatabaseCount('wishlists', 0);
    }

    public function test_deleting_a_listing_cascades_wishlist_rows(): void
    {
        $user = User::factory()->create();
        $listing = Listing::factory()->create(['user_id' => $user->id]);
        Wishlist::create(['user_id' => $user->id, 'listing_id' => $listing->id]);

        Sanctum::actingAs($user);
        $this->deleteJson("/api/listings/{$listing->id}")->assertOk();

        $this->assertDatabaseCount('wishlists', 0);
    }
}
