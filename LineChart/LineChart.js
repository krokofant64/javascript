function LineChart()
{
   this.tickLength = 5;
   this.leftMargin = 10;
   this.rightMargin = 10;
   this.topMargin = 10;
   this.bottomMargin = 10;
   this.tickDistanceY = 20;
   this.tickDistanceX = 20;
   this.backgroundColor = "DodgerBlue";
   this.foregroundColor = "White";
   this.history = undefined;

   this.startTime = 0;
   this.endTime = 0;
   this.startValue = 0;
   this.endValue = 0;
};

LineChart.prototype.numberTicInfo = function (theStartValue, theEndValue, theAxisLength, theTickDistanceInPixel)
{
   var result =       
   {
      numberOfDecimals: 0,
      tickDistance:     0,
      numberOfTicks: 0,
      startValue: theStartValue
   };
   var range = theEndValue - theStartValue;
   var distance = range / Math.floor(theAxisLength / theTickDistanceInPixel);
   var numberOfDigits = Math.floor(Math.log(distance)/Math.LN10);
   var divisor = Math.pow(10, numberOfDigits);
   var normalizedDistance = distance / divisor;
   if (normalizedDistance <= 2)
   {
      result.tickDistance = 2 * divisor;
   }
   else
   if (normalizedDistance <= 2.5)
   {
      result.tickDistance = 2.5 * divisor;
   }
   else
   if (normalizedDistance <= 5)
   {
      result.tickDistance = 5 * divisor;
   }
   else
   {
      result.tickDistance = 10 * divisor;
   }

   result.startValue = Math.floor(theStartValue / result.tickDistance) * result.tickDistance;
   result.numberOfDecimals = (numberOfDigits < 0) ? Math.abs(numberOfDigits) : 0;

   result.numberOfTicks = Math.ceil((theEndValue - result.startValue) / result.tickDistance);
   result.range = result.numberOfTicks * result.tickDistance;
   return result;
};

LineChart.prototype.to2digit = function (theNumber)
{
   result = "" + theNumber;
   while (result.length < 2)
   {
      result = "0" + result;
   }
   return result;
};

LineChart.prototype.to3digit = function (theNumber)
{
   result = "" + theNumber;
   while (result.length < 3)
   {
      result = result + "0";
   }
   return result;
};

LineChart.prototype.timeToString = function (theTimeInMs, thePreviousTimeInMs, theUnit)
{
   
   var result = "";
   var currentTime = new Date(theTimeInMs);
   var previousTime = new Date(thePreviousTimeInMs);
   switch (theUnit)
   {
      case "ms":
      {
         if (currentTime.getFullYear() != previousTime.getFullYear() ||
             currentTime.getMonth() != previousTime.getMonth() ||
             currentTime.getDate() != previousTime.getDate())
         {
           result += currentTime.getFullYear() + "-" +
                     this.to2digit(currentTime.getMonth() + 1) + "-" +
                     this.to2digit(currentTime.getDate()) + " ";
           result += this.to2digit(currentTime.getHours()) + ":" + 
                     this.to2digit(currentTime.getMinutes()) + ":";
         }
         else
         if (currentTime.getHours() != previousTime.getHours() ||
             currentTime.getMinutes() != previousTime.getMinutes())
         {
           result += this.to2digit(currentTime.getHours()) + ":" + 
                     this.to2digit(currentTime.getMinutes()) + ":";
         }
         result += this.to2digit(currentTime.getSeconds()) + "." +  
                   this.to3digit(currentTime.getMilliseconds());
         return result;
      }
      case "s":
      {
         if (currentTime.getFullYear() != previousTime.getFullYear() ||
             currentTime.getMonth() != previousTime.getMonth() ||
             currentTime.getDate() != previousTime.getDate())
         {
           result += currentTime.getFullYear() + "-" +
                     this.to2digit(currentTime.getMonth() + 1) + "-" +
                     this.to2digit(currentTime.getDate()) + " ";
         }
         result += this.to2digit(currentTime.getHours()) + ":" + 
                  this.to2digit(currentTime.getMinutes()) + ":" +
                  this.to2digit(currentTime.getSeconds());
         return result;
      }
      case "min":
      {
         if (currentTime.getFullYear() != previousTime.getFullYear() ||
             currentTime.getMonth() != previousTime.getMonth() ||
             currentTime.getDate() != previousTime.getDate())
         {
           result += currentTime.getFullYear() + "-" +
                     this.to2digit(currentTime.getMonth() + 1) + "-" +
                     this.to2digit(currentTime.getDate()) + " ";
         }
         result += this.to2digit(currentTime.getHours()) + ":" +
                   this.to2digit(currentTime.getMinutes());
         return result;
      }
      case "h":
      {
         if (currentTime.getFullYear() != previousTime.getFullYear() ||
             currentTime.getMonth() != previousTime.getMonth() ||
             currentTime.getDate() != previousTime.getDate())
         {
           result += currentTime.getFullYear() + "-" +
                     this.to2digit(currentTime.getMonth() + 1) + "-" +
                     this.to2digit(currentTime.getDate()) + " ";
         }
         return result + this.to2digit(currentTime.getHours()) + ":" +
                         this.to2digit(currentTime.getMinutes());
      }
      case "d":
      {
         return "" + currentTime.getFullYear() + "-" +
                     this.to2digit(currentTime.getMonth() + 1) + "-" +
                     this.to2digit(currentTime.getDate());
      }

   }
};

