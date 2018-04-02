"use strict";

var Client = require('node-rest-client').Client;
var includes = require('array-includes');
var cidrClean = require('cidr-clean');

var settings = require('./settings.json');

var options = {
  mimetypes: {
      xml: ["application/xml"]
    }
};
var client = new Client(options);
client.parsers.find("XML").options= {"mergeAttrs": true};

client.get(settings.o365addressURL, function (data, response) {
  var newlist = [];
  for(var i = 0; i < data.products.product.length; i++)
  {
    if(includes(settings.msProducts, data.products.product[i].name[0])) {
      for(var ii = 0; ii < data.products.product[i].addresslist.length; ii++) {
        if(data.products.product[i].addresslist[ii].type[0] == 'IPv4') {
          if ( typeof data.products.product[i].addresslist[ii].address !== 'undefined' && data.products.product[i].addresslist[ii].address ) {
            var addresslist = data.products.product[i].addresslist[ii].address
            addresslist.forEach(function(value) {
              newlist.push(value);
            });
          }
        }
      }
    }
  }
  if (newlist.length) {
    var newlist = cidrClean(newlist);
    var addresses = [];
    newlist.forEach(function(value) {
      var tempobj = {'subnet': value};
      addresses.push(tempobj);
    });
    var body = {'addressSpaceExcludeSubnet': addresses};
    var client = new Client(options_auth);
    var args = {
      data: body,
      headers: {"Content-Type": "application/json"},
      path: {"NA": settings.networkAccessObject}
    };
    var options_auth = {
      user: "admin",
      password: "admin",
      connection: {
      "rejectUnauthorized": false 
      }
    };
    var client = new Client(options_auth);
    client.patch("https://10.0.0.128/mgmt/tm/apm/resource/network-access/${NA}", args, function (data, response) {
      console.log(data);
    });
  }
});