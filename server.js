const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const ejs = require('ejs');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
require('dotenv').config();
const app = express();
const port = process.env.PORT;
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(bodyParser.json());
const conn = process.env.MONGO_URL;
mongoose.connect(conn);


const inputSchema = new mongoose.Schema({
    cn: String,
    month: String,
    name: String,
    workedDays: String,
    paymentStatus: String,
    paidBy: String,
    payDate: String,
    remarks: String,
})

const InputData = mongoose.model('InputData',inputSchema);

app.get('/',(req,res)=>{
  res.sendFile(__dirname+'/public/home.html');
})

app.get('/upload',(req,res)=>{
    res.sendFile(__dirname+'/public/upload.html')
})

app.post('/upload',async(req,res)=>{
  let {cn,month,name,workedDays,paymentStatus,paidBy,payDate,remarks} = req.body;
  try{
    const inputData = new InputData({
        cn: cn,
        month: month,
        name: name,
        workedDays: workedDays,
        paymentStatus: paymentStatus,
        paidBy: paidBy,
        payDate: payDate,
        remarks: remarks,
    });
    await inputData.save();
    let a45 = fs.readFileSync('public/submit.html')
    res.send(a45.toString());
  }
  catch(err){
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
})

app.get('/display',async (req, res) => {
  try {
    const data = await InputData.find();
    res.render('display', { data });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post('/update/:id',async (req, res) => {
  try {
    const { id } = req.params;
    let { cn,month,name,workedDays,paidBy,paymentStatus,payDate,remarks } = req.body;
    await InputData.findByIdAndUpdate(id, { cn,month,name,workedDays,paidBy,paymentStatus,payDate,remarks });
    res.status(200).send('Data updated successfully');
  } catch (error) {
    res.status(500).send(error.message);
  }
});


app.delete('/entries/:id', async (req, res) => {
  try {
      const deletedEntry = await InputData.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: 'Entry deleted successfully', deletedEntry });
  } catch (error) {
      res.status(500).json({ error: 'Error deleting entry' });
  }
});

// API endpoint to handle duplicate request
app.post('/entries/:id/duplicate', async (req, res) => {
  try {
      const originalEntry = await InputData.findById(req.params.id);
      const duplicatedEntry = new InputData(originalEntry);
      await duplicatedEntry.save();
      res.status(201).json({ message: 'Entry duplicated successfully', duplicatedEntry });
      console.log(req.params.id);
  } catch (error) {
      res.status(500).json({ error: 'Error duplicating entry' });
  }
});


app.listen(port,()=>{
  console.log(`server runnig at ${port}`)
})