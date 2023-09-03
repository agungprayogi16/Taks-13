/** @format */

// const cardData = [
//   {
//     projectTitle: "Dumbways Mobile App - 2021",
//     startDate: "2023-08-03",
//     endDate: "2023-11-03",
//     duration: "5 Month",
//     description: `Contrary to popular belief, Lorem Ipsum is not simply random text.
//     It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.
//     Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia,
//     looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage,
//     and going through the cites of the word in classical literature, discovered the undoubtable source.
//     Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum"
//     (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics,
//     very popular during the Renaissance. The first line of Lorem Ipsum,
//      "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.`,
//     image: "../image/memakai-topi.webp",
//   },
//   {
//     projectTitle: "Dumbways Mobile App - 2023",
//     startDate: "2023-08-03",
//     endDate: "2023-11-03",
//     duration: "1 Month",
//     description: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.`,
//     image: "../image/123.jpeg",
//   },
// ];

const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;
const fileUpload = require("express-fileupload");
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");

//init sequelize
const config = require("./src/config/config.json");
const { Sequelize, QuretyTypes, QueryTypes } = require("sequelize");
const sequelize = new Sequelize(config.development);

// example to use hbs "template engine"
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "src/views"));

app.use(express.static("src/assets/image"));
app.use(express.static(path.join("src")));
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload());
// parsing data from client
app.use(express.urlencoded({ extended: false }));

// setup flash
app.use(flash());

// setup session
app.use(
  session({
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 2,
    },
    store: new session.MemoryStore(),
    saveUninitialized: true,
    resave: false,
    secret: "secretValue",
  })
);

// app.use(express.static("assets"));

app.get("/", home);
app.get("/add-project", addProject);
app.post("/add-project", postProject);
app.get("/contact", contact);
app.get("/testimoni", testimoni);
app.get("/add-project/:id", detailProject);
app.get("/from-login", fromlogin);
app.post("/from-login", userLogin);
app.get("/from-logout", logout);
app.get("/from-register", fromRegister);
app.post("/from-register", addUser);
app.get("/delete-project/:id", deleteProject);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// index
function home(req, res) {
  res.render("index", {
    isLogin: req.session.isLogin,
    user: req.session.user,
  });
}

function contact(req, res) {
  res.render("contact", {
    isLogin: req.session.isLogin,
    user: req.session.user,
  });
}

function testimoni(req, res) {
  res.render("testimoni", {
    isLogin: req.session.isLogin,
    user: req.session.user,
  });
}

function detailProject(req, res) {
  const { id } = req.params;

  res.render("detail-project", { detail: cardData[id] });
}

function addProject(req, res) {
  res.render("add-project", {
    isLogin: req.session.isLogin,
    user: req.session.user,
  });
}

function fromlogin(req, res) {
  res.render("from-login");
}

async function userLogin(req, res) {
  try {
    const { email, password } = req.body;
    const query = `SELECT * FROM users WHERE email = '${email}'`;
    let obj = await sequelize.query(query, { type: QueryTypes.SELECT });

    console.log(obj[0].password);

    // checking if email has not been registered
    if (!obj.length) {
      req.flash("danger", "user has not been registered");
      return res.redirect("/from-login");
    }

    bcrypt.compare(password, obj[0].password, (err, result) => {
      if (!result) {
        req.flash("danger", "password wrong");
        return res.redirect("/from-login");
      } else {
        req.session.isLogin = true;
        req.session.user = obj[0].name;
        req.flash("success", "login success");
        return res.redirect("/");
      }
      console.log(err);
    });
  } catch (error) {
    console.log(error);
  }
}

function logout(req, res) {
  res.render("from-logout");
}

function fromRegister(req, res) {
  res.render("from-register");
}

async function deleteProject(req, res) {
  try {
    const { id } = req.params;

    await sequelize.query(`DELETE FROM INDEX WHERE id = ${id}`);
    res.redirect("/add-project");
  } catch (error) {
    console.log(error);
  }
}

async function addUser(req, res) {
  try {
    const { name, email, password } = req.body;
    const salt = 10;

    // query untuk cek email apakah sudah di regitrasi
    // if(emailquery.length != 0) return email sudah ada

    bcrypt.hash(password, salt, async (err, hashPassword) => {
      const query = `INSERT INTO users (name,password,email, "createdAt", "updatedAt") VALUES ('${name}', '${hashPassword}', '${email}', NOW(), NOW());`;
      await sequelize.query(query, { type: QueryTypes.SELECT });
    });
    res.redirect("from-login");
  } catch (error) {
    console.log(error);
  }
}

async function postProject(req, res) {
  const { projectTitle, startDate, endDate, description, icotSet } = req.body;

  // memmbuat url image
  const getImage = req.files.inputImage;
  const imageUrl = path.join(
    __dirname,
    "./src/assets/image" + ` ${getImage.name}`
  );

  // menggunakan async await
  await getImage.mv(imageUrl);
  const image = `/image/${getImage.name}`;
  // Konversi ke objek Date
  console.log(image);
  let konversiStartDate = new Date(startDate);
  let konversiEndDate = new Date(endDate);

  // Menghitung selisih antara tanggal-tanggal tersebut dalam milisekon
  let timeDifference = konversiStartDate - konversiEndDate;

  // Mengubah milisekon menjadi hari,tahun,bulan
  let differenceInDays = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  let differenceInMonths = Math.floor(differenceInDays / 30.44);
  let differenceInYears = Math.floor(differenceInMonths / 12);

  let durationDate;

  if (differenceInYears > 0) {
    // console.log(differenceInYears + " years");
    durationDate = `${differenceInYears} years`;
  } else if (differenceInMonths > 0) {
    durationDate = `${differenceInMonths} months`;
    // console.log(differenceInMonths + " months");
  } else {
    durationDate = `${differenceInDays} days`;
    // console.log(differenceInDays + " days");
  }

  // memanggil model
  const project = {
    projectTitle,
    startDate,
    endDate,
    description,
    icotSet,
    image,
    duration: durationDate,
  };
  cardData.push(project);

  res.redirect("/");
}
