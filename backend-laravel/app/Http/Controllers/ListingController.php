<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListingController extends Controller
{
    /**
     * Image storage rule shared by store/update.
     */
    private const IMAGE_RULES = 'nullable|array';

    private const IMAGE_ITEM_RULES = 'file|image|mimes:jpeg,png,jpg,gif,webp|max:5120';

    public function index(): JsonResponse
    {
        $listings = Listing::with('user')
            ->withAvg('ratings as rating_avg', 'rating')
            ->withCount('ratings as rating_count')
            ->latest()
            ->get();

        return response()->json($listings);
    }

    public function myListings(Request $request): JsonResponse
    {
        $listings = Listing::with('user')
            ->withAvg('ratings as rating_avg', 'rating')
            ->withCount('ratings as rating_count')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($listings);
    }

    public function show(Request $request, string $title): JsonResponse
    {
        $listing = Listing::with('user')
            ->withAvg('ratings as rating_avg', 'rating')
            ->withCount('ratings as rating_count')
            ->where('title', $title)
            ->first();

        if (! $listing) {
            return response()->json(['message' => 'Listing not found'], 404);
        }

        if ($request->user()) {
            $listing->setAttribute('my_rating', $listing->ratings()
                ->where('user_id', $request->user()->id)
                ->value('rating'));
        }

        return response()->json($listing);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'images' => self::IMAGE_RULES,
            'images.*' => self::IMAGE_ITEM_RULES,
            'date_debut' => 'nullable|date',
            'date_fin' => 'nullable|date|after_or_equal:date_debut',
            'people' => 'required|integer|min:1',
            'rooms' => 'required|integer|min:1',
        ]);

        $images = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $images[] = $file->store('images', 'public');
            }
        }

        $listing = Listing::create([
            'title' => $validated['title'],
            'location' => $validated['location'],
            'price' => $validated['price'],
            'images' => $images,
            'date_debut' => $validated['date_debut'] ?? null,
            'date_fin' => $validated['date_fin'] ?? null,
            'people' => $validated['people'],
            'rooms' => $validated['rooms'],
            'user_id' => $request->user()->id,
        ]);

        return response()->json($listing->load('user'), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $listing = Listing::find($id);

        if (! $listing) {
            return response()->json(['message' => 'Listing not found'], 404);
        }

        if ($listing->user_id !== $request->user()->id) {
            return response()->json(['message' => 'You do not own this listing'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'location' => 'sometimes|string|max:255',
            'price' => 'sometimes|numeric|min:0',
            'images' => self::IMAGE_RULES,
            'images.*' => self::IMAGE_ITEM_RULES,
            'date_debut' => 'sometimes|required_with:date_fin|date',
            'date_fin' => 'sometimes|date|after_or_equal:date_debut',
            'people' => 'sometimes|integer|min:1',
            'rooms' => 'sometimes|integer|min:1',
        ]);

        $listing->fill($validated);

        if ($request->hasFile('images')) {
            $images = $listing->images ?? [];
            foreach ($request->file('images') as $file) {
                $images[] = $file->store('images', 'public');
            }
            $listing->images = $images;
        }

        $listing->save();

        return response()->json($listing->load('user'));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $listing = Listing::find($id);

        if (! $listing) {
            return response()->json(['message' => 'Listing not found'], 404);
        }

        if ($listing->user_id !== $request->user()->id) {
            return response()->json(['message' => 'You do not own this listing'], 403);
        }

        $listing->delete();

        return response()->json(['message' => 'Listing deleted successfully']);
    }
}
