require('dotenv').config();

// Memory optimization for free hosting
process.env.NODE_OPTIONS = '--max-old-space-size=256';

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Route Imports
const authRoutes = require('./routes/authRoutes.cjs');
const googleAuthRoutes = require('./routes/googleAuth.cjs'); // Added Google Auth routes
const contentRoutes = require('./routes/contentRoutes.cjs');
const paymentRoutes = require('./routes/paymentRoutes.cjs');
const paymentSettingsRoutes = require('./routes/paymentSettingsRoutes.cjs'); // ✅ NEW

const app = express();

// =======================
// ✅ CORS Middleware Setup
// =======================
const allowedOrigins = [
  'http://localhost:5173',
  'https://climax-frontend.vercel.app',
  'https://watchclimax.vercel.app', // ✅ new domain
  'https://climaxott.vercel.app', // ✅ CURRENT FRONTEND URL
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS Not Allowed'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// =======================
// ✅ MongoDB Connection (Optimized for free hosting)
// =======================
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 5 // Limit connection pool
})
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
  });

// =======================
// ✅ API Routes
// =======================

// Add root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🎬 Climax OTT Backend API',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      contents: '/api/contents',
      payments: '/api/payments',
      'payment-settings': '/api/payment-settings'
    }
  });
});

// Direct content endpoint for debugging - BEFORE route middleware
app.get('/api/contents', async (req, res) => {
  try {
    console.log('📦 Content API called');
    
    // First, try to connect to database and fetch real content
    if (mongoose.connection.readyState === 1) {
      try {
        const Content = require('./models/Content.cjs');
        const contents = await Content.find().sort({ createdAt: -1 });
        console.log('📦 Found contents from DB:', contents.length);
        
        if (contents.length > 0) {
          return res.json(contents);
        }
      } catch (dbError) {
        console.error('❌ Database query error:', dbError);
      }
    }
    
    // Fallback: Return static content that matches your database schema
    console.log('📦 Using fallback static content');
    const fallbackContent = [
      {
        _id: "670123456789abcdef000001",
        title: "The Dark Knight",
        description: "Batman faces the Joker in this epic crime drama.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        thumbnail: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=500",
        category: "Action",
        type: "movie",
        duration: 152,
        climaxTimestamp: 120,
        premiumPrice: 4.99,
        genre: ["Action", "Crime", "Drama"],
        rating: 9.0,
        isActive: true,
        createdAt: new Date()
      },
      {
        _id: "670123456789abcdef000002", 
        title: "Stranger Things",
        description: "Supernatural drama series set in the 1980s.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500",
        category: "Drama",
        type: "series", 
        duration: 45,
        climaxTimestamp: 35,
        premiumPrice: 2.99,
        genre: ["Drama", "Fantasy", "Horror"],
        rating: 8.7,
        isActive: true,
        createdAt: new Date()
      },
      {
        _id: "670123456789abcdef000003",
        title: "Comedy Central",
        description: "Hilarious comedy specials and shows.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", 
        thumbnail: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=500",
        category: "Comedy",
        type: "series",
        duration: 30,
        climaxTimestamp: 20,
        premiumPrice: 1.99,
        genre: ["Comedy"],
        rating: 8.5,
        isActive: true,
        createdAt: new Date()
      }
    ];
    
    res.json(fallbackContent);
    
  } catch (error) {
    console.error('❌ Content API error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch contents', 
      error: error.message
    });
  }
});

