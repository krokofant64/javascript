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
   
   this.startTime = 0;
   this.endTime = 0;
   this.startValue = 0;
   this.endValue = 0;
};

LineChart.prototype.numberTicInfo = function (theRange, theAxisLength, theTickDistanceInPixel)
{
   var result =       
   {
      numberOfDecimals: 0,
      tickDistance:     0,
      numberOfTicks:    0
   };
   var distance = theRange / (theAxisLength / theTickDistanceInPixel);
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

   result.numberOfDecimals = (numberOfDigits < 0) ? Math.abs(numberOfDigits) : 0;

   result.numberOfTicks = Math.ceil(theRange / result.tickDistance);
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
         if (currentTime.getUTCFullYear() != previousTime.getUTCFullYear() ||
             currentTime.getUTCMonth() != previousTime.getUTCMonth() ||
             currentTime.getUTCDate() != previousTime.getUTCDate())
         {
           result += currentTime.getUTCFullYear() + "-" +
                     currentTime.getUTCMonth() + 1 + "-" +
                     currentTime.getUTCDate() + " ";
           result += this.to2digit(currentTime.getUTCHours()) + ":" + 
                     this.to2digit(currentTime.getUTCMinutes()) + ":";
         }
         else
         if (currentTime.getUTCHours() != previousTime.getUTCHours() ||
             currentTime.getUTCMinutes() != previousTime.getUTCMinutes())
         {
           result += this.to2digit(currentTime.getUTCHours()) + ":" + 
                     this.to2digit(currentTime.getUTCMinutes()) + ":";
         }
         result += this.to2digit(currentTime.getUTCSeconds()) + "." +  
                   this.to3digit(currentTime.getUTCMilliseconds());
         return result;
      }
      case "s":
      {
         if (currentTime.getUTCFullYear() != previousTime.getUTCFullYear() ||
             currentTime.getUTCMonth() != previousTime.getUTCMonth() ||
             currentTime.getUTCDate() != previousTime.getUTCDate())
         {
           result += currentTime.getUTCFullYear() + "-" +
                     this.to2digit(currentTime.getUTCMonth() + 1) + "-" +
                     this.to2digit(currentTime.getUTCDate()) + " ";
         }
         result += this.to2digit(currentTime.getUTCHours()) + ":" + 
                  this.to2digit(currentTime.getUTCMinutes()) + ":" +
                  this.to2digit(currentTime.getUTCSeconds());
         return result;
      }
      case "min":
      {
         if (currentTime.getUTCFullYear() != previousTime.getUTCFullYear() ||
             currentTime.getUTCMonth() != previousTime.getUTCMonth() ||
             currentTime.getUTCDate() != previousTime.getUTCDate())
         {
           result += currentTime.getUTCFullYear() + "-" +
                     this.to2digit(currentTime.getUTCMonth() + 1) + "-" +
                     this.to2digit(currentTime.getUTCDate()) + " ";
         }
         result += this.to2digit(currentTime.getUTCHours()) + ":" +
                   this.to2digit(currentTime.getUTCMinutes());
         return result;
      }
      case "h":
      {
         if (currentTime.getUTCFullYear() != previousTime.getUTCFullYear() ||
             currentTime.getUTCMonth() != previousTime.getUTCMonth() ||
             currentTime.getUTCDate() != previousTime.getUTCDate())
         {
           result += currentTime.getUTCFullYear() + "-" +
                     this.to2digit(currentTime.getUTCMonth() + 1) + "-" +
                     this.to2digit(currentTime.getUTCDate()) + " ";
         }
         return result + this.to2digit(currentTime.getUTCHours()) + ":" +
                         this.to2digit(currentTime.getUTCMinutes());
      }
      case "d":
      {
         return "" + currentTime.getUTCFullYear() + "-" +
                     this.to2digit(currentTime.getUTCMonth() + 1) + "-" +
                     this.to2digit(currentTime.getUTCDate());
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

LineChart.prototype.timeTickInfo = function (theRange, theAxisLength, theTickDistanceInPixel)
{
   var result =       
   {
      unit:          "ms",
      tickDistance:  0,
      numberOfTicks: 0
   };
   var distance = theRange / (theAxisLength / theTickDistanceInPixel);
   
   for (var i = 0; i < this.TimeTickTableC.length - 1; i++)
   {
      if (distance <= this.TimeTickTableC[i].tickDistance)
      {
         result.tickDistance = this.TimeTickTableC[i].tickDistance;
         result.unit = this.TimeTickTableC[i].unit;
         result.numberOfTicks = Math.ceil(theRange / result.tickDistance);
         return result;
      }
   }
   i = this.TimeTickTableC.length - 1;
   result.tickDistance = this.TimeTickTableC[i].tickDistance;
   result.unit = this.TimeTickTableC[i].unit;
   result.numberOfTicks = Math.ceil(theRange / result.tickDistance);
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
      for (var time in this.data[color])
      {
         if (this.startTime == undefined)
         {
            this.startTime = time;
            this.endTime = time;
            this.startValue = this.data[color][time].value;
            this.endValue = this.data[color][time].value;
         }
         else
         {
            if (time < this.startTime)
            {
               this.startTime = time;
            }
            else
            if (time > this.endTime)
            {
               this.endTime = time;
            }
            if (this.data[color][time].value < this.startValue)
            {
               this.startValue = this.data[color][time].value;
            }
            else
            if (this.data[color][time].value > this.endValue)
            {
               this.endValue = this.data[color][time].value;
            }
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
   var labelWidthY = ctx.measureText("9999-99-99 23:59:59.999").width;
   var zeroOffsetY = this.bottomMargin + labelWidthY + this.tickLength + 2;
   var yLength = this.height - zeroOffsetY - this.topMargin;
   ctx.translate(zeroOffsetX,
                 this.height - zeroOffsetY);  

   var range = this.endValue - this.startValue;
   var yAxisInfo = this.numberTicInfo(range, yLength, this.tickDistanceY);
   this.startValue = Math.floor(this.startValue/yAxisInfo.tickDistance) * yAxisInfo.tickDistance;
   range = this.endValue - this.startValue;
   yAxisInfo = this.numberTicInfo(range, yLength, this.tickDistanceY);
   
   var timeRange = this.endTime - this.startTime;
   var xAxisInfo = this.timeTickInfo(timeRange, xLength, this.tickDistanceX);
   this.startTime = Math.floor(this.startTime/xAxisInfo.tickDistance) * xAxisInfo.tickDistance;
   timeRange = this.endTime - this.startTime
   xAxisInfo = this.timeTickInfo(timeRange, xLength, this.tickDistanceX);

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
      var label = this.valueToString(yAxisInfo.tickDistance * i + this.startValue, yAxisInfo.numberOfDecimals);
      ctx.fillText(label, 0.5 - this.tickLength - 2, -y - 0.5);
   }
   ctx.stroke();
   ctx.restore();

   // Draw X-grid lines
   ctx.save();
   ctx.lineWidth = 1;
   ctx.beginPath();
   for (var i = 0; i <= xAxisInfo.numberOfTicks; i++)
   {
      var currentTime = xAxisInfo.tickDistance * i + this.startTime
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
      var currentTime = xAxisInfo.tickDistance * i + this.startTime
      var label = this.timeToString(currentTime, previousTime, xAxisInfo.unit);
      var x = Math.floor(i * xLength/(xAxisInfo.numberOfTicks));
      previousTime = currentTime;
      ctx.moveTo( x + 0.5, 0.5);
      ctx.lineTo( x + 0.5, 0.5 + this.tickLength);
      ctx.save();
      ctx.translate(x + 0.5 ,
                       0.5 + this.tickLength + 2);  
      ctx.rotate(-90*Math.PI/180);
      ctx.fillText(label, 0 , 0);
      ctx.restore();
   }
   ctx.stroke();
   ctx.restore();

   // Draw the data series
   ctx.save();
   var previous  = {};
   if ("data" in this)
   {
      for (var color in this.data)
      {
         ctx.strokeStyle = color;
         ctx.beginPath();
         for (var time in this.data[color])
         {
            var value = this.data[color][time].value;
            var x = (time - this.startTime) / timeRange * xLength;
            var y = (value - this.startValue) / range * yLength;
            if (color in previous)
            {
               ctx.moveTo(previous[color].x, -previous[color].y);
               ctx.lineTo(x, -y);
            }
            previous[color] = {x : x, y : y };
         }
         ctx.stroke();
      }
   }
   ctx.restore();
   ctx.restore();
};

LineChart.prototype.addData = function (theColor, theValue, theTime)
{
   var time;
   if (theTime instanceof Date)
   {
      time = theTime.getTime();
   }
   else
   {
      time = theTime - (new Date()).getTimezoneOffset() * 60 * 1000; 
   }
   if (!this.data)
   {
      this.data = {};
      this.startTime = time;
      this.endTime = time;
      this.startValue = theValue;
      this.endValue = theValue;
   }
   if (!this.data[theColor])
   {
      this.data[theColor] = {};
   }
   this.data[theColor][time] = {color: theColor, value: theValue};
   if (time < this.startTime)
   {
      this.startTime = time;
   }
   else
   if (time > this.endTime)
   {
      this.endTime = time;
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
}

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
         for (var time in this.data[color])
         {
            if (time < theTime)
            {
               delete this.data[color][time];
            }
         }
      }
   }
   this.findLimits();
}
