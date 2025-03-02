# DAM Project

This project is a Digital Asset Management (DAM) system that allows cataloging and managing of assets both locally and on cloud storage services.

## Features

- Support for various file formats (photos, videos, Adobe files, PDFs).
- Integration with local storage and cloud storages (Azure, AWS, Google Cloud).
- Metadata extraction and indexing.
- Social media integration for sharing assets as reels or posts.
- Dockerized deployment for easy setup.

## Project Structure

```
dam-project/
├── backend/
│   ├── src/
│   ├── .env
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites

- Docker
- Node.js
- npm

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/<your-username>/dam-project.git
    cd dam-project
    ```

2. Build and run the application using Docker Compose:
    ```sh
    docker-compose up --build
    ```

### Usage

Access the application at `http://localhost:3000`.

### Contributing

Contributions are welcome! Please open an issue or submit a pull request.