// Individual content endpoint
app.get('/api/contents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📦 Individual content API called for ID:', id);
    
    // First, try to get from database
    if (mongoose.connection.readyState === 1) {
      try {
        const Content = require('./models/Content.cjs');
        const content = await Content.findById(id);
        if (content) {
          console.log('📦 Found content in DB:', content.title);
          return res.json(content);
        }
      } catch (dbError) {
        console.error('❌ Database query error:', dbError);
      }
    }
    
    // Fallback: Find in static content
    const fallbackContent = [
      {
        _id: "670123456789abcdef000001",
        title: "The Dark Knight",
        description: "Batman faces the Joker in this epic crime drama.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        thumbnail: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=500",
        category: "Action",
        type: "movie",
        duration: 152,
        climaxTimestamp: 120,
        premiumPrice: 4.99,
        genre: ["Action", "Crime", "Drama"],
        rating: 9.0,
        isActive: true,
        createdAt: new Date()
      },
      {
        _id: "670123456789abcdef000002", 
        title: "Stranger Things",
        description: "Supernatural drama series set in the 1980s.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500",
        category: "Drama",
        type: "series", 
        duration: 45,
        climaxTimestamp: 35,
        premiumPrice: 2.99,
        genre: ["Drama", "Fantasy", "Horror"],
        rating: 8.7,
        isActive: true,
        createdAt: new Date()
      },
      {
        _id: "670123456789abcdef000003",
        title: "Comedy Central",
        description: "Hilarious comedy specials and shows.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", 
        thumbnail: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=500",
        category: "Comedy",
        type: "series",
        duration: 30,
        climaxTimestamp: 20,
        premiumPrice: 1.99,
        genre: ["Comedy"],
        rating: 8.5,
        isActive: true,
        createdAt: new Date()
      }
    ];
    
    const content = fallbackContent.find(c => c._id === id);
    
    if (content) {
      console.log('📦 Found content in fallback:', content.title);
      res.json(content);
    } else {
      console.log('❌ Content not found for ID:', id);
      res.status(404).json({ message: 'Content not found' });
    }
    
  } catch (error) {
    console.error('❌ Individual content API error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch content', 
      error: error.message
    });
  }
});

// Seed endpoint to add sample content to database
app.post('/api/contents/seed', async (req, res) => {
  try {
    const Content = require('./models/Content.cjs');
    
    // Check if content already exists
    const existingCount = await Content.countDocuments();
    if (existingCount > 0) {
      return res.json({ message: 'Content already exists', count: existingCount });
    }
    
    const sampleContent = [
      {
        title: 'The Dark Knight',
        description: 'Batman faces the Joker in this epic crime drama.',
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=500',
        category: 'Action',
        type: 'movie',
        duration: 152,
        climaxTimestamp: 120,
        premiumPrice: 4.99,
        genre: ['Action', 'Crime', 'Drama'],
        rating: 9.0,
        isActive: true
      },
      {
        title: 'Stranger Things',
        description: 'Supernatural drama series set in the 1980s.',
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500',
        category: 'Drama',
        type: 'series',
        duration: 45,
        climaxTimestamp: 35,
        premiumPrice: 2.99,
        genre: ['Drama', 'Fantasy', 'Horror'],
        rating: 8.7,
        isActive: true
      }
    ];
    
    const result = await Content.insertMany(sampleContent);
    res.json({ message: 'Sample content added', count: result.length, content: result });
    
  } catch (error) {
    console.error('❌ Seed error:', error);
    res.status(500).json({ message: 'Failed to seed content', error: error.message });
  }
});

// Payment check endpoint - BEFORE route middleware
app.get('/api/payments/check', async (req, res) => {
  try {
    const { userId, contentId } = req.query;
    
    // For demo: always return false so payment modal shows for premium content
    res.json({
      paid: false
    });
  } catch (error) {
    res.status(500).json({ message: 'Payment check failed' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);  // <-- Add Google auth routes here
// Skip content routes since we have direct endpoint above
app.use('/api/payments', paymentRoutes);
app.use('/api/payment-settings', paymentSettingsRoutes); // ✅ NEW

// Video proxy endpoint for better loading performance
app.get('/api/video/:id', async (req, res) => {
  try {
    const Content = require('./models/Content.cjs');
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    // Set caching headers for better performance
    res.set({
      'Cache-Control': 'public, max-age=3600',
      'Content-Type': 'video/mp4'
    });
    
    // Redirect to the video URL with caching
    res.redirect(301, content.videoUrl);
  } catch (error) {
    console.error('Video proxy error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =======================
// ✅ Start Server
// =======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running`);
});
