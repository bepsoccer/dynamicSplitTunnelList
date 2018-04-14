function splitO365addresses() {}

splitO365addresses.prototype.WORKER_URI_PATH = "shared/dynamicSplitTunnelList/updateO365addresses";
splitO365addresses.prototype.isPublic = true;

var logger = require('f5-logger').getInstance();
var Client = require('node-rest-client').Client;
var includes = require('array-includes');
var cidrClean = require('cidr-clean-bp');

/**
* handle onGet HTTP request
*/
splitO365addresses.prototype.onGet = function(restOperation) {
  var basicAuthToken = restOperation.getBasicAuthorization();
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
                var addresslist = data.products.product[i].addresslist[ii].address;
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
        var args = {
          data: body,
          headers: {
            "Content-Type": "application/json",
            "Authorization": basicAuthToken
          },
          path: {"NA": settings.networkAccessObject}
        };
        var options_auth = {
          //user: "admin",
          //password: "admin",
          connection: {
          "rejectUnauthorized": false 
          }
        };
        var client = new Client(options_auth);
        var req = client.patch("http://localhost:8100/mgmt/tm/apm/resource/network-access/${NA}", args, function (data, response) {
          logger.info(data);
          restOperation.setBody(JSON.stringify(data));
          //restOperation.setBody(JSON.stringify(response.statusCode + " " + response.statusMessage));
          splitO365addresses.prototype.completeRestOperation(restOperation);
        }).on('error', function (err) {
            logger.info('something went wrong on the request', err.request.options);
            restOperation.setBody(JSON.stringify(err.request.options));
            splitO365addresses.prototype.completeRestOperation(restOperation);
        });
        req.on('requestTimeout', function (req) {
            logger.info('request has expired');
            req.abort();
        });
         
        req.on('responseTimeout', function (res) {
            logger.info('response has expired');
            restOperation.setBody(JSON.stringify('response has expired'));
            splitO365addresses.prototype.completeRestOperation(restOperation);
        });
         
        req.on('error', function (err) {
            logger.info('request error', err);
            restOperation.setBody(JSON.stringify(err));
            splitO365addresses.prototype.completeRestOperation(restOperation);
        });
      }
    });
  //this.completeRestOperation(restOperation);
};

/**
* handle /example HTTP request
*/
splitO365addresses.prototype.getExampleState = function () {
  return {
    "value": "your_string"
  };
};

module.exports = splitO365addresses;