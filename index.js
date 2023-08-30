/** @format */

const cardData = [
  {
    projectTitle: "Dumbways Mobile App - 2021",
    startDate: "2023-08-03",
    endDate: "2023-11-03",
    duration: "5 Month",
    description: `Contrary to popular belief, Lorem Ipsum is not simply random text. 
    It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.
    Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia,
    looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, 
    and going through the cites of the word in classical literature, discovered the undoubtable source.
    Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum"
    (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, 
    very popular during the Renaissance. The first line of Lorem Ipsum,
     "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.`,
    image: "../image/memakai-topi.webp",
  },
  {
    projectTitle: "Dumbways Mobile App - 2023",
    startDate: "2023-08-03",
    endDate: "2023-11-03",
    duration: "1 Month",
    description: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.`,
    image: "../image/123.jpeg",
  },
];

const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;
const fileUpload = require("express-fileupload");

//init sequelize
const config = require("./src/config/config.json");
const { Sequelize, QuretyTypes } = require("sequelize");
const sequelize = new require("config.development");

// example to use hbs "template engine"
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "src/views"));

app.use(express.static("src/assets/image"));
app.use(express.static(path.join("src")));
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload());

// app.use(express.static("assets"));

app.get("/", home);
app.get("/add-project", addProject);
app.post("/add-project", postProject);
app.get("/contact", contact);
app.get("/testimoni", testimoni);
app.get("/add-project/:id", detailProject);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

function home(req, res) {
  res.render("index", { cardData });
}

function contact(req, res) {
  res.render("contact");
}

function testimoni(req, res) {
  res.render("testimoni");
}

function detailProject(req, res) {
  const { id } = req.params;

  res.render("detail-project", { detail: cardData[id] });
}

function addProject(req, res) {
  res.render("add-project");
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
