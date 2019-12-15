var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mysql = require("mysql");
var dotenv = require("dotenv");
dotenv.config();

const DB_host = process.env.DATABASE_HOST || 'localhost';
const DB_port = process.env.DATABASE_PORT || 3306;
const DB_user = process.env.DATABASE_USER || 'tutorconnect';
const DB_pass = process.env.DATABASE_PASS || 'abcd1234';
const DB_name = process.env.DATABASE_NAME || 'tutorconnect';

var pool  = mysql.createPool({
  connectionLimit : 10,
  host            : DB_host,
  port            : DB_port,
  user            : DB_user,
  password        : DB_pass,
  database        : DB_name,
  multipleStatements: true
});



//Support for ejs files.
app.set("view engine","ejs");

app.use(bodyParser.urlencoded({extended: true}));


//Home page
app.get("/",function(req,res)
{
    res.render('homePage');
});

//Login Page
app.get("/:usertype/login", function(req, res) {
    var userType = req.params;
    res.render("login",{user:userType});


});

//Post Route for Login Page
app.post("/:userType/login", function(req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var userType = req.params.userType;

    var qrystr = "SELECT * FROM login where Email = \""+email+"\" AND Password = \""+password+"\" AND Usertype = \""+userType+"\"";
    console.log(qrystr);
    pool.query(qrystr, function(error, results, fields) {
        if(results.length == 1)
        {
            if(userType == "student")
            {
                qrystr = "SELECT S_ID from Student where Email = \""+email+"\"";
                pool.query(qrystr, function(error, results, fields) {
                    res.redirect("/"+userType+"/"+results[0].S_ID+"");
                });
            }

            if(userType == "tutor")
            {
                qrystr = "SELECT T_ID from Tutor where Email = \""+email+"\"";
                pool.query(qrystr, function(error, results, fields) {
                    res.redirect("/"+userType+"/"+results[0].T_ID+"");
                });
            }

            if(userType == "coaching")
            {
                qrystr = "SELECT C_ID from Coaching where Email = \""+email+"\"";
                pool.query(qrystr, function(error, results, fields) {
                    res.redirect("/"+userType+"/"+results[0].C_ID+"");
                });
            }
        }
        else
         res.send("<h3>Not A User</h3>");
    });

});

//User Registration Forms
app.get("/:usertype/register",function(req,res)
{
    var userType = req.params.usertype;
    if(userType == 'student')
    {
        res.render("regStudent");
    }

    if(userType == 'tutor')
    {
        res.render("regTutor");
    }
    if(userType == 'coaching')
    {
        res.render("regCoaching");
    }
});