LineChart.prototype.valueToString = function (theValue, theNumberOfDecimals)
{
   var valueAsString = theValue.toFixed(theNumberOfDecimals);
   var dotPosition = valueAsString.indexOf(".");
   if (dotPosition == -1)
   {
      var result = "";
      while (valueAsString.length % 3 != 0)
      {
         valueAsString = " " + valueAsString;
      }
      for (var i = 0; i < valueAsString.length; i += 3)
      {
         result += valueAsString.substr(i, 3);
         result += " ";
      }
      return result.trim();
   }
   else
   {
   }
   return valueAsString;
}

LineChart.prototype.TimeTickTableC = [
   { tickDistance:                        1, unit: "ms"  },
   { tickDistance:                        2, unit: "ms"  },
   { tickDistance:                        5, unit: "ms"  },
   { tickDistance:                       10, unit: "ms"  },
   { tickDistance:                       20, unit: "ms"  },
   { tickDistance:                       25, unit: "ms"  },
   { tickDistance:                       50, unit: "ms"  },
   { tickDistance:                      100, unit: "ms"  },
   { tickDistance:                      200, unit: "ms"  },
   { tickDistance:                      250, unit: "ms"  },
   { tickDistance:                      500, unit: "ms"  },
   { tickDistance:                 1 * 1000, unit: "s"   },
   { tickDistance:                 2 * 1000, unit: "s"   },
   { tickDistance:                 5 * 1000, unit: "s"   },
   { tickDistance:                10 * 1000, unit: "s"   },
   { tickDistance:                15 * 1000, unit: "s"   },
   { tickDistance:                20 * 1000, unit: "s"   },
   { tickDistance:                30 * 1000, unit: "s"   },
   { tickDistance:            1 * 60 * 1000, unit: "min" },
   { tickDistance:            2 * 60 * 1000, unit: "min" },
   { tickDistance:            5 * 60 * 1000, unit: "min" },
   { tickDistance:           10 * 60 * 1000, unit: "min" },
   { tickDistance:           15 * 60 * 1000, unit: "min" },
   { tickDistance:           20 * 60 * 1000, unit: "min" },
   { tickDistance:           30 * 60 * 1000, unit: "min" },
   { tickDistance:       1 * 60 * 60 * 1000, unit: "h"   },
   { tickDistance:       2 * 60 * 60 * 1000, unit: "h"   },
   { tickDistance:       3 * 60 * 60 * 1000, unit: "h"   },
   { tickDistance:       4 * 60 * 60 * 1000, unit: "h"   },
   { tickDistance:       6 * 60 * 60 * 1000, unit: "h"   },
   { tickDistance:      12 * 60 * 60 * 1000, unit: "h"   },
   { tickDistance:  1 * 24 * 60 * 60 * 1000, unit: "d"   },
   { tickDistance:  7 * 24 * 60 * 60 * 1000, unit: "d"   }
];

