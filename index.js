import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import authRoutes from "./routes/auth.js";
import teacherRoutes from "./routes/teachers.js";
import gradeRoutes from "./routes/grades.js";
import studentRoutes from "./routes/students.js";
import courseRoutes from "./routes/courses.js";
import scoreRoutes from "./routes/scores.js";
import activityRoutes from "./routes/activities.js";
import attendanceRoutes from "./routes/attendance.js";
import performancecRoutes from "./routes/performancec.js";
import {
  registerAdmin,
  registerStudent,
  registerTeacher,
} from "./controllers/auth.js";
import { verifyToken } from "./middleware/auth.js";
import { editStudent } from "./controllers/students.js";
import { editTeacher } from "./controllers/teachers.js";

// CONFIGURATIONS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();  // Declaración de `app` corregida

app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors({
  origin: 'https://schoolinfocliente.onrender.com' // Cambia esto a la URL de tu frontend desplegado
}));

app.use("/assets", express.static(path.join(__dirname, "public/assets")));
mongoose.set("strictQuery", true);

// FILE STORAGE
const adminStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets/admins");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + uuidv4();
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const teacherStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets/teachers");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + uuidv4();
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const studentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets/students");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + uuidv4();
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const adminUpload = multer({ storage: adminStorage });
const teacherUpload = multer({ storage: teacherStorage });
const studentUpload = multer({ storage: studentStorage });

// ROUTES WITH FILES
app.post(
  "/auth/registerStudent",
  verifyToken,
  studentUpload.single("picture"),
  registerStudent
);
app.post(
  "/auth/registerTeacher",
  verifyToken,
  teacherUpload.single("picture"),
  registerTeacher
);
app.post("/auth/registerAdmin", adminUpload.single("picture"), registerAdmin);
app.patch("/students/:studentId/editStudent", verifyToken, studentUpload.single("picture"), editStudent);
app.patch("/teachers/:teacherId/editTeacher", verifyToken, teacherUpload.single("picture"), editTeacher);

// ROUTES
app.use("/auth", authRoutes);
app.use("/teachers", teacherRoutes);
app.use("/grades", gradeRoutes);
app.use("/students", studentRoutes);
app.use("/courses", courseRoutes);
app.use("/scores", scoreRoutes);
app.use("/activities", activityRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/performancec", performancecRoutes);

// MONGOOSE SETUP
const PORT = process.env.PORT || 6001;

// Log the MONGO_URL to ensure it is correctly loaded
console.log('MONGO_URL:', process.env.MONGO_URL);

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server port: ${PORT}`));
  })
  .catch((error) => console.log(error));
