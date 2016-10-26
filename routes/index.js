var express = require('express');
var fs = require('fs');
var path = require('path');
var highland = require('highland');
var oboe = require('oboe');
var request = require('request');

var router = express.Router();

function streamDePuntos(stream) {
  return highland(function(push, next) {
    oboe(stream)
      .node('{x y color}', function(punto) {
        push(null, punto);
      })
      .done(function() {
        push(null, highland.nil);
      });
  });
}

router.get('/', function(req, res) {
  res.render('index');
});

router.get('/datos', function(req, res) {

  var pathGato = path.resolve(__dirname, '../datos/gato.json');
  var datosGato = fs.createReadStream(pathGato);
  var streamGato = streamDePuntos(datosGato);

  var streamPuntos = streamGato.map(JSON.stringify)
    .intersperse(',');

  highland([
      '[',
      streamPuntos,
      ']'
    ])
    .invoke('split', [''])
    .sequence()
    .pipe(res);

});

module.exports = router;
