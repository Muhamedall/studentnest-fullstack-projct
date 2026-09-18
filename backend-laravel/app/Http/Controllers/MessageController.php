<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $messages = Message::with('sender', 'receiver', 'listing')
            ->where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->latest()
            ->get();

        $conversations = [];
        $seen = [];

        foreach ($messages as $message) {
            $otherId = $message->sender_id === $userId ? $message->receiver_id : $message->sender_id;

            if (isset($seen[$otherId])) {
                if ($message->read_at === null && $message->receiver_id === $userId) {
                    $conversations[$otherId]['unread']++;
                }
                continue;
            }

            $seen[$otherId] = true;
            $other = $message->sender_id === $userId ? $message->receiver : $message->sender;

            $conversations[$otherId] = [
                'user' => $other ? ['id' => $other->id, 'name' => $other->name, 'profile_image' => $other->profile_image] : null,
                'last_message' => $message->body,
                'last_message_at' => $message->created_at,
                'listing_title' => $message->listing?->title,
                'unread' => ($message->read_at === null && $message->receiver_id === $userId) ? 1 : 0,
            ];
        }

        return response()->json(array_values($conversations));
    }

    public function show(Request $request, int $userId): JsonResponse
    {
        $me = $request->user()->id;

        $other = User::find($userId);

        if (! $other) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $messages = Message::where(function ($query) use ($me, $userId) {
            $query->where('sender_id', $me)->where('receiver_id', $userId);
        })->orWhere(function ($query) use ($me, $userId) {
            $query->where('sender_id', $userId)->where('receiver_id', $me);
        })->orderBy('created_at')->get();

        Message::where('sender_id', $userId)
            ->where('receiver_id', $me)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'other' => ['id' => $other->id, 'name' => $other->name, 'profile_image' => $other->profile_image],
            'messages' => $messages->map(function ($message) use ($me) {
                return [
                    'id' => $message->id,
                    'body' => $message->body,
                    'sender_id' => $message->sender_id,
                    'listing_title' => $message->listing?->title,
                    'created_at' => $message->created_at,
                    'mine' => $message->sender_id === $me,
                ];
            }),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'receiver_id' => 'required|integer|exists:users,id',
            'body' => 'required|string|max:2000',
            'listing_id' => 'nullable|integer|exists:listings,id',
        ]);

        $message = Message::create([
            'sender_id' => $request->user()->id,
            'receiver_id' => $validated['receiver_id'],
            'listing_id' => $validated['listing_id'] ?? null,
            'body' => $validated['body'],
        ]);

        return response()->json($message->load('sender', 'receiver'), 201);
    }
}