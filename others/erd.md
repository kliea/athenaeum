erDiagram
USER ||--o{ BOOK_LOAN : "borrows"
USER ||--o{ STAFF : "is a"
BOOK ||--|{ BOOK_LOAN : "is in"
BOOK }o--o{ AUTHOR : "written by"
STAFF }o--|| POSITION : "has"
BOOK }o--|| STATUS : "has"

    USER {
        int id PK
        string name
        string email
        timestamp email_verified_at
        string password
        string remember_token
        timestamp created_at
        timestamp updated_at
    }

    BOOK {
        int id PK
        string title
        string isbn
        text description
        int status_id FK
        timestamp published_date
        timestamp created_at
        timestamp updated_at
    }

    AUTHOR {
        int id PK
        string name
        text biography
        timestamp created_at
        timestamp updated_at
    }

    BOOK_LOAN {
        int id PK
        int user_id FK
        int book_id FK
        date loan_date
        date due_date
        date return_date
        timestamp created_at
        timestamp updated_at
    }

    STAFF {
        int id PK
        int user_id FK
        int position_id FK
        timestamp created_at
        timestamp updated_at
    }

    POSITION {
        int id PK
        string name
        timestamp created_at
        timestamp updated_at
    }

    STATUS {
        int id PK
        string name
        timestamp created_at
        timestamp updated_at
    }
