const path = require('path');
const express=require('express');
const app =express();

const port=3000;

const pathToStaticFiles= path.join(__dirname,'Zadanie6');
app.use(express.static(pathToStaticFiles));

const indexHtml = path.join(__dirname,'Zadanie6','Zadanie6.html');
app.get('/',function(req,res){
    res.sendFile(indexHtml)
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

const pathToHtml =path.join(__dirname,'page/index.html');
