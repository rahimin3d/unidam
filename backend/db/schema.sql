CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL
);

INSERT INTO contacts (name, phone, email) VALUES 
('John Doe', '555-1234', 'johndoe@example.com'),
('Jane Smith', '555-5678', 'janesmith@example.com'),
('Alice Johnson', '555-8765', 'alicejohnson@example.com');