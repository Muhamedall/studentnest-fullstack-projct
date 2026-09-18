<?php

namespace Tests\Feature\Api;

use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CommentApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_create_a_comment(): void
    {
        $listing = Listing::factory()->create();

        $this->postJson('/api/comments', [
            'text' => 'Nice room',
            'listing_id' => $listing->id,
        ])->assertUnauthorized();
    }

    public function test_authenticated_user_can_create_a_comment(): void
    {
        $user = User::factory()->create();
        $listing = Listing::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/comments', [
            'text' => 'Nice room, great location!',
            'listing_id' => $listing->id,
        ])->assertCreated()
            ->assertJsonPath('user_id', $user->id)
            ->assertJsonPath('listing_id', $listing->id);

        $this->assertDatabaseCount('comments', 1);
    }

    public function test_comment_requires_existing_listing(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/comments', [
            'text' => 'Hello',
            'listing_id' => 9999,
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['listing_id']);
    }

    public function test_comment_requires_text(): void
    {
        $user = User::factory()->create();
        $listing = Listing::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/comments', [
            'listing_id' => $listing->id,
        ])->assertStatus(422)->assertJsonValidationErrors(['text']);
    }

    public function test_comments_are_listed_with_user_name(): void
    {
        $listing = Listing::factory()->create();
        $user = User::factory()->create(['name' => 'Commenter Name']);
        $listing->comments()->create(['user_id' => $user->id, 'text' => 'First!']);

        $this->getJson("/api/listings/{$listing->id}/comments")
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.text', 'First!')
            ->assertJsonPath('0.user_name', 'Commenter Name');
    }
}