LineChart.prototype.timeTickInfo = function (theStartTime, theEndTime, theAxisLength, theTickDistanceInPixel)
{
   var result =       
   {
      unit:          "ms",
      tickDistance:  0,
      numberOfTicks: 0,
      startTime: theStartTime
   };
   var range = theEndTime - theStartTime;
   var distance = range / Math.floor(theAxisLength / theTickDistanceInPixel);
   
   for (var i = 0; i < this.TimeTickTableC.length - 1; i++)
   {
      if (distance <= this.TimeTickTableC[i].tickDistance)
      {
         result.tickDistance = this.TimeTickTableC[i].tickDistance;
         result.unit = this.TimeTickTableC[i].unit;
         result.numberOfTicks = Math.ceil(range / result.tickDistance);
         result.startTime = Math.floor(theStartTime / result.tickDistance) * result.tickDistance;

         result.numberOfTicks = Math.ceil((theEndTime - result.startTime) / result.tickDistance);
         result.range = result.numberOfTicks * result.tickDistance;

         return result;
      }
   }
   i = this.TimeTickTableC.length - 1;
   result.tickDistance = this.TimeTickTableC[i].tickDistance;
   result.unit = this.TimeTickTableC[i].unit;
   result.numberOfTicks = Math.ceil(range / result.tickDistance);
   result.startTime = Math.floor(theStartTime / result.tickDistance) * result.tickDistance;

   result.numberOfTicks = Math.ceil((theEndTime - result.startTime) / result.tickDistance);
   result.range = result.numberOfTicks * result.tickDistance;
   return result;
};

LineChart.prototype.findLimits = function ()
{
   this.startTime = undefined;
   this.endTime = undefined;
   this.startValue = undefined;
   this.endValue = undefined;
   if (!this.data)
   {
      return;
   }
   for (var color in this.data)
   {
      var length = this.data[color].length;
      if (length > 0 && this.startTime == undefined)
      {
         this.startTime = this.data[color][0].time;
         this.endTime = this.data[color][length - 1].time;
         this.startValue = this.data[color][0].value; // Initial value only
         this.endValue = this.startValue;             // Initial value only
      }
      for (var i = 0; i < this.data[color].length; i++)
      {
         var value = this.data[color][i].value;
         if (value < this.startValue)
         {
            this.startValue = value;
         }
         else
         if (value > this.endValue)
         {
            this.endValue = value;
         }
      }
   }
};

