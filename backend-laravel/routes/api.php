<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\EtudiantControlloller;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\ListingController;
use App\Http\Controllers\CommentsController;

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

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/login', [UserController::class, 'login']);
Route::post('/register', [UserController::class, 'store']);

Route::post('/listings', [ListingController::class, 'store']);
Route::get('/dataListings', [ListingController::class, 'index']);
Route::middleware(['auth:sanctum'])->post('/logout', [UserController::class, 'logout']);



Route::get('/dataListings/{title}', [ListingController::class, 'show']);

Route::post('/comments', [CommentController::class, 'store']);
Route::get('/listings/{listingId}/comments', [CommentController::class, 'index']);
Route::get('/healthz', fn() => response()->json(['status' => 'ok']));
