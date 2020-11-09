var Tools2D = { };

Tools2D.Circle = function (theCenter, theRadius)
{
   this.center = theCenter;
   this.radius = theRadius;
};

// ----------------------------------------------------------------------------

Tools2D.Line = function (theStartPoint, theEndPoint)
{
   this.startPoint = theStartPoint;
   this.endPoint = theEndPoint;
};

// ----------------------------------------------------------------------------

Tools2D.Point = function (theX, theY)
{
   this.x = theX;
   this.y = theY;
};

// ----------------------------------------------------------------------------

Tools2D.Rectangle = function (theUpperLeft, theLowerRight)
{
   this.upperLeft = theUpperLeft;
   this.lowerRight = theLowerRight;
};

// ----------------------------------------------------------------------------

Tools2D.Triangle = function (thePoint1, thePoint2, thePoint3)
{
   this.point1 = thePoint1;
   this.point2 = thePoint2;
   this.point3 = thePoint3;
}

// ----------------------------------------------------------------------------

Tools2D.Rectangle.prototype.normalize = function ()
{
   var xmin;
   var xmax;
   if (this.upperLeft.x < this.lowerRight.x)
   {
      xmin = this.upperLeft.x;
      xmax = this.lowerRight.x;
   }
   else
   {
      xmin = this.lowerRight.x;
      xmax = this.upperLeft.x;
   }
   var ymin;
   var ymax;
   if (this.upperLeft.y < this.lowerRight.y)
   {
      ymin = this.upperLeft.y;
      ymax = this.lowerRight.y
   }
   else
   {
      ymin = this.lowerRight.y;
      ymax = this.upperLeft.y
   }
   this.upperLeft.x = xmin;
   this.upperLeft.y = ymin;
   this.lowerRight.x = xmax;
   this.lowerRight.y = ymax;
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
      var lineLength = Tools2D.distancePointToPoint(theLine.startPoint, theLine.endPoint);
      if (lineLength != 0.0)
      {
         return Math.abs(num) / lineLength;
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
   var distanceCenter = Tools2D.distancePointToPoint(thePoint, theCircle.center);
   if (distanceCenter > theCircle.radius)
   {
      return distanceCenter - theCircle.radius;
   }
   return 0.0;
}

// ---------------------------------------------------------------------------

Tools2D.intersectionLineSegmentRectangle = function (theLine, theRectangle)
{   
   var result = [];
   
   theRectangle.normalize();
   
   var dx = theLine.endPoint.x - theLine.startPoint.x;
   var dy = theLine.endPoint.y - theLine.startPoint.y;
   if (dx != 0) 
   {
      var k1 = (theRectangle.upperLeft.x - theLine.startPoint.x) / dx;
      if (0 <= k1 && k1 <= 1)
      {
         var y = theLine.startPoint.y + k1 * dy;
         if (theRectangle.upperLeft.y <= y && y <= theRectangle.lowerRight.y)
         { 
            result.push(new Tools2D.Point(theRectangle.upperLeft.x, y));	
         }
      }
      var k2 = (theRectangle.lowerRight.x - theLine.startPoint.x) / dx;
      if (0 <= k2 && k2 <= 1)
      {
         var y = theLine.startPoint.y + k2 * dy;
         if (theRectangle.upperLeft.y <= y && y <= theRectangle.lowerRight.y)
         { 
            result.push(new Tools2D.Point(theRectangle.lowerRight.x, y));	
         }
      }
   }
   if (dy != 0)
   {
      var k1 = (theRectangle.upperLeft.y - theLine.startPoint.y) / dy;
      if (0 <= k1 && k1 <= 1)
      {
         var x = theLine.startPoint.x + k1 * dx;
         if (theRectangle.upperLeft.x <= x && x <= theRectangle.lowerRight.x)
         {
            result.push(new Tools2D.Point(x, theRectangle.upperLeft.y));
         }
      }
      var k2 = (theRectangle.lowerRight.y - theLine.startPoint.y) / dy;
      if (0 <= k2 && k2 <= 1)
      {
         var x = theLine.startPoint.x + k2 * dx;
         if (theRectangle.upperLeft.x <= x && x <= theRectangle.lowerRight.x)
         {
            result.push(new Tools2D.Point(x, theRectangle.lowerRight.y));
         }
      }
   }
   return result;	   
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
         return new Tools2D.Point(theLine0.startPoint.x + (t * d0x), 
                                  theLine0.startPoint.y + (t * d0y));
      }
   }
   return undefined; // No intersection
}

// ----------------------------------------------------------------------------

Tools2D.pointInTriangle = function (theTriangle, thePoint)
{
   var denominator = ((theTriangle.point2.y - theTriangle.point3.y) * 
                      (theTriangle.point1.x - theTriangle.point3.x) + 
                      (theTriangle.point3.x - theTriangle.point2.x) * 
                      (theTriangle.point1.y - theTriangle.point3.y));
   if (denominator != 0)
   {
      var a = ((theTriangle.point2.y - theTriangle.point3.y) * (thePoint.x - theTriangle.point3.x) + 
		       (theTriangle.point3.x - theTriangle.point2.x) * (thePoint.y - theTriangle.point3.y)) / denominator;
      var b = ((theTriangle.point3.y - theTriangle.point1.y) * (thePoint.x - theTriangle.point3.x) + 
               (theTriangle.point1.x - theTriangle.point3.x) * (thePoint.y - theTriangle.point3.y)) / denominator;
      var c = 1 - a - b;

      return 0 <= a && a <= 1 && 
             0 <= b && b <= 1 && 
             0 <= c && c <= 1;
   }
   return false;
}
