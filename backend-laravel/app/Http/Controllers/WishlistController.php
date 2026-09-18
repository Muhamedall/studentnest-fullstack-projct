<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $favorites = Wishlist::where('user_id', $request->user()->id)
            ->with('listing.user')
            ->latest()
            ->get();

        return response()->json($favorites);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'listing_id' => 'required|integer|exists:listings,id',
        ]);

        $wishlist = Wishlist::firstOrCreate([
            'user_id' => $request->user()->id,
            'listing_id' => $validated['listing_id'],
        ]);

        return response()->json($wishlist->load('listing'), 201);
    }

    public function destroy(Request $request, int $listingId): JsonResponse
    {
        Wishlist::where('user_id', $request->user()->id)
            ->where('listing_id', $listingId)
            ->delete();

        return response()->json(['message' => 'Favorite removed']);
    }
}
