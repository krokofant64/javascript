var Tools2D = { };

// ----------------------------------------------------------------------------
// Geometric Primitives:
// ----------------------------------------------------------------------------

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

Tools2D.Triangle = function (thePoint1, thePoint2, thePoint3)
{
   this.point1 = thePoint1;
   this.point2 = thePoint2;
   this.point3 = thePoint3;
}

// ----------------------------------------------------------------------------
// Transformation Matrix:
// ----------------------------------------------------------------------------

/**
 * Create a transformation matrix
 */
Tools2D.Matrix = function()
{
   this.matrix = [[1, 0, 0],
                  [0, 1, 0],
                  [0, 0, 1]];
}

// ----------------------------------------------------------------------------

Tools2D.Matrix.prototype.clone = function ()
{
   return [[this.matrix[0][0], this.matrix[0][1], this.matrix[0][2]],
           [this.matrix[1][0], this.matrix[1][1], this.matrix[1][2]],
           [                0,                 0,                 1]]
}

// ----------------------------------------------------------------------------

/**
 * Multiply transformation matrix by another transformation matrix
 * @param theOther the other transformation matrix
 */
Tools2D.Matrix.prototype.multiplyWith = function (theOther)
{
   var c = [];
   c[0] = [];
   c[0][0] = this.matrix[0][0]*theOther.matrix[0][0] + this.matrix[0][1]*theOther.matrix[1][0];
   c[0][1] = this.matrix[0][0]*theOther.matrix[0][1] + this.matrix[0][1]*theOther.matrix[1][1];
   c[0][2] = this.matrix[0][0]*theOther.matrix[0][2] + this.matrix[0][1]*theOther.matrix[1][2] + this.matrix[0][2];      
   c[1] = [];
   c[1][0] = this.matrix[1][0]*theOther.matrix[0][0] + this.matrix[1][1]*theOther.matrix[1][0];
   c[1][1] = this.matrix[1][0]*theOther.matrix[0][1] + this.matrix[1][1]*theOther.matrix[1][1];
   c[1][2] = this.matrix[1][0]*theOther.matrix[0][2] + this.matrix[1][1]*theOther.matrix[1][2] + this.matrix[1][2];
   c[2] = [];   
   c[2][0] = 0;
   c[2][1] = 0;
   c[2][2] = 1;
   this.matrix = c;
}

// ----------------------------------------------------------------------------

Tools2D.Matrix.prototype.setMatrix = function (theElement00, theElement01, theElement02,
                                               theElement10, theElement11, theElement12)
{
   this.matrix = [[theElement00, theElement01, theElement02],
                  [theElement10, theElement11, theElement12],
                  0,             0,            1];
}

// ----------------------------------------------------------------------------

Tools2D.Matrix.prototype.setRotationMatrix = function (theAngle)
{
   var cos = Math.cos(theAngle);
   var sin = Math.sin(theAngle);
   this.matrix = [[ cos, sin, 0],
                  [-sin, cos, 0],
                  [   0,   0, 1]];
}

// ----------------------------------------------------------------------------

Tools2D.Matrix.prototype.setScalingMatrix = function (theScaleX, theScaleY)
{
   this.matrix = [[theScaleX,         0, 0],
                  [        0, theScaleY, 0],
                  [        0,         0, 1]];
}

// ----------------------------------------------------------------------------

Tools2D.Matrix.prototype.setTranslationMatrix = function (theDx, theDy)
{
   this.matrix = [[1, 0, theDx],
                  [0, 1, theDy],
                  [0, 0,     1]];
}

// ----------------------------------------------------------------------------

Tools2D.Matrix.prototype.transformPoint = function (thePoint)
{
   var x = this.matrix[0][0] * thePoint.x + this.matrix[0][1] * thePoint.y + this.matrix[0][2];
   var y = this.matrix[1][0] * thePoint.x + this.matrix[1][1] * thePoint.y + this.matrix[1][2];
   return new Point(x, y);
}

// ----------------------------------------------------------------------------
// Geometric Tools:
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
