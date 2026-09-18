<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use App\Models\Rating;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RatingController extends Controller
{
    public function index(Request $request, int $listingId): JsonResponse
    {
        $listing = Listing::find($listingId);

        if (! $listing) {
            return response()->json(['message' => 'Listing not found'], 404);
        }

        $average = (float) $listing->ratings()->avg('rating');
        $count = $listing->ratings()->count();

        $myRating = null;
        if ($request->user()) {
            $myRating = $listing->ratings()
                ->where('user_id', $request->user()->id)
                ->value('rating');
        }

        return response()->json([
            'average' => round($average, 1),
            'count' => $count,
            'my_rating' => $myRating,
        ]);
    }

    public function store(Request $request, int $listingId): JsonResponse
    {
        $listing = Listing::find($listingId);

        if (! $listing) {
            return response()->json(['message' => 'Listing not found'], 404);
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
        ]);

        $rating = Rating::updateOrCreate(
            [
                'listing_id' => $listingId,
                'user_id' => $request->user()->id,
            ],
            ['rating' => $validated['rating']]
        );

        return response()->json([
            'message' => 'Rating saved',
            'rating' => $rating,
            'average' => round((float) $listing->ratings()->avg('rating'), 1),
            'count' => $listing->ratings()->count(),
        ], 201);
    }
}