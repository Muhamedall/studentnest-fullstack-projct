<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'text' => 'required|string|max:2000',
            'listing_id' => 'required|integer|exists:listings,id',
            'parent_id' => 'nullable|integer|exists:comments,id',
        ]);

        $comment = Comment::create([
            'text' => $validated['text'],
            'listing_id' => $validated['listing_id'],
            'user_id' => $request->user()->id,
            'parent_id' => $validated['parent_id'] ?? null,
        ]);

        return response()->json($comment->load('user'), 201);
    }

    public function index(Request $request, int $listingId): JsonResponse
    {
        $comments = Comment::where('listing_id', $listingId)
            ->with('user')
            ->latest()
            ->get()
            ->append('user_name');

        $byId = [];
        foreach ($comments as $comment) {
            $byId[$comment->id] = [
                'id' => $comment->id,
                'text' => $comment->text,
                'user_name' => $comment->user_name,
                'created_at' => $comment->created_at,
                'replies' => [],
            ];
        }

        $roots = [];
        foreach ($comments as $comment) {
            if ($comment->parent_id && isset($byId[$comment->parent_id])) {
                $byId[$comment->parent_id]['replies'][] = $byId[$comment->id];
            } else {
                $roots[] = $byId[$comment->id];
            }
        }

        return response()->json($roots);
    }
}