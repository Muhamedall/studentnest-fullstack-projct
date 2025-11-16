<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Listing extends Model
{
    use HasFactory;
    protected $fillable = [
        'title', // Add any other attributes you want to allow mass assignment for here
        'location',
        'price',
        'images',
        'date_debut',
        'date_fin',
        'people',
        'rooms',
        'user_id',
    ];
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function commenter()
    {
        return $this->hasMany(Commenter::class);
    }
    public function wishlest(): HasMany
    {
        return $this->hasMany(Wishlest::class);
    }
}
