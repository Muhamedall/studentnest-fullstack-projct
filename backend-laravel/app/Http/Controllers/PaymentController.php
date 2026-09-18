<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use App\Models\Payment;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Stripe;
use Stripe\Webhook;

class PaymentController extends Controller
{
    public function checkout(Request $request, int $listingId): JsonResponse
    {
        $listing = Listing::with('user')->find($listingId);

        if (! $listing) {
            return response()->json(['message' => 'Listing not found'], 404);
        }

        if ($listing->user_id === $request->user()->id) {
            return response()->json(['message' => 'You cannot book your own listing'], 422);
        }

        $secret = config('services.stripe.secret');

        if (! $secret) {
            return response()->json([
                'message' => 'Stripe is not configured yet. Add your STRIPE_SECRET (test mode) in the backend .env file.',
            ], 503);
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

        $reservation = Reservation::firstOrCreate(
            [
                'user_id' => $request->user()->id,
                'listing_id' => $listingId,
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'is_paid' => false,
            ],
            [
                'status' => 'pending',
                'is_paid' => false,
            ]
        );

        Stripe::setApiKey($secret);

        $session = StripeSession::create([
            'mode' => 'payment',
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => 'usd',
                    'product_data' => [
                        'name' => $listing->title,
                        'description' => 'Reservation on StudentNest from '.$validated['start_date'].' to '.$validated['end_date'],
                    ],
                    'unit_amount' => (int) round($listing->price * 100),
                ],
                'quantity' => 1,
            ]],
            'metadata' => [
                'listing_id' => $listingId,
                'reservation_id' => $reservation->id,
                'user_id' => $request->user()->id,
            ],
            'success_url' => config('services.stripe.frontend_success_url'),
            'cancel_url' => config('services.stripe.frontend_cancel_url'),
        ]);

        $payment = Payment::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'listing_id' => $listingId,
                'reservation_id' => $reservation->id,
            ],
            [
                'amount' => $listing->price,
                'currency' => 'usd',
                'provider' => 'stripe',
                'stripe_session_id' => $session->id,
                'status' => 'pending',
            ]
        );

        return response()->json([
            'checkout_url' => $session->url,
            'session_id' => $session->id,
            'payment_id' => $payment->id,
            'reservation_id' => $reservation->id,
        ]);
    }

    public function webhook(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');

        $endpointSecret = config('services.stripe.webhook_secret');

        if (! $endpointSecret) {
            return response()->json(['message' => 'Webhook secret not configured'], 503);
        }

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
        } catch (SignatureVerificationException $e) {
            return response()->json(['message' => 'Invalid signature'], 400);
        }

        $session = $event->data->object;

        if ($event->type === 'checkout.session.completed' && $session->payment_status === 'paid') {
            $payment = Payment::where('stripe_session_id', $session->id)->first();

            if ($payment) {
                $payment->update([
                    'status' => 'paid',
                    'stripe_payment_intent_id' => $session->payment_intent ?? $payment->stripe_payment_intent_id,
                ]);

                if ($payment->reservation_id) {
                    Reservation::where('id', $payment->reservation_id)->update([
                        'status' => 'paid',
                        'is_paid' => true,
                    ]);
                }
            }
        }

        return response()->json(['received' => true]);
    }

    public function index(Request $request): JsonResponse
    {
        $payments = Payment::with(['listing', 'reservation'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($payments);
    }

    public function earnings(Request $request): JsonResponse
    {
        $listingIds = Listing::where('user_id', $request->user()->id)->pluck('id');

        $payments = Payment::with('listing')
            ->whereIn('listing_id', $listingIds)
            ->where('status', 'paid')
            ->latest()
            ->get();

        return response()->json([
            'total' => (float) $payments->sum('amount'),
            'payments' => $payments,
        ]);
    }
}