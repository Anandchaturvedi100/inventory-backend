#  Inventory Nexus - Smart Rack & Location Manager

**Inventory Nexus** is a modern, web-based inventory management application designed to organize stock items, monitor low-stock levels, and track exact rack/box locations in real-time. Built with a decoupled frontend-backend architecture, it features seamless cloud image storage to keep server storage overhead at 0 KB.

---

Key Features

**Real-Time Search & Filter:** Quickly search items by Name, Category, or Rack/Box location.
**Stock Management:** Add, Update, and Delete items along with cost and selling prices.
**Low Stock Alert System:** Automatic threshold detection to flag items running low on stock.
 **Cloud Image Storage:** Direct image uploads to **Cloudinary** using Multer, eliminating local server storage bloat.
**Fully Deployed & Live:** Frontend hosted on **Vercel** and Backend hosted on **Render**.
-**Secure Environment Variables:** API credentials hidden safely via `.env` configurations.

---

##  Tech Stack & Languages Used

### **Languages**
- **JavaScript (ES6+)** - Core programming language for both Frontend and Backend logic.
- **HTML5 & CSS3** - UI structure, responsive styling, and modern dashboard layout.
- **JSON** - Lightweight data-interchange format used for data storage.

### **Frontend**
- **React.js** (Vite/CRA) - UI Component Library.
- **Axios** - HTTP client for API communication.
- **Vercel** - Frontend Hosting & Deployment Platform.

### **Backend**
- **Node.js** - JavaScript Runtime Environment.
- **Express.js** - Backend Web Framework.
- **Multer & Cloudinary SDK** - Handling multipart file uploads directly to Cloud Storage.
- **CORS & Dotenv** - Cross-origin resource sharing & Environment configuration.
- **Render.com** - Cloud Server Hosting.

---

##  How It Works (System Architecture)


[ User Browser ] ───(React App / Vercel)───► [ Node.js Express Backend / Render ]
│               │
(Saves Items) │               │ (Uploads Photos)
▼               ▼
[ inventory.json ]   [ Cloudinary Storage ]


1. **User Request:** The user interacts with the React UI hosted on Vercel (e.g., adding a new item with details and an image).
2. **API Call:** React sends a `FormData` request to the live Express API on Render (`/api/items`).
3. **Image Upload:** Express routes the attached photo through `multer-storage-cloudinary`, uploading it directly to Cloudinary.
4. **Data Persistence:** Cloudinary returns a secure image URL. The backend attaches this URL to the item object and updates `inventory.json`.
5. **State Update:** The backend sends the updated item list back to React to re-render the dashboard UI instantaneously.

---

##  Project Structure

```text
inventory-app/
├── backend/
│   ├── server.js          # Express API server & routes
│   ├── inventory.json     # Data file for items storage
│   ├── .env               # Private API keys (Cloudinary, Port)
│   ├── .gitignore          # Ignored files (node_modules, .env)
│   └── package.json       # Backend dependencies
│
└── frontend/
    ├── src/
    │   ├── App.jsx        # Main React Component (UI & Logic)
    │   ├── main.jsx       # Entry Point
    │   └── App.css        # Dashboard styling & UI layout
    ├── package.json       # Frontend dependencies
    └── vite.config.js     # Vite builder configuration


** Local Setup & Installation Guide
    Prerequisites
        Node.js (v16 or higher) installed on your system.
        Free account on Cloudinary for image API keys.

1. Backend Setup

# Navigate to backend directory
cd backend

# Install dependencies
npm install express cors multer cloudinary multer-storage-cloudinary dotenv

# Create a .env file in the backend directory
# Add the following keys:
PORT=5000
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

# Start local backend server
node server.js
Backend will run locally at: http://localhost:5000

2. Frontend Setup

# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev


API Endpoints SummaryMethodEndpointDescriptionGET/api/itemsFetch all inventory items (supports ?search= query)POST/api/itemsAdd a new inventory item with optional image filePUT/api/items/:idUpdate an existing item by IDDELETE/api/items/:idRemove an item from inventory by ID


