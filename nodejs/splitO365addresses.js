function splitO365addresses() {}

splitO365addresses.prototype.WORKER_URI_PATH = "shared/dynamicSplitTunnelList/updateO365addresses";
splitO365addresses.prototype.isPublic = true;

var logger = require('f5-logger').getInstance();
var Client = require('node-rest-client').Client;
var includes = require('array-includes');
var cidrClean = require('cidr-clean');

/**
* handle onGet HTTP request
*/
splitO365addresses.prototype.onGet = function(restOperation) {
  var basicAuthToken = restOperation.getBasicAuthorization();
    logger.info("gathered basic auth " + basicAuthToken);
    logger.info("about to set settings");
    var settings = require('settings.json');

    var options = {
      mimetypes: {
          xml: ["application/xml"]
        }
    };
    var client = new Client(options);
    client.parsers.find("XML").options= {"mergeAttrs": true};
logger.info(settings);
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
        var body = {'addressSpaceIncludeSubnet': addresses};
        //var client = new Client(options_auth);
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
        client.patch("https://localhost:8100/mgmt/tm/apm/resource/network-access/${NA}", args, function (data, response) {
          logger.info(response);
          restOperation.setBody(response.statusCode + " " + response.statusMessage);
          this.completeRestOperation(restOperation);
        });
      }
    });
  //restOperation.setBody(JSON.stringify(newRestOperation("get", "http://localhost:8100/mgmt/tm/ltm/profile/", basicAuthToken) ));
  //restOperation.setBody(JSON.stringify(basicAuthToken));
  //restOperation.setBody(JSON.stringify(newCall()));
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