var Tools2D = { };

Tools2D.Point = function (theX, theY)
{
   this.x = theX;
   this.y = theY;
};

// ----------------------------------------------------------------------------

Tools2D.Line = function (theStartPoint, theEndPoint)
{
   this.startPoint = theStartPoint;
   this.endPoint = theEndPoint;
};

// ----------------------------------------------------------------------------

Tools2D.Circle = function (theCenter, theRadius)
{
   this.center = theCenter;
   this.radius = theRadius;
};

// ----------------------------------------------------------------------------

Tools2D.distancePointToPoint = function (thePoint0, thePoint1)
{
   var dx = thePoint0.x - thePoint1.x;
   var dy = thePoint0.y - thePoint1.y;
   return Math.sqrt(dx * dx + dy * dy);
};

// ----------------------------------------------------------------------------

Tools2D.squareDistancePointToPoint = function (thePoint0, thePoint1)
{
   var dx = thePoint0.x - thePoint1.x;
   var dy = thePoint0.y - thePoint1.y;
   return dx * dx + dy * dy;
}

// ----------------------------------------------------------------------------

Tools2D.distancePointToLine = function (thePoint, theLine)
{
   var num = (theLine.endPoint.y - theLine.startPoint.y) * thePoint.x -
                (theLine.endPoint.x - theLine.startPoint.x) * thePoint.y +
                (theLine.endPoint.x * theLine.startPoint.y - theLine.endPoint.y * theLine.startPoint.x);
   if (num != 0.0)
   {
      var lineLength = distancePointToPoint(theLine.startPoint, theLine.endPoint);
      if (lineLength != 0.0)
      {
         return abs(num) / lineLength;
      }
   }
   return 0.0;
}

// ----------------------------------------------------------------------------

Tools2D.distancePointToLineSegment = function (thePoint, theLine)
{
   var dlx = theLine.endPoint.x - theLine.startPoint.x;
   var dly = theLine.endPoint.y - theLine.startPoint.y;
   var dot = (thePoint.x - theLine.startPoint.x) * dlx + 
             (thePoint.y - theLine.startPoint.y) * dly;
   var len_sq = dlx * dlx + dly * dly;
   var m = -1;
   if (len_sq != 0)
   {
      m = dot / len_sq;
   }
   var dx;
   var dy;
   if (m < 0)
   {
      dx = thePoint.x - theLine.startPoint.x;
      dy = thePoint.y - theLine.startPoint.y;
   }
   else
   if (m > 1)
   {
      dx = thePoint.x - theLine.endPoint.x;
      dy = thePoint.y - theLine.endPoint.y;
   }
   else
   {
      dx = thePoint.x - (theLine.startPoint.x + m * dlx);
      dy = thePoint.y - (theLine.startPoint.y + m * dly);
   }
   return Math.sqrt(dx * dx + dy * dy);
}

// ----------------------------------------------------------------------------

Tools2D.distancePointToCircle = function (thePoint, theCircle)
{
   var distanceCenter = distancePointToPoint(thePoint, theCircle.center);
   if (distanceCenter > theCircle.radius)
   {
      return distanceCenter - theCircle.radius;
   }
   return 0.0;
}

// ----------------------------------------------------------------------------

Tools2D.intersectionLineSegmentLineSegment = function (theLine0, theLine1)
{
   var d0x = theLine0.endPoint.x - theLine0.startPoint.x;
   var d0y = theLine0.endPoint.y - theLine0.startPoint.y;
   var d1x = theLine1.endPoint.x - theLine1.startPoint.x;
   var d1y = theLine1.endPoint.y - theLine1.startPoint.y;
   var det = (-d1x * d0y + d0x * d1y);
   if (det != 0)
   {
      var s = (-d0y * (theLine0.startPoint.x - theLine1.startPoint.x) +
                d0x * (theLine0.startPoint.y - theLine1.startPoint.y)) / det;
      var t = ( d1x * (theLine0.startPoint.y - theLine1.startPoint.y) -
                d1y * (theLine0.startPoint.x - theLine1.startPoint.x)) / det;
      if (s >= 0.0 && s <= 1.0 && t >= 0.0 && t <= 1.0)
      {
         // Lines intersect
         return new Point(theLine0.startPoint.x + (t * d0x), 
                          theLine0.startPoint.y + (t * d0y));
      }
   }
   return undefined; // No intersection
}
