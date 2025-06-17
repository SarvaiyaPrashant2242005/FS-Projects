const express = require("express");
const port = 3001;
let users = require("./users.json");
const fs = require("fs");
const path = require("path");


const app = express();

// Middlewares
app.use(express.static(path.join(__dirname, "view")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

// routes
app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "view", "template", "register.html"));
});

app.get("/login", (req,res) => {
    res.sendFile(path.join(__dirname, "view", "template", "login.html"));
})


app.post("/register", (req, res) => {
    const { name, email, password,confirmPassword  } = req.body;
 
    if (password !== confirmPassword) {
        return res.send(`
            <script>
                alert("Passwords do not match.");
                window.history.back();
            </script>
        `);
    }

    const emailCheck = users.find((user) => user.email == email);

    if(emailCheck){
        return res.send(`
            <script>
                alert("Email already exists. Please use a different one or Login.");
                window.history.back();
            </script>
        `)
    }

    const newData = {
        id: users.length + 1,
        name,
        email,
        password 
    };

    users.push(newData);

    fs.writeFile("users.json", JSON.stringify(users, null, 2), (err) => {
        if (err) {
            console.log("Error:", err);
            return res.status(500).send("Error saving user data.");
        }
        res.redirect("/login");
    });
});



// Server
app.listen(port, () => {
    console.log(`Server started at port : ${port}`);
    console.log(`http://localhost:${port}`);
})