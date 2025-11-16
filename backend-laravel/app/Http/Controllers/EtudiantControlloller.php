<?php
// EtudiantController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Etudiant; // Import the Etudiant model

class EtudiantController extends Controller
{
    public function store(Request $request)
    {
        // Validate the request data
        $validatedData = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:etudiants'], // Adjust table name if necessary
            'password' => ['required', 'string', 'min:8'], // Adjust password complexity rules
            'dateOfBirth' => ['required', 'date'],
            'city' => ['required', 'string', 'max:255'],
        ]);

        // Create a new Etudiant instance
        $etudiant = Etudiant::create($validatedData);

        // Return a success response
        return response()->json(['message' => 'Etudiant registered successfully', 'etudiant' => $etudiant], 201);
    }
}

