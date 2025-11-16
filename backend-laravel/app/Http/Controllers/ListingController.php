<?php

// app/Http/Controllers/ListingController.php
namespace App\Http\Controllers;

use App\Models\Listing;
use Illuminate\Http\Request;

class ListingController extends Controller
{
    public function index()
    {
        // Eager load the user relationship
        $listings = Listing::with('user')->get();
        return response()->json($listings);
    }
    public function show($title)
{
    // Retrieve the listing by its title
    $listing = Listing::where('title', $title)->with('user')->first();

    if (!$listing) {
        return response()->json(['message' => 'Listing not found'], 404);
    }

    return response()->json($listing);
}


    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'price' => 'required|numeric',
            'images' => 'nullable|array',
            'images.*' => 'file|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'date_debut' => 'nullable|date',
            'date_fin' => 'nullable|date',
            'people' => 'required|integer|min:1',
            'rooms' => 'required|integer|min:1',
        ]);

        $images = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('images', 'public');
                $images[] = $path;
            }
        }

        $listing = Listing::create([
            'title' => $request->title,
            'location' => $request->location,
            'price' => $request->price,
            'images' => json_encode($images),
            'date_debut' => $request->date_debut,
            'date_fin' => $request->date_fin,
            'people' => $request->people,
            'rooms' => $request->rooms,
            'user_id' => $request->user()->id,
        ]);

        return response()->json($listing, 201);
    }
}
