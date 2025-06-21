const express = require("express");
const mongoose = require("mongoose");
const port = 3001;
const path = require("path");

const MONGO_URI = ("mongodb://127.0.0.1:27017/FS_project")

const app = express();

mongoose.connect(MONGO_URI)
.then(() => {
    console.log("DB connection established...");
    
})
.catch((error) => {
    console.log("Error in DB connection...",error);
    
})

const userSchema = new mongoose.Schema({
    id: { type: Number, unique: true, required: true },
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true }
})

const userModel = mongoose.model("user", userSchema)


// Middlewares
app.use(express.static(path.join(__dirname, "view")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

// routes
app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "view", "template", "register.html"));
});

app.get("/", (req,res) => {
    res.sendFile(path.join(__dirname, "view", "template", "login.html"));
})

app.get("/dashboard", (req,res) => {
    res.sendFile(path.join(__dirname, "view", "template", "index.html"));
})

app.post("/", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check user in MongoDB
        const userCheck = await userModel.findOne({ email, password });
        if (!userCheck) {
            return res.send(`
                <script>
                    alert("Invalid email or password.");
                    window.history.back();
                </script>
            `);
        }
        res.redirect("/dashboard");
    } catch (err) {
        console.log("Error:", err);
        res.status(500).send("Error checking user data.");
    }
});



app.post("/register", async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.send(`
            <script>
                alert("Passwords do not match.");
                window.history.back();
            </script>
        `);
    }

    // Check if email already exists in the database
    const emailCheck = await userModel.findOne({ email });
    if (emailCheck) {
        return res.send(`
            <script>
                alert("Email already exists. Please use a different one or Login.");
                window.history.back();
            </script>
        `);
    }

    // Create new user in MongoDB
    const newUser = new userModel({
        id: Date.now(), 
        name,
        email,
        password
    });

    try {
        await newUser.save();
        res.redirect("/");
    } catch (err) {
        console.log("Error:", err);
        res.status(500).send("Error saving user data.");
    }
});



// Server
app.listen(port, () => {
    console.log(`Server started at port : ${port}`);
    console.log(`http://localhost:${port}`);
})