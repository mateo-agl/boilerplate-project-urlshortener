mongoose = require('mongoose');
const { Schema } = mongoose;

const uri = process.env['URI'];

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const objSchema = new Schema({
  original_url: String,
  short_url: Number
});

let ObjModel = mongoose.model('url_objects', objSchema);

const createAndSaveShortUrl = (url, num, done) => {
  const obj = new ObjModel({
    original_url: url,
    short_url: num
  });
  obj.save((err, data) => {
    if (err) return console.error(err);
    done(null, data);
  });
};

const findDocument = (reqUrl, done) => {
  if (Number(reqUrl)) {
    ObjModel.findOne({short_url: reqUrl}, (err, doc) => {
      if (err) return console.error(err);
      done(null, doc);
    });
  } else {
    ObjModel.findOne({original_url: reqUrl}, (err, doc) => {
      if (err) return console.error(err);
      done(null, doc);
    });
  }
}

exports.ObjModel = ObjModel;
exports.createAndSaveShortUrl = createAndSaveShortUrl;
exports.findDocument = findDocument;