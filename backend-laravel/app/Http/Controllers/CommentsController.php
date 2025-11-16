<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Comment;

class CommentController extends Controller
{
    public function store(Request $request)
    {
        // Validate the request data
        $request->validate([
            'text' => 'required|string',
            'listing_id' => 'required|exists:listings,id'
        ]);

        // Create a new comment
        $comment = new Comment();
        $comment->text = $request->text;
        $comment->listing_id = $request->listing_id;
        $comment->save();

        return response()->json(['message' => 'Comment saved successfully'], 201);
    }

    public function index($listingId)
    {
        // Retrieve comments for a specific listing
        $comments = Comment::where('listing_id', $listingId)->get();
        return response()->json($comments, 200);
    }
}