LineChart.prototype.draw = function (theCanvas)
{
   if (!this.data)
   {
      return;
   }
   var ctx = theCanvas.getContext("2d");
   ctx.save();
   this.width = theCanvas.width;
   this.height = theCanvas.height;

   ctx.fillStyle = this.backgroundColor;
   ctx.rect(0, 0, this.width, this.height);
   ctx.fill();
   var labelWidthX = ctx.measureText(" 9 999 999 999").width;
   var zeroOffsetX = this.leftMargin + labelWidthX + this.tickLength + 2;
   var xLength = this.width - zeroOffsetX - this.rightMargin;

   // Draw the labels
   if (this.labels)
   {
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      var deltaY = ctx.measureText('M').width + 5;
      var deltaX = xLength / 3;
      var y = this.topMargin + deltaY;
      var column = 0;
      for (var color in this.labels)
      {
         ctx.beginPath();
         var label = this.labels[color];
         var x = zeroOffsetX + (column % 3) * deltaX;
         ctx.strokeStyle = color;
         ctx.fillStyle = this.foregroundColor;
         ctx.moveTo(x, y);
         ctx.lineTo(x + 20, y);
         ctx.stroke();
         ctx.fillText(label, x + 25, y);
         column++;
         if (column % 3 == 0)
         {
            y += deltaY;
         }
      }
      ctx.beginPath();
   }

   var labelWidthY = ctx.measureText("9999-99-99 23:59:59.999").width;
   var zeroOffsetY = this.bottomMargin + labelWidthY + this.tickLength + 2;
   var yLength = this.height - zeroOffsetY - this.topMargin - ((column + 2) / 3 + 1) * deltaY;
   ctx.translate(zeroOffsetX,
                 this.height - zeroOffsetY);  

   var yAxisInfo = this.numberTicInfo(this.startValue, this.endValue, yLength, this.tickDistanceY);

   if (this.history)
   {
      this.startTime = Math.max(this.startTime, (new Date()).getTime() - this.history);
      var xAxisInfo = this.timeTickInfo(this.startTime, this.endTime, xLength, this.tickDistanceX);
      this.removeOldEntries(xAxisInfo.startTime);
   }
   else
   {
      var xAxisInfo = this.timeTickInfo(this.startTime, this.endTime, xLength, this.tickDistanceX);
   }

   ctx.strokeStyle = this.foregroundColor;
   ctx.fillStyle = this.foregroundColor;
   ctx.save();
   ctx.lineWidth = 2;
   ctx.beginPath();
   ctx.moveTo(0.5, 0.5);
   ctx.lineTo(0.5, -yLength - 0.5);
   ctx.moveTo(0.5, 0.5);
   ctx.lineTo(xLength + 0.5, 0.5);
   ctx.stroke();
   ctx.restore();

   // Draw Y-grid lines
   ctx.save();
   ctx.lineWidth = 1;
   ctx.beginPath();
   for (var i = 0; i <= yAxisInfo.numberOfTicks; i++)
   {
      var y = Math.floor(i * yLength / (yAxisInfo.numberOfTicks));
      ctx.moveTo(0.5, -y + 0.5);
      ctx.lineTo(0.5 + xLength, -y + 0.5);
   }
   ctx.stroke();
   ctx.restore();

   // Draw Y-axis ticks and labels
   ctx.save();
   ctx.textAlign = "right";
   ctx.textBaseline = "middle";
   ctx.lineWidth = 2;
   ctx.beginPath();
   for (var i = 0; i <= yAxisInfo.numberOfTicks; i++)
   {
      var y = Math.floor(i * yLength / (yAxisInfo.numberOfTicks));
      ctx.moveTo(0.5, -y + 0.5);
      ctx.lineTo(0.5 - this.tickLength, -y + 0.5);
      var label = this.valueToString(yAxisInfo.tickDistance * i + yAxisInfo.startValue, yAxisInfo.numberOfDecimals);
      ctx.fillText(label, 0.5 - this.tickLength - 2, -y - 0.5);
   }
   ctx.stroke();
   ctx.restore();

   // Draw X-grid lines
   if (xAxisInfo.numberOfTicks > 0)
   {
      ctx.save();
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (var i = 0; i <= xAxisInfo.numberOfTicks; i++)
      {
         var currentTime = xAxisInfo.tickDistance * i + xAxisInfo.startTime
         var x = Math.floor(i * xLength / (xAxisInfo.numberOfTicks));
         ctx.moveTo(x + 0.5, 0.5);
         ctx.lineTo(x + 0.5, 0.5 + -yLength);
      }
      ctx.stroke();
      ctx.restore();

      // Draw X-axis ticks and labels
      ctx.save();
      ctx.textAlign = "end";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 2;
      ctx.beginPath();
      var previousTime = 0;
      for (var i = 0; i <= xAxisInfo.numberOfTicks; i++)
      {
         var currentTime = xAxisInfo.tickDistance * i + xAxisInfo.startTime
         var label = this.timeToString(currentTime, previousTime, xAxisInfo.unit);
         var x = Math.floor(i * xLength / (xAxisInfo.numberOfTicks));
         previousTime = currentTime;
         ctx.moveTo(x + 0.5, 0.5);
         ctx.lineTo(x + 0.5, 0.5 + this.tickLength);
         ctx.save();
         ctx.translate(x + 0.5,
                          0.5 + this.tickLength + 2);
         ctx.rotate(-90 * Math.PI / 180);
         ctx.fillText(label, 0, 0);
         ctx.restore();
      }
      ctx.stroke();
      ctx.restore();
   }

   // Draw the data series
   ctx.save();
   if ("data" in this)
   {
      for (var color in this.data)
      {
         ctx.strokeStyle = color;
         var hex = ctx.strokeStyle.replace('#', '');
         var r = parseInt(hex.substring(0, 2), 16);
         var g = parseInt(hex.substring(2, 4), 16);
         var b = parseInt(hex.substring(4, 6), 16);

         ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + 0.2 + ")";
         {
            ctx.beginPath();
            var firstPoint = true;
            for (var i = 0; i < this.data[color].length; i++)
            {
               var time = this.data[color][i].time;
               var value = this.data[color][i].value;
               var x = (time - xAxisInfo.startTime) / xAxisInfo.range * xLength;
               var y = (value - yAxisInfo.startValue) / yAxisInfo.range * yLength;
               if (firstPoint == true)
               {
                  firstPoint = false;
                  ctx.moveTo(x, -y);
               }
               else
               {
                  ctx.lineTo(x, -y);
               }
            }
            ctx.stroke();

            ctx.beginPath();
            var firstPoint = true;
            var x0;
            for (var i = 0; i < this.data[color].length; i++)
            {
               var time = this.data[color][i].time;
               var value = this.data[color][i].value;
               var x = (time - xAxisInfo.startTime) / xAxisInfo.range * xLength;
               var y = (value - yAxisInfo.startValue) / yAxisInfo.range * yLength;
               if (firstPoint == true)
               {
                  firstPoint = false;
                  x0 = x;
                  ctx.moveTo(x, -y);
               }
               else
               {
                  ctx.lineTo(x, -y);
               }
            }
            ctx.lineTo(x, 0);
            ctx.lineTo(x0, 0);
            ctx.closePath();
            ctx.fill();
         }
      }
   }
   ctx.restore();
   ctx.restore();
};