//Route to Registration forms
app.post("/:usertype/register",function(req,res)
{
    var userType = req.params.usertype;
    var email = req.body.email;
    var pass = req.body.password;
    var qrystr;

    function UpdateLogin()
    {
        var qrystr = "INSERT INTO login (Email, Password, Usertype) VALUES (\""+email+"\", \""+pass+"\", \""+userType+"\")";
        console.log(qrystr);

        pool.query(qrystr, function(error, results, fields)
        {
            if(error)
            throw error;
            else
            console.log("Login Table Updated");

        });
    }



    if(userType == 'student')
    {
        console.log("data passed!");
        //console.log(req.body);
        qrystr = "INSERT INTO Student(F_Name,L_Name,Email,City,Contact) VALUES (\""+req.body.fname+"\",\""+req.body.lname+"\",\""+req.body.email+"\",\""+req.body.city+"\","+req.body.contact+")";
        console.log(qrystr);
        pool.query(qrystr, function (error, results, fields)
        {
            if (error){
                res.send("<h3> Already A User </h3>");
            }
            else
            console.log("Added a new user!");
            UpdateLogin();
        });

        qrystr = "SELECT S_ID FROM Student WHERE F_Name= \""+req.body.fname+"\" AND L_Name= \""+req.body.lname+"\" AND Email= \""+req.body.email+"\" AND City= \""+req.body.city+"\" AND Contact= "+req.body.contact;
        console.log(qrystr);
        var resulte;
        var sid;
        pool.query(qrystr, function(error,results,fields)
        {
            if(error){
                console.log(error);
                res.redirect("/");
            }
            else
            {
                console.log(results);
                res.redirect("/student/"+results[0].S_ID+"/defaultPreferences");

            }
        });

    }

    if(userType == 'tutor')
    {

        console.log("Data is Passed");

        qrystr = "Insert into Tutor (F_Name, L_Name, Email, Contact, City, Qualification, Experience) VALUES (\""+req.body.fname+"\", \""+req.body.lname+"\",\""+req.body.email+"\", "+req.body.contact+",\""+req.body.city+"\", \""+req.body.qualification+"\", "+req.body.experience+")";
        console.log(qrystr);
        pool.query(qrystr, function(error, results, fields)
        {
            if(error) throw error;
            else
            {
            console.log("New Tutor Added");
            UpdateLogin();
            }
        

            qrystr = "SELECT T_ID FROM Tutor WHERE Email = \""+req.body.email+"\"";
            console.log(qrystr);
            pool.query(qrystr, function(error,results,fields)
            {
                if(error) throw error;
                else
                {
                    console.log(results);
                    res.redirect("/tutor/"+results[0].T_ID+"/defaultPreferences");

                }
            });
        });
        // res.redirect("/"+userType+"/register");
    }

    if(userType == 'coaching')
    {

        // console.log(req.body);
        qrystr = "Insert into Coaching(Name, Email, City, Contact, Establishment) VALUES("+ "\""+req.body.name + "\"," + "\"" + req.body.email +"\"," + "\"" + req.body.city + "\"," +  req.body.contact + ", "+req.body.establishment+");";
        // console.log(qrystr);
        pool.query(qrystr, function (error, results, fields)
        {
            if (error){
                console.log(error);
                res.send("<h3> Already A User </h3>");
            }

            console.log("Added a new Coaching!");
            UpdateLogin();
        
            qrystr = "select C_ID from Coaching where Name = "  + "\"" + req.body.name + "\" " + "AND Email = " + "\"" + req.body.email + "\"";
             // console.log(typeof qrystr1);
            pool.query(qrystr, function (error, results, fields)
            {
                if (error) throw error;
                else
                {
                    // console.log("ID selected!");
                    // console.log(results);
                    res.redirect("/coaching/"+results[0].C_ID+"/defaultPreferences");
                }
            });
        });

        // res.redirect("/"+userType+"/register");
    }
});


app.get("/:usertype/:userid/defaultPreferences",function(req,res)
{
    var userType = req.params.usertype;
    if(userType == 'student')
    {
        var studentId= req.params.userid;
        var qrystr = "SELECT DISTINCT class FROM CoursePool ORDER BY class";
        pool.query(qrystr,function(error, results, fields)
        {
            if(error) throw error;
            else;

            console.log(results.length);
            var classes=results;
            var qrystr2 = "SELECT DISTINCT subject FROM CoursePool ORDER BY subject";
            pool.query(qrystr2,function(error, results, fields)
            {
                if(error) throw error;
                else
                console.log(results);
                res.render("studPrefForm.ejs",{studentId:studentId,classes:classes,subjects:results});
            });


        });
    }

    if(userType == 'tutor')
    {
        var tutorId = req.params.userid;
        res.render("tutorPrefForm",{userID: tutorId});
    }

    if(userType == 'coaching')
    {
        var coachingId = req.params.userid;
        res.render("coachingPrefForm",{userID: coachingId});
    }

});

