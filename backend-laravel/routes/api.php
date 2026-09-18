<?php

use App\Http\Controllers\CommentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ListingController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\RatingController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WishlistController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    Route::put('/user/password', [UserController::class, 'updatePassword']);

    Route::post('/logout', [UserController::class, 'logout']);

    // Dashboard
    Route::get('/dashboard-stats', [DashboardController::class, 'stats']);

    // Listings (authenticated actions)
    Route::post('/listings', [ListingController::class, 'store']);
    Route::get('/my-listings', [ListingController::class, 'myListings']);
    Route::put('/listings/{id}', [ListingController::class, 'update']);
    Route::delete('/listings/{id}', [ListingController::class, 'destroy']);

    // Comments
    Route::post('/comments', [CommentController::class, 'store']);

    // Ratings
    Route::post('/listings/{listingId}/ratings', [RatingController::class, 'store']);

    // Wishlist
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist', [WishlistController::class, 'store']);
    Route::delete('/wishlist/{listingId}', [WishlistController::class, 'destroy']);

    // Reservations
    Route::get('/my-reservations', [ReservationController::class, 'myReservations']);
    Route::post('/listings/{listingId}/reservations', [ReservationController::class, 'store']);
    Route::get('/listings/{listingId}/reservations', [ReservationController::class, 'index']);

    // Payments
    Route::post('/listings/{listingId}/checkout', [PaymentController::class, 'checkout']);
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::get('/payments/earnings', [PaymentController::class, 'earnings']);

    // Messages
    Route::get('/messages', [MessageController::class, 'index']);
    Route::get('/messages/{userId}', [MessageController::class, 'show']);
    Route::post('/messages', [MessageController::class, 'store']);
});

// Public endpoints
Route::post('/login', [UserController::class, 'login'])->middleware('throttle:auth');
Route::post('/register', [UserController::class, 'store'])->middleware('throttle:auth');

Route::get('/dataListings', [ListingController::class, 'index']);
Route::get('/dataListings/{title}', [ListingController::class, 'show']);
Route::get('/listings/{listingId}/comments', [CommentController::class, 'index']);
Route::get('/listings/{listingId}/ratings', [RatingController::class, 'index']);

// Stripe webhook (no auth — Stripe signs the payload)
Route::post('/stripe/webhook', [PaymentController::class, 'webhook']);

Route::get('/healthz', fn () => response()->json(['status' => 'ok']));