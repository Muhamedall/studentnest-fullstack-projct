<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Wishlist; 

class WishlistController extends Controller
{
    public function addFavorite(Request $request)
    {
        $user = Auth::user();

        $wishlist = Wishlist::create([
            'user_id' => $user->id,
            'listing_id' => $request->listing_id,
        ]);

        return response()->json($wishlist, 201);
    }

    public function removeFavorite(Request $request)
    {
        $user = Auth::user();

        Wishlist::where('user_id', $user->id)
            ->where('listing_id', $request->listing_id)
            ->delete();

        return response()->json(['message' => 'Favorite removed'], 200);
    }

    public function getFavorites()
    {
        $user = Auth::user();
        if (!$user) { 
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        $favorites = Wishlist::where('user_id', $user->id)->with('listing')->get();
        return response()->json($favorites, 200);
    }
}