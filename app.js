const express = require("express");
const mongoose = require("mongoose");
const models = require("./models/Note");
const path = require('path');
const md = require('marked');

const Note = models.NoteModel;
const Visit = models.VisitModel;

const app = express();

mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/notes', { useNewUrlParser: true });

app.set('view engine', 'pug');
app.set('views', 'views');

app.use(express.urlencoded({ extended: true }));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

const countVisit = async (req, res, next) => {

  const path = req.path;
  const date = Date.now();
  const userAgent = req.headers['user-agent'];
  const count = 1;

  const visit = new Visit({  
      path,  
      date, 
      userAgent,
      count                                            
  });

  await Visit.findOne({ "path": path }, async function(error, result){
    if (error) return console.error(error);           

    if (result) {
        console.log(result.count);
        result.count += 1;
        await result.save(function(error){
            if (error) return console.error(error);
        });               
    }else{
        await visit.save((error) => {
            if (error) {
                console.log(error);
                return;
            }
        console.log("Visit created"); 
        });
    };
  });
  next();
};


app.get("/", countVisit,  async (req, res) => {
  const notes = await Note.find();
  res.render("index",{ notes: notes } );

});

app.get("/notes/new", countVisit, async (req, res) => {
  const notes = await Note.find();
  res.render("new", { notes: notes });
});

app.post("/notes", async (req, res, next) => {
  const data = {
    title: req.body.title,
    body: req.body.body
  };

  const note = new Note(req.body);
  try {
    await note.save();
  } catch (e) {
    return next(e);
  }

  res.redirect('/');
});

app.get("/notes/:id", countVisit, async (req, res) => {
  const notes = await Note.find();
  const note = await Note.findById(req.params.id);
  res.render("show", { notes: notes, currentNote: note, md: md });
});

app.get("/notes/:id/edit", countVisit, async (req, res, next) => {
  const notes = await Note.find();
  const note = await Note.findById(req.params.id);
  res.render("edit", { notes: notes, currentNote: note });
});

app.get("/analytics", countVisit,  async (req, res, next) => {
  const resumenVisits = await Visit.find().sort({ count: -1});
    console.log(resumenVisits);  
    res.render("analytics", { visits: resumenVisits }); 
});

app.patch("/notes/:id", async (req, res) => {
  const id = req.params.id;
  const note = await Note.findById(id);

  note.title = req.body.title;
  note.body = req.body.body;

  try {
    await note.save();
  } catch (e) {
    return next(e);
  }

  res.status(204).send({});
});

app.delete("/notes/:id", async (req, res) => {
  await Note.deleteOne({ _id: req.params.id });
  res.status(204).send({});
});

app.listen(3000, () => console.log("Listening on port 3000 ..."));
