var fs = require("fs");
var request = require('request');
var ical2json = require("ical2json");
var schArray = [];

var url = "https://calendar.google.com/calendar/ical/gdmkcomaf0lunq1hqgc6c5urec%40group.calendar.google.com/private-f554f24e635c1c8add5f1625d7a4c42f/basic.ics";
request.get(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var icalJSON = ical2json.convert(body);
       var sch = icalJSON;
       for (i = 0; i < sch.VEVENT.length; i++)
       {
         var today = new Date();
         if (sch.VEVENT[i].DTSTART && parseicaldate(sch.VEVENT[i].DTSTART).getFullYear() === today.getFullYear())
         {
           var startD = parseicaldate(sch.VEVENT[i].DTSTART);
           var endD = parseicaldate(sch.VEVENT[i].DTEND);
           var name = sch.VEVENT[i].SUMMARY;
           var info = sch.VEVENT[i].DESCRIPTION;
           var room = sch.VEVENT[i].LOCATION;
           var type = "";
           if (name.search("Lecture") >= 0)
           {
             name = name.substr(0, name.search("Lecture")-1);
             type = "Lecture";
           }
           else if (name.search("Laboratory") >= 0)
           {
             name = name.substr(0, name.search("Laboratory")-1);
             type = "Laboratory";
           }
           else if (name.search("Tutorial"))
           {
             name = name.substr(0, name.search("Tutorial")-1);
             type = "Tutorial";
           }
           else
           {
             type = "";
           }
           var crn = info.substr((info.search("CRN")+5),5);
           var courseCode = info.substr((info.search("Course Code")+13),(info.search("nSection") - (info.search("Course Code")+15)));
           var section = info.substr((info.search("Section")+9),3);
           var obj = {
             "start_date_object":startD,
             "end_date_object":endD,
             "date_string":startD.toLocaleDateString(),
             "start_time_string":startD.toLocaleTimeString(),
             "end_time_string":endD.toLocaleTimeString(),
             "name":name,
             "location":room,
             "type":type,
             "crn":crn,
             "code":courseCode,
             "section":section
           };
           schArray.push(obj);
         }
       }
       var arrayString = JSON.stringify(schArray);
       fs.writeFile('schedule.json', arrayString, function(err){
         if (err)
         {
           console.log(err);
         }
         else
         {
           console.log("file written successfully");
         }
       });
    }
});

function parseicaldate(icalStr)
{
  var strYear = icalStr.substr(0,4);
  var strMonth = parseInt(icalStr.substr(4,2),10)-1;
  var strDay = icalStr.substr(6,2);
  var strHour = icalStr.substr(9,2);
  var strMin = icalStr.substr(11,2);
  var strSec = icalStr.substr(13,2);
  var sdate = strDay + "/" + strMonth + "/" + strYear + " " + strHour + ":" + strMin + ":" + strSec + " UTC";
  var oDate =  new Date(sdate);
  return oDate;
}
