<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function store(Request $request, int $listingId): JsonResponse
    {
        $listing = Listing::find($listingId);

        if (! $listing) {
            return response()->json(['message' => 'Listing not found'], 404);
        }

        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        $startDate = $request->date('start_date');

        if ($listing->date_debut && $startDate->lt($listing->date_debut)) {
            return response()->json([
                'message' => 'The start date must not be earlier than the listing availability start date.',
            ], 422);
        }

        if ($listing->date_fin && $request->date('end_date')->gt($listing->date_fin)) {
            return response()->json([
                'message' => 'The end date must not be later than the listing availability end date.',
            ], 422);
        }

        $reservation = Reservation::create([
            'user_id' => $request->user()->id,
            'listing_id' => $listingId,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'status' => 'pending',
        ]);

        return response()->json($reservation->load('user'), 201);
    }

    public function index(Request $request, int $listingId): JsonResponse
    {
        $listing = Listing::find($listingId);

        if (! $listing) {
            return response()->json(['message' => 'Listing not found'], 404);
        }

        if ($listing->user_id !== $request->user()->id) {
            return response()->json(['message' => 'You do not own this listing'], 403);
        }

        $reservations = Reservation::where('listing_id', $listingId)
            ->with('user')
            ->latest()
            ->get()
            ->append('user_name');

        return response()->json($reservations);
    }

    public function myReservations(Request $request): JsonResponse
    {
        $reservations = Reservation::with('listing.user')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($reservations);
    }
}
