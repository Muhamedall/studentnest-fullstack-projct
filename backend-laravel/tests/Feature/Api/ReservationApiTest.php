<?php

namespace Tests\Feature\Api;

use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ReservationApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_create_a_reservation(): void
    {
        $listing = Listing::factory()->create();

        $this->postJson("/api/listings/{$listing->id}/reservations", [
            'start_date' => '2026-10-01',
            'end_date' => '2026-11-01',
        ])->assertUnauthorized();
    }

    public function test_authenticated_user_can_reserve_a_listing(): void
    {
        $user = User::factory()->create();
        $listing = Listing::factory()->create([
            'date_debut' => '2026-01-01',
            'date_fin' => '2026-12-31',
        ]);
        Sanctum::actingAs($user);

        $this->postJson("/api/listings/{$listing->id}/reservations", [
            'start_date' => '2026-10-01',
            'end_date' => '2026-11-01',
        ])->assertCreated()
            ->assertJsonPath('listing_id', $listing->id)
            ->assertJsonPath('user_id', $user->id)
            ->assertJsonPath('status', 'pending');
        $this->assertDatabaseCount('reservations', 1);
    }

    public function test_reservation_requires_valid_dates(): void
    {
        $listing = Listing::factory()->create([
            'date_debut' => '2026-01-01',
            'date_fin' => '2026-12-31',
        ]);
        Sanctum::actingAs(User::factory()->create());

        $this->postJson("/api/listings/{$listing->id}/reservations", [
            'end_date' => '2026-11-01',
        ])->assertStatus(422)->assertJsonValidationErrors(['start_date']);

        $this->postJson("/api/listings/{$listing->id}/reservations", [
            'start_date' => '2026-11-01',
            'end_date' => '2026-10-01',
        ])->assertStatus(422)->assertJsonValidationErrors(['end_date']);
    }

    public function test_reservation_cannot_start_before_listing_availability(): void
    {
        $listing = Listing::factory()->create(['date_debut' => '2026-10-15']);
        Sanctum::actingAs(User::factory()->create());

        $this->postJson("/api/listings/{$listing->id}/reservations", [
            'start_date' => '2026-10-01',
            'end_date' => '2026-11-01',
        ])->assertStatus(422);
    }

    public function test_reserving_missing_listing_returns_404(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/listings/9999/reservations', [
            'start_date' => '2026-10-01',
            'end_date' => '2026-11-01',
        ])->assertNotFound();
    }

    public function test_listing_owner_can_view_reservations(): void
    {
        $owner = User::factory()->create(['name' => 'Home Owner']);
        $listing = Listing::factory()->create([
            'user_id' => $owner->id,
            'date_debut' => '2026-01-01',
            'date_fin' => '2026-12-31',
        ]);
        $renter = User::factory()->create(['name' => 'Renter Person']);
        $listing->reservations()->create([
            'user_id' => $renter->id,
            'start_date' => '2026-10-01',
            'end_date' => '2026-11-01',
        ]);

        Sanctum::actingAs($owner);

        $this->getJson("/api/listings/{$listing->id}/reservations")
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.start_date', '2026-10-01')
            ->assertJsonPath('0.end_date', '2026-11-01')
            ->assertJsonPath('0.user_name', 'Renter Person');
    }

    public function test_non_owner_cannot_view_reservations(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $listing = Listing::factory()->create(['user_id' => $owner->id]);

        Sanctum::actingAs($other);

        $this->getJson("/api/listings/{$listing->id}/reservations")->assertForbidden();
    }

    public function test_guest_cannot_view_reservations(): void
    {
        $listing = Listing::factory()->create();

        $this->getJson("/api/listings/{$listing->id}/reservations")->assertUnauthorized();
    }
}
