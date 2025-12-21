<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Book;
use App\Models\Author;
use App\Models\Status;
use Carbon\Carbon;

class BookSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $availableStatus = Status::where('title', 'Available')->first();
        
        if (!$availableStatus) {
            $this->command->info('Available status not found. Skipping Book seeding.');
            return;
        }

        // Get authors
        $fitzgerald = Author::where('last_name', 'Fitzgerald')->first();
        $orwell = Author::where('last_name', 'Orwell')->first();
        $rowling = Author::where('last_name', 'Rowling')->first();
        $lee = Author::where('last_name', 'Lee')->first();
        $tolkien = Author::where('last_name', 'Tolkien')->first();

        $books = [
            [
                'title' => 'The Great Gatsby',
                'isbn' => '978-0743273565',
                'publication_year' => 1925,
                'status_id' => $availableStatus->id,
                'authors' => [$fitzgerald],
            ],
            [
                'title' => '1984',
                'isbn' => '978-0451524935',
                'publication_year' => 1949,
                'status_id' => $availableStatus->id,
                'authors' => [$orwell],
            ],
            [
                'title' => 'Harry Potter and the Sorcerer\'s Stone',
                'isbn' => '978-0590353427',
                'publication_year' => 1997,
                'status_id' => $availableStatus->id,
                'authors' => [$rowling],
            ],
            [
                'title' => 'To Kill a Mockingbird',
                'isbn' => '978-0061120084',
                'publication_year' => 1960,
                'status_id' => $availableStatus->id,
                'authors' => [$lee],
            ],
            [
                'title' => 'The Hobbit',
                'isbn' => '978-0547928227',
                'publication_year' => 1937,
                'status_id' => $availableStatus->id,
                'authors' => [$tolkien],
            ],
             [
                'title' => 'The Fellowship of the Ring',
                'isbn' => '978-0547928210',
                'publication_year' => 1954,
                'status_id' => $availableStatus->id,
                'authors' => [$tolkien],
            ],
        ];

        foreach ($books as $bookData) {
            // Extract authors to attach later
            $bookAuthors = $bookData['authors'];
            unset($bookData['authors']);

            // Create book
            $book = Book::create($bookData);

            // Attach authors
            // Filter out nulls just in case an author wasn't found
            $validAuthors = array_filter($bookAuthors, fn($a) => $a !== null);
            if (!empty($validAuthors)) {
                 $book->authors()->attach(array_map(fn($a) => $a->id, $validAuthors));
            }
        }
    }
}
