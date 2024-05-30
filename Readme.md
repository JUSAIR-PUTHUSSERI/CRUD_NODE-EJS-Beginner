# Node js
1. ``npm init -y``
2. `` npm i express@4 ``
3. ``npm i ejs``
4. ``npm i body-parser``
5.  ``npm i mongoose``
6. `npm i multer` for image/file upload
7. `npm i file-system`

- Express Server ```https://expressjs.com/en/starter/hello-world.html```

- MongoDB Connection
````https://mongoosejs.com/docs/index.html````


- for the file upload
 const multer = require('multer');


    const storage = multer.diskStorage({
    destination: (req, file, cb) => {
    cb(null, 'public/images'); // Directory to save the uploaded files
    },
    filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
    }
    });

    const upload = multer({ storage: storage });

    