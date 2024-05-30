const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const mongoose = require('mongoose');
const Chat = require('./models/chat');
const multer = require('multer');
const fs =require('fs')

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images'); // Directory to save the uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Naming the file with the current timestamp
  }
});

const upload = multer({ storage: storage });

// Middleware setup
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
main().then(() => {
  console.log("MongoDB connected");
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://localhost:27017/MyData');
}

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Root route
app.get('/', async (req, res) => {
  let chats = await Chat.find();
  res.render('index.ejs', { chats });
});

// Create new chat
app.get('/new', (req, res) => {
  res.render('new.ejs');
});

app.post('/new', upload.single('testImage'), async (req, res) => {
  const { name, password, address } = req.body;
  
  // Check if the file was uploaded
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  
  const images = {
    data: req.file.filename,
    contentType: req.file.mimetype
  };

  const fullchat = new Chat({
    name,
    password,
    address,
    images,
  });

  try {
    await fullchat.save();
    console.log("Database and post successful");
    res.redirect('/');
  } catch (err) {
    console.log("Error in post", err);
    res.status(500).send("Error saving chat");
  }
});

// Fetch chat data to edit
app.get('/edit/:id', async (req, res) => {
  const id = req.params.id.trim();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid ID format");
  }

  try {
    const chat = await Chat.findById(id);
    if (!chat) {
      return res.status(404).send("Chat not found");
    }
    res.render('edit.ejs', { upchat: chat });
  } catch (err) {
    console.log("Can't retrieve data...", err);
    res.status(500).send("Internal Server Error");
  }
});

// Update chat
app.post('/edit/:id', upload.single('testImage'), async (req, res) => {
  const id = req.params.id.trim();
  const { name, password, address } = req.body;

  const updateData = { name, password, address };

  // Check if a new file was uploaded
  if (req.file) {
    updateData.images = {
      data: req.file.filename,
      contentType: req.file.mimetype
    };
  }

  try {
    await Chat.findByIdAndUpdate(id, updateData, { new: true });
    res.redirect('/');
  } catch (err) {
    console.log("error caused in update post", err);
    res.status(500).send("An error occurred while updating the post.");
  }
});


// Delete chat
app.get('/delete/:id', async (req, res) => {
  try {
    const id = req.params.id.trim();
    console.log("ID to delete:", id);

    const deletedChat = await Chat.findByIdAndDelete(id);
    if (!deletedChat) {
      console.log("No chat found with that ID.");
    } else {
      // Convert the buffer to a string for the image path
      const imagePathBuffer = deletedChat.images.data;
      const imagePath = path.join(__dirname, 'public', 'images', imagePathBuffer.toString());

      // Delete the image file from the public/images folder
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error("Error deleting image:", err);
        } else {
          console.log("Image deleted successfully");
        }
      });

      console.log('Deleted successfully:', deletedChat);
      res.redirect('/');
    }
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).send("Error deleting chat.");
  }
});



// Server listening
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