LineChart.prototype.addData = function (theColor, theValue, theTime)
{
   var currentTime;
   if (theTime == undefined)
   {
      currentTime = (new Date()).getTime();
   }
   else
   if (theTime instanceof Date)
   {
      currentTime = theTime.getTime();
   }
   else
   {
      currentTime = theTime;
   }
   if (!this.data)
   {
      this.data = {};
      this.startTime = currentTime;
      this.endTime = currentTime;
      this.startValue = theValue;
      this.endValue = theValue;
   }
   if (!this.data[theColor])
   {
      this.data[theColor] = [];
   }
   this.data[theColor].push({ time: currentTime, value: theValue });
   if (currentTime < this.startTime)
   {
      this.startTime = currentTime;
   }
   else
      if (currentTime > this.endTime)
      {
         this.endTime = currentTime;
      }
   if (theValue < this.startValue)
   {
      this.startValue = theValue;
   }
   else
      if (theValue > this.endValue)
      {
         this.endValue = theValue;
      }
};

LineChart.prototype.addLabel = function (theColor, theLabel)
{
   if (!this.labels)
   {
      this.labels = {};
   }
   this.labels[theColor] = theLabel;
};

LineChart.prototype.reset = function ()
{
   delete this.data;
}

LineChart.prototype.removeOldEntries = function (theTime)
{
   if ("data" in this)
   {
      for (var color in this.data)
      {
         for (var i = 0; i < this.data[color].length; i++)
         {
            if (this.data[color][i].time >= theTime)
            {
               if (i > 0)
               {
                  var time1 = this.data[color][i].time;
                  var time0 = this.data[color][i - 1].time;
                  var value1 = this.data[color][i].value;
                  var value0 = this.data[color][i - 1].value;
                  var m = (value1 - value0) / (time1 - time0);
                  var value = value0 + m * (theTime - time0);
                  this.data[color][i - 1].time = theTime;
                  this.data[color][i - 1].value =  value;
                  this.data[color] = this.data[color].slice(i - 1);
               }
               else
               {
                  this.data[color] = this.data[color].slice(i);
               }
               break;
            }
         }
      }
   }
   this.findLimits();
}