app.post("/:usertype/:userid/defaultPreferences",function(req,res)
{
    var userType = req.params.usertype;
    if(userType == 'student')
    {
        var classes = req.body.class;
        var subjects = req.body.subject;
        var studentId= req.params.userid;
        for(var i=0;i<subjects.length;i++)
        {
            var subcode = classes[i].toString() + "_" + subjects[i].toString().substring(0,3).toUpperCase();
            var qrystr="INSERT INTO S_Courses VALUES ("+studentId+",\""+subcode+"\")";
            console.log(qrystr);
            pool.query(qrystr,function (err, result)
            {
            if (err) throw err;
              console.log("Record inserted!");
            });
        }
        console.log(classes.length);
        console.log(subjects.length);
        res.redirect("/student/"+studentId);
    }

    if(userType == 'tutor')
    {
       for(var i = 0; i < req.body.class.length;i++)
      {
         var str = req.body.subject[i];
         console.log(req.body.class.length);
         console.log(typeof req.body.subject[i]);
         console.log("Class is " + req.body.class[i]);
         console.log("Subject is " + req.body.subject[i]);
         var Course_ID = req.body.class[i] + "_" + str.toString().substring(0,3).toUpperCase();
         console.log(Course_ID);
         var T_ID = req.params.userid;
        //  var qrystr = "insert into CoursePool VALUES(" + "\""+ Course_ID +"\"," + "\"" + req.body.class[i] + "\"," + "\"" + req.body.subject[i] + "\")";
         var qrystr = "insert into CoursePool VALUES(" + "\""+ req.body.class[i] +"\"," + "\"" + req.body.subject[i] + "\"," + "\"" + Course_ID + "\")";

         var qrystr1 = "insert into T_Courses VALUES(" + "\"" + T_ID + "\"," + "\"" + Course_ID + "\"" + ");";

         pool.query(qrystr, function (error, results, fields)
         {
            if (error) console.log("Duplicate entry!");
            else
            console.log("Record added in CoursePool table!");
          });

          pool.query(qrystr1, function (error, results, fields)
          {
            if (error) throw error;
            console.log("Record added in T_Courses table!");
          });
      }
      res.redirect("/tutor/"+T_ID);
     }


    if(userType == 'coaching')
    {

      for(var i = 0;i < req.body.class.length;i++)
      {
         var str = req.body.subject[i];
         var Course_ID = req.body.class[i] + "_" + str.substring(0,3).toUpperCase();
         var C_ID = req.params.userid;
        //  var qrystr = "insert into CoursePool VALUES(" + "\""+ Course_ID +"\"," + "\"" + req.body.class[i] + "\"," + "\"" + req.body.subject[i] + "\")";
        var qrystr = "insert into CoursePool VALUES(" + "\""+ req.body.class[i] +"\"," + "\"" + req.body.subject[i] + "\"," + "\"" + Course_ID + "\")";
         var qrystr1 = "insert into C_Courses VALUES(" + "\"" + C_ID + "\"," + "\"" + Course_ID + "\"" + ");";
         pool.query(qrystr, function (error, results, fields)
         {
            if (error) console.log("Duplicate entry!");
            else
            console.log("Record added in Courses table!");
          });
          pool.query(qrystr1, function (error, results, fields)
          {
            if (error) throw error;
            console.log("Record added in C_Courses table!");
          });
      }
      res.redirect("/coaching/"+C_ID);
     }
});

//dashboard
app.get("/:usertype/:userid",function(req, res)
{
    var userType = req.params.usertype;
    var userId = req.params.userid;
    if(userType == 'student')
    {
        var qrystr = "SELECT * FROM Student WHERE S_ID = "+userId;

        console.log(qrystr);
        var sbasics;
        pool.query(qrystr,function(err,result)
        {
            if (err) throw err;
            else
            console.log(result);
            sbasics=result;
            console.log("reached student basic data");
            var qrystr1 = "SELECT * FROM S_Courses a INNER JOIN CoursePool b on a.Course_ID = b.Course_ID where S_ID = "+userId+" ORDER BY class, subject";
            pool.query(qrystr1,function(err,result)
            {
                if(err) throw err;
                else
                console.log("courses query");
                console.log(result);
                var courses=result;
                //console.log(sbasics[0].City);
                var qrystr2 = "SELECT * from Tutor a inner join T_Courses b on a.T_ID = b.T_ID inner join CoursePool c on b.Course_ID = c.Course_ID where a.City in (select City from Student where S_ID = "+userId+") and b.Course_ID IN (select Course_ID from S_Courses where S_ID="+userId+")";
                pool.query(qrystr2,function(error, result, fields)
                {
                        if (error) throw error;
                        else
                        console.log(result);
                        var tutors = result;
                        var qrystr3 = "SELECT * from Coaching a inner join C_Courses b on a.C_ID = b.C_ID inner join CoursePool c on b.Course_ID = c.Course_ID where a.City in (select City from Student where S_ID = "+userId+") and b.Course_ID IN (select Course_ID from S_Courses where S_ID="+userId+")";
                        pool.query(qrystr3,function(error, result, fields)
                        {
                            if(error) throw error;
                            else
                            console.log(result);
                            var coachings = result;
                            res.render("studash.ejs",{info:sbasics[0],courses:courses,tutors:tutors,coachings:coachings});
                        });

                });


            });

        });
    }

    if(userType == 'tutor')
    {
        var qrystr = "SELECT * FROM Tutor WHERE T_ID = "+userId;

        console.log(qrystr);
        var tbasics;
        pool.query(qrystr,function(err,result)
        {
            if (err) throw err;
            else
            console.log(result);
            tbasics=result;
            console.log("reached tutor basic data");
            var qrystr1 = "SELECT * FROM T_Courses a INNER JOIN CoursePool b on a.Course_ID = b.Course_ID where T_ID = "+userId+" ORDER BY class, subject";
            console.log(qrystr1);
            pool.query(qrystr1,function(err,result)
            {
                if(err) throw err;
                else
                console.log("courses query");
                console.log(result);
                res.render("tudash.ejs",{info:tbasics[0],courses:result});

            });
        });
    }

    if(userType == 'coaching')
    {
        var qrystr = "SELECT * FROM Coaching WHERE C_ID = "+userId;

        console.log(qrystr);
        var cbasics;
        pool.query(qrystr,function(err,result)
        {
            if (err) throw err;
            else
            console.log(result);
            cbasics=result;
            console.log("reached coaching basic data");
            var qrystr1 = "SELECT * FROM C_Courses a INNER JOIN CoursePool b on a.Course_ID = b.Course_ID where C_ID = "+userId+" ORDER BY class, subject";
            pool.query(qrystr1,function(err,result)
            {
                if(err) throw err;
                else
                console.log("courses query");
                console.log(result);
                res.render("coadash.ejs",{info:cbasics[0],courses:result});

            });
        });
    }


});

