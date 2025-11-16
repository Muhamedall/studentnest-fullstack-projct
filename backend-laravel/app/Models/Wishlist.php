<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Wishlist extends Model
{
    use HasFactory;
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // A favorite belongs to a listing
    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }
}
