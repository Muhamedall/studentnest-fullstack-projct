<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();

        $listingIds = Listing::where('user_id', $user->id)->pluck('id');

        $reservations = \App\Models\Reservation::whereIn('listing_id', $listingIds);

        $comments = \App\Models\Comment::whereIn('listing_id', $listingIds);

        $payments = \App\Models\Payment::where('status', 'paid')->whereIn('listing_id', $listingIds);

        return response()->json([
            'listings_count' => $listingIds->count(),
            'reservations_count' => (clone $reservations)->count(),
            'pending_reservations' => (clone $reservations)->where('status', 'pending')->count(),
            'comments_count' => $comments->count(),
            'wishlist_count' => \App\Models\Wishlist::whereIn('listing_id', $listingIds)->count(),
            'total_revenue' => (float) $payments->sum('amount'),
            'paid_reservations' => (clone $reservations)->where('is_paid', true)->count(),
            'my_reservations_count' => \App\Models\Reservation::where('user_id', $user->id)->count(),
            'unread_messages' => Message::where('receiver_id', $user->id)->whereNull('read_at')->count(),
        ]);
    }
}