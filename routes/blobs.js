var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST

const Blob = require('../models/blobs');

//Any requests to this controller must pass through this 'use' function
//Copy and pasted from method-override
router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res){
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
      }
}))

//build the REST operations at the base for blobs
//this will be accessible from http://127.0.0.1:3000/blobs if the default route for / is left unchanged
router.get('/', isLoggedIn, function(req, res, next) {
        //retrieve all blobs from Monogo
        mongoose.model('Blob').find({}, function (err, blobs) {
              if (err) {
                  return console.error(err);
              } else {
                  //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                  res.format({
                      //HTML response will render the index.jade file in the views/blobs folder. We are also setting "blobs" to be an accessible variable in our jade view
                    html: function(){
                        res.render('blobs/main', {
                              title: 'All the events',
                              "blobs" : blobs
                          });
                    },
                    //JSON response will show all blobs in JSON format
                    json: function(){
                        res.json(blobs);
                    }
                });
              }     
        });
    });

    //POST a new blob
router.post('/', isLoggedIn, function(req, res) {
        // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
        var title = req.body.title;
        var organiser = req.body.organiser;
        var date = req.body.date;
        var description = req.body.description;
        var ticketprice = req.body.ticketprice;
        //call the create function for our database
        mongoose.model('Blob').create({
            title : title,
            organiser : organiser,
            date : date,
            description : description,
            ticketprice: ticketprice
        }, function (err, blob) {
              if (err) {
                  res.send("There was a problem adding the information to the database.");
              } else {
                  //Blob has been created
                  console.log('POST creating new blob: ' + blob);
                  res.format({
                      //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                    html: function(){
                        // If it worked, set the header so the address bar doesn't still say /adduser
                        res.location("blobs");
                        // And forward to success page
                        res.redirect("/events");
                    },
                    //JSON response will show the newly created blob
                    json: function(){
                        res.json(blob);
                    }
                });
              }
        })
    });

/* GET New Blob page. */
router.get('/new',  isLoggedIn, function(req, res) {
    res.render('blobs/new', { title: 'Add New Blob' });
});

// route middleware to validate :id
router.param('id', function(req, res, next, id) {
    //console.log('validating ' + id + ' exists');
    //find the ID in the Database
    mongoose.model('Blob').findById(id, function (err, blob) {
        //if it isn't found, we are going to repond with 404
        if (err) {
            console.log(id + ' was not found');
            res.status(404)
            var err = new Error('Not Found');
            err.status = 404;
            res.format({
                html: function(){
                    next(err);
                 },
                json: function(){
                       res.json({message : err.status  + ' ' + err});
                 }
            });
        //if it is found we continue on
        } else {
            //uncomment this next line if you want to see every JSON document response for every GET/PUT/DELETE call
            //console.log(blob);
            // once validation is done save the new item in the req
            req.id = id;
            // go to the next thing
            next(); 
        } 
    });
});

router.get('/:id', isLoggedIn, function(req, res) {
    mongoose.model('Blob').findById(req.id, function (err, blob) {
      if (err) {
        console.log('GET Error: There was a problem retrieving: ' + err);
      } else {
        console.log('GET Retrieving ID: ' + blob._id);
        var blobdob = blob.date.toISOString();
        blobdob = blobdob.substring(0, blobdob.indexOf('T'))
        res.format({
          html: function(){
              res.render('blobs/show', {
                "blob" : blob
              });
          },
          json: function(){
              res.json(blob);
          }
        });
      }
    });
  });

//GET the individual blob by Mongo ID
router.route('/:id/edit')
    //GET the individual blob by Mongo ID
    .get(function(req, res) {
	    //search for the blob within Mongo
	    mongoose.model('Blob').findById(req.id, function (err, blob) {
	        if (err) {
	            console.log('GET Error: There was a problem retrieving: ' + err);
	        } else {
	            //Return the blob
	            console.log('GET Retrieving ID: ' + blob._id);
              var blobdob = blob.date.toISOString();
              blobdob = blobdob.substring(0, blobdob.indexOf('T'))
	            res.format({
	                //HTML response will render the 'edit.jade' template
	                html: function(){
	                       res.render('blobs/edit', {
	                          title: 'EventID' + blob._id,
	                          "blob" : blob
	                      });
	                 },
	                 //JSON response will return the JSON output
	                json: function(){
	                       res.json(blob);
	                 }
	            });
	        }
	    });
	})
        
    //PUT to update a blob by ID
    .put(function(req, res) {
	    // Get our REST or form values. These rely on the "name" attributes
	    var title = req.body.title;
	    var description = req.body.description;
	    var date = req.body.date;
	    var organiser = req.body.organiser;
	    var ticketprice = req.body.ticketprice;

	    //find the document by ID
	    mongoose.model('Blob').findById(req.id, function (err, blob) {
	        //update it
	        blob.update({
	            title : title,
	            description : description,
	            date : date,
                organiser : organiser,
                ticketprice: ticketprice
	        }, function (err, blobID) {
	          if (err) {
	              res.send("There was a problem updating the information to the database: " + err);
	          } 
	          else {
	                  //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
	                  res.format({
	                      html: function(){
	                           res.redirect("/events/" + blob._id);
	                     },
	                     //JSON responds showing the updated values
	                    json: function(){
	                           res.json(blob);
	                     }
	                  });
	           }
	        })
	    });
	})
	//DELETE a Blob by ID
    .delete(function (req, res){
	    //find blob by ID
	    mongoose.model('Blob').findById(req.id, function (err, blob) {
	        if (err) {
	            return console.error(err);
	        } else {
	            //remove it from Mongo
	            blob.remove(function (err, blob) {
	                if (err) {
	                    return console.error(err);
	                } else {
	                    //Returning success messages saying it was deleted
	                    console.log('DELETE removing ID: ' + blob._id);
	                    res.format({
	                        //HTML returns us back to the main page, or you can create a success page
	                          html: function(){
	                               res.redirect("/events");
	                         },
	                         //JSON returns the item with the message that is has been deleted
	                        json: function(){
	                               res.json({message : 'deleted',
	                                   item : blob
	                               });
	                         }
	                      });
	                }
	            });
	        }
	    });
	});

    
// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

module.exports = router;