//delete user
app.get("/:usertype/:userid/delete",function(req,res)
{
    var userType = req.params.usertype;
    var userId = req.params.userid;

   if(userType == 'student')
   {
       var qrystr = "DELETE FROM Student where S_ID="+userId;
       pool.query(qrystr,function(error, results, fields)
       {
            if (error) throw error;
            else
            console.log("deleted student");
            res.redirect("/");

       });
   }

   if(userType == 'tutor')
   {
       var qrystr = "DELETE FROM T_Courses where T_ID="+userId+";\ndelete from CoursePool where Course_ID not in (select distinct Course_ID from C_Courses) AND Course_ID not in (select distinct Course_ID from T_Courses);";
       pool.query(qrystr,function(error, results, fields)
       {
            if (error) throw error;
            else
            {
                var qrystr2 = "DELETE FROM Tutor where T_ID="+userId;
                pool.query(qrystr2,function(error, results, fields)
                {
                    console.log("deleted tutor");
                    res.redirect("/");
                });
            }
       });
   }
   if(userType == 'coaching')
   {
       var qrystr = "DELETE FROM C_Courses where C_ID="+userId+";\ndelete from CoursePool where Course_ID not in (select distinct Course_ID from C_Courses) AND Course_ID not in (select distinct Course_ID from T_Courses);";
       pool.query(qrystr,function(error, results, fields)
       {
            if (error) throw error;
            else
            {
                var qrystr2 = "DELETE FROM Coaching where C_ID="+userId;
                pool.query(qrystr2,function(error, results, fields)
                {
                    console.log("deleted coaching");
                    res.redirect("/");
                });
            }
       });
   }

});

//reset preferences
app.get("/:usertype/:userid/resetprefs",function(req,res)
{
   var userType = req.params.usertype;
   var userId = req.params.userid;
  if(userType == 'student')
  {
      var qrystr = "Delete FROM S_Courses where S_ID="+userId;
      console.log(qrystr);
      pool.query(qrystr,function(error, results, fields)
      {
          if(error) throw error;
          else
          console.log("Reset student preferences");
          res.redirect("/student/"+userId+"/defaultPreferences");
      });
  }

  if(userType == 'tutor')
  {
      var qrystr = "Delete FROM T_Courses where T_ID="+userId+";delete from CoursePool where Course_ID not in (select distinct Course_ID from C_Courses) AND Course_ID not in (select distinct Course_ID from T_Courses);";
      console.log(qrystr);
      pool.query(qrystr,function(error, results, fields)
      {
          if(error) console.log(error) ;
          else
          console.log("Reset tutor preferences");
          res.redirect("/tutor/"+userId+"/defaultPreferences");
      });
  }

  if(userType == 'coaching')
  {
      var qrystr = "Delete FROM C_Courses where C_Courses.C_ID="+userId+";delete from CoursePool where Course_ID not in (select distinct Course_ID from C_Courses) AND Course_ID not in (select distinct Course_ID from T_Courses);";
      console.log(qrystr);
      pool.query(qrystr,function(error, results, fields)
      {
          if(error) throw error;
          else
          console.log("Reset coaching preferences");
          res.redirect("/coaching/"+userId+"/defaultPreferences");
      });
  }
});


app.get("*",function(req,res)
{
    res.redirect("/");
});

app.listen(3000,function()
{
    console.log("Server is listening!");
});
