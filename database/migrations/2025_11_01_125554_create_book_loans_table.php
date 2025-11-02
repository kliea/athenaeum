<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('book_loans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_id')->constrained()->onDelete('cascade');
            $table->foreignId('staff_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('borrower_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('loan_date')->useCurrent();
            $table->timestamp('due_date');
            $table->timestamp('return_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();


            $table->index(['book_id', 'loan_date']);
            $table->index('due_date');
            $table->index('return_date');
            $table->index(['borrower_id', 'loan_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('book_loans');
    }
